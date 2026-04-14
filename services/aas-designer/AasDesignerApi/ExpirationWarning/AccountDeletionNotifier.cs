using AasDesignerApi.Mail;
using AasDesignerApi.Model;
using AasDesignerModel;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerApi.ExpirationWarning;

public class AccountDeletionNotifier
{
    public static void SendWarnmail(
        Model.Organisation o,
        IApplicationDbContext context,
        MailService mailer,
        string subjectPrefix,
        ILogger logger
    )
    {
        var text = File.ReadAllText(Path.Combine("Mail", "Templates", $"tenant_deleted.html"));

        var admins = context
            .BenutzerOrganisations.Include(ou => ou.Benutzer)
            .Where(ou => ou.OrganisationId == o.Id)
            .ToList();

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
                adminText = adminText.Replace("{{email}}", a.Benutzer.Email);

                var subject = subjectPrefix + " Löschung Ihres Accounts / Deletion of your Account";
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
