using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AasDesignerApi.Model;
using AasDesignerModel;
using AasDesignerModel.Model;
using AasShared.Submodels;
using Newtonsoft.Json;

namespace AasDesignerCommon.Lookup
{
    public class LookupUpdater
    {
        internal static void UpdateLookupAsync(
            AppUser appUser,
            AasCore.Aas3_1.Environment environment,
            IApplicationDbContext context
        )
        {
            // Adressen
            // ProductFamily
            // ProductRoot
            ExtractAdresse(environment, appUser, context);
            ExtractProduktfamilie(environment, appUser, context);
            // Wunsch von Rentschler
            ExtractProductRoot(environment, appUser, context);
            ExtractProductDesignation(environment, appUser, context);
        }

        private static void ExtractProduktfamilie(
            AasCore.Aas3_1.Environment environment,
            AppUser appUser,
            IApplicationDbContext context
        )
        {
            var productFamily = NameplateManager
                .ExtractProduktfamilieNameFromEnv(environment)
                .Trim();
            if (string.IsNullOrWhiteSpace(productFamily))
                return;
            var existing = context.ProductFamilys.FirstOrDefault(family =>
                family.BesitzerOrganisationId == appUser.OrganisationId
                && family.Name.Trim().ToLower() == productFamily.Trim().ToLower()
                && !family.Geloescht
            );
            var values = NameplateManager.ExtractProduktfamilieValuesFromEnv(environment);
            var mlpKeyValues = new List<MlpKeyValue>();
            if (values != null)
            {
                mlpKeyValues = JsonConvert.DeserializeObject<List<MlpKeyValue>>(values) ?? [];
            }
            if (existing == null)
            {
                var pf = new ProductFamily()
                {
                    Name = productFamily,
                    BesitzerId = appUser.BenutzerId,
                    BesitzerOrganisationId = appUser.OrganisationId,
                    MlpKeyValues = mlpKeyValues,
                };

                context.Add(pf);
            }
            else
            {
                // Update existing product family
                existing.MlpKeyValues = mlpKeyValues;
            }
            context.SaveChanges();
        }

        private static void ExtractAdresse(
            AasCore.Aas3_1.Environment environment,
            AppUser appUser,
            IApplicationDbContext context
        )
        {
            var adresse = AddressManager.ExtractAddressFromEnv(environment);

            var resultAdresse = new Adresse(adresse);

            var eintrag = context.Adresses.FirstOrDefault(a =>
                a.Strasse == adresse.Strasse
                && (a.Bundesland ?? string.Empty).Trim().ToLower()
                    == (adresse.Bundesland ?? string.Empty).Trim().ToLower()
                && (a.Ort ?? string.Empty).Trim().ToLower()
                    == (adresse.Ort ?? string.Empty).Trim().ToLower()
                && (a.Plz ?? string.Empty).Trim().ToLower()
                    == (adresse.Plz ?? string.Empty).Trim().ToLower()
                && (a.Name ?? string.Empty).Trim().ToLower()
                    == (adresse.Name ?? string.Empty).Trim().ToLower()
                && (a.LaenderCode ?? string.Empty).Trim().ToLower()
                    == (adresse.LaenderCode ?? string.Empty).Trim().ToLower()
                && a.BesitzerOrganisationId == appUser.OrganisationId
                && !a.Geloescht
            );

            if (eintrag == null)
            {
                if (!resultAdresse.IsEmpty())
                {
                    resultAdresse.BesitzerId = appUser.BenutzerId;
                    resultAdresse.BesitzerOrganisationId = appUser.OrganisationId;

                    context.Adresses.Add(resultAdresse);
                    context.SaveChanges();
                }
            }
            else
            {
                eintrag.Name = resultAdresse.Name;
                eintrag.Bundesland = resultAdresse.Bundesland;
                eintrag.Strasse = resultAdresse.Strasse;
                eintrag.Ort = resultAdresse.Ort;
                eintrag.Plz = resultAdresse.Plz;
                eintrag.LaenderCode = resultAdresse.LaenderCode;
                context.SaveChanges();
            }
        }

        private static void ExtractProductRoot(
            AasCore.Aas3_1.Environment environment,
            AppUser appUser,
            IApplicationDbContext context
        )
        {
            var productRoot = NameplateManager.ExtractProduktstammNameFromEnv(environment).Trim();
            if (string.IsNullOrWhiteSpace(productRoot))
                return;
            var existing = context.ProductRoots.FirstOrDefault(root =>
                root.BesitzerOrganisationId == appUser.OrganisationId
                && root.Name.Trim().ToLower() == productRoot.Trim().ToLower()
                && !root.Geloescht
            );
            var values = NameplateManager.ExtractProduktstammValuesFromEnv(environment);
            var mlpKeyValues = new List<MlpKeyValue>();
            if (values != null)
            {
                mlpKeyValues = JsonConvert.DeserializeObject<List<MlpKeyValue>>(values) ?? [];
            }
            if (existing == null)
            {
                var pf = new ProductRoot()
                {
                    Name = productRoot,
                    BesitzerId = appUser.BenutzerId,
                    BesitzerOrganisationId = appUser.OrganisationId,
                    MlpKeyValues = mlpKeyValues,
                };

                context.Add(pf);
                context.SaveChanges();
            }
            else
            {
                // Update existing product root
                existing.MlpKeyValues = mlpKeyValues;
                context.SaveChanges();
            }
        }

        private static void ExtractProductDesignation(
            AasCore.Aas3_1.Environment environment,
            AppUser appUser,
            IApplicationDbContext context
        )
        {
            var productDesignation = NameplateManager
                .ExtractProduktbezeichnungNameFromEnv(environment)
                .Trim();
            if (string.IsNullOrWhiteSpace(productDesignation))
                return;
            var existing = context.ProductDesignations.FirstOrDefault(root =>
                root.BesitzerOrganisationId == appUser.OrganisationId
                && root.Name.Trim().ToLower() == productDesignation.Trim().ToLower()
                && !root.Geloescht
            );
            var values = NameplateManager.ExtractProduktbezeichnungValuesFromEnv(environment);
            var mlpKeyValues = new List<MlpKeyValue>();
            if (values != null)
            {
                mlpKeyValues = JsonConvert.DeserializeObject<List<MlpKeyValue>>(values) ?? [];
            }
            if (existing == null)
            {
                var pf = new ProductDesignation()
                {
                    Name = productDesignation,
                    BesitzerId = appUser.BenutzerId,
                    BesitzerOrganisationId = appUser.OrganisationId,
                    MlpKeyValues = mlpKeyValues,
                };

                context.Add(pf);
                context.SaveChanges();
            }
            else
            {
                // Update existing product root
                existing.MlpKeyValues = mlpKeyValues;
                context.SaveChanges();
            }
        }
    }
}
