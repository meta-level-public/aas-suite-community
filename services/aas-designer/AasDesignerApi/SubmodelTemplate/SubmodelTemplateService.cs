using System.IO.Packaging;
using System.Reflection;
using System.Text;
using System.Text.Json.Nodes;
using AasDesignerApi.Model;
using AasDesignerApi.Model.Client;
using AasDesignerApi.Packaging;
using AasDesignerCommon.Packaging;
using AasDesignerCommon.Utils;
using AasDesignerModel;
using AasShared.Exceptions;
using BaSyx.Models.Core.AssetAdministrationShell.Implementations;
using BaSyx.Models.Export;
using Microsoft.Extensions.Caching.Memory;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using AasJsonization = AasCore.Aas3_1.Jsonization;

namespace AasDesignerApi.SubmodelTemplate
{
    public class SubmodelTemplateService
    {
        private const string IdtaRepoShellsUrl =
            "https://smt-repo.admin-shell-io.com/api/v3.0/shells";
        private const string IdtaRepoSubmodelsUrl =
            "https://smt-repo.admin-shell-io.com/api/v3.0/submodels";
        private const string IdtaRepoConceptDescriptionsUrl =
            "https://smt-repo.admin-shell-io.com/api/v3.0/concept-descriptions";
        private const string StandardGeneratorDefaultIriPrefix = "https://admin-shell.io/generated";
        private const string StandardNameplateTemplateId = "https://admin-shell.io/idta-02006-3-0";
        private const string NameplateAddressInformationSemanticId =
            "https://admin-shell.io/zvei/nameplate/1/0/ContactInformations/AddressInformation";
        private const string NameplateContactInformationSemanticId =
            "https://admin-shell.io/zvei/nameplate/1/0/ContactInformations/ContactInformation";
        private const string ContactInformationTemplateUrl =
            "https://admin-shell.io/idta/SubmodelTemplate/ContactInformation/1/0";
        private static readonly TimeSpan RepoMemoryCacheDuration = TimeSpan.FromMinutes(15);
        private static readonly MemoryCacheEntryOptions RepoMemoryCacheOptions =
            new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = RepoMemoryCacheDuration,
                Size = 1,
            };
        private static readonly HashSet<string> AddressFieldIdShorts = new(StringComparer.Ordinal)
        {
            "Company",
            "Name",
            "Street",
            "StreetName",
            "Zipcode",
            "ZipCode",
            "Zip",
            "CityTown",
            "City",
            "StateCounty",
            "State",
            "NationalCode",
            "CountryCode",
            "Country",
        };
        private static readonly StandardGeneratorTemplateDefinition[] StandardGeneratorPr1Templates =
        [
            new(
                "digital-nameplate",
                "https://admin-shell.io/idta/nameplate/3/0/Nameplate",
                StandardNameplateTemplateId
            ),
            new(
                "handover-documentation",
                "0173-1#01-AHF578#003",
                "https://admin-shell.io/idta-02004-2-0"
            ),
        ];
        private readonly IApplicationDbContext _context;
        private readonly AASXPackager _packager;
        private readonly IMemoryCache _memoryCache;

        private sealed record StandardGeneratorTemplateDefinition(
            string Role,
            string SemanticId,
            string TemplateId
        );

        public SubmodelTemplateService(
            IApplicationDbContext context,
            AASXPackager packager,
            IMemoryCache memoryCache
        )
        {
            _context = context;
            _packager = packager;
            _memoryCache = memoryCache;
        }

        public SubmodelResult GetEmptyTemplate(long id)
        {
            var smt = _context.SubmodelTemplates.First(sm => sm.Id == id && !sm.Geloescht);

            return GetResult(smt);
        }

        private SubmodelResult GetResult(Model.SubmodelTemplate smt)
        {
            SubmodelResult result = new SubmodelResult();
            var basePath = new FileInfo(System.Reflection.Assembly.GetExecutingAssembly().Location)
                .Directory
                ?.FullName;
            var aasxPackage = _packager.ReadPackage(
                Path.Combine(basePath ?? string.Empty, "Assets", "Templates", smt.Filename)
            );

            aasxPackage.Environment?.Submodels?.ForEach(
                (sm) =>
                {
                    sm.Kind = AasCore.Aas3_1.ModellingKind.Instance;
                    var jsonObject = AasJsonization.Serialize.ToJsonObject(sm);
                    result.V3SubmodelsPlain.Add(jsonObject.ToJsonString());
                }
            );
            aasxPackage.Environment?.ConceptDescriptions?.ForEach(
                (cd) =>
                {
                    var jsonObject = AasJsonization.Serialize.ToJsonObject(cd);
                    result.V3ConceptDescriptionsPlain.Add(jsonObject.ToJsonString());
                }
            );

            return result;
        }

        public SubmodelResult GetEmptyTemplateByName(string name, AasMetamodelVersion version)
        {
            var smt = _context.SubmodelTemplates.First(sm =>
                sm.Name.ToLower() == name.ToLower() && !sm.Geloescht && sm.Version == version
            );

            return GetResult(smt);
        }

        public List<Model.SubmodelTemplate> GetAll(AasMetamodelVersion version)
        {
            return _context
                .SubmodelTemplates.Where(sm =>
                    !sm.Geloescht && (sm.Version == version || version == AasMetamodelVersion.ALL)
                )
                .ToList();
        }

        public Model.SubmodelTemplate GetPaket(long id)
        {
            return _context.SubmodelTemplates.First(sm => sm.Id == id && !sm.Geloescht);
        }

