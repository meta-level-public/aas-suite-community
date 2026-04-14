using System.Security.Cryptography.X509Certificates;
using AasDesignerApi.Exceptions;
using AasDesignerApi.Model;
using AasDesignerApi.Utils;
using AasDesignerModel;
using AasShared.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerApi.Service
{
    public class EclassCertificateService
    {
        private readonly IApplicationDbContext _context;

        private enum CertificateAttributes
        {
            CommonName,
            Organization,
        }

        public EclassCertificateService(IApplicationDbContext context)
        {
            _context = context;
        }

        public EclassCertificate Upload(IFormFile file, long orgaId)
        {
            var organisation = _context.Organisations.Find(orgaId);

            if (
                organisation != null
                && FileExtension.IsFileFromExtensionType(
                    file.FileName,
                    ".pfx",
                    "application/x-pkcs12"
                )
            )
            {
                using var ms = new MemoryStream();
                file.CopyTo(ms);
                var fileBytes = ms.ToArray();

                try
                {
                    var certificates = X509CertificateLoader.LoadPkcs12(fileBytes, password: null);

                    EclassCertificate organisationCertificate = new()
                    {
                        ValidTo = certificates.NotAfter,
                        ValidFrom = certificates.NotBefore,
                        SerialNumber = certificates.SerialNumber,
                        IssuingCertificate = GetAttributeByName(
                            certificates,
                            CertificateAttributes.Organization
                        ),
                        IssuedBy = GetAttributeByName(
                            certificates,
                            CertificateAttributes.CommonName
                        ),
                        Filename = file.FileName?.Trim() ?? string.Empty,
                        Signature = certificates.SignatureAlgorithm.FriendlyName ?? string.Empty,
                        OrganisationId = organisation.Id,
                        CertificateBlob = new EclassCertificateBlob() { Datei = fileBytes },
                    };

                    organisation.EclassCertificateId = organisationCertificate.Id;
                    organisation.EclassCertificate = organisationCertificate;

                    _context.SaveChanges();

                    return organisationCertificate;
                }
                catch (Exception)
                {
                    throw new InvalidFileException("CORRUPT_FILE");
                }
            }
            throw new InvalidFileException("CORRUPT_FILE");
        }

        public EclassCertificate? GetByCurrentOrga(long orgaId)
        {
            EclassCertificate? result = null;

            var organisation = _context
                .Organisations.Include(o => o.EclassCertificate)
                .FirstOrDefault(o => o.Id == orgaId);

            if (organisation != null && organisation.EclassCertificate != null)
            {
                result = organisation.EclassCertificate;
            }

            return result;
        }

        public bool Delete(long orgaId)
        {
            bool result = false;

            var organisation = _context
                .Organisations.Include(o => o.EclassCertificate)
#pragma warning disable 8602
                    .ThenInclude(c => c.CertificateBlob)
#pragma warning restore 8602
                .FirstOrDefault(o => o.Id == orgaId);

            if (organisation != null && organisation.EclassCertificate != null)
            {
                organisation.EclassCertificateId = null;

                _context.EclassCertificateBlobs.Remove(
                    organisation.EclassCertificate.CertificateBlob
                );
                _context.EclassCertificats.Remove(organisation.EclassCertificate);
                _context.SaveChanges();

                result = true;
            }

            return result;
        }

        private static string GetAttributeByName(
            X509Certificate2 certificates,
            CertificateAttributes attributeName
        )
        {
            var result = string.Empty;

            string[] splittetElement;

            // Certifikats Attribute CN: CommonName OU: OrganizationalUnit O: Organization L: Locality S: StateOrProvinceName C: CountryName
            if (attributeName == CertificateAttributes.CommonName)
            {
                const string COMMON_NAME_KEY = "CN=";

                const int COMMON_NAME_POSITION = 0;

                splittetElement = certificates.Issuer.Split(",");

                result = splittetElement[COMMON_NAME_POSITION]
                    .Trim()
                    .Replace(COMMON_NAME_KEY, string.Empty);
            }
            else if (attributeName == CertificateAttributes.Organization)
            {
                const string ORGANIZATION_KEY = "O=";

                const int ORGANIZATION_POSITION = 2;

                splittetElement = certificates.IssuerName.Name.Split(",");

                result = splittetElement[ORGANIZATION_POSITION]
                    .Trim()
                    .Replace(ORGANIZATION_KEY, string.Empty);
            }

            return result;
        }
    }
}
