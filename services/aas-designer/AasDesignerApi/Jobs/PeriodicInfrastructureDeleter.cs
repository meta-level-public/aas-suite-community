using System.Globalization;
using AasDesignerAasApi.Infrastructure;
using AasDesignerApi.ExpirationWarning;
using AasDesignerApi.Extensions;
using AasDesignerApi.Mail;
using AasDesignerApi.Model;
using AasDesignerApi.Statistics;
using AasDesignerCommon.Utils;
using AasDesignerModel;
using AasDesignerModel.Model;
using AasShared.Configuration;
using CsvHelper.Configuration.Attributes;
using Newtonsoft.Json;

namespace AasDesignerApi.Jobs
{
    public class PeriodicInfrastructureDeleter : IHostedService, IDisposable
    {
        private int executionCount = 0;
        private readonly ILogger<PeriodicInfrastructureDeleter> _logger;
        private readonly IServiceProvider _provider;
        private Timer? _timer = null;

        public PeriodicInfrastructureDeleter(
            ILogger<PeriodicInfrastructureDeleter> logger,
            IServiceProvider provider
        )
        {
            _logger = logger;
            _provider = provider;
        }

        public Task StartAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("PeriodicInfrastructureDeleter running.");

            // _timer = new Timer(DoWork, null, TimeSpan.Zero,
            //     TimeSpan.FromMinutes(5));

            // stündlicher Lauf
            _timer = new Timer(DoWork, null, TimeSpan.Zero, TimeSpan.FromHours(1));

            return Task.CompletedTask;
        }

        /// <summary>
        /// This method is called by the timer to perform the work.
        /// It checks for infrastructures that are not referenced by any organisation
        /// and deletes them if they are not.
        /// It also creates a delete protocol entry for each deleted infrastructure.
        /// </summary>
        /// <param name="state"></param>
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
                    // prüfen, welche Infrastrukturen nicht referenziert sind
                    var infrastructures = context
                        .AasInfrastructureSettings.Where(s =>
                            s.IsInternal && !string.IsNullOrWhiteSpace(s.ContainerGuid)
                        )
                        .ToList();
                    infrastructures.ForEach(infraSetting =>
                    {
                        try
                        {
                            var referencingOrga = context.Organisations.Any(o =>
                                o.InternalAasInfrastructureGuid == infraSetting.ContainerGuid
                            );
                            if (!referencingOrga)
                            {
                                // apikey löschen
                                context.Apikeys.RemoveRange(
                                    context.Apikeys.Where(a =>
                                        a.AasInfrastructureSettingsId == infraSetting.Id
                                    )
                                );

                                // Infrastruktur löschen
                                context.AasInfrastructureSettings.RemoveHardDelete(infraSetting);

                                InfrastructureChangeRequester.RequestInfrastructureRemoval(
                                    infraSetting.ContainerGuid,
                                    appSettings.ContainerManagerInboxDirectory
                                );
                                var deleteProtocol = new DeleteProtocol
                                {
                                    DeleteType = DeleteType.Infrastructure,
                                    AdditionalData = JsonConvert.SerializeObject(
                                        new
                                        {
                                            InfraName = infraSetting.Name,
                                            InfraGuid = infraSetting.ContainerGuid,
                                        }
                                    ),
                                    AnlageBenutzer = "System",
                                    AnlageDatum = DateTime.Now,
                                    AenderungsBenutzer = "System",
                                    AenderungsDatum = DateTime.Now,
                                };
                                context.Add(deleteProtocol);
                                context.SaveChanges();
                                _logger.LogInformation(
                                    "Infrastructure {InfraName} with GUID {InfraGuid} deleted.",
                                    infraSetting.Name,
                                    infraSetting.ContainerGuid
                                );
                            }
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(
                                ex,
                                "Error deleting infrastructure {InfraName} with GUID {InfraGuid}.",
                                infraSetting.Name,
                                infraSetting.ContainerGuid
                            );
                        }
                    });
                }
            }

            _logger.LogInformation(
                "PeriodicInfrastructureDeleter is working. Count: {Count}",
                count
            );
        }

        public Task StopAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("PeriodicInfrastructureDeleter is stopping.");

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
