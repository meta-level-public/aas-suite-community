using AasDesignerApi.Mail;
using AasDesignerApi.Model;
using AasDesignerApi.Model.Client;
using AasDesignerApi.Orga;
using AasDesignerApi.Utils;
using AasDesignerCommon.Utils;
using AasDesignerModel;
using AasDesignerModel.Exceptions;
using AasShared.Configuration;

namespace AasDesignerApi.Service
{
    public class ContactService
    {
        private readonly ILogger<ContactService> _logger;
        private readonly OrganisationService _organisationService;
        private readonly IApplicationDbContext _context;
        private readonly AppSettings _config;
        private readonly MailService _mailer;
        private readonly EmailUtilService _emailUtilService;
        private readonly InfrastructureRequester _infrastructureRequester;

        public ContactService(
            ILogger<ContactService> logger,
            OrganisationService organisationService,
            IApplicationDbContext context,
            AppSettings config,
            MailService mailer,
            EmailUtilService emailUtilService,
            InfrastructureRequester infrastructureRequester
        )
        {
            _logger = logger;
            _organisationService = organisationService;
            _context = context;
            _config = config;
            _mailer = mailer;
            _emailUtilService = emailUtilService;
            _infrastructureRequester = infrastructureRequester;
        }

        public Organisation? CreateRegisterOrganisation(ContactRequest request)
        {
            if (request.Organisation == null)
            {
                _logger.LogWarning("Keine Organisation angegeben bei Registrierungsanfrage!");
                return null;
            }
            if (request.Admin == null)
            {
                _logger.LogWarning("Keine Admindaten angegeben bei Registrierungsanfrage!");
                return null;
            }

            var freeModel = _context.PaymentModels.FirstOrDefault(p =>
                p.NameLabel == "SYSTEM_FREE_ACCOUNT" && p.IsSystemModel
            );
            if (freeModel == null)
            {
                _logger.LogWarning("Kostenloses Systembezahlmodell nicht gefunden!");
                return null;
            }

            var emailDomainRequest = request.Organisation.Email.Split('@')[1];
            if (_emailUtilService.IsPublicEmailProvider(request.Organisation.Email))
            {
                _logger.LogInformation(
                    "Öffentliche Emailadresse bei Registrierungsanfrage, keine Duplikatsprüfung auf EmailDomain möglich"
                );
            }
            else
            {
                var existingOrgaWithThisEmailDomain = _context.Organisations.FirstOrDefault(o =>
                    o.Email.EndsWith(emailDomainRequest)
                );
                if (existingOrgaWithThisEmailDomain != null)
                {
                    _logger.LogWarning("Organisation mit dieser EmailDomain existiert bereits!");
                    throw new OrganisationDomainAlreadyExistsException();
                }
            }

            try
            {
                var rndPass = PasswordHelper.GenerateNewRandomPassword();
                CreateNewBenutzerDto admin = new()
                {
                    BenutzerRollen = new List<string>
                    {
                        AuthRoles.ORGA_ADMIN,
                        AuthRoles.BENUTZER,
                        AuthRoles.FEED_MAPPING_USER,
                    },
                    Email = request.Admin.Email ?? string.Empty,
                    Name = request.Admin.Name,
                    Vorname = request.Admin.Vorname ?? string.Empty,
                    Passwort = rndPass,
                };

                AddressDto orgaAdresse = new()
                {
                    Bundesland = request.Organisation.Bundesland,
                    LaenderCode = request.Organisation.LaenderCode,
                    Ort = request.Organisation.Ort,
                    Plz = request.Organisation.Plz,
                    Strasse = request.Organisation.Strasse,
                };

                OrganisationDto orga = new()
                {
                    AccountAktiv = true,
                    Email = request.Organisation.Email,
                    Name = request.Organisation.Name,
                    Telefon = request.Organisation.Telefon,
                    Fax = request.Organisation.Fax,
                    Strasse = orgaAdresse.Strasse,
                    Plz = orgaAdresse.Plz,
                    Ort = orgaAdresse.Ort,
                    Bundesland = orgaAdresse.Bundesland,
                    LaenderCode = orgaAdresse.LaenderCode,
                };

                AddOrgaData orgaData = new() { Admin = admin, Orga = orga };

                var createdOrga = _organisationService.Add(orgaData, out var userAlreadyExists);

                var endDate = DateTime.Now.AddDays(14);
                OrganisationPaymentModel orgaPaymentModel = new()
                {
                    AnlageDatum = DateTime.Now,
                    AnlageBenutzer = "system",
                    PaymentModel = freeModel,
                    EndDate = endDate,
                };

                if (createdOrga != null)
                {
                    createdOrga.Bezahlmodelle = new List<OrganisationPaymentModel>
                    {
                        orgaPaymentModel,
                    };
                    // _infrastructureRequester.RequestInfrastructure(createdOrga, "started"); // sollte schon angelegt sein!
                    _context.SaveChanges();
                }

                var url = $"{_config.BaseUrl}";

                var lang = String.IsNullOrEmpty(request.SelectedLanguage)
                    ? "en"
                    : request.SelectedLanguage;

                var text = File.ReadAllText(
                    Path.Combine(
                        AppContext.BaseDirectory,
                        "Mail",
                        "Templates",
                        $"neue_orga_willkommem-tmpl.{lang}.html"
                    )
                );

                text = text.Replace(
                    "{{username}}",
                    $"{request.Admin.Vorname} {request.Admin.Name}"
                );
                if (userAlreadyExists)
                {
                    if (request.SelectedLanguage == "de")
                        text = text.Replace("{{password}}", "Ihr bisheriges Passwort");
                    else
                        text = text.Replace("{{password}}", "Your existing password");
                }
                else
                {
                    text = text.Replace("{{password}}", rndPass);
                }
                text = text.Replace("{{contact.EMAIL}}", request.Admin.Email);
                text = text.Replace("{{url}}", url);
                text = text.Replace("{{endDate}}", endDate.ToString());
                text = text.Replace("{{loginname}}", request.Admin.Email);

                var subject =
                    lang == "de" ? "[AAS Designer] Testzugang" : "[AAS Designer] Test account";
#pragma warning disable CS8604 // Possible null reference argument.
                _mailer.SendMail(request.Admin.Email, subject, text, true);
#pragma warning restore CS8604 // Possible null reference argument.

                return createdOrga;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Fehler beim Anlegen der Orga");
            }
            return null;
        }

        public Model.RequestForOffer SaveOfferRequest(ContactRequest request)
        {
            var offerRequest = new Model.RequestForOffer
            {
                Name = request.RequestForOffer?.Name ?? string.Empty,
                Vorname = request.RequestForOffer?.Vorname ?? string.Empty,
                Email = request.RequestForOffer?.Email ?? string.Empty,
                PaymentPeriod = request.RequestForOffer?.PaymentPeriod ?? string.Empty,
                NumberOfLicences = request.RequestForOffer?.NumberOfLicences ?? string.Empty,
                Organisation = request.RequestForOffer?.Organisation,
                Price = request.RequestForOffer?.Price ?? string.Empty,
            };

            _context.RequestForOffers.Add(offerRequest);
            _context.SaveChanges();

            return offerRequest;
        }
    }
}
