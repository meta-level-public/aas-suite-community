using System.Drawing.Text;
using System.Globalization;
using AasDesignerApi.Mail;
using AasDesignerApi.Model;
using AasDesignerApi.Statistics;
using AasDesignerModel;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerApi.Jobs
{
    public class DailyQmZertChecker : IHostedService, IDisposable
    {
        private int executionCount = 0;
        private readonly ILogger<DailyQmZertChecker> _logger;
        private readonly IServiceProvider _provider;
        private readonly MailService _mailService;
        private Timer? _timer = null;
        private readonly IConfiguration _configuration;

        public DailyQmZertChecker(
            ILogger<DailyQmZertChecker> logger,
            MailService mailService,
            IServiceProvider provider,
            IConfiguration configuration
        )
        {
            _logger = logger;
            _provider = provider;
            _mailService = mailService;
            _configuration = configuration;
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

            var nowMinus14Days = DateTime.Today.AddDays(-14);

            using (var scope = _provider.CreateScope()) // this will use `IServiceScopeFactory` internally
            {
                var context = scope.ServiceProvider.GetService<IApplicationDbContext>();
                if (context != null)
                {
                    var lastRun = context
                        .PersistentSettings.AsNoTracking()
                        .Where(s => s.Name == "DailyQmZertChecker_LastRun")
                        .FirstOrDefault();
                    if (lastRun != null)
                    {
                        if (
                            DateTime.TryParseExact(
                                lastRun.Value,
                                "yyyy-MM-dd HH:mm:ss",
                                CultureInfo.InvariantCulture,
                                DateTimeStyles.None,
                                out DateTime lastRunDateTime
                            )
                        )
                        {
                            if (lastRunDateTime.Date >= nowMinus14Days)
                            {
                                _logger.LogInformation(
                                    "DailyQmZertChecker: Last run was less than 14 days ago. Skipping this run."
                                );
                                return;
                            }
                            SendMail(context);

                            lastRun.Value = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");

                            context.Update(lastRun);
                            context.SaveChanges();
                        }
                    }
                    else
                    {
                        // first run ever
                        lastRun = new PersistentSetting
                        {
                            Name = "DailyQmZertChecker_LastRun",
                            Value = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"),
                        };

                        SendMail(context);

                        context.Add(lastRun);
                        context.SaveChanges();
                    }
                }

                _logger.LogInformation("DailyQmZertChecker is working. Count: {Count}", count);
            }
        }

        private string SendMail(IApplicationDbContext context)
        {
            var body = string.Empty;

            var orgas = context
                .Organisations.Where(o => o.Geloescht != true)
                .AsNoTracking()
                .ToList();
            orgas.ForEach(o =>
            {
                // Datei erzeugen und Mailen
                // jeder Datensatz muss Organame Orgastrasse Ort PLZ Ablaufdatum Status enthalten

                // TODO: fill body
            });

            var subject = "[AAS-Designer] QM-Zertifikat Organisationsbenachrichtigung";
            var rcptEmailConfig = _configuration["QMZertRecipients"];
            if (!string.IsNullOrEmpty(rcptEmailConfig))
            {
                var splittedEmails = rcptEmailConfig.Split(
                    ';',
                    StringSplitOptions.RemoveEmptyEntries
                );
                foreach (var email in splittedEmails)
                {
                    _mailService.SendMail(email, subject, body, true);
                }
            }
            else
            {
                _logger.LogWarning(
                    "DailyQmZertChecker: No QM-Zert recipients configured. Skipping email sending."
                );
            }

            return body;
        }

        public Task StopAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("DailyQmZertChecker is stopping.");

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
            string jobStartTime = "00:15";
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
