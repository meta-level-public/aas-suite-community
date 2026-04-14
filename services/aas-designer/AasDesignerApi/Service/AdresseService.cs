using AasDesignerApi.Model;
using AasDesignerModel;
using AasDesignerModel.Model;
using AasShared.Exceptions;
using AasShared.Submodels;
using BaSyx.Models.Export;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerApi.Service
{
    public class AdresseService
    {
        private readonly IApplicationDbContext _context;

        public AdresseService(IApplicationDbContext context)
        {
            _context = context;
        }

        public List<Adresse> GetAdressen(AppUser user)
        {
            return _context
                .Adresses.Include(a => a.Besitzer)
                .Where(a =>
                    (
                        a.BesitzerOrganisationId == user.OrganisationId
                        || a.BesitzerOrganisationId == null
                    )
                    && a.BesitzerId == user.BenutzerId
                    && !a.Geloescht
                )
                .ToList()
                .Select(NormalizeAddressForResponse)
                .ToList();
        }

        public Adresse? GetAdressById(long id)
        {
            var address = _context
                .Adresses.Include(a => a.Besitzer)
                // .ThenInclude(b => b.Organisationen)
                .FirstOrDefault(a => a.Id == id);

            return address != null ? NormalizeAddressForResponse(address) : null;
        }

        public Adresse Add(AppUser user, Adresse adresse)
        {
            NormalizeAddressForPersistence(adresse);

            var eintrag = _context.Adresses.FirstOrDefault(a =>
                a.Strasse == adresse.Strasse
                && a.Bundesland == adresse.Bundesland
                && a.Ort == adresse.Ort
                && a.Plz == adresse.Plz
                && a.BesitzerId == user.BenutzerId
                && a.BesitzerOrganisationId == user.OrganisationId
                && !a.Geloescht
            );

            if (eintrag == null)
            {
                adresse.BesitzerId = user.BenutzerId;
                _context.Adresses.Add(adresse);
                _context.SaveChanges();

                return NormalizeAddressForResponse(adresse);
            }
            else
            {
                throw new EntryAlreadyExistsException("ENTRY_ALREADY_EXISTS");
            }
        }

        public Adresse Add(AppUser user, AssetAdministrationShellEnvironment_V2_0 env)
        {
            var adresse = AddressManager.ExtractAddressFromEnv(env);

            var resultAdresse = new Adresse(adresse);
            NormalizeAddressForPersistence(resultAdresse);

            var eintrag = _context.Adresses.FirstOrDefault(a =>
                a.Strasse == adresse.Strasse
                && a.Bundesland == adresse.Bundesland
                && a.Ort == adresse.Ort
                && a.Plz == adresse.Plz
                && a.Name == adresse.Name
                && a.LaenderCode == adresse.LaenderCode
                && a.BesitzerId == user.BenutzerId
                && !a.Geloescht
            );

            if (eintrag == null)
            {
                if (!resultAdresse.IsEmpty())
                {
                    resultAdresse.BesitzerId = user.BenutzerId;

                    _context.Adresses.Add(resultAdresse);
                    _context.SaveChanges();
                }
                return NormalizeAddressForResponse(resultAdresse);
            }
            else
            {
                eintrag = UpdateAddress(eintrag, resultAdresse);
                _context.SaveChanges();

                return NormalizeAddressForResponse(eintrag);
            }
        }

        public Adresse Add(AppUser user, AasCore.Aas3_1.Environment env)
        {
            var adresse = AddressManager.ExtractAddressFromEnv(env);

            var resultAdresse = new Adresse(adresse);
            NormalizeAddressForPersistence(resultAdresse);

            var eintrag = _context.Adresses.FirstOrDefault(a =>
                a.Strasse == adresse.Strasse
                && a.Bundesland == adresse.Bundesland
                && a.Ort == adresse.Ort
                && a.Plz == adresse.Plz
                && a.Name == adresse.Name
                && a.LaenderCode == adresse.LaenderCode
                && a.BesitzerId == user.BenutzerId
                && !a.Geloescht
            );

            if (eintrag == null)
            {
                if (!resultAdresse.IsEmpty())
                {
                    resultAdresse.BesitzerId = user.BenutzerId;

                    _context.Adresses.Add(resultAdresse);
                    _context.SaveChanges();
                }
                return NormalizeAddressForResponse(resultAdresse);
            }
            else
            {
                eintrag = UpdateAddress(eintrag, resultAdresse);
                _context.SaveChanges();

                return NormalizeAddressForResponse(eintrag);
            }
        }

        public bool Remove(long id)
        {
            var result = false;
            var eintrag = _context.Adresses.FirstOrDefault(a => a.Id == id);
            if (eintrag != null)
            {
                _context.Remove(eintrag);

                _context.SaveChanges();
                result = true;
            }

            return result;
        }

        public bool Update(Model.Benutzer user, Adresse adresse)
        {
            var result = false;
            NormalizeAddressForPersistence(adresse);

            var eintrag = _context.Adresses.FirstOrDefault(a => a.Id == adresse.Id && !a.Geloescht);

            if (eintrag != null && IsNotInUseByUser(user, adresse))
            {
                eintrag = UpdateAddress(eintrag, adresse);

                eintrag.BesitzerId = user.Id;

                _context.SaveChanges();

                result = true;
            }

            return result;
        }

        public Adresse? GetAdressByIdFromOrganisationUser(long addressId)
        {
            return _context
                .Adresses.Include(a => a.Besitzer)
                .FirstOrDefault(a => a.Id == addressId && !a.Geloescht);
        }

        private static Adresse UpdateAddress(Adresse eintrag, Adresse adresse)
        {
            eintrag.Name = adresse.Name;
            eintrag.NameMlpKeyValues = CloneValues(adresse.NameMlpKeyValues);
            eintrag.Strasse = adresse.Strasse;
            eintrag.StrasseMlpKeyValues = CloneValues(adresse.StrasseMlpKeyValues);
            eintrag.Plz = adresse.Plz;
            eintrag.Ort = adresse.Ort;
            eintrag.OrtMlpKeyValues = CloneValues(adresse.OrtMlpKeyValues);
            eintrag.Bundesland = adresse.Bundesland;
            eintrag.BundeslandMlpKeyValues = CloneValues(adresse.BundeslandMlpKeyValues);
            eintrag.LaenderCode = adresse.LaenderCode;

            return eintrag;
        }

        private bool IsNotInUseByUser(Model.Benutzer user, Adresse adresse)
        {
            return !_context
                .Adresses.Where(a => a.BesitzerId == user.Id && !a.Geloescht)
                .Any(a =>
                    a.Name == adresse.Name
                    && a.Strasse == adresse.Strasse
                    && a.Plz == adresse.Plz
                    && a.Ort == adresse.Ort
                    && a.Bundesland == adresse.Bundesland
                    && a.LaenderCode == adresse.LaenderCode
                    && !a.Geloescht
                );
        }

        private static Adresse NormalizeAddressForResponse(Adresse adresse)
        {
            NormalizeAddressForPersistence(adresse);
            return adresse;
        }

        private static void NormalizeAddressForPersistence(Adresse adresse)
        {
            adresse.NameMlpKeyValues = NormalizeValues(adresse.NameMlpKeyValues, adresse.Name);
            adresse.StrasseMlpKeyValues = NormalizeValues(
                adresse.StrasseMlpKeyValues,
                adresse.Strasse
            );
            adresse.OrtMlpKeyValues = NormalizeValues(adresse.OrtMlpKeyValues, adresse.Ort);
            adresse.BundeslandMlpKeyValues = NormalizeValues(
                adresse.BundeslandMlpKeyValues,
                adresse.Bundesland
            );

            adresse.Name = GetPreferredText(adresse.NameMlpKeyValues, adresse.Name);
            adresse.Strasse = GetPreferredText(adresse.StrasseMlpKeyValues, adresse.Strasse);
            adresse.Ort = GetPreferredText(adresse.OrtMlpKeyValues, adresse.Ort);
            adresse.Bundesland = GetPreferredText(
                adresse.BundeslandMlpKeyValues,
                adresse.Bundesland
            );
        }

        private static List<MlpKeyValue> NormalizeValues(
            List<MlpKeyValue>? values,
            string? fallback
        )
        {
            var normalized = (values ?? [])
                .Where(value => !string.IsNullOrWhiteSpace(value.Text))
                .GroupBy(value => (value.Language ?? string.Empty).Trim().ToLowerInvariant())
                .Where(group => !string.IsNullOrWhiteSpace(group.Key))
                .Select(group => new MlpKeyValue
                {
                    Language = group.Key,
                    Text = group.First().Text.Trim(),
                })
                .ToList();

            var sourceText =
                normalized.FirstOrDefault(value => value.Language == "de")?.Text
                ?? normalized.FirstOrDefault(value => value.Language == "en")?.Text
                ?? normalized.FirstOrDefault()?.Text
                ?? fallback?.Trim()
                ?? string.Empty;

            if (string.IsNullOrWhiteSpace(sourceText))
            {
                return normalized;
            }

            if (!normalized.Any(value => value.Language == "de"))
            {
                normalized.Insert(0, new MlpKeyValue { Language = "de", Text = sourceText });
            }

            if (!normalized.Any(value => value.Language == "en"))
            {
                normalized.Insert(
                    normalized.Any(value => value.Language == "de") ? 1 : 0,
                    new MlpKeyValue { Language = "en", Text = sourceText }
                );
            }

            return normalized;
        }

        private static string GetPreferredText(List<MlpKeyValue>? values, string? fallback)
        {
            return values?.FirstOrDefault(value => value.Language == "de")?.Text
                ?? values?.FirstOrDefault(value => value.Language == "en")?.Text
                ?? values?.FirstOrDefault()?.Text
                ?? fallback
                ?? string.Empty;
        }

        private static List<MlpKeyValue> CloneValues(List<MlpKeyValue>? values)
        {
            return values
                    ?.Select(value => new MlpKeyValue
                    {
                        Language = value.Language,
                        Text = value.Text,
                    })
                    .ToList()
                ?? [];
        }
    }
}
