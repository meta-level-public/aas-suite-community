using System.Globalization;
using AasDesignerApi.ExpirationWarning;
using AasDesignerApi.Mail;
using AasDesignerApi.Model;
using AasDesignerApi.Statistics;
using AasDesignerCommon.Utils;
using AasDesignerModel;
using AasDesignerModel.Model;
using AasDesignerSystemManagementApi.SystemManagement.Model;
using AasShared.Configuration;
using CsvHelper.Configuration.Attributes;

namespace AasDesignerApi.Jobs
{
    public class DailyExpiredOrganisationsChecker : IHostedService, IDisposable
    {
        private int executionCount = 0;
        private readonly ILogger<DailyExpiredOrganisationsChecker> _logger;
        private readonly IServiceProvider _provider;
        private Timer? _timer = null;

        public DailyExpiredOrganisationsChecker(
            ILogger<DailyExpiredOrganisationsChecker> logger,
            IServiceProvider provider
        )
        {
            _logger = logger;
            _provider = provider;
        }

        public Task StartAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("DailyExpiredAccountsChecker running.");

            // _timer = new Timer(DoWork, null, TimeSpan.Zero,
            //     TimeSpan.FromMinutes(15));

            // täglicher Lauf
            _timer = new Timer(DoWork, null, getJobRunDelay(), new TimeSpan(24, 0, 7));

            return Task.CompletedTask;
        }

