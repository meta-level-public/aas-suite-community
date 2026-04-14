using AasDesignerApi.Mail;
using AasDesignerApi.Model;
using AasDesignerApi.Model.Client;
using AasDesignerApi.Service;
using AasDesignerModel.Exceptions;
using AasDesignerSystemManagementApi.SystemManagement.Model;
using AasShared.Controllers;
using Microsoft.AspNetCore.Mvc;

namespace AasDesignerApi.Controllers.Internal
{
    public enum ContactResultStatus
    {
        Success,
        OrganisationDomainAlreadyExists,
        OrganisationNotCreated,
    }

    public class ContactResult
    {
        public bool IsSuccess { get; set; }
        public ContactResultStatus ContactResultStatus { get; set; } = ContactResultStatus.Success;
    }

    [ApiController]
    [Route("api/[controller]/[action]")]
    [ApiExplorerSettings(GroupName = "internal")]
    public class ContactController : InternalApiBaseController
    {
        private readonly MailService _mailService;
        private readonly IMailSettingsRuntimeService _mailSettingsRuntimeService;
        private readonly ContactService _contactService;

        public ContactController(
            MailService mailService,
            IMailSettingsRuntimeService mailSettingsRuntimeService,
            ContactService contactService
        )
        {
            _mailService = mailService;
            _mailSettingsRuntimeService = mailSettingsRuntimeService;
            _contactService = contactService;
        }

        [HttpPut]
        public ContactResult Send(ContactRequest request)
        {
            var emailSettings = _mailSettingsRuntimeService.GetApplicationMailSettings();
            var result = new ContactResult() { IsSuccess = true };

            var orgaDomainAlreadyExists = false;
            var sendCopy = true;

            var text =
                $"Es wurde eine neue Anfrage vom Kontaktformular gesendet!\n\n"
                + $"Thema: {request.Topic}\n\n\n";
            var textForMl = string.Empty;

            if (request.Topic == "Angebotsanfrage")
            {
                var offerRequest = _contactService.SaveOfferRequest(request);

                text += "Es wurde ein Angebot angefordert!\n\n";

                text += $"Organisationsname: {request.RequestForOffer?.Organisation?.Name}\n";
                text += $"Strasse: {request.RequestForOffer?.Organisation?.Strasse}\n";
                text += $"PLZ: {request.RequestForOffer?.Organisation?.Plz}\n";
                text += $"Ort: {request.RequestForOffer?.Organisation?.Ort}\n";
                text += $"Land: {request.RequestForOffer?.Organisation?.LaenderCode}\n";
                text += $"OrgaEmail: {request.RequestForOffer?.Organisation?.Email}\n";
                text += $"Telefon: {request.RequestForOffer?.Organisation?.Telefon}\n";
                text += $"Ansprechpartner\n";
                text += $"Name: {request.RequestForOffer?.Name}\n";
                text += $"Vorname: {request.RequestForOffer?.Vorname}\n";
                text += $"Email: {request.RequestForOffer?.Email}\n\n";
                text += $"AnzahlNutzer: {request.RequestForOffer?.NumberOfLicences}\n";
                text += $"Bezahlintervall: {request.RequestForOffer?.PaymentPeriod}\n";
                text += $"\nBemerkung: {request.Message}\n";

                textForMl = text;
            }
            else if (request.Topic == "Registrierung")
            {
                Organisation? createdOrga;
                try
                {
                    createdOrga = _contactService.CreateRegisterOrganisation(request);
                }
                catch (OrganisationDomainAlreadyExistsException)
                {
                    createdOrga = null;
                    orgaDomainAlreadyExists = true;
                    result.ContactResultStatus =
                        ContactResultStatus.OrganisationDomainAlreadyExists;
                    result.IsSuccess = false;
                }

                text += "Es wurde die Registrierung einer neuen Organisation angefordert!\n\n";

                text += $"Organisationsname: {request.Organisation?.Name}\n";
                text += $"Strasse: {request.Organisation?.Strasse}\n";
                text += $"PLZ: {request.Organisation?.Plz}\n";
                text += $"Ort: {request.Organisation?.Ort}\n";
                text += $"Land: {request.Organisation?.LaenderCode}\n";
                text += $"OrgaEmail: {request.Organisation?.Email}\n";
                text += $"Telefon: {request.Organisation?.Telefon}\n";
                text += $"Fax: {request.Organisation?.Fax}\n\n";
                text += $"Ansprechpartner\n";
                text += $"Name: {request.Admin?.Name}\n";
                text += $"Vorname: {request.Admin?.Vorname}\n";
                text += $"Email: {request.Admin?.Email}\n\n";
                text += $"Lizenz: {request.Lizenz}\n";
                text += $"\nBemerkung: {request.Message}\n";

                textForMl = text;

                if (createdOrga != null)
                {
                    textForMl += "\n\n\n\n";
                    textForMl += "Die Organisation wurde angelegt, es ist nichts mehr zu tun";
                    textForMl += "\n\n\n\n";
                    textForMl += "";

                    sendCopy = false;
                }
                else if (orgaDomainAlreadyExists)
                {
                    textForMl += "\n\n\n\n";
                    textForMl +=
                        "Die Organisation wurde nicht angelegt. Mit der Domain existiert bereits eine Organisation.";
                    textForMl += "\n\n\n\n";
                    textForMl +=
                        "Wir sollten die Anfrage prüfen, die Person anschreiben und ggf. manuell anlegen oder überprüfen, ob wir den Nutzer zuordnen können, wenn die Orga noch aktiv ist.";
                    textForMl +=
                        "Man könnte auch überlegen, ob man dem Nutzer die Option gibt, den Organisationsadmin darüber zu informieren, dass ein weiterer Nutzer Zugriff erhalten möchte";
                }
                else
                {
                    textForMl += "\n\n\n\n";
                    textForMl += "Die Organisation konnte nicht automatisch angelegt werden.";
                    textForMl += "\n\n\n\n";
                    textForMl +=
                        "Bitte Überprüfen ob es bereits eine Organisation mit dieser E-Mailadresse gibt.";
                }
            }
            else
            {
                text +=
                    $"Nachricht: \n\n{request.Message}\n\n"
                    + $"Absender Mailadresse: {request.Email}\n\n";
                textForMl = text;
            }

            _mailService.SendMail(
                emailSettings.NewOrgaNotificationAddress,
                $"Anfrage: {request.Topic}",
                textForMl
            );

            if (sendCopy && !orgaDomainAlreadyExists)
            {
                var task = new Task(async () =>
                {
                    await Task.Delay(1000 * 60);
                    if (!string.IsNullOrEmpty(request.Email))
                        _mailService.SendMail(
                            request.Email,
                            $"[Kopie]Anfrage: {request.Topic}",
                            text
                        );
                    else if (!string.IsNullOrEmpty(request.Admin?.Email))
                        _mailService.SendMail(
                            request.Admin.Email,
                            $"[Kopie]Anfrage: {request.Topic}",
                            text
                        );
                    else if (!string.IsNullOrEmpty(request.RequestForOffer?.Email))
                        _mailService.SendMail(
                            request.RequestForOffer.Email,
                            $"[Kopie]Anfrage: {request.Topic}",
                            text
                        );
                });
                task.Start();
            }

            return result;
        }
    }
}
