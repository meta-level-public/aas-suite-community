using AasDesignerApi.Model;
using AasDesignerModel;
using AasDesignerModel.Model;
using AasShared.Exceptions;

namespace AasDesignerApi.EClass
{
    public class EclassImportService
    {
        private readonly IApplicationDbContext _context;

        public EclassImportService(
            IApplicationDbContext context,
            IServiceScopeFactory serviceScopeFactory
        )
        {
            _context = context;
        }

        public long StoreImportEclass(AppUser benutzer, IFormFile file)
        {
            using var ms = new MemoryStream();
            file.CopyTo(ms);

            var importQueueItem = new EClassImportQueueItem
            {
                BenutzerId = benutzer.BenutzerId,
                DateImport = DateTime.Now,
                ImportFile = ms.ToArray(),
                OrganisationId = benutzer.OrganisationId,
            };

            _context.EClassImportQueueItems.Add(importQueueItem);
            _context.SaveChanges();

            return importQueueItem.Id!.Value;
        }

        public List<EClassImportQueueItemDto> CheckPendingImport(AppUser benutzer)
        {
            return _context
                .EClassImportQueueItems.Where(i => i.OrganisationId == benutzer.OrganisationId)
                .Select(
                    (item) =>
                        new EClassImportQueueItemDto
                        {
                            BenutzerId = item.BenutzerId,
                            DateError = item.DateError,
                            DateImport = item.DateImport,
                            DateStarted = item.DateStarted,
                            Error = item.Error,
                            ErrorMessage = item.ErrorMessage,
                            OrganisationId = item.OrganisationId,
                            Started = item.Started,
                            Id = item.Id,
                            CountFilesProcessed = item.CountFilesProcessed,
                            CountFiles = item.CountFiles,
                        }
                )
                .ToList();
        }

        internal List<EClassImportQueueItemDto> DeletePendingImport(AppUser benutzer, long importId)
        {
            var importItem = _context.EClassImportQueueItems.First(x => x.Id == importId);

            if (importItem.OrganisationId != benutzer.OrganisationId)
                throw new OperationNotAllowedException("DELETEING_OTHERS_ITEMS_PERMITTED");

            _context.Remove(importItem);
            _context.SaveChanges();

            return CheckPendingImport(benutzer);
        }
    }
}