        public long SavePackageFile(
            IFormFile file,
            string fileName,
            Model.Benutzer user,
            string label,
            string semanticIds,
            string name,
            AasMetamodelVersion version,
            string group = "IDTA"
        )
        {
            var smt = new Model.SubmodelTemplate()
            {
                Filename = fileName,
                Label = label,
                SemanticIds = semanticIds,
                Name = name,
                Version = version,
                Group = group,
            };

            // datei ablegen
            var basePath = new FileInfo(System.Reflection.Assembly.GetExecutingAssembly().Location)
                .Directory
                ?.FullName;
            var path = Path.Combine(basePath ?? string.Empty, "Assets", "Templates");
            if (!Directory.Exists(path))
            {
                Directory.CreateDirectory(path);
            }
            using (var fileStream = new FileStream(Path.Combine(path, fileName), FileMode.Create))
            {
                file.CopyTo(fileStream);
            }
            _context.Add(smt);

            // cds indizieren:

            var aasxPackage = _packager.ReadPackage(
                Path.Combine(basePath ?? string.Empty, "Assets", "Templates", smt.Filename)
            );
            smt.SubmodelVersion =
                $"{aasxPackage.Environment?.Submodels?[0].Administration?.Version}.{aasxPackage.Environment?.Submodels?[0].Administration?.Revision}";

            aasxPackage.Environment?.ConceptDescriptions?.ForEach(cd =>
            {
                var dbCd = _context.ConceptDescriptions.FirstOrDefault(c =>
                    c.IdShort == cd.IdShort || c.CdId == cd.Id
                );
                if (dbCd != null)
                {
                    // update
                    dbCd.ConceptDescriptionPlain = AasJsonization
                        .Serialize.ToJsonObject(cd)
                        .ToString();
                    dbCd.IdShort = cd.IdShort ?? string.Empty;
                    dbCd.CdId = cd.Id;
                }
                else
                {
                    dbCd = new MlConceptDescription()
                    {
                        IdShort = cd.IdShort ?? string.Empty,
                        ConceptDescriptionPlain = AasJsonization
                            .Serialize.ToJsonObject(cd)
                            .ToString(),
                        CdId = cd.Id,
                    };
                    _context.ConceptDescriptions.Add(dbCd);
                }
            });
            _context.SaveChanges();

            return smt.Id;
        }

        public bool Delete(long id)
        {
            var sm = _context.SubmodelTemplates.First(sm => sm.Id == id && !sm.Geloescht);
            var basePath = new FileInfo(System.Reflection.Assembly.GetExecutingAssembly().Location)
                .Directory
                ?.FullName;
            System.IO.File.Delete(
                Path.Combine(basePath ?? string.Empty, "Assets", "Templates", sm.Filename)
            );
            _context.Remove(sm);
            _context.SaveChanges();

            return true;
        }

        public bool Update(Model.SubmodelTemplate smt)
        {
            var dbTemplate = _context.SubmodelTemplates.First(sm =>
                sm.Id == smt.Id && !sm.Geloescht
            );
            dbTemplate.Label = smt.Label;
            dbTemplate.Name = smt.Name;
            dbTemplate.SemanticIds = smt.SemanticIds;

            _context.SaveChanges();
            return true;
        }

        public SubmodelResult GetByIdentification(
            string? idShort,
            string? semanticId,
            AasMetamodelVersion version
        )
        {
            Model.SubmodelTemplate? smt = null;
            if (semanticId != null)
                smt = _context.SubmodelTemplates.FirstOrDefault(sm =>
                    sm.SemanticIds.Contains(semanticId) && sm.Version == version && !sm.Geloescht
                );
            if (smt == null)
                smt = _context.SubmodelTemplates.FirstOrDefault(sm =>
                    sm.Name == idShort && !sm.Geloescht && sm.Version == version
                );
            if (smt == null)
                return new SubmodelResult();
            return GetResult(smt);
        }

        public void SavePackageFiles(List<IFormFile> formFiles, string group = "IDTA")
        {
            try
            {
                _context.Database.BeginTransaction();

                formFiles.ForEach(file =>
                {
                    using var ms = new MemoryStream();
                    file.CopyTo(ms);

                    Model.SubmodelTemplate smt;

                    var fixedMs =
                        OriginFixUtil.CheckAndFixPackageOrigin(ms)
                        ?? throw new InvalidOperationException(
                            "Could not normalize package origin."
                        );
                    var aasxPackage = PackagingUtil.ReadPackage(fixedMs, true);
                    var firstSubmodel = aasxPackage.Environment?.Submodels?.FirstOrDefault();

                    smt = new Model.SubmodelTemplate()
                    {
                        Filename = file.FileName,
                        Label = firstSubmodel?.IdShort ?? string.Empty,
                        SemanticIds =
                            firstSubmodel?.SemanticId?.Keys.FirstOrDefault()?.Value ?? string.Empty,
                        Name = firstSubmodel?.IdShort ?? string.Empty,
                        Version = AasMetamodelVersion.V3,
                        SubmodelVersion =
                            $"{firstSubmodel?.Administration?.Version ?? string.Empty}.{firstSubmodel?.Administration?.Revision ?? string.Empty}".Trim(
                                '.'
                            ),
                    };
                    if (aasxPackage.Environment != null)
                    {
                        UpdateConceptDescriptions(aasxPackage.Environment);
                    }

                    // datei ablegen
                    var basePath = new FileInfo(
                        System.Reflection.Assembly.GetExecutingAssembly().Location
                    )
                        .Directory
                        ?.FullName;
                    var path = Path.Combine(basePath ?? string.Empty, "Assets", "Templates");
                    if (!Directory.Exists(path))
                    {
                        Directory.CreateDirectory(path);
                    }
                    using (
                        var fileStream = new FileStream(
                            Path.Combine(path, file.FileName),
                            FileMode.Create
                        )
                    )
                    {
                        file.CopyTo(fileStream);
                    }
                    _context.Add(smt);
                });

                _context.SaveChanges();
                _context.Database.CurrentTransaction?.Commit();
            }
            catch
            {
                if (_context.Database.CurrentTransaction != null)
                {
                    _context.Database.CurrentTransaction.Rollback();
                }
                throw;
            }
        }

        private void UpdateConceptDescriptions(AasCore.Aas3_1.Environment env)
        {
            env.ConceptDescriptions?.ForEach(cd =>
            {
                var dbCd = _context.ConceptDescriptions.FirstOrDefault(c =>
                    c.IdShort == cd.IdShort || c.CdId == cd.Id
                );
                if (dbCd != null)
                {
                    // update
                    dbCd.ConceptDescriptionPlain = AasJsonization
                        .Serialize.ToJsonObject(cd)
                        .ToString();
                    dbCd.IdShort = cd.IdShort ?? string.Empty;
                    dbCd.CdId = cd.Id;
                }
                else
                {
                    dbCd = new MlConceptDescription()
                    {
                        IdShort = cd.IdShort ?? string.Empty,
                        ConceptDescriptionPlain = AasJsonization
                            .Serialize.ToJsonObject(cd)
                            .ToString(),
                        CdId = cd.Id,
                    };
                    _context.ConceptDescriptions.Add(dbCd);
                }
            });
            _context.SaveChanges();
        }

        public async Task<List<Model.SubmodelTemplate>> GetAllFromIdtaRepo()
        {
            var submodels = await GetPagedRepoResult(IdtaRepoSubmodelsUrl, "submodels");
            if (submodels.Count == 0)
                return [];

            var shells = await GetPagedRepoResult(IdtaRepoShellsUrl, "shells");
            var submodelToAasIdShort = BuildSubmodelAasMap(shells);

            return ParseIdtaRepoTemplates(submodels, submodelToAasIdShort);
        }

