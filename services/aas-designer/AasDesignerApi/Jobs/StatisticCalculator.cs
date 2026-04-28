using AasDesignerApi.Model;
using AasDesignerApi.Statistics;
using AasDesignerModel;

namespace AasDesignerApi.Jobs
{
    public class StatisticCalculator : IHostedService, IDisposable
    {
        private int executionCount = 0;
        private readonly ILogger<StatisticCalculator> _logger;
        private readonly IServiceProvider _provider;
        private CancellationTokenSource? _cts;

        public StatisticCalculator(ILogger<StatisticCalculator> logger, IServiceProvider provider)
        {
            _logger = logger;
            _provider = provider;
        }

        public Task StartAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("StatisticCalculator running.");
            _cts = CancellationTokenSource.CreateLinkedTokenSource(stoppingToken);
            _ = Task.Run(() => RunLoopAsync(_cts.Token), _cts.Token);
            return Task.CompletedTask;
        }

        private async Task RunLoopAsync(CancellationToken cancellationToken)
        {
            var lastRun = DateTimeOffset.MinValue;
            using var timer = new PeriodicTimer(TimeSpan.FromMinutes(1));

            while (await timer.WaitForNextTickAsync(cancellationToken))
            {
                StatisticCalculatorSettingsDto settings;
                try
                {
                    using var scope = _provider.CreateScope();
                    var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();
                    settings = await StatisticCalculatorSettingsStore.LoadAsync(
                        db,
                        cancellationToken
                    );
                }
                catch
                {
                    settings = new StatisticCalculatorSettingsDto(
                        StatisticCalculatorSettingsStore.DefaultIntervalMinutes,
                        true
                    );
                }

                if (!settings.IsEnabled)
                    continue;

                if (
                    DateTimeOffset.UtcNow - lastRun
                    < TimeSpan.FromMinutes(settings.IntervalMinutes)
                )
                    continue;

                lastRun = DateTimeOffset.UtcNow;
                try
                {
                    DoWork(null);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "StatisticCalculator: Fehler im Lauf.");
                }
            }
        }

        private void DoWork(object? state)
        {
            try
            {
                var count = Interlocked.Increment(ref executionCount);

                var now = DateTime.Today;

                using (var scope = _provider.CreateScope()) // this will use `IServiceScopeFactory` internally
                {
                    var context = scope.ServiceProvider.GetService<IApplicationDbContext>();
                    if (context != null)
                    {
                        var orgas = context.Organisations.Where(o => o.Geloescht != true).ToList();
                        orgas.ForEach(o =>
                        {
                            var count = context.StatisticActions.Count(s =>
                                s.Typ == StatisticActionType.UPLOAD && s.OrgaId == o.Id
                            );

                            var statData = context
                                .StatisticDatas.Where(s =>
                                    s.Typ == StatisticsType.UPLOADS_TOTAL && s.OrgaId == o.Id
                                )
                                .FirstOrDefault();
                            if (statData == null)
                            {
                                statData = new StatisticData
                                {
                                    Typ = StatisticsType.UPLOADS_TOTAL,
                                    OrgaId = o.Id,
                                };
                                context.Add(statData);
                            }
                            statData.Value = count;
                            context.SaveChanges();

                            count = context.StatisticActions.Count(s =>
                                s.ActionDate.Day == now.Day
                                && s.ActionDate.Month == now.Month
                                && s.ActionDate.Year == now.Year
                                && s.Typ == StatisticActionType.UPLOAD
                                && s.OrgaId == o.Id
                            );

                            statData = context
                                .StatisticDatas.Where(s =>
                                    s.Typ == StatisticsType.UPLOADS_TODAY && s.OrgaId == o.Id
                                )
                                .FirstOrDefault();
                            if (statData == null)
                            {
                                statData = new StatisticData
                                {
                                    Typ = StatisticsType.UPLOADS_TODAY,
                                    OrgaId = o.Id,
                                };
                                context.Add(statData);
                            }
                            statData.Value = count;
                            context.SaveChanges();

                            count = context.StatisticActions.Count(s =>
                                s.Typ == StatisticActionType.REGISTRATION && s.OrgaId == o.Id
                            );

                            statData = context
                                .StatisticDatas.Where(s =>
                                    s.Typ == StatisticsType.REGISTRATIONS_TOTAL && s.OrgaId == o.Id
                                )
                                .FirstOrDefault();
                            if (statData == null)
                            {
                                statData = new StatisticData
                                {
                                    Typ = StatisticsType.REGISTRATIONS_TOTAL,
                                    OrgaId = o.Id,
                                };
                                context.Add(statData);
                            }
                            statData.Value = count;
                            context.SaveChanges();

                            count = context.StatisticActions.Count(s =>
                                s.ActionDate.Day == now.Day
                                && s.ActionDate.Month == now.Month
                                && s.ActionDate.Year == now.Year
                                && s.Typ == StatisticActionType.REGISTRATION
                                && s.OrgaId == o.Id
                            );

                            statData = context
                                .StatisticDatas.Where(s =>
                                    s.Typ == StatisticsType.REGISTRATIONS_TODAY && s.OrgaId == o.Id
                                )
                                .FirstOrDefault();
                            if (statData == null)
                            {
                                statData = new StatisticData
                                {
                                    Typ = StatisticsType.REGISTRATIONS_TODAY,
                                    OrgaId = o.Id,
                                };
                                context.Add(statData);
                            }
                            statData.Value = count;
                            context.SaveChanges();

                            count = context.StatisticActions.Count(s =>
                                s.Typ == StatisticActionType.PUBLISH && s.OrgaId == o.Id
                            );

                            statData = context
                                .StatisticDatas.Where(s =>
                                    s.Typ == StatisticsType.PUBLISH_TOTAL && s.OrgaId == o.Id
                                )
                                .FirstOrDefault();
                            if (statData == null)
                            {
                                statData = new StatisticData
                                {
                                    Typ = StatisticsType.PUBLISH_TOTAL,
                                    OrgaId = o.Id,
                                };
                                context.Add(statData);
                            }
                            statData.Value = count;
                            context.SaveChanges();

                            count = context.StatisticActions.Count(s =>
                                s.ActionDate.Day == now.Day
                                && s.ActionDate.Month == now.Month
                                && s.ActionDate.Year == now.Year
                                && s.Typ == StatisticActionType.PUBLISH
                                && s.OrgaId == o.Id
                            );

                            statData = context
                                .StatisticDatas.Where(s =>
                                    s.Typ == StatisticsType.PUBLISH_TODAY && s.OrgaId == o.Id
                                )
                                .FirstOrDefault();
                            if (statData == null)
                            {
                                statData = new StatisticData
                                {
                                    Typ = StatisticsType.PUBLISH_TODAY,
                                    OrgaId = o.Id,
                                };
                                context.Add(statData);
                            }
                            statData.Value = count;
                            context.SaveChanges();
                        });
                    }
                }

                _logger.LogInformation("StatisticCalculator is working. Count: {Count}", count);
            }
            catch
            {
                /**/
            }
        }

        public Task StopAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("StatisticCalculator is stopping.");
            _cts?.Cancel();
            return Task.CompletedTask;
        }

        public void Dispose()
        {
            _cts?.Dispose();
        }
    }
}
