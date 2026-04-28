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
        private CancellationTokenSource? _cts;

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
            _logger.LogInformation("DailyStatisticCalculator running.");
            _cts = CancellationTokenSource.CreateLinkedTokenSource(stoppingToken);
            _ = Task.Run(() => RunLoopAsync(_cts.Token), _cts.Token);
            return Task.CompletedTask;
        }

        private async Task RunLoopAsync(CancellationToken cancellationToken)
        {
            // Warte bis zur geplanten Startzeit
            var initialDelay = getJobRunDelay();
            if (initialDelay > TimeSpan.Zero)
                await Task.Delay(initialDelay, cancellationToken).ConfigureAwait(false);

            var lastRun = DateTimeOffset.MinValue;
            using var timer = new PeriodicTimer(TimeSpan.FromMinutes(10));

            while (await timer.WaitForNextTickAsync(cancellationToken))
            {
                DailyStatisticCalculatorSettingsDto settings;
                try
                {
                    using var scope = _provider.CreateScope();
                    var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();
                    settings = await DailyStatisticCalculatorSettingsStore.LoadAsync(
                        db,
                        cancellationToken
                    );
                }
                catch
                {
                    settings = new DailyStatisticCalculatorSettingsDto(
                        DailyStatisticCalculatorSettingsStore.DefaultIntervalMinutes,
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
                    _logger.LogError(ex, "DailyStatisticCalculator: Fehler im Lauf.");
                }
            }
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
            _cts?.Cancel();
            return Task.CompletedTask;
        }

        public void Dispose()
        {
            _cts?.Dispose();
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