        public async Task<SubmodelResult> GetBatteryPassportFromIdtaRepo()
        {
            var allTemplates = await GetAllFromIdtaRepo();
            var selectedTemplates = allTemplates
                .Where(t => ContainsIgnoreCase(t.Name, "ForDBPAAS"))
                .ToList();

            // Fallback for current IDTA repo naming: select DBP templates by battery-passport semantics.
            if (selectedTemplates.Count == 0)
            {
                selectedTemplates = allTemplates
                    .Where(t =>
                        ContainsIgnoreCase(t.SemanticIds, "digitalbatterypassport/")
                        || ContainsIgnoreCase(t.SemanticIds, "io.admin-shell.idta.batterypass.")
                    )
                    .ToList();
            }

            var digitalNameplate = allTemplates.FirstOrDefault(t =>
                ContainsIgnoreCase(t.SemanticIds, "digital_nameplate")
                || ContainsIgnoreCase(t.SemanticIds, "digitalbatterypassport/nameplate")
                || ContainsIgnoreCase(t.Name, "BatteryNameplate")
                || ContainsIgnoreCase(t.Name, "DigitalNameplate")
            );

            var technicalData = allTemplates.FirstOrDefault(t =>
                ContainsIgnoreCase(t.SemanticIds, "digitalbatterypassport/technicaldata")
                || ContainsIgnoreCase(
                    t.SemanticIds,
                    "SubmodelTemplate/DigitalBatteryPassport/TechnicalData"
                )
                || ContainsIgnoreCase(t.Name, "TechnicalData")
            );
            var handoverDocumentation = allTemplates.FirstOrDefault(t =>
                ContainsIgnoreCase(t.SemanticIds, "0173-1#01-AHF578#003")
                || ContainsIgnoreCase(t.SemanticIds, "batterypass.handover_documentation")
                || ContainsIgnoreCase(t.Name, "HandoverDocumentation")
            );
            var carbonFootprint = allTemplates.FirstOrDefault(t =>
                ContainsIgnoreCase(
                    t.SemanticIds,
                    "https://admin-shell.io/idta/CarbonFootprint/CarbonFootprint/1/0"
                )
                || ContainsIgnoreCase(t.SemanticIds, "/CarbonFootprint/CarbonFootprint/")
                || ContainsIgnoreCase(t.Name, "CarbonFootprint")
            );

            if (
                digitalNameplate != null
                && selectedTemplates.All(t => t.Url != digitalNameplate.Url)
            )
            {
                selectedTemplates.Add(digitalNameplate);
            }
            if (technicalData != null && selectedTemplates.All(t => t.Url != technicalData.Url))
            {
                selectedTemplates.Add(technicalData);
            }
            if (
                handoverDocumentation != null
                && selectedTemplates.All(t => t.Url != handoverDocumentation.Url)
            )
            {
                selectedTemplates.Add(handoverDocumentation);
            }
            if (carbonFootprint != null && selectedTemplates.All(t => t.Url != carbonFootprint.Url))
            {
                selectedTemplates.Add(carbonFootprint);
            }

            var result = new SubmodelResult();
            foreach (
                var template in selectedTemplates.Where(t => !string.IsNullOrWhiteSpace(t.Url))
            )
            {
                var templateResult = await GetRepoSubmodelTemplate(template.Url);
                foreach (var submodel in templateResult.V3SubmodelsPlain)
                {
                    if (!result.V3SubmodelsPlain.Contains(submodel))
                    {
                        result.V3SubmodelsPlain.Add(submodel);
                    }
                }

                foreach (var cd in templateResult.V3ConceptDescriptionsPlain)
                {
                    if (!result.V3ConceptDescriptionsPlain.Contains(cd))
                    {
                        result.V3ConceptDescriptionsPlain.Add(cd);
                    }
                }
            }

            return result;
        }

        public async Task<StandardGeneratorBootstrapResult> GetStandardGeneratorBootstrap(
            string mode,
            string? iriPrefix = null
        )
        {
            var normalizedMode = NormalizeStandardGeneratorMode(mode);
            var normalizedIriPrefix = string.IsNullOrWhiteSpace(iriPrefix)
                ? StandardGeneratorDefaultIriPrefix
                : iriPrefix.Trim().TrimEnd('/');

            var allTemplates = await GetAllFromIdtaRepo();
            var result = new StandardGeneratorBootstrapResult
            {
                Mode = normalizedMode,
                UiRules = CreateStandardGeneratorUiRules(normalizedMode),
            };

            var knownConceptDescriptionIds = new HashSet<string>(StringComparer.Ordinal);
            var submodels = new List<AasCore.Aas3_1.Submodel>();

            foreach (var templateDefinition in StandardGeneratorPr1Templates)
            {
                var template = allTemplates.FirstOrDefault(t =>
                    string.Equals(
                        t.SemanticIds,
                        templateDefinition.SemanticId,
                        StringComparison.Ordinal
                    )
                    && string.Equals(
                        t.TemplateId,
                        templateDefinition.TemplateId,
                        StringComparison.Ordinal
                    )
                );

                if (template == null || string.IsNullOrWhiteSpace(template.Url))
                {
                    throw new InvalidOperationException(
                        $"Required IDTA template '{templateDefinition.TemplateId}' for '{templateDefinition.Role}' is unavailable."
                    );
                }

                var templateResult = await GetRepoSubmodelTemplate(
                    template.Url,
                    knownConceptDescriptionIds
                );
                var submodelPlain = templateResult.V3SubmodelsPlain.FirstOrDefault();
                if (string.IsNullOrWhiteSpace(submodelPlain))
                {
                    throw new InvalidOperationException(
                        $"IDTA template '{templateDefinition.TemplateId}' did not provide a usable submodel payload."
                    );
                }

                if (!TryDeserializeSubmodel(submodelPlain, out var submodel))
                {
                    throw new InvalidOperationException(
                        $"IDTA template '{templateDefinition.TemplateId}' returned an invalid submodel payload."
                    );
                }

                submodel.Id = IdGenerationUtil.GenerateId(IdType.Submodel, normalizedIriPrefix);

                if (
                    string.Equals(
                        templateDefinition.TemplateId,
                        StandardNameplateTemplateId,
                        StringComparison.Ordinal
                    )
                )
                {
                    await EnrichStandardNameplateWithContactInformation(
                        submodel,
                        result,
                        knownConceptDescriptionIds
                    );
                }

                submodelPlain = AasJsonization.Serialize.ToJsonObject(submodel).ToJsonString();

                submodels.Add(submodel);
                AddDistinctPayload(result.V3SubmodelsPlain, submodelPlain);

                foreach (var conceptDescriptionPlain in templateResult.V3ConceptDescriptionsPlain)
                {
                    AddDistinctPayload(result.V3ConceptDescriptionsPlain, conceptDescriptionPlain);
                    if (
                        TryGetConceptDescriptionId(
                            conceptDescriptionPlain,
                            out var conceptDescriptionId
                        )
                    )
                    {
                        knownConceptDescriptionIds.Add(conceptDescriptionId);
                    }
                }

                result.TemplateRoles.Add(
                    new StandardGeneratorTemplateRoleResult
                    {
                        Role = templateDefinition.Role,
                        Label = template.Label,
                        SemanticId = templateDefinition.SemanticId,
                        TemplateId = templateDefinition.TemplateId,
                        SourceUrl = template.Url,
                        SubmodelId = submodel.Id,
                        SubmodelIdShort = submodel.IdShort ?? string.Empty,
                        SubmodelPlain = submodelPlain,
                    }
                );
            }

            var shell = CreateStandardGeneratorShell(
                normalizedMode,
                normalizedIriPrefix,
                submodels
            );
            result.V3ShellPlain = AasJsonization.Serialize.ToJsonObject(shell).ToJsonString();

            return result;
        }

