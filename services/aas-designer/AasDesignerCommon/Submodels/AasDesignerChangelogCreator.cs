using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using AasCore.Aas3_1;
using AasDesignerApi.Model;
using AasDesignerCommon.Utils;

namespace AasDesignerCommon.Submodels
{
    public static class AasDesignerChangelogCreator
    {
        public static Submodel Create(AppUser appUser, Organisation orga)
        {
            var changelogSubmodel = new Submodel(
                IdGenerationUtil.GenerateId(IdType.Submodel, appUser.Organisation.IriPrefix),
                null,
                null,
                "AasDesignerChangelog",
                [
                    new LangStringNameType("en", "AAS Designer Changelog"),
                    new LangStringNameType("de", "AAS Designer Changelog"),
                ],
                [
                    new LangStringTextType(
                        "en",
                        "Contains the log of changes made to the AAS by the AAS Designer"
                    ),
                    new LangStringTextType(
                        "de",
                        "Enthält das Protokoll der Änderungen an der AAS die durch den AAS Designer durchgeführt wurden"
                    ),
                ],
                new AdministrativeInformation(
                    null,
                    "0",
                    "1",
                    new Reference(
                        ReferenceTypes.ExternalReference,
                        [new Key(KeyTypes.GlobalReference, "AasDesigner")]
                    )
                ),
                ModellingKind.Instance,
                new Reference(
                    ReferenceTypes.ExternalReference,
                    [new Key(KeyTypes.GlobalReference, "AasDesignerChangelog")]
                ),
                null,
                null,
                null,
                null
            );

            var changelogSmc = new SubmodelElementCollection(null, null, "Changes");
            var creationCollection = new SubmodelElementCollection(null, null, "Creation");
            var creationDate = new Property(
                DataTypeDefXsd.DateTime,
                null,
                null,
                "Date",
                null,
                null,
                null,
                null,
                null,
                null,
                FormatChangelogTimestamp(DateTime.UtcNow)
            );
            var creationUser = new Property(
                DataTypeDefXsd.String,
                null,
                null,
                "User",
                null,
                null,
                null,
                null,
                null,
                null,
                appUser.Benutzer.Email
            );
            var actionText = new Property(
                DataTypeDefXsd.String,
                null,
                null,
                "Action",
                null,
                null,
                null,
                null,
                null,
                null,
                "Creation"
            );

            creationCollection.Value = [creationDate, creationUser, actionText];
            changelogSmc.Value = [creationCollection];

            changelogSubmodel.SubmodelElements = [changelogSmc];

            return changelogSubmodel;
        }

        public static ConceptDescription GetConceptDescription()
        {
            var cd = new ConceptDescription(
                "AasDesignerChangelog",
                null,
                null,
                "Changelog",
                null,
                [
                    new LangStringTextType(
                        "en",
                        "Enthält das Protokoll der Änderungen an der AAS die durch den AAS Designer durchgeführt wurden"
                    ),
                    new LangStringTextType(
                        "de",
                        "Contains the log of changes made to the AAS by the AAS Designer"
                    ),
                ]
            );

            // cd.EmbeddedDataSpecifications = [new EmbeddedDataSpecification(new DataSpec)
            //     new DataSpecificationIec61360(
            //         [
            //             new LangStringPreferredNameTypeIec61360("en", "Changelog"),
            //             new LangStringPreferredNameTypeIec61360("de", "Änderungsprotokoll")
            //         ],
            //         [
            //             new LangStringShortNameTypeIec61360("en", "Changelog"),
            //             new LangStringShortNameTypeIec61360("de", "Änderungsprotokoll")
            //         ],
            //         null,
            //         null,
            //         null,
            //         null,
            //         null,
            //         [
            //             new LangStringDefinitionTypeIec61360("en", "Enthält das Protokoll der Änderungen an der AAS die durch den AAS Designer durchgeführt wurden"),
            //             new LangStringDefinitionTypeIec61360("de", "Datum der Änderung")
            //         ],
            //         null,
            //         null,
            //         null,
            //         null
            // )];

            return cd;
        }

        public static Submodel? GetIfNotContained(
            IAssetAdministrationShell aas,
            AasCore.Aas3_1.Environment env,
            AppUser appUser,
            Organisation orga
        )
        {
            var isContained = false;
            aas.Submodels?.ForEach(smRef =>
            {
                var sm = GetSubmodelFromEnv(env, smRef.Keys.First().Value);
                // AasDesignerChangelog erzeugen, falls es noch fehlt
                if (
                    sm != null
                    && sm.SemanticId != null
                    && sm.SemanticId.Keys.Any(k => k.Value == "AasDesignerChangelog")
                )
                {
                    // ist da?
                    isContained = true;
                }
            });

            if (!isContained)
            {
                return Create(appUser, orga);
            }
            else
            {
                return null;
            }
        }

        public static void AddSubmodel(
            AasCore.Aas3_1.Environment env,
            Submodel sm,
            IAssetAdministrationShell aasToAdd
        )
        {
            env.Submodels ??= [];
            env.Submodels.Add(sm);
            aasToAdd.Submodels ??= [];
            aasToAdd.Submodels.Add(
                new Reference(ReferenceTypes.ModelReference, [new Key(KeyTypes.Submodel, sm.Id)])
            );

            env.ConceptDescriptions ??= [];
            env.ConceptDescriptions.Add(GetConceptDescription());
        }

        private static Submodel? GetSubmodelFromEnv(
            AasCore.Aas3_1.Environment environment,
            string id
        )
        {
            return (Submodel?)environment.Submodels?.FirstOrDefault(sm => sm.Id == id);
        }

        internal static void UpdateChangelog(
            IAssetAdministrationShell aas,
            AasCore.Aas3_1.Environment environment,
            AppUser appUser,
            Organisation orga,
            string action = "Update"
        )
        {
            aas.Submodels?.ForEach(smRef =>
            {
                var sm = GetSubmodelFromEnv(environment, smRef.Keys.First().Value);
                if (
                    sm != null
                    && sm.SemanticId != null
                    && sm.SemanticId.Keys.Any(k => k.Value == "AasDesignerChangelog")
                )
                {
                    var changelogSmc =
                        sm.SubmodelElements?.FirstOrDefault(sme => sme.IdShort == "Changes")
                        as SubmodelElementCollection;
                    if (changelogSmc == null)
                    {
                        changelogSmc = new SubmodelElementCollection(null, null, "Changes");
                        sm.SubmodelElements ??= [];
                        sm.SubmodelElements.Add(changelogSmc);
                    }
                    changelogSmc.Value ??= [];
                    var count = changelogSmc.Value.Count;

                    var changesCollection = new SubmodelElementCollection(
                        null,
                        null,
                        $"Update{count}"
                    );
                    var changeDate = new Property(
                        DataTypeDefXsd.DateTime,
                        null,
                        null,
                        "Date",
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        FormatChangelogTimestamp(DateTime.UtcNow)
                    );
                    var changeUser = new Property(
                        DataTypeDefXsd.String,
                        null,
                        null,
                        "User",
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        appUser.Benutzer.Email
                    );
                    var actionText = new Property(
                        DataTypeDefXsd.String,
                        null,
                        null,
                        "Action",
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        action
                    );

                    changesCollection.Value = [changeDate, changeUser, actionText];
                    changelogSmc.Value.Add(changesCollection);
                }
            });
        }

        private static string FormatChangelogTimestamp(DateTime timestampUtc)
        {
            return timestampUtc
                .ToUniversalTime()
                .ToString("yyyy-MM-dd'T'HH:mm:ss.fff'Z'", CultureInfo.InvariantCulture);
        }
    }
}
