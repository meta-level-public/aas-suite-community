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
        private Timer? _timer = null;

        public StatisticCalculator(ILogger<StatisticCalculator> logger, IServiceProvider provider)
        {
            _logger = logger;
            _provider = provider;
        }

        public Task StartAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("StatisticCalculator running.");

            // _timer = new Timer(DoWork, null, TimeSpan.Zero,
            //     TimeSpan.FromSeconds(5));

            _timer = new Timer(DoWork, null, TimeSpan.Zero, TimeSpan.FromMinutes(10));

            return Task.CompletedTask;
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

            _timer?.Change(Timeout.Infinite, 0);

            return Task.CompletedTask;
        }

        public void Dispose()
        {
            _timer?.Dispose();
        }
    }
}