        private async Task EnrichStandardNameplateWithContactInformation(
            AasCore.Aas3_1.Submodel nameplateSubmodel,
            StandardGeneratorBootstrapResult result,
            HashSet<string> knownConceptDescriptionIds
        )
        {
            var contactTemplateResult = await GetRepoSubmodelTemplate(
                ContactInformationTemplateUrl,
                knownConceptDescriptionIds
            );
            var contactSubmodelPlain = contactTemplateResult.V3SubmodelsPlain.FirstOrDefault();

            if (
                string.IsNullOrWhiteSpace(contactSubmodelPlain)
                || !TryDeserializeSubmodel(contactSubmodelPlain, out var contactSubmodel)
            )
            {
                return;
            }

            MergeContactInformationIntoNameplate(nameplateSubmodel, contactSubmodel);

            foreach (
                var conceptDescriptionPlain in contactTemplateResult.V3ConceptDescriptionsPlain
            )
            {
                AddDistinctPayload(result.V3ConceptDescriptionsPlain, conceptDescriptionPlain);
                if (
                    TryGetConceptDescriptionId(
                        conceptDescriptionPlain,
                        out var conceptDescriptionId
                    )
                )
                {
                    knownConceptDescriptionIds.Add(conceptDescriptionId);
                }
            }
        }

        internal static void MergeContactInformationIntoNameplate(
            AasCore.Aas3_1.Submodel nameplateSubmodel,
            AasCore.Aas3_1.Submodel contactInformationSubmodel
        )
        {
            var sourceContactInformation = FindCollectionBySemanticId(
                contactInformationSubmodel.SubmodelElements,
                NameplateContactInformationSemanticId
            );
            if (sourceContactInformation == null)
            {
                return;
            }

            var targetAddressInformation = FindCollectionBySemanticId(
                nameplateSubmodel.SubmodelElements,
                NameplateAddressInformationSemanticId
            );

            if (targetAddressInformation == null)
            {
                EnsureTopLevelContactInformation(nameplateSubmodel, sourceContactInformation);
                return;
            }

            ResetSubmodelElementValuesRecursively(targetAddressInformation);

            var remainingChildren = (targetAddressInformation.Value ?? [])
                .Where(child =>
                    !AddressFieldIdShorts.Contains(child.IdShort ?? string.Empty)
                    && !HasSemanticId(child, NameplateContactInformationSemanticId)
                )
                .ToList();

            remainingChildren.Add(sourceContactInformation);
            targetAddressInformation.Value = remainingChildren;
        }

        public async Task<SubmodelResult> GetRepoSubmodelTemplate(string url)
        {
            return await GetRepoSubmodelTemplate(url, null);
        }

        public async Task<SubmodelResult> GetRepoSubmodelTemplate(
            string url,
            IEnumerable<string>? knownConceptDescriptionIds
        )
        {
            SubmodelResult result = new SubmodelResult();
            if (string.IsNullOrWhiteSpace(url))
                return result;

            var payload = await GetRepoSubmodelPayload(url);

            if (string.IsNullOrWhiteSpace(payload))
            {
                return result;
            }

            payload = SanitizeKnownIdtaPayloadDefects(payload);
            payload = EmbeddedDataspecFixUtil.FixEmbeddedDataspec(payload);
            JObject? submodelRes = JsonConvert.DeserializeObject<JObject>(payload);
            if (submodelRes == null)
                return result;

            var submodelJsonNode = JsonNode.Parse(submodelRes.ToString());
            if (submodelJsonNode == null)
                return result;

            var submodel = AasCore.Aas3_1.Jsonization.Deserialize.SubmodelFrom(submodelJsonNode);
            NormalizeRepoSubmodelForInsertion(submodel);

            var jsonObject = AasJsonization.Serialize.ToJsonObject(submodel);
            result.V3SubmodelsPlain.Add(jsonObject.ToJsonString());

            var referencedConceptDescriptionIds = CollectReferencedConceptDescriptionIds(submodel);
            if (knownConceptDescriptionIds != null)
            {
                referencedConceptDescriptionIds.ExceptWith(
                    knownConceptDescriptionIds.Where(id => !string.IsNullOrWhiteSpace(id))
                );
            }

            var conceptDescriptionPayloads = await GetConceptDescriptionPayloadsForIds(
                referencedConceptDescriptionIds
            );
            result.V3ConceptDescriptionsPlain.AddRange(conceptDescriptionPayloads);

            return result;
        }

        internal static void NormalizeRepoSubmodelForInsertion(AasCore.Aas3_1.Submodel submodel)
        {
            submodel.Kind = AasCore.Aas3_1.ModellingKind.Instance;
            RemoveTemplateQualifiers(submodel);

            foreach (var submodelElement in submodel.SubmodelElements ?? [])
            {
                RemoveTemplateQualifiersRecursively(submodelElement);
            }
        }

        private static void EnsureTopLevelContactInformation(
            AasCore.Aas3_1.Submodel nameplateSubmodel,
            AasCore.Aas3_1.SubmodelElementCollection sourceContactInformation
        )
        {
            if (
                (nameplateSubmodel.SubmodelElements ?? []).Any(element =>
                    HasSemanticId(element, NameplateContactInformationSemanticId)
                )
            )
            {
                return;
            }

            nameplateSubmodel.SubmodelElements ??= [];
            nameplateSubmodel.SubmodelElements.Add(sourceContactInformation);
        }

