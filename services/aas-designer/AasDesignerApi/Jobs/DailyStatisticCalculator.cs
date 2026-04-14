using System.Globalization;
using AasDesignerApi.Model;
using AasDesignerApi.Statistics;
using AasDesignerModel;

namespace AasDesignerApi.Jobs
{
    public class DailyStatisticCalculator : IHostedService, IDisposable
    {
        private int executionCount = 0;
        private readonly ILogger<DailyStatisticCalculator> _logger;
        private readonly IServiceProvider _provider;
        private Timer? _timer = null;

        public DailyStatisticCalculator(
            ILogger<DailyStatisticCalculator> logger,
            IServiceProvider provider
        )
        {
            _logger = logger;
            _provider = provider;
        }

        public Task StartAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("StatisticCalculator running.");

            // _timer = new Timer(DoWork, null, TimeSpan.Zero,
            //     TimeSpan.FromSeconds(5));

            // täglicher Lauf
            _timer = new Timer(DoWork, null, getJobRunDelay(), new TimeSpan(24, 0, 0));

            return Task.CompletedTask;
        }

        private void DoWork(object? state)
        {
            var count = Interlocked.Increment(ref executionCount);

            var now = DateTime.Today;

            using (var scope = _provider.CreateScope()) // this will use `IServiceScopeFactory` internally
            {
                var context = scope.ServiceProvider.GetService<IApplicationDbContext>();
                if (context != null)
                {
                    var yesterday = DateTime.Today.AddDays(-1);
                    var orgas = context.Organisations.Where(o => o.Geloescht != true).ToList();
                    orgas.ForEach(o =>
                    {
                        var uploadsYesterday = context.StatisticActions.Count(s =>
                            s.ActionDate.Day == yesterday.Day
                            && s.ActionDate.Month == yesterday.Month
                            && s.ActionDate.Year == yesterday.Year
                            && s.Typ == StatisticActionType.UPLOAD
                            && s.OrgaId == o.Id
                        );

                        var statData = context
                            .StatisticDatas.Where(s =>
                                s.Typ == StatisticsType.UPLOADS_YESTERDAY && s.OrgaId == o.Id
                            )
                            .FirstOrDefault();
                        if (statData == null)
                        {
                            statData = new StatisticData
                            {
                                Typ = StatisticsType.UPLOADS_YESTERDAY,
                                OrgaId = o.Id,
                            };
                            context.Add(statData);
                        }
                        statData.Value = uploadsYesterday;
                        context.SaveChanges();

                        var registerYesterday = context.StatisticActions.Count(s =>
                            s.ActionDate.Day == yesterday.Day
                            && s.ActionDate.Month == yesterday.Month
                            && s.ActionDate.Year == yesterday.Year
                            && s.Typ == StatisticActionType.REGISTRATION
                            && s.OrgaId == o.Id
                        );

                        statData = context
                            .StatisticDatas.Where(s =>
                                s.Typ == StatisticsType.REGISTRATIONS_YESTERDAY && s.OrgaId == o.Id
                            )
                            .FirstOrDefault();
                        if (statData == null)
                        {
                            statData = new StatisticData
                            {
                                Typ = StatisticsType.REGISTRATIONS_YESTERDAY,
                                OrgaId = o.Id,
                            };
                            context.Add(statData);
                        }
                        statData.Value = registerYesterday;
                        context.SaveChanges();

                        var publishYesterday = context.StatisticActions.Count(s =>
                            s.ActionDate.Day == yesterday.Day
                            && s.ActionDate.Month == yesterday.Month
                            && s.ActionDate.Year == yesterday.Year
                            && s.Typ == StatisticActionType.PUBLISH
                            && s.OrgaId == o.Id
                        );

                        statData = context
                            .StatisticDatas.Where(s =>
                                s.Typ == StatisticsType.PUBLISH_YESTERDAY && s.OrgaId == o.Id
                            )
                            .FirstOrDefault();
                        if (statData == null)
                        {
                            statData = new StatisticData
                            {
                                Typ = StatisticsType.PUBLISH_YESTERDAY,
                                OrgaId = o.Id,
                            };
                            context.Add(statData);
                        }
                        statData.Value = registerYesterday;
                        context.SaveChanges();
                    });
                }
            }

            _logger.LogInformation("DailyStatisticCalculator is working. Count: {Count}", count);
        }

        public Task StopAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("DailyStatisticCalculator is stopping.");

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
