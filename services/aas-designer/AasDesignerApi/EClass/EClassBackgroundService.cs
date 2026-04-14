using System.IO.Compression;
using AasDesignerModel;
using AasDesignerModel.Model;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerApi.EClass
{
    public class EClassBackgroundService
    {
        private readonly IServiceScopeFactory _serviceScopeFactory;
        private IApplicationDbContext context = null!;

        public EClassBackgroundService(IServiceScopeFactory serviceScopeFactory)
        {
            _serviceScopeFactory = serviceScopeFactory;
        }

        public void ImportEclass(long importId)
        {
            using (var scope = _serviceScopeFactory.CreateScope())
            using (var scope2 = _serviceScopeFactory.CreateScope())
            {
                context = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();
                var contextUpdateQueue =
                    scope2.ServiceProvider.GetRequiredService<IApplicationDbContext>();

                var isFirstFile = true;
                var importItem = contextUpdateQueue.EClassImportQueueItems.First(x =>
                    x.Id == importId
                );
                var organisation = context.Organisations.First(o =>
                    o.Id == importItem.OrganisationId
                );

                importItem.DateStarted = DateTime.Now;
                importItem.Started = true;
                contextUpdateQueue.SaveChanges();

                var transaction = context.Database.BeginTransaction();
                try
                {
                    using var msZip = new MemoryStream(importItem.ImportFile ?? []);

                    // check if this type of eclass import already exists, then skip the whole import
                    using ZipArchive zip = new ZipArchive(msZip, ZipArchiveMode.Read);
                    importItem.CountFiles = zip.Entries.Count(x => x.Name.EndsWith(".xml"));
                    contextUpdateQueue.SaveChanges();

                    foreach (ZipArchiveEntry entry in zip.Entries)
                    {
                        if (entry.Name.EndsWith(".xml"))
                        {
                            var stream = entry.Open();
                            using var ms = new MemoryStream();
                            stream.CopyTo(ms);

                            var metadata = EClassUtils.GetEClassMetadata(ms);
                            var existingMetadata = GetExistingMetadata(metadata);
                            // TODO: enthaltene Sprachen setzen und prüfen ob import in der sprache schon da ist
                            if (existingMetadata == null)
                            {
                                metadata.Languages = [metadata.ContentLanguage];
                                if (!string.IsNullOrEmpty(metadata.SchemaVersion))
                                {
                                    context.EClassMetadatas.Add(metadata);
                                    context.SaveChanges();
                                    if (organisation.OwnedEclassData.Any(x => x.Id == metadata.Id))
                                    {
                                        organisation.OwnedEclassData.Add(metadata);
                                        context.SaveChanges();
                                    }
                                }
                            }
                            else
                            {
                                if (
                                    organisation.OwnedEclassData.Any(x =>
                                        x.Id == existingMetadata.Id
                                    )
                                )
                                {
                                    organisation.OwnedEclassData.Add(metadata);
                                    context.SaveChanges();
                                }
                                if (existingMetadata.Languages.Contains(metadata.ContentLanguage))
                                {
                                    if (isFirstFile)
                                    {
                                        break;
                                    }
                                }
                                else
                                {
                                    existingMetadata.Languages.Add(metadata.ContentLanguage);
                                    context.SaveChanges();
                                }

                                metadata = existingMetadata;
                            }
                            isFirstFile = false;

                            if (metadata.Id == null)
                            {
                                continue;
                                // throw new Exception($"NO ID while processing file {entry.Name}");
                            }

                            ConvertClasses(entry, ms, metadata);

                            ConvertProperties(entry, ms, metadata);

                            ConvertDatatypes(entry, ms, metadata);

                            ConvertUnits(entry, ms, metadata);

                            importItem.CountFilesProcessed++;
                            contextUpdateQueue.SaveChanges();
                        }
                    }
                    context.SaveChanges();
                    transaction.Commit();

                    contextUpdateQueue.Remove(importItem);
                    contextUpdateQueue.SaveChanges();
                }
                catch (Exception ex)
                {
                    transaction.Rollback();

                    importItem.Error = true;
                    importItem.DateError = DateTime.Now;
                    importItem.ErrorMessage = ex.Message;
                    contextUpdateQueue.SaveChanges();
                }
                finally
                {
                    Console.WriteLine("Finally");
                }
            }
        }

        private void ConvertUnits(ZipArchiveEntry entry, MemoryStream ms, EClassMetadata metadata)
        {
            var units = EClassUtils.GetEClassUnits(ms, entry.FullName, metadata);
            units?.ForEach(newUnit =>
            {
                // prüfen ob vielleicht schon vorhanden anhand guid, dann nicht noch einmal importieren
                if (!metadata.Id.HasValue)
                {
                    return;
                }
                var existingUnit = GetExistingUnit(newUnit, metadata.Id.Value);
                if (existingUnit == null)
                {
                    context.EClassUnits.Add(newUnit);
                }
                else
                {
                    existingUnit.Definition = existingUnit
                        .Definition.Concat(newUnit.Definition)
                        .DistinctBy(x => x.Key)
                        .ToDictionary(x => x.Key, x => x.Value);
                    existingUnit.PreferredName = existingUnit
                        .PreferredName.Concat(newUnit.PreferredName)
                        .DistinctBy(x => x.Key)
                        .ToDictionary(x => x.Key, x => x.Value);
                    existingUnit.ShortName = existingUnit
                        .ShortName.Concat(newUnit.ShortName)
                        .DistinctBy(x => x.Key)
                        .ToDictionary(x => x.Key, x => x.Value);
                    existingUnit.CodeListValue = existingUnit
                        .CodeListValue.Concat(newUnit.ShortName)
                        .DistinctBy(x => x.Key)
                        .ToDictionary(x => x.Key, x => x.Value);
                    existingUnit.Name = existingUnit
                        .Name.Concat(newUnit.Name)
                        .DistinctBy(x => x.Key)
                        .ToDictionary(x => x.Key, x => x.Value);
                }
            });
            context.SaveChanges();
        }

        private void ConvertDatatypes(
            ZipArchiveEntry entry,
            MemoryStream ms,
            EClassMetadata metadata
        )
        {
            var datatypes = EClassUtils.GetEClassDatatypes(ms, entry.FullName, metadata);
            datatypes?.ForEach(newDatatype =>
            {
                // prüfen ob vielleicht schon vorhanden anhand guid, dann nicht noch einmal importieren
                if (metadata.Id == null)
                {
                    return;
                }

                if (!metadata.Id.HasValue)
                {
                    return;
                }
                var existingDatatype = GetExistingDatatype(newDatatype, metadata.Id.Value);
                if (existingDatatype == null)
                {
                    context.EClassDatatypes.Add(newDatatype);
                }
                else
                {
                    existingDatatype.Definition = existingDatatype
                        .Definition.Concat(newDatatype.Definition)
                        .DistinctBy(x => x.Key)
                        .ToDictionary(x => x.Key, x => x.Value);
                    existingDatatype.PreferredName = existingDatatype
                        .PreferredName.Concat(newDatatype.PreferredName)
                        .DistinctBy(x => x.Key)
                        .ToDictionary(x => x.Key, x => x.Value);
                    // valueMeanings in den TypeDefinitions ...
                    existingDatatype.TypeDefinition.Constraints.ForEach(
                        existingDatatypeConstraint =>
                        {
                            var indx =
                                existingDatatypeConstraint.TypeDefinition.Constraints.IndexOf(
                                    existingDatatypeConstraint
                                );
                            var newValueMeanings = newDatatype
                                .TypeDefinition
                                .Constraints[indx]
                                .ValueMeanings;
                            existingDatatypeConstraint.ValueMeanings.ForEach(existingMeaning =>
                            {
                                existingMeaning.PreferredName = existingMeaning
                                    .PreferredName.Concat(
                                        newValueMeanings
                                            .First(m => m.Guid == existingMeaning.Guid)
                                            .PreferredName
                                    )
                                    .DistinctBy(x => x.Key)
                                    .ToDictionary(x => x.Key, x => x.Value);
                                existingMeaning.Definition = existingMeaning
                                    .Definition.Concat(
                                        newValueMeanings
                                            .First(m => m.Guid == existingMeaning.Guid)
                                            .Definition
                                    )
                                    .DistinctBy(x => x.Key)
                                    .ToDictionary(x => x.Key, x => x.Value);
                                existingMeaning.ShortName = existingMeaning
                                    .ShortName.Concat(
                                        newValueMeanings
                                            .First(m => m.Guid == existingMeaning.Guid)
                                            .ShortName
                                    )
                                    .DistinctBy(x => x.Key)
                                    .ToDictionary(x => x.Key, x => x.Value);
                            });
                        }
                    );
                }
            });
            context.SaveChanges();
        }

        private void ConvertProperties(
            ZipArchiveEntry entry,
            MemoryStream ms,
            EClassMetadata metadata
        )
        {
            var properties = EClassUtils.GetEClassProperties(ms, entry.FullName, metadata);
            properties?.ForEach(newProperty =>
            {
                // prüfen ob vielleicht schon vorhanden anhand guid, dann nicht noch einmal importieren
                if (metadata.Id == null)
                {
                    return;
                }

                if (!metadata.Id.HasValue)
                {
                    return;
                }
                var existingProperty = GetExistingProperty(newProperty, metadata.Id.Value);
                if (existingProperty == null)
                {
                    context.EClassProperties.Add(newProperty);
                }
                else
                {
                    existingProperty.Definition = existingProperty
                        .Definition.Concat(newProperty.Definition)
                        .DistinctBy(x => x.Key)
                        .ToDictionary(x => x.Key, x => x.Value);
                    existingProperty.PreferredName = existingProperty
                        .PreferredName.Concat(newProperty.PreferredName)
                        .DistinctBy(x => x.Key)
                        .ToDictionary(x => x.Key, x => x.Value);
                    existingProperty.ShortName = existingProperty
                        .ShortName.Concat(newProperty.ShortName)
                        .DistinctBy(x => x.Key)
                        .ToDictionary(x => x.Key, x => x.Value);
                }
            });
            context.SaveChanges();
        }

        private void ConvertClasses(ZipArchiveEntry entry, MemoryStream ms, EClassMetadata metadata)
        {
            var classes = EClassUtils.GetEClassClasses(ms, entry.FullName, metadata);
            classes?.ForEach(newClass =>
            {
                // prüfen ob vielleicht schon vorhanden anhand guid, dann nicht noch einmal importieren
                if (metadata.Id == null)
                {
                    return;
                }

                if (!metadata.Id.HasValue)
                {
                    return;
                }
                var existingClass = GetExistingClass(newClass, metadata.Id.Value);
                if (existingClass == null)
                {
                    context.EClassClasses.Add(newClass);
                }
                else
                {
                    existingClass.Definition = existingClass
                        .Definition.Concat(newClass.Definition)
                        .DistinctBy(x => x.Key)
                        .ToDictionary(x => x.Key, x => x.Value);
                    existingClass.Keywords = existingClass
                        .Keywords.Concat(newClass.Keywords)
                        .DistinctBy(x => x.Key)
                        .ToDictionary(x => x.Key, x => x.Value);
                    existingClass.PreferredName = existingClass
                        .PreferredName.Concat(newClass.PreferredName)
                        .DistinctBy(x => x.Key)
                        .ToDictionary(x => x.Key, x => x.Value);
                    existingClass.ShortName = existingClass
                        .ShortName.Concat(newClass.ShortName)
                        .DistinctBy(x => x.Key)
                        .ToDictionary(x => x.Key, x => x.Value);
                }
            });
            context.SaveChanges();
        }

        private EClassMetadata? GetExistingMetadata(EClassMetadata metadata)
        {
            return context.EClassMetadatas.FirstOrDefault(m =>
                m.ContentIdentification == metadata.ContentIdentification
                && metadata.ContentDescription == m.ContentDescription
            );
        }

        private EClassClass? GetExistingClass(EClassClass eclass, long metadataId)
        {
            return context.EClassClasses.FirstOrDefault(c =>
                c.Guid == eclass.Guid && c.EClassMetadataId == metadataId
            );
        }

        private EClassProperty? GetExistingProperty(EClassProperty property, long metadataId)
        {
            return context.EClassProperties.FirstOrDefault(c =>
                c.Guid == property.Guid && c.EClassMetadataId == metadataId
            );
        }

        private EClassDatatype? GetExistingDatatype(EClassDatatype datatype, long metadataId)
        {
            var dt = context
                .EClassDatatypes.Include(d => d.TypeDefinition)
                    .ThenInclude(td => td.Constraints)
                .FirstOrDefault(c => c.Guid == datatype.Guid && c.EClassMetadataId == metadataId);
            dt?.TypeDefinition.Constraints.ForEach(c =>
            {
                context.Entry(c).Collection(c => c.ValueMeanings).Load();
            });

            return dt;
        }

        private EClassUnit? GetExistingUnit(EClassUnit unit, long metadataId)
        {
            return context.EClassUnits.FirstOrDefault(c =>
                c.Irdi == unit.Irdi && c.EClassMetadataId == metadataId
            );
        }
    }
}