        private static AasCore.Aas3_1.SubmodelElementCollection? FindCollectionBySemanticId(
            IEnumerable<AasCore.Aas3_1.ISubmodelElement>? submodelElements,
            string semanticId
        )
        {
            if (submodelElements == null)
            {
                return null;
            }

            foreach (var submodelElement in submodelElements)
            {
                if (
                    submodelElement is AasCore.Aas3_1.SubmodelElementCollection collection
                    && HasSemanticId(collection, semanticId)
                )
                {
                    return collection;
                }

                var nestedCollection = FindCollectionBySemanticId(
                    EnumerateChildSubmodelElements(submodelElement),
                    semanticId
                );
                if (nestedCollection != null)
                {
                    return nestedCollection;
                }
            }

            return null;
        }

        private static bool HasSemanticId(AasCore.Aas3_1.IHasSemantics element, string semanticId)
        {
            return element.SemanticId?.Keys?.Any(key =>
                    string.Equals(key.Value?.Trim(), semanticId, StringComparison.Ordinal)
                ) == true;
        }

        private static void ResetSubmodelElementValuesRecursively(
            AasCore.Aas3_1.ISubmodelElement submodelElement
        )
        {
            switch (submodelElement)
            {
                case AasCore.Aas3_1.SubmodelElementCollection collection:
                    foreach (var child in collection.Value ?? [])
                    {
                        ResetSubmodelElementValuesRecursively(child);
                    }
                    break;
                case AasCore.Aas3_1.SubmodelElementList list:
                    foreach (var child in list.Value ?? [])
                    {
                        ResetSubmodelElementValuesRecursively(child);
                    }
                    break;
                case AasCore.Aas3_1.MultiLanguageProperty multiLanguageProperty:
                    multiLanguageProperty.Value = null;
                    break;
                case AasCore.Aas3_1.Property property:
                    property.Value = null;
                    break;
                case AasCore.Aas3_1.Range range:
                    range.Min = null;
                    range.Max = null;
                    break;
                case AasCore.Aas3_1.File file:
                    file.Value = null;
                    break;
                case AasCore.Aas3_1.Blob blob:
                    blob.Value = null;
                    break;
                case AasCore.Aas3_1.ReferenceElement referenceElement:
                    referenceElement.Value = null;
                    break;
            }
        }

        private static void RemoveTemplateQualifiersRecursively(
            AasCore.Aas3_1.ISubmodelElement submodelElement
        )
        {
            RemoveTemplateQualifiers(submodelElement);

            foreach (var childElement in EnumerateChildSubmodelElements(submodelElement))
            {
                RemoveTemplateQualifiersRecursively(childElement);
            }
        }

        private static void RemoveTemplateQualifiers(AasCore.Aas3_1.IQualifiable qualifiable)
        {
            if (qualifiable.Qualifiers == null || qualifiable.Qualifiers.Count == 0)
            {
                return;
            }

            var qualifiers = qualifiable
                .Qualifiers.Where(q => q.Kind != AasCore.Aas3_1.QualifierKind.TemplateQualifier)
                .ToList();

            qualifiable.Qualifiers = qualifiers.Count > 0 ? qualifiers : null;
        }

        private static IEnumerable<AasCore.Aas3_1.ISubmodelElement> EnumerateChildSubmodelElements(
            AasCore.Aas3_1.ISubmodelElement submodelElement
        )
        {
            foreach (var propertyName in new[] { "Value", "Statements", "Annotations" })
            {
                foreach (
                    var child in EnumerateSubmodelElementsFromProperty(
                        submodelElement,
                        propertyName
                    )
                )
                {
                    yield return child;
                }
            }

            foreach (
                var propertyName in new[]
                {
                    "InputVariables",
                    "OutputVariables",
                    "InoutputVariables",
                }
            )
            {
                var operationVariablesProperty = submodelElement
                    .GetType()
                    .GetProperty(propertyName, BindingFlags.Instance | BindingFlags.Public);
                if (
                    operationVariablesProperty?.GetValue(submodelElement)
                    is not System.Collections.IEnumerable operationVariables
                )
                {
                    continue;
                }

                foreach (var operationVariable in operationVariables)
                {
                    if (operationVariable == null)
                    {
                        continue;
                    }

                    var valueProperty = operationVariable
                        .GetType()
                        .GetProperty("Value", BindingFlags.Instance | BindingFlags.Public);
                    if (
                        valueProperty?.GetValue(operationVariable)
                        is AasCore.Aas3_1.ISubmodelElement value
                    )
                    {
                        yield return value;
                    }
                }
            }
        }

        private static IEnumerable<AasCore.Aas3_1.ISubmodelElement> EnumerateSubmodelElementsFromProperty(
            object owner,
            string propertyName
        )
        {
            var property = owner
                .GetType()
                .GetProperty(propertyName, BindingFlags.Instance | BindingFlags.Public);
            if (property?.GetValue(owner) is not System.Collections.IEnumerable values)
            {
                yield break;
            }

            foreach (var value in values)
            {
                if (value is AasCore.Aas3_1.ISubmodelElement submodelElement)
                {
                    yield return submodelElement;
                }
            }
        }

        public async Task<string?> GetRepoConceptDescription(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                return null;
            }

