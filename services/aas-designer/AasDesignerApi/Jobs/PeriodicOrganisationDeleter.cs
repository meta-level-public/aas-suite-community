using System.Globalization;
using System.Text.Json;
using AasDesignerAasApi.Infrastructure;
using AasDesignerApi.ExpirationWarning;
using AasDesignerApi.Extensions;
using AasDesignerApi.Mail;
using AasDesignerApi.Model;
using AasDesignerApi.Statistics;
using AasDesignerApi.Utils;
using AasDesignerCommon.Utils;
using AasDesignerModel;
using AasDesignerModel.Model;
using AasShared.Configuration;
using CsvHelper.Configuration.Attributes;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;

namespace AasDesignerApi.Jobs
{
    public class PeriodicOrganisationDeleter : IHostedService, IDisposable
    {
        private int executionCount = 0;
        private readonly ILogger<PeriodicOrganisationDeleter> _logger;
        private readonly IServiceProvider _provider;
        private Timer? _timer = null;

        public PeriodicOrganisationDeleter(
            ILogger<PeriodicOrganisationDeleter> logger,
            IServiceProvider provider
        )
        {
            _logger = logger;
            _provider = provider;
        }

        public Task StartAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("PeriodicOrganisationDeleter running.");

            // _timer = new Timer(DoWork, null, TimeSpan.Zero,
            //     TimeSpan.FromMinutes(5));

            // stündlicher Lauf
            _timer = new Timer(DoWork, null, TimeSpan.Zero, TimeSpan.FromHours(1));

            return Task.CompletedTask;
        }

