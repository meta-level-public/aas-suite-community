using AasDesignerApi.Mail;
using AasDesignerApi.Model;
using AasDesignerModel;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AasDesignerApi.ExpirationWarning;

public class AccountDeletionIn14DaysWarner
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
            Path.Combine("Mail", "Templates", $"tenant_deleting_in_14_days.html")
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
                    + " Löschung Ihres Accounts – Handlungsbedarf / Deletion of your account - action required";
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