        private void DoWork(object? state)
        {
            var count = Interlocked.Increment(ref executionCount);

            var now = DateTime.Today;

            using (var scope = _provider.CreateScope()) // this will use `IServiceScopeFactory` internally
            {
                using var context = scope.ServiceProvider.GetService<IApplicationDbContext>();
                var mailer = scope.ServiceProvider.GetService<MailService>();
                var mailSettingsRuntimeService =
                    scope.ServiceProvider.GetService<IMailSettingsRuntimeService>();
                if (context != null && mailer != null && mailSettingsRuntimeService != null)
                {
                    var emailConfig = mailSettingsRuntimeService.GetApplicationMailSettings();
                    var today = DateTime.Today;
                    var sevenDaysBefore = DateTime.Today.AddDays(-7);
                    var orgas = context.Organisations.ToList();
                    orgas.ForEach(o =>
                    {
                        try
                        {
                            var validPaymentModels = o.GetValidPaymentModels(context, today);
                            if (validPaymentModels.Count > 0)
                            {
                                // es gibt noch gültige Bezahlmodelle, also ist der Account noch aktiv, prüfen ob Restlaufzeit > 7 Tage bei irgendeinem der Bezahlmodelle
                                var hasAnyValidLonger7Days = validPaymentModels.Exists(b =>
                                    b.EndDate == null || b.EndDate > today.AddDays(7)
                                );
                                if (hasAnyValidLonger7Days)
                                {
                                    // es gibt noch gültige Bezahlmodelle, also ist der Account noch aktiv
                                    o.ExpirationState = ExpirationState.NOTHING;
                                    o.ExpirationStateDate = DateTime.Now;
                                }
                                else
                                {
                                    // es gibt keine gültigen Bezahlmodelle mehr, die länger als 7 Tage laufen,
                                    // Prüfen, ob es ein Bezahlmodell gibt, welches heute abläuft
                                    var hasAnyValidShorter1Days = validPaymentModels.Exists(b =>
                                        b.EndDate != null && b.EndDate < today.AddDays(1)
                                    );
                                    if (hasAnyValidShorter1Days)
                                    {
                                        if (
                                            o.ExpirationState
                                            != ExpirationState.WARNING_EXPIRIATION_TODAY
                                        )
                                        {
                                            _logger.LogDebug(
                                                "Account {Id} is expiring today.",
                                                o.Id
                                            );
                                            var lastOrgaPaymentModel = context
                                                .OrganisationPaymentModels.Where(p =>
                                                    p.OrganisationId == o.Id
                                                )
                                                .OrderByDescending(p => p.EndDate)
                                                .FirstOrDefault();
                                            var expiryDate =
                                                (lastOrgaPaymentModel?.EndDate) ?? DateTime.Today;
                                            // Mail senden
                                            AccountExpiringTodayWarner.SendWarnmail(
                                                o,
                                                context,
                                                mailer,
                                                expiryDate,
                                                emailConfig.SubjectPrefix,
                                                _logger
                                            );
                                            // Status setzen
                                            o.ExpirationState =
                                                ExpirationState.WARNING_EXPIRIATION_TODAY;
                                            o.ExpirationStateDate = DateTime.Now;
                                        }
                                        else
                                        {
                                            _logger.LogDebug(
                                                "Account {Id} is expiring today, but warnmail is sent.",
                                                o.Id
                                            );
                                        }
                                    }
                                    else
                                    {
                                        // also warnen, wenn nicht bereits getan
                                        if (
                                            o.ExpirationState
                                            != ExpirationState.WARNING_EXPIRIATION_IN_7_DAYS
                                        )
                                        {
                                            _logger.LogDebug(
                                                "Account {Id} is expiring in 7 days.",
                                                o.Id
                                            );
                                            var lastOrgaPaymentModel = context
                                                .OrganisationPaymentModels.Where(p =>
                                                    p.OrganisationId == o.Id
                                                )
                                                .OrderByDescending(p => p.EndDate)
                                                .FirstOrDefault();
                                            var expiryDate =
                                                (lastOrgaPaymentModel?.EndDate)
                                                ?? DateTime.Today.AddDays(7);
                                            // Mail senden
                                            AccountExpiringIn7DaysWarner.SendWarnmail(
                                                o,
                                                context,
                                                mailer,
                                                expiryDate,
                                                emailConfig.SubjectPrefix,
                                                _logger
                                            );
                                            // Status setzen
                                            o.ExpirationState =
                                                ExpirationState.WARNING_EXPIRIATION_IN_7_DAYS;
                                            o.ExpirationStateDate = DateTime.Now;
                                        }
                                        else
                                        {
                                            // es wurde bereits gewarnt, also nichts tun
                                            _logger.LogDebug(
                                                "Account {Id} already warned for expiration in 7 days.",
                                                o.Id
                                            );
                                        }
                                    }
                                }
                            }
                            else
                            {
                                // no valid Payment model
                                // warnstufen setzen
                                if (
                                    o.ExpirationState == null
                                    || o.ExpirationState == ExpirationState.NOTHING
                                )
                                {
                                    // ein unbekannter Zustand, also Ab Stufe 3 Warnen
                                    o.ExpirationState = ExpirationState.WARNING_DELETION_IN_14_DAYS;
                                    o.ExpirationStateDate = DateTime.Now;
                                    _logger.LogDebug(
                                        "Account {Id} is deleted in 14 days. (leerer Zustand -> initial)",
                                        o.Id
                                    );
                                    var lastOrgaPaymentModel = context
                                        .OrganisationPaymentModels.Where(p =>
                                            p.OrganisationId == o.Id
                                        )
                                        .OrderByDescending(p => p.EndDate)
                                        .FirstOrDefault();
                                    var expiryDate =
                                        (lastOrgaPaymentModel?.EndDate) ?? DateTime.Today;
                                    // Mail senden
                                    AccountDeletionIn14DaysWarner.SendWarnmail(
                                        o,
                                        context,
                                        mailer,
                                        expiryDate,
                                        emailConfig.SubjectPrefix,
                                        _logger
                                    );
                                }
                                else if (
                                    o.ExpirationState == ExpirationState.WARNING_EXPIRIATION_TODAY
                                    && o.ExpirationStateDate != null
                                    && o.ExpirationStateDate.Value.Date
                                        <= DateTime.Today.AddDays(-7)
                                )
                                {
                                    o.ExpirationState = ExpirationState.WARNING_DELETION_IN_14_DAYS;
                                    o.ExpirationStateDate = DateTime.Now;
                                    _logger.LogDebug("Account {Id} is deleted in 14 days.", o.Id);
                                    var lastOrgaPaymentModel = context
                                        .OrganisationPaymentModels.Where(p =>
                                            p.OrganisationId == o.Id
                                        )
                                        .OrderByDescending(p => p.EndDate)
                                        .FirstOrDefault();
                                    var expiryDate =
                                        (lastOrgaPaymentModel?.EndDate)
                                        ?? DateTime.Today.AddDays(-7);
                                    // Mail senden
                                    AccountDeletionIn14DaysWarner.SendWarnmail(
                                        o,
                                        context,
                                        mailer,
                                        expiryDate,
                                        emailConfig.SubjectPrefix,
                                        _logger
                                    );
                                }
                                else if (
                                    o.ExpirationState == ExpirationState.WARNING_DELETION_IN_14_DAYS
                                    && o.ExpirationStateDate != null
                                    && o.ExpirationStateDate.Value.Date
                                        <= DateTime.Today.AddDays(-7)
                                )
                                {
                                    o.ExpirationState = ExpirationState.WARNING_DELETION_IN_7_DAYS;
                                    o.ExpirationStateDate = DateTime.Now;
                                    _logger.LogDebug("Account {Id} is deleted in 7 days.", o.Id);

                                    var lastOrgaPaymentModel = context
                                        .OrganisationPaymentModels.Where(p =>
                                            p.OrganisationId == o.Id
                                        )
                                        .OrderByDescending(p => p.EndDate)
                                        .FirstOrDefault();
                                    var expiryDate =
                                        (lastOrgaPaymentModel?.EndDate)
                                        ?? DateTime.Today.AddDays(-14);
                                    // Mail senden
                                    AccountDeletionIn7DaysWarner.SendWarnmail(
                                        o,
                                        context,
                                        mailer,
                                        expiryDate,
                                        emailConfig.SubjectPrefix,
                                        _logger
                                    );
                                }
                                else if (
                                    o.ExpirationState == ExpirationState.WARNING_DELETION_IN_7_DAYS
                                    && o.ExpirationStateDate != null
                                    && o.ExpirationStateDate.Value.Date
                                        <= DateTime.Today.AddDays(-7)
                                )
                                {
                                    o.ExpirationState = ExpirationState.DELETION_TODAY;
                                    o.ExpirationStateDate = DateTime.Now;
                                    _logger.LogDebug("Account {Id} is deleted today.", o.Id);
                                    // Mail senden
                                    AccountDeletionNotifier.SendWarnmail(
                                        o,
                                        context,
                                        mailer,
                                        emailConfig.SubjectPrefix,
                                        _logger
                                    );
                                }
                                else
                                {
                                    _logger.LogInformation(
                                        "Account {Id} {OrgaNAme} is already in State {ExpirationState} since {ExpirationStateDate}.",
                                        o.Id,
                                        o.Name,
                                        o.ExpirationState,
                                        o.ExpirationStateDate
                                    );
                                }
                            }
                            context.SaveChanges();
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(
                                ex,
                                "Error in DailyExpiredAccountsChecker for orga {OrgaId}: {Message}",
                                o.Id,
                                ex.Message
                            );
                        }
                    });

                    // Organisationen, die gelöscht werden sollen
                    var deleteOrgas = context
                        .Organisations.Where(o =>
                            o.ExpirationState == ExpirationState.DELETION_TODAY
                        )
                        .ToList();
                    deleteOrgas.ForEach(o =>
                    {
                        // Organisation löschen
                        o.Geloescht = true;
                        _logger.LogDebug("Account {Id} is deleted.", o.Id);
                    });
                    context.SaveChanges();
                }
            }

            _logger.LogInformation("DailyExpiredAccountsChecker is working. Count: {Count}", count);
        }

        public Task StopAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("DailyExpiredAccountsChecker is stopping.");

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
