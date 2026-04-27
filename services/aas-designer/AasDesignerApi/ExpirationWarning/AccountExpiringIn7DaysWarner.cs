using AasDesignerApi.Mail;
using AasDesignerApi.Model;
using AasDesignerModel;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerApi.ExpirationWarning;

public class AccountExpiringIn7DaysWarner
{
    public static void SendWarnmail(
        Model.Organisation o,
        IApplicationDbContext context,
        MailService mailer,
        DateTime? expiryDate,
        string subjectPrefix,
        ILogger logger
    )
    {
        var text = File.ReadAllText(
            Path.Combine(
                AppContext.BaseDirectory,
                "Mail",
                "Templates",
                $"tenant_expiring_in_7_days.html"
            )
        );

        var admins = context
            .BenutzerOrganisations.Include(ou => ou.Benutzer)
            .Where(ou => ou.OrganisationId == o.Id)
            .ToList();

        if (expiryDate == null)
        {
            expiryDate = DateTime.Today.AddDays(7);
        }

        admins
            .Where(u => u.BenutzerRollen.Contains(AuthRoles.ORGA_ADMIN))
            .ToList()
            .ForEach(a =>
            {
                var adminText = text.Replace(
                    "{{username}}",
                    $"{a.Benutzer.Vorname} {a.Benutzer.Name}"
                );
                adminText = adminText.Replace("{{organame}}", o.Name);
                adminText = adminText.Replace(
                    "{{expirationDateDe}}",
                    expiryDate?.ToString("dd.MM.yyyy")
                );
                adminText = adminText.Replace(
                    "{{expirationDateEn}}",
                    expiryDate?.ToString("yyyy/MM/dd")
                );
                adminText = adminText.Replace("{{email}}", a.Benutzer.Email);

                var subject =
                    subjectPrefix
                    + " Lizenzablauf Ihres Accounts – Handlungsbedarf / License expiry of your account - action required";
#pragma warning disable CS8604 // Possible null reference argument.
                try
                {
                    mailer.SendMail(a.Benutzer.Email, subject, adminText, true);
                    logger.LogTrace("Successfully sent warning mail to {Email}", a.Benutzer.Email);
                }
                catch (Exception ex)
                {
                    logger.LogError(
                        ex,
                        "Error sending mail to {Email}: {Message}",
                        a.Benutzer.Email,
                        ex.Message
                    );
                }
#pragma warning restore CS8604 // Possible null reference argument.
            });
    }
}