        private void DoWork(object? state)
        {
            var count = Interlocked.Increment(ref executionCount);

            var now = DateTime.Today;

            using (var scope = _provider.CreateScope()) // this will use `IServiceScopeFactory` internally
            {
                var context = scope.ServiceProvider.GetService<IApplicationDbContext>();
                var appSettings = scope.ServiceProvider.GetService<AppSettings>();
                if (context != null && appSettings != null)
                {
                    var orgas = context.Organisations.Where(o => o.Geloescht).ToList();
                    orgas.ForEach(o =>
                    {
                        try
                        {
                            // hier müssen wir alle Referenzierten Objekte mit entfernen

                            var orgaUsers = context
                                .BenutzerOrganisations.Include(bo => bo.Benutzer)
                                .Where(bo => bo.OrganisationId == o.Id)
                                .ToList();

                            orgaUsers.ForEach(orgaUser =>
                            {
                                context.ProductFamilys.RemoveRangeHardDelete(
                                    context
                                        .ProductFamilys.Where(pf =>
                                            pf.BesitzerId == orgaUser.BenutzerId
                                        )
                                        .ToList()
                                );
                                context.ProductFamilys.RemoveRangeHardDelete(
                                    context
                                        .ProductFamilys.Where(pf =>
                                            pf.BesitzerOrganisationId == orgaUser.OrganisationId
                                        )
                                        .ToList()
                                );
                                context.ProductRoots.RemoveRangeHardDelete(
                                    context
                                        .ProductRoots.Where(pf =>
                                            pf.BesitzerId == orgaUser.BenutzerId
                                        )
                                        .ToList()
                                );
                                context.ProductRoots.RemoveRangeHardDelete(
                                    context
                                        .ProductRoots.Where(pf =>
                                            pf.BesitzerOrganisationId == orgaUser.OrganisationId
                                        )
                                        .ToList()
                                );
                                context.ProductDesignations.RemoveRangeHardDelete(
                                    context
                                        .ProductDesignations.Where(pf =>
                                            pf.BesitzerId == orgaUser.BenutzerId
                                        )
                                        .ToList()
                                );
                                context.ProductDesignations.RemoveRangeHardDelete(
                                    context
                                        .ProductDesignations.Where(pf =>
                                            pf.BesitzerOrganisationId == orgaUser.OrganisationId
                                        )
                                        .ToList()
                                );
                                context.Adresses.RemoveRangeHardDelete(
                                    context
                                        .Adresses.Where(pf => pf.BesitzerId == orgaUser.BenutzerId)
                                        .ToList()
                                );
                                context.SharedLinks.RemoveRangeHardDelete(
                                    context
                                        .SharedLinks.Where(pf =>
                                            pf.BesitzerId == orgaUser.BenutzerId
                                        )
                                        .ToList()
                                );
                                context.Snippets.RemoveRangeHardDelete(
                                    context
                                        .Snippets.Where(pf => pf.BesitzerId == orgaUser.BenutzerId)
                                        .ToList()
                                );

                                // RefreshToken?

                                var deleteProtocolEntryUser = new DeleteProtocol
                                {
                                    DeleteType = DeleteType.UserAccount,
                                    AdditionalData = JsonConvert.SerializeObject(
                                        new
                                        {
                                            Email = EmailUtilService.AnonymizeEmail(
                                                orgaUser.Benutzer.Email
                                            ),
                                        }
                                    ),
                                    AnlageBenutzer = "System",
                                    AnlageDatum = DateTime.Now,
                                    AenderungsBenutzer = "System",
                                    AenderungsDatum = DateTime.Now,
                                };
                                context.Add(deleteProtocolEntryUser);
                            });

                            context.OrgaHelpTexts.RemoveRangeHardDelete(
                                context
                                    .OrgaHelpTexts.Where(oht => oht.OrganisationId == o.Id)
                                    .ToList()
                            );
                            context.OrganisationPaymentModels.RemoveRangeHardDelete(
                                context
                                    .OrganisationPaymentModels.Where(opm =>
                                        opm.OrganisationId == o.Id
                                    )
                                    .ToList()
                            );
                            context.OrgaRechnungen.RemoveRangeHardDelete(
                                context
                                    .OrgaRechnungen.Where(or => or.OrganisationId == o.Id)
                                    .ToList()
                            );

                            context.Mappings.RemoveRangeHardDelete(
                                context.Mappings.Where(m => m.BesitzerOrgaId == o.Id).ToList()
                            );
                            context.PcnListeners.RemoveRangeHardDelete(
                                context.PcnListeners.Where(pl => pl.OrganizationId == o.Id).ToList()
                            );

                            context.SubmodelTemplates.RemoveRangeHardDelete(
                                context
                                    .SubmodelTemplates.Where(st => st.OrganisationId == o.Id)
                                    .ToList()
                            );
                            context.Snippets.RemoveRangeHardDelete(
                                context
                                    .Snippets.Where(st => st.BesitzerOrganisationId == o.Id)
                                    .ToList()
                            );

                            var eclassCerts = context
                                .EclassCertificats.Include(ecb => ecb.CertificateBlob)
                                .Where(ec => ec.OrganisationId == o.Id)
                                .ToList();
                            context.EclassCertificateBlobs.RemoveRangeHardDelete(
                                eclassCerts.Select(ec => ec.CertificateBlob).ToList()
                            );
                            context.EclassCertificats.RemoveRangeHardDelete(eclassCerts);

                            context.Adresses.RemoveRangeHardDelete(
                                context
                                    .Adresses.Where(a => a.BesitzerOrganisationId == o.Id)
                                    .ToList()
                            );
                            context.RequestForOffers.RemoveRangeHardDelete(
                                context
                                    .RequestForOffers.Where(rfo => rfo.OrganisationId == o.Id)
                                    .ToList()
                            );
                            context.Invitations.RemoveRangeHardDelete(
                                context.Invitations.Where(i => i.OrganisationId == o.Id).ToList()
                            );
                            context.Apikeys.RemoveRangeHardDelete(
                                context.Apikeys.Where(a => a.OrganisationId == o.Id).ToList()
                            );

                            var deleteProtocolEntryOrga = new DeleteProtocol
                            {
                                DeleteType = DeleteType.Organisation,
                                AdditionalData = JsonConvert.SerializeObject(
                                    new { o.Name, o.Email }
                                ),
                                AnlageBenutzer = "System",
                                AnlageDatum = DateTime.Now,
                                AenderungsBenutzer = "System",
                                AenderungsDatum = DateTime.Now,
                            };
                            context.Add(deleteProtocolEntryOrga);

                            o.ShouldBeHardDeleted = true;
                            context.Organisations.Remove(o);
                            context.SaveChanges();
                            _logger.LogInformation(
                                "Organisation {OrgaName} with ID {OrgaId} deleted.",
                                o.Name,
                                o.Id
                            );
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(
                                ex,
                                "Error deleting organisation {OrgaName} with ID {OrgaId}.",
                                o.Name,
                                o.Id
                            );
                        }
                    });
                }
            }

            _logger.LogInformation("PeriodicOrganisationDeleter is working. Count: {Count}", count);
        }

        public Task StopAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("PeriodicOrganisationDeleter is stopping.");

            _timer?.Change(Timeout.Infinite, 0);

            return Task.CompletedTask;
        }

        public void Dispose()
        {
            _timer?.Dispose();
        }

        private static TimeSpan getScheduledParsedTime()
        {
            string[] formats = [@"hh\:mm\:ss", "hh\\:mm"];
            string jobStartTime = "00:10";
            TimeSpan.TryParseExact(
                jobStartTime,
                formats,
                CultureInfo.InvariantCulture,
                out TimeSpan ScheduledTimespan
            );
            return ScheduledTimespan;
        }

        private static TimeSpan getJobRunDelay()
        {
            TimeSpan scheduledParsedTime = getScheduledParsedTime();
            TimeSpan curentTimeOftheDay = TimeSpan.Parse(
                DateTime.Now.TimeOfDay.ToString("hh\\:mm")
            );
            TimeSpan delayTime =
                scheduledParsedTime >= curentTimeOftheDay
                    ? scheduledParsedTime - curentTimeOftheDay
                    : new TimeSpan(24, 0, 0) - curentTimeOftheDay + scheduledParsedTime;
            return delayTime;
        }
    }
}