            return await GetRepoConceptDescriptionPayload(id);
        }

        public async Task<List<string>> GetRepoConceptDescriptions(List<string> ids)
        {
            if (ids == null || ids.Count == 0)
            {
                return [];
            }

            var distinctIds = ids.Where(id => !string.IsNullOrWhiteSpace(id))
                .Select(id => id.Trim())
                .Distinct(StringComparer.Ordinal)
                .ToList();

            var payloads = await Task.WhenAll(distinctIds.Select(GetRepoConceptDescriptionPayload));
            return payloads
                .Where(payload => !string.IsNullOrWhiteSpace(payload))
                .Cast<string>()
                .ToList();
        }

        private HashSet<string> CollectReferencedConceptDescriptionIds(
            AasCore.Aas3_1.Submodel submodel
        )
        {
            var result = new HashSet<string>(StringComparer.Ordinal);

            AddReferenceIds(submodel.SemanticId, result);

            if (submodel.SubmodelElements != null)
            {
                CollectReferencedConceptDescriptionIdsRecursive(submodel.SubmodelElements, result);
            }

            return result;
        }

        private void CollectReferencedConceptDescriptionIdsRecursive(
            List<AasCore.Aas3_1.ISubmodelElement> submodelElements,
            HashSet<string> conceptDescriptionIds
        )
        {
            foreach (var submodelElement in submodelElements)
            {
                AddReferenceIds(submodelElement.SemanticId, conceptDescriptionIds);

                if (submodelElement is AasCore.Aas3_1.SubmodelElementCollection collection)
                {
                    if (collection.Value != null)
                    {
                        CollectReferencedConceptDescriptionIdsRecursive(
                            collection.Value,
                            conceptDescriptionIds
                        );
                    }
                    continue;
                }

                if (submodelElement is AasCore.Aas3_1.SubmodelElementList list)
                {
                    if (list.Value != null)
                    {
                        CollectReferencedConceptDescriptionIdsRecursive(
                            list.Value,
                            conceptDescriptionIds
                        );
                    }
                }
            }
        }

        private void AddReferenceIds(
            AasCore.Aas3_1.IReference? reference,
            HashSet<string> conceptDescriptionIds
        )
        {
            foreach (var key in reference?.Keys ?? [])
            {
                if (!string.IsNullOrWhiteSpace(key.Value))
                {
                    conceptDescriptionIds.Add(key.Value.Trim());
                }
            }
        }

        private async Task<List<string>> GetConceptDescriptionPayloadsForIds(
            IEnumerable<string> conceptDescriptionIds
        )
        {
            var distinctIds = conceptDescriptionIds
                .Where(id => !string.IsNullOrWhiteSpace(id))
                .Select(id => id.Trim())
                .Distinct(StringComparer.Ordinal)
                .ToList();

            if (distinctIds.Count == 0)
            {
                return [];
            }

            var payloadsById = _context
                .ConceptDescriptions.Where(cd => distinctIds.Contains(cd.CdId))
                .AsEnumerable()
                .GroupBy(cd => cd.CdId, StringComparer.Ordinal)
                .ToDictionary(
                    group => group.Key,
                    group =>
                        group
                            .OrderByDescending(cd => cd.AenderungsDatum)
                            .ThenByDescending(cd => cd.Id)
                            .Select(cd =>
                                NormalizeRepoConceptDescriptionPayload(cd.ConceptDescriptionPlain)
                                ?? string.Empty
                            )
                            .FirstOrDefault(payload => !string.IsNullOrWhiteSpace(payload))
                        ?? string.Empty,
                    StringComparer.Ordinal
                );

            var missingIds = distinctIds.Where(id => !payloadsById.ContainsKey(id)).ToList();
            if (missingIds.Count > 0)
            {
                var repoPayloads = await Task.WhenAll(
                    missingIds.Select(async id => new
                    {
                        Id = id,
                        Payload = NormalizeRepoConceptDescriptionPayload(
                            await GetRepoConceptDescriptionPayload(id)
                        ),
                    })
                );

                foreach (var repoPayload in repoPayloads)
                {
                    if (!string.IsNullOrWhiteSpace(repoPayload.Payload))
                    {
                        payloadsById[repoPayload.Id] = repoPayload.Payload;
                    }
                }
            }

            return distinctIds
                .Where(id =>
                    payloadsById.TryGetValue(id, out var payload)
                    && !string.IsNullOrWhiteSpace(payload)
                )
                .Select(id => payloadsById[id])
                .ToList();
        }

        private static string NormalizeStandardGeneratorMode(string mode)
        {
            var normalizedMode = mode?.Trim().ToLowerInvariant();
            return normalizedMode switch
            {
                "typ" => normalizedMode,
                "instanz" => normalizedMode,
                _ => throw new ArgumentException("Mode must be 'typ' or 'instanz'.", nameof(mode)),
            };
        }

        private static StandardGeneratorUiRules CreateStandardGeneratorUiRules(string mode)
        {
            var showInstanceOnlyFields = string.Equals(mode, "instanz", StringComparison.Ordinal);
            return new StandardGeneratorUiRules
            {
                ShowSerialNumber = showInstanceOnlyFields,
                ShowManufacturingDate = showInstanceOnlyFields,
            };
        }

        private static void AddDistinctPayload(List<string> target, string payload)
        {
            if (
                string.IsNullOrWhiteSpace(payload)
                || target.Contains(payload, StringComparer.Ordinal)
            )
            {
                return;
            }

            target.Add(payload);
        }

        private static bool TryDeserializeSubmodel(
            string submodelPlain,
            out AasCore.Aas3_1.Submodel submodel
        )
        {
            submodel = null!;

            try
            {
                var jsonNode = JsonNode.Parse(submodelPlain);
                if (jsonNode == null)
                {
                    return false;
                }

                submodel = AasJsonization.Deserialize.SubmodelFrom(jsonNode);
                return true;
            }
            catch
            {
                return false;
            }
        }

        private static bool TryGetConceptDescriptionId(
            string conceptDescriptionPlain,
            out string conceptDescriptionId
        )
        {
            conceptDescriptionId = string.Empty;

            try
            {
                var jsonNode = JsonNode.Parse(conceptDescriptionPlain);
                var id = jsonNode?["id"]?.GetValue<string>();
                if (string.IsNullOrWhiteSpace(id))
                {
                    return false;
                }

                conceptDescriptionId = id.Trim();
                return true;
            }
            catch
            {
                return false;
            }
        }

        private static AasCore.Aas3_1.AssetAdministrationShell CreateStandardGeneratorShell(
            string mode,
            string iriPrefix,
            IEnumerable<AasCore.Aas3_1.Submodel> submodels
        )
        {
            var normalizedPrefix = iriPrefix.TrimEnd('/');
            var assetInformation = new AasCore.Aas3_1.AssetInformation(
                string.Equals(mode, "typ", StringComparison.Ordinal)
                    ? AasCore.Aas3_1.AssetKind.Type
                    : AasCore.Aas3_1.AssetKind.Instance,
                IdGenerationUtil.GenerateId(IdType.Asset, normalizedPrefix)
            );

            return new AasCore.Aas3_1.AssetAdministrationShell(
                IdGenerationUtil.GenerateId(IdType.Aas, normalizedPrefix),
                assetInformation
            )
            {
                IdShort = string.Equals(mode, "typ", StringComparison.Ordinal)
                    ? "TypeAssetAdministrationShell"
                    : "InstanceAssetAdministrationShell",
                Administration = new AasCore.Aas3_1.AdministrativeInformation
                {
                    Version = "1",
                    Revision = "0",
                    Creator = new AasCore.Aas3_1.Reference(
                        AasCore.Aas3_1.ReferenceTypes.ExternalReference,
                        [
                            new AasCore.Aas3_1.Key(
                                AasCore.Aas3_1.KeyTypes.GlobalReference,
                                "AasDesigner"
                            ),
                        ]
                    ),
                },
                Submodels = submodels
                    .Select(submodel =>
                        (AasCore.Aas3_1.IReference)
                            new AasCore.Aas3_1.Reference(
                                AasCore.Aas3_1.ReferenceTypes.ModelReference,
                                [
                                    new AasCore.Aas3_1.Key(
                                        AasCore.Aas3_1.KeyTypes.Submodel,
                                        submodel.Id
                                    ),
                                ]
                            )
                    )
                    .ToList(),
            };
        }

        private async Task<string?> TryGetLiveString(string url)
        {
            try
            {
                using var httpClient = new HttpClient();
                var response = await httpClient.GetAsync(url);
                if (!response.IsSuccessStatusCode)
                {
                    return null;
                }
                return await response.Content.ReadAsStringAsync();
            }
            catch
            {
                return null;
            }
        }

        private List<Model.SubmodelTemplate> ParseIdtaRepoTemplates(
            JArray items,
            Dictionary<string, HashSet<string>>? submodelToAasIdShort = null
        )
        {
            var result = new List<Model.SubmodelTemplate>();

            try
            {
                foreach (var item in items)
                {
                    try
                    {
                        var itemString = EmbeddedDataspecFixUtil.FixEmbeddedDataspec(
                            item.ToString()
                        );
                        JObject? submodelRes = JsonConvert.DeserializeObject<JObject>(itemString);
                        if (submodelRes == null)
                            continue;

                        var submodelJsonNode = JsonNode.Parse(submodelRes.ToString());
                        if (submodelJsonNode == null)
                            continue;

                        var submodel = AasCore.Aas3_1.Jsonization.Deserialize.SubmodelFrom(
                            submodelJsonNode
                        );
                        if (submodel.Kind != AasCore.Aas3_1.ModellingKind.Template)
                            continue;

                        var template = new Model.SubmodelTemplate
                        {
                            Name = submodel.IdShort ?? string.Empty,
                            Label =
                                submodel.Description?.FirstOrDefault()?.Text
                                ?? submodel.IdShort
                                ?? string.Empty,
                            SemanticIds =
                                submodel.SemanticId?.Keys?.FirstOrDefault()?.Value ?? string.Empty,
                            TemplateId = submodel.Administration?.TemplateId ?? string.Empty,
                            Version = AasMetamodelVersion.V3,
                            SubmodelVersion =
                                $"{submodel.Administration?.Version}.{submodel.Administration?.Revision}",
                            Group = "IDTA_SMT_REPO",
                            Url =
                                IdtaRepoSubmodelsUrl.AppendSlash()
                                + submodel.Id.ToBase64UrlEncoded(Encoding.UTF8),
                        };
                        if (submodelToAasIdShort != null && !string.IsNullOrWhiteSpace(submodel.Id))
                        {
                            if (
                                submodelToAasIdShort.TryGetValue(submodel.Id, out var aasIdShorts)
                                && aasIdShorts.Count > 0
                            )
                            {
                                template.SourceAasIdShort = string.Join(
                                    ", ",
                                    aasIdShorts.OrderBy(v => v, StringComparer.OrdinalIgnoreCase)
                                );
                            }
                        }
                        result.Add(template);
                    }
                    catch
                    {
                        // Einzelnes Element überspringen, Rest verarbeiten
                    }
                }
            }
            catch
            {
                return [];
            }

            return result;
        }

        private Dictionary<string, HashSet<string>> BuildSubmodelAasMap(JArray shells)
        {
            var mapping = new Dictionary<string, HashSet<string>>(StringComparer.Ordinal);
            foreach (var shellItem in shells)
            {
                try
                {
                    var aasIdShort = shellItem["idShort"]?.ToString();
                    if (string.IsNullOrWhiteSpace(aasIdShort))
                        continue;

                    var submodels = shellItem["submodels"] as JArray;
                    if (submodels == null)
                        continue;

                    foreach (var smRef in submodels)
                    {
                        var keys = smRef["keys"] as JArray;
                        if (keys == null)
                            continue;

                        foreach (var key in keys)
                        {
                            var keyType = key["type"]?.ToString();
                            if (
                                !string.Equals(
                                    keyType,
                                    "Submodel",
                                    StringComparison.OrdinalIgnoreCase
                                )
                            )
                                continue;

                            var submodelId = key["value"]?.ToString();
                            if (string.IsNullOrWhiteSpace(submodelId))
                                continue;

                            if (!mapping.TryGetValue(submodelId, out var set))
                            {
                                set = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
                                mapping[submodelId] = set;
                            }
                            set.Add(aasIdShort);
                        }
                    }
                }
                catch
                {
                    // Einzelnes Element überspringen, Rest verarbeiten
                }
            }

            return mapping;
        }

        private static bool ContainsIgnoreCase(string? value, string expected)
        {
            return !string.IsNullOrWhiteSpace(value)
                && value.Contains(expected, StringComparison.OrdinalIgnoreCase);
        }

        private static string SanitizeKnownIdtaPayloadDefects(string payload)
        {
            if (string.IsNullOrWhiteSpace(payload))
            {
                return payload;
            }

            return payload
                .Replace("urn:samurn:samm:", "urn:samm:", StringComparison.OrdinalIgnoreCase)
                .Replace("urn:samurn:samurn:samm:", "urn:samm:", StringComparison.OrdinalIgnoreCase)
                .Replace("urn:samurn:samm", "urn:samm", StringComparison.OrdinalIgnoreCase)
                .Replace("urn:samurn:samurn:samm", "urn:samm", StringComparison.OrdinalIgnoreCase);
        }

        private string GetIdtaRepoCachePath()
        {
            var basePath =
                new FileInfo(System.Reflection.Assembly.GetExecutingAssembly().Location)
                    .Directory
                    ?.FullName
                ?? string.Empty;
            var cachePath = Path.Combine(basePath, "Assets", "Templates", "IdtaRepoCache");
            if (!Directory.Exists(cachePath))
            {
                Directory.CreateDirectory(cachePath);
            }
            return cachePath;
        }

        private async Task<JArray> GetPagedRepoResult(string baseUrl, string cacheName)
        {
            var cacheKey = $"idta-repo-list:{cacheName}";
            if (
                _memoryCache.TryGetValue<string>(cacheKey, out var cachedPayload)
                && !string.IsNullOrWhiteSpace(cachedPayload)
            )
            {
                try
                {
                    return JArray.Parse(cachedPayload);
                }
                catch
                {
                    // Fallback to live/cache file.
                }
            }

            var live = await TryGetLivePagedResult(baseUrl);
            if (live != null)
            {
                SaveRepoListCache(cacheName, live.ToString(Formatting.None));
                _memoryCache.Set(cacheKey, live.ToString(Formatting.None), RepoMemoryCacheOptions);
                return live;
            }

            var filePayload = LoadRepoListCache(cacheName);
            if (!string.IsNullOrWhiteSpace(filePayload))
            {
                try
                {
                    var parsed = JArray.Parse(filePayload);
                    _memoryCache.Set(cacheKey, filePayload, RepoMemoryCacheOptions);
                    return parsed;
                }
                catch
                {
                    return [];
                }
            }

            return [];
        }

        private async Task<JArray?> TryGetLivePagedResult(string baseUrl)
        {
            var aggregated = new JArray();
            string? cursor = null;
            var seenCursors = new HashSet<string>(StringComparer.Ordinal);
            const int limit = 200;
            const int maxPages = 500;

            for (var page = 0; page < maxPages; page++)
            {
                var url = $"{baseUrl}?limit={limit}";
                if (!string.IsNullOrWhiteSpace(cursor))
                {
                    url += "&cursor=" + Uri.EscapeDataString(cursor);
                }

                var payload = await TryGetLiveString(url);
                if (string.IsNullOrWhiteSpace(payload))
                {
                    return page == 0 ? null : aggregated;
                }

                payload = SanitizeKnownIdtaPayloadDefects(payload);
                payload = EmbeddedDataspecFixUtil.FixEmbeddedDataspec(payload);
                JObject? wrapper = JsonConvert.DeserializeObject<JObject>(payload);
                if (wrapper == null)
                {
                    return page == 0 ? null : aggregated;
                }

                var pageItems = wrapper.Value<JArray>("result") ?? [];
                foreach (var item in pageItems)
                {
                    aggregated.Add(item);
                }

                var nextCursor = wrapper["paging_metadata"]?["cursor"]?.ToString();
                if (string.IsNullOrWhiteSpace(nextCursor) || !seenCursors.Add(nextCursor))
                {
                    break;
                }

                cursor = nextCursor;
                if (pageItems.Count == 0)
                {
                    break;
                }
            }

            return aggregated;
        }

        private void SaveRepoListCache(string cacheName, string payload)
        {
            var path = Path.Combine(GetIdtaRepoCachePath(), $"{cacheName}.json");
            System.IO.File.WriteAllText(path, payload);
        }

        private string? LoadRepoListCache(string cacheName)
        {
            var path = Path.Combine(GetIdtaRepoCachePath(), $"{cacheName}.json");
            if (!System.IO.File.Exists(path))
                return null;
            return System.IO.File.ReadAllText(path);
        }

        private string EncodeUrlForFilename(string url)
        {
            var bytes = Encoding.UTF8.GetBytes(url);
            return Convert.ToBase64String(bytes).Replace("/", "_").Replace("+", "-").TrimEnd('=');
        }

        private void SaveRepoSubmodelCache(string url, string payload)
        {
            var filename = $"{EncodeUrlForFilename(url)}.json";
            var path = Path.Combine(GetIdtaRepoCachePath(), filename);
            System.IO.File.WriteAllText(path, payload);
        }

        private string? LoadRepoSubmodelCache(string url)
        {
            var filename = $"{EncodeUrlForFilename(url)}.json";
            var path = Path.Combine(GetIdtaRepoCachePath(), filename);
            if (!System.IO.File.Exists(path))
                return null;
            return System.IO.File.ReadAllText(path);
        }

        private async Task<string?> GetRepoSubmodelPayload(string url)
        {
            var normalizedUrl = NormalizeRepoSubmodelUrl(url);
            var cacheKey = $"idta-repo-submodel:{normalizedUrl}";
            if (_memoryCache.TryGetValue<string>(cacheKey, out var cachedPayload))
            {
                return cachedPayload;
            }

            var payload = await TryGetLiveString(normalizedUrl);
            if (!string.IsNullOrWhiteSpace(payload))
            {
                SaveRepoSubmodelCache(normalizedUrl, payload);
                _memoryCache.Set(cacheKey, payload, RepoMemoryCacheOptions);
                return payload;
            }

            payload = LoadRepoSubmodelCache(normalizedUrl);
            if (!string.IsNullOrWhiteSpace(payload))
            {
                _memoryCache.Set(cacheKey, payload, RepoMemoryCacheOptions);
            }

            return payload;
        }

        private static string NormalizeRepoSubmodelUrl(string url)
        {
            var trimmedUrl = url?.Trim() ?? string.Empty;
            if (string.IsNullOrWhiteSpace(trimmedUrl))
            {
                return string.Empty;
            }

            if (trimmedUrl.StartsWith(IdtaRepoSubmodelsUrl, StringComparison.OrdinalIgnoreCase))
            {
                return trimmedUrl;
            }

            return IdtaRepoSubmodelsUrl.AppendSlash()
                + trimmedUrl.ToBase64UrlEncoded(Encoding.UTF8);
        }

        private void SaveRepoConceptDescriptionCache(string id, string payload)
        {
            var filename = $"cd_{EncodeUrlForFilename(id)}.json";
            var path = Path.Combine(GetIdtaRepoCachePath(), filename);
            System.IO.File.WriteAllText(path, payload);
        }

        private string? LoadRepoConceptDescriptionCache(string id)
        {
            var filename = $"cd_{EncodeUrlForFilename(id)}.json";
            var path = Path.Combine(GetIdtaRepoCachePath(), filename);
            if (!System.IO.File.Exists(path))
                return null;
            return System.IO.File.ReadAllText(path);
        }

        private async Task<string?> GetRepoConceptDescriptionPayload(string id)
        {
            var cacheKey = $"idta-repo-cd:{id}";
            if (_memoryCache.TryGetValue<string>(cacheKey, out var cachedPayload))
            {
                return cachedPayload;
            }

            var url =
                IdtaRepoConceptDescriptionsUrl.AppendSlash() + id.ToBase64UrlEncoded(Encoding.UTF8);
            var payload = await TryGetLiveString(url);
            if (!string.IsNullOrWhiteSpace(payload))
            {
                SaveRepoConceptDescriptionCache(id, payload);
                _memoryCache.Set(cacheKey, payload, RepoMemoryCacheOptions);
                return payload;
            }

            payload = LoadRepoConceptDescriptionCache(id);
            if (!string.IsNullOrWhiteSpace(payload))
            {
                _memoryCache.Set(cacheKey, payload, RepoMemoryCacheOptions);
            }

            return payload;
        }

        private string? NormalizeRepoConceptDescriptionPayload(string? payload)
        {
            if (string.IsNullOrWhiteSpace(payload))
            {
                return null;
            }

            return EmbeddedDataspecFixUtil.FixEmbeddedDataspec(
                SanitizeKnownIdtaPayloadDefects(payload)
            );
        }
    }
}
