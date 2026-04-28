import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { Injectable } from '@angular/core';
import type { Router } from '@angular/router';

import { lastValueFrom } from 'rxjs';

import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { OrgaUserSeatStats } from '@aas-designer-model';
import { AppConfigService, PortalService } from '@aas/common-services';
import { FilenameHelper, IdGenerationUtil, SemanticIdHelper } from '@aas/helpers';
import { ApiException } from '@aas/jwt-auth';
import { ConceptDescription, FileResult, MultiLanguagePropertyValue, ShellResult } from '@aas/model';
import { SaveShellResult } from '@aas/webapi-client';
import { DppAssistantFieldValue, DppPcfEntryCollection } from 'battery-passport-assistant';
import * as batteryPassportTemplateRegistry from './battery-passport-template-registry';
import { prefillBatteryPassportTechnicalData } from './generator-battery-passport-prefill.builder';
import { buildDocumentationExportSubmodel, syncDocumentationDocuments } from './generator-documentation.builder';
import { createDppMetaSubmodels } from './generator-dpp-meta.builder';
import {
  buildDppPcfSubmodelElements,
  DPP_PCF_REQUIRED_SEMANTIC_IDS,
  hasDppPcfValues,
  isDppPcfTemplateSubmodel,
} from './generator-dpp-pcf.builder';
import { appendExportSubmodel, createGeneratorExportState, GeneratorExportState } from './generator-export.builder';
import { GeneratorExportService } from './generator-export.service';
import { appendGeneratorFilesToFormData } from './generator-file-export.builder';
import { buildGeneratorFlow, GeneratorFlowStep, GeneratorMode } from './generator-flow.config';
import {
  buildTemplateBackedNameplateSubmodel,
  createDppDigitalNameplateSubmodel,
  createStandardAssistantNameplateSubmodel,
  type GeneratorNameplateMarkingSource,
  type GeneratorNameplateSource,
} from './generator-nameplate.builder';
import { GeneratorStateStore } from './generator-state.store';
import { Document } from './model/document';
import { DocumentItem } from './model/document-item';
import { HerstellerAdresse } from './model/hersteller-adresse';
import { SubmodelResult } from './model/submodel-result';

const STANDARD_NAMEPLATE_TEMPLATE_ID = 'https://admin-shell.io/idta-02006-3-0';
const STANDARD_NAMEPLATE_SEMANTIC_ID = 'https://admin-shell.io/idta/nameplate/3/0/Nameplate';
const CONTACT_INFORMATION_TEMPLATE_URL = 'https://admin-shell.io/idta/SubmodelTemplate/ContactInformation/1/0';
const ADDRESS_INFORMATION_SEMANTIC_ID =
  'https://admin-shell.io/zvei/nameplate/1/0/ContactInformations/AddressInformation';
const CONTACT_INFORMATION_SEMANTIC_ID =
  'https://admin-shell.io/zvei/nameplate/1/0/ContactInformations/ContactInformation';
const NAMEPLATE_ADDRESS_FIELD_ID_SHORTS = new Set([
  'Company',
  'Name',
  'Street',
  'StreetName',
  'Zipcode',
  'ZipCode',
  'Zip',
  'CityTown',
  'City',
  'StateCounty',
  'State',
  'NationalCode',
  'CountryCode',
  'Country',
]);

interface DppUploadedFileEntry {
  key: string;
  file: File;
  filename: string;
  contentType: string;
  embeddedPath: string;
}

interface StandardGeneratorTemplateRole {
  role: string;
  label: string;
  semanticId: string;
  templateId: string;
  sourceUrl: string;
  submodelId: string;
  submodelIdShort: string;
  submodelPlain: string;
}

interface StandardGeneratorUiRules {
  showSerialNumber: boolean;
  showManufacturingDate: boolean;
}

interface StandardGeneratorBootstrapResult {
  mode: string;
  v3ShellPlain: string;
  v3SubmodelsPlain: string[];
  v3ConceptDescriptionsPlain: string[];
  templateRoles: StandardGeneratorTemplateRole[];
  uiRules: StandardGeneratorUiRules;
}

interface GeneratorBootstrapOptions {
  shell?: aas.types.AssetAdministrationShell;
  submodels?: aas.types.Submodel[];
  conceptDescriptions?: aas.types.ConceptDescription[];
  templateRoles?: StandardGeneratorTemplateRole[];
  uiRules?: StandardGeneratorUiRules | null;
}

interface GeneratorImportedEnvironmentSnapshot {
  assetAdministrationShells?: unknown[];
  submodels?: unknown[];
  conceptDescriptions?: unknown[];
}

interface GeneratorImportedAssetMetadataSnapshot {
  kind?: 'Type' | 'Instance';
  assetId?: string;
  assetShellId?: string;
  assetShellIdentifier?: string;
  assetShellDescription?: MultiLanguagePropertyValue[];
  assetThumbnailFilename?: string;
  assetThumbnailFile?: File;
}

export interface GeneratorImportedStateSnapshot {
  environment: GeneratorImportedEnvironmentSnapshot | null;
  assetMetadata: GeneratorImportedAssetMetadataSnapshot | null;
  packageThumbnailFile: File | null;
  packageThumbnailFilename: string;
}

@Injectable({
  providedIn: 'root',
})
export class GeneratorService {
  vwsTyp: GeneratorMode | undefined;
  currentId: number | null = null;
  private currentImportedStateSnapshot: GeneratorImportedStateSnapshot | null = null;
  currentEditDocument: DocumentItem | null = null;
  currentEditDocumentIndex: number | null = null;
  standardGeneratorTemplateRoles: StandardGeneratorTemplateRole[] = [];
  standardGeneratorUiRules: StandardGeneratorUiRules | null = null;
  generatorFlowSteps: GeneratorFlowStep[] = [];
  batteryTechnicalDataEdited: boolean = false;
  dppAssistantValues: Record<string, DppAssistantFieldValue> = {};
  dppUploadedFilesByKey = new Map<string, DppUploadedFileEntry>();
  dppPcfEntries: DppPcfEntryCollection = {
    productCarbonFootprints: [],
    productOrSectorSpecificCarbonFootprints: [],
  };

  constructor(
    private http: HttpClient,
    private portalService: PortalService,
    private appConfigService: AppConfigService,
    private generatorStateStore: GeneratorStateStore = new GeneratorStateStore(),
    private generatorExportService: GeneratorExportService = new GeneratorExportService(http, appConfigService),
  ) {}

  get additionalV3Submodels() {
    return this.generatorStateStore.submodels();
  }

  set additionalV3Submodels(submodels: aas.types.Submodel[]) {
    this.generatorStateStore.setSubmodels(submodels);
  }

  get additionalV3ConceptDescriptions() {
    return this.generatorStateStore.conceptDescriptions();
  }

  set additionalV3ConceptDescriptions(conceptDescriptions: aas.types.ConceptDescription[]) {
    this.generatorStateStore.setConceptDescriptions(conceptDescriptions);
  }

  importGeneratorStateSnapshot(
    snapshot: {
      environment?: {
        assetAdministrationShells?: unknown[];
        submodels?: unknown[];
        conceptDescriptions?: unknown[];
      } | null;
      assetMetadata?: {
        kind?: 'Type' | 'Instance';
        assetId?: string;
        assetShellId?: string;
        assetShellIdentifier?: string;
        assetShellDescription?: MultiLanguagePropertyValue[];
        assetThumbnailFilename?: string;
        assetThumbnailFile?: File;
      } | null;
      packageThumbnailFile?: File | null;
      packageThumbnailFilename?: string | null;
    } | null,
  ) {
    this.currentImportedStateSnapshot =
      snapshot == null
        ? null
        : {
            environment: snapshot.environment ?? null,
            assetMetadata:
              snapshot.assetMetadata == null
                ? null
                : {
                    ...snapshot.assetMetadata,
                    assetShellDescription: [...(snapshot.assetMetadata.assetShellDescription ?? [])],
                    assetThumbnailFilename: `${snapshot.assetMetadata.assetThumbnailFilename ?? ''}`.trim(),
                  },
            packageThumbnailFile: snapshot.packageThumbnailFile ?? null,
            packageThumbnailFilename: `${snapshot.packageThumbnailFilename ?? ''}`.trim(),
          };
    this.hydrateImportedGeneratorState();
  }

  async getData(id: number) {
    const params = new HttpParams().append('id', id);
    const res = await lastValueFrom(
      this.http.get<any>(`${this.appConfigService.config.apiPath}/Aas/GetAas`, { params }),
    );

    return this.createImportedStateSnapshotFromDto(res.shell);
  }

  async getRawData(id: number) {
    const params = new HttpParams().append('id', id);

    const res = await lastValueFrom(
      this.http.get<ShellResult>(`${this.appConfigService.config.apiPath}/Aas/GetAas`, { params }),
    );
    return ShellResult.fromDto(res);
  }

  async getSupplementalFiles(id: number) {
    const files = await lastValueFrom(
      this.http.get<FileResult[]>(`${this.appConfigService.config.apiPath}/Aas/GetSupplementalFiles?id=${id}`, {}),
    );

    return files.map((d: FileResult) => FileResult.fromDto(d));
  }

  async getNewAas(typ: string, withDocumentation: boolean = false) {
    const params = new HttpParams().append('typ', typ).append('withDocumentation', withDocumentation);
    const res = await lastValueFrom(
      this.http.get<any>(`${this.appConfigService.config.apiPath}/SubmodelTemplate/GetEmptyAas`, { params }),
    );

    return this.createImportedStateSnapshotFromDto(res);
  }

  resetStandardGeneratorState() {
    this.standardGeneratorTemplateRoles = [];
    this.standardGeneratorUiRules = null;
    this.generatorFlowSteps = [];
  }

  resetGeneratorSessionState(mode?: GeneratorMode) {
    this.resetStandardGeneratorState();
    this.currentImportedStateSnapshot = null;
    this.generatorStateStore.reset();
    this.batteryTechnicalDataEdited = false;
    this.dppAssistantValues = {};
    this.dppUploadedFilesByKey.clear();
    this.dppPcfEntries = this.createEmptyDppPcfEntries();

    if (mode != null) {
      this.vwsTyp = mode;
    }
  }

  setAdditionalTemplateBundle(
    submodels: aas.types.Submodel[] = [],
    conceptDescriptions: aas.types.ConceptDescription[] = [],
  ) {
    this.additionalV3Submodels = submodels;
    this.additionalV3ConceptDescriptions = conceptDescriptions;
  }

  mergeAdditionalTemplateBundle(
    submodels: aas.types.Submodel[] = [],
    conceptDescriptions: aas.types.ConceptDescription[] = [],
  ) {
    this.additionalV3Submodels = this.mergeByStableId(this.additionalV3Submodels, submodels, (submodel) => [
      `${submodel?.id ?? ''}`,
      `${submodel?.idShort ?? ''}`,
    ]);
    this.additionalV3ConceptDescriptions = this.mergeByStableId(
      this.additionalV3ConceptDescriptions,
      conceptDescriptions,
      (conceptDescription) => [`${conceptDescription?.id ?? ''}`],
    );
  }

  applyCurrentAasDefaults(options: { assetKind?: 'Type' | 'Instance'; initializeCurrentYear?: boolean }) {
    if (options.initializeCurrentYear) {
      const currentYear = new Date().getFullYear().toString();
      this.setCurrentGeneratorNameplatePropertyValue('YearOfConstruction', currentYear);
    }

    if (options.assetKind != null) {
      this.generatorStateStore.updateAssetMetadata({ kind: options.assetKind }, this.portalService.iriPrefix);
    }
  }

  beginDocumentInsert(currentLanguage: string = 'en') {
    this.currentEditDocumentIndex = null;
    this.currentEditDocument = DocumentItem.createDraft(currentLanguage);
  }

  beginDocumentEdit(document: DocumentItem, documentIndex: number, currentLanguage: string = 'en') {
    this.currentEditDocumentIndex = documentIndex;
    this.currentEditDocument = DocumentItem.clone(document, currentLanguage);
  }

  applyCurrentDocumentEdit() {
    if (this.currentEditDocument == null) {
      return;
    }

    const nextDocumentItems = [...this.getCurrentGeneratorDocumentItems(this.portalService.currentLanguage)];

    if (
      this.currentEditDocumentIndex != null &&
      this.currentEditDocumentIndex >= 0 &&
      this.currentEditDocumentIndex < nextDocumentItems.length
    ) {
      nextDocumentItems[this.currentEditDocumentIndex] = this.currentEditDocument;
    } else {
      nextDocumentItems.push(this.currentEditDocument);
    }

    this.syncDocumentationSubmodelDocuments(nextDocumentItems);
    this.discardCurrentDocumentEdit();
  }

  addOrReplaceDocumentItem(documentItem: DocumentItem, index?: number) {
    this.storeDocumentAttachment(documentItem);
    const nextDocumentItems = [...this.getCurrentGeneratorDocumentItems(this.portalService.currentLanguage)];

    if (index == null || index < 0 || index >= nextDocumentItems.length) {
      nextDocumentItems.push(documentItem);
    } else {
      nextDocumentItems[index] = documentItem;
    }

    this.syncDocumentationSubmodelDocuments(nextDocumentItems);
  }

  removeDocumentItem(documentItem: DocumentItem) {
    const nextDocumentItems = this.getCurrentGeneratorDocumentItems(this.portalService.currentLanguage).filter(
      (candidate) => `${candidate.idShort ?? ''}` !== `${documentItem.idShort ?? ''}`,
    );

    this.syncDocumentationSubmodelDocuments(nextDocumentItems);
  }

  discardCurrentDocumentEdit() {
    this.currentEditDocument = null;
    this.currentEditDocumentIndex = null;
  }

  get showStandardGeneratorSerialNumber() {
    return this.standardGeneratorUiRules?.showSerialNumber ?? this.vwsTyp !== 'typ';
  }

  get showStandardGeneratorManufacturingDate() {
    return this.standardGeneratorUiRules?.showManufacturingDate ?? this.vwsTyp !== 'typ';
  }

  getCurrentGeneratorRootShell() {
    this.syncGeneratorStateStore();

    return this.generatorStateStore.shell() ?? null;
  }

  getCurrentGeneratorConceptDescriptions() {
    this.syncGeneratorStateStore();

    return this.generatorStateStore.conceptDescriptions();
  }

  findCurrentGeneratorConceptDescription(id: string | null | undefined, returnDefault: boolean = true) {
    const normalizedId = `${id ?? ''}`.trim();
    if (normalizedId === '') {
      return returnDefault ? new ConceptDescription() : undefined;
    }

    const conceptDescription = this.getCurrentGeneratorConceptDescriptions().find(
      (candidate) => `${candidate?.id ?? ''}`.trim() === normalizedId,
    );

    if (conceptDescription != null) {
      return ConceptDescription.fromDto(aas.jsonization.toJsonable(conceptDescription));
    }

    return returnDefault ? new ConceptDescription() : undefined;
  }

  getCurrentGeneratorNameplateSubmodel() {
    this.syncGeneratorStateStore();

    return (
      this.additionalV3Submodels.find(
        (submodel) =>
          `${submodel?.idShort ?? ''}`.includes('Nameplate') ||
          ['https://admin-shell.io/idta-02006-3-0', 'https://admin-shell.io/idta-02035-1'].includes(
            `${submodel?.administration?.templateId ?? ''}`,
          ),
      ) ?? null
    );
  }

  getCurrentGeneratorFile(reference: string | null | undefined) {
    return this.getStoredGeneratorFile(reference);
  }

  getCurrentGeneratorDocumentItems(currentLanguage: string = this.portalService.currentLanguage) {
    const documentRaw = this.getCurrentGeneratorDocumentationSubmodel();
    if (documentRaw == null) {
      return [];
    }

    return Document.fromDto(documentRaw, currentLanguage).documentItems.map((documentItem) => {
      documentItem.file = this.getStoredGeneratorFile(documentItem.filePath);
      return documentItem;
    });
  }

  getCurrentGeneratorDocumentationSemanticId() {
    return `${this.getCurrentGeneratorDocumentationSubmodel()?.semanticId?.keys?.[0]?.value ?? ''}`.trim();
  }

  getCurrentGeneratorNameplateSource(): GeneratorNameplateSource | null {
    const nameplateRaw = this.getCurrentGeneratorNameplateSubmodel();
    if (nameplateRaw == null) {
      return null;
    }

    const nameplateElements = nameplateRaw.submodelElements ?? [];
    const contactInformation = this.findCurrentGeneratorNameplateContactInformationCollection(nameplateElements);

    return {
      nameplate: {
        manufacturer: this.getCurrentGeneratorNameplateMultiLanguageValue(nameplateElements, ['ManufacturerName']),
        address: {
          street: this.getCurrentGeneratorNameplateMultiLanguageValue(contactInformation?.value, [
            'Street',
            'StreetName',
          ]),
          zip: this.getCurrentGeneratorNameplateMultiLanguageValue(contactInformation?.value, [
            'Zipcode',
            'ZipCode',
            'Zip',
          ]),
          cityTown: this.getCurrentGeneratorNameplateMultiLanguageValue(contactInformation?.value, [
            'CityTown',
            'City',
          ]),
          stateCounty: this.getCurrentGeneratorNameplateMultiLanguageValue(contactInformation?.value, [
            'StateCounty',
            'State',
          ]),
          countryCode: this.getCurrentGeneratorNameplateMultiLanguageValue(contactInformation?.value, [
            'NationalCode',
            'CountryCode',
            'Country',
          ]),
        },
        productDesignation: this.getCurrentGeneratorNameplateMultiLanguageValue(nameplateElements, [
          'ManufacturerProductDesignation',
        ]),
        productRoot: this.getCurrentGeneratorNameplateMultiLanguageValue(nameplateElements, [
          'ManufacturerProductRoot',
        ]),
        productFamily: this.getCurrentGeneratorNameplateMultiLanguageValue(nameplateElements, [
          'ManufacturerProductFamily',
        ]),
        serialNumber: this.getCurrentGeneratorNameplateStringValue(nameplateElements, ['SerialNumber']),
        yearOfConstruction: this.getCurrentGeneratorNameplateStringValue(nameplateElements, ['YearOfConstruction']),
        markings: this.getCurrentGeneratorNameplateMarkings(nameplateRaw),
      },
    };
  }

  rebuildGeneratorFlow() {
    this.generatorFlowSteps = buildGeneratorFlow({
      mode: this.vwsTyp,
      additionalSubmodels: this.additionalV3Submodels,
      usesBootstrappedStandardTemplates: this.standardGeneratorTemplateRoles.length > 0,
      formatLabel: (value) => this.formatGeneratorFlowLabel(value),
    });
  }

  navigateToNextGeneratorFlowStep(
    router: Router,
    currentStepId: string,
    fallbackCommands: Array<string | number> = ['generator', 'confirmation'],
  ) {
    const nextStep = this.getAdjacentGeneratorFlowStep(currentStepId, 1);
    return router.navigate(nextStep?.routeCommands ?? fallbackCommands);
  }

  navigateToPreviousGeneratorFlowStep(
    router: Router,
    currentStepId: string,
    fallbackCommands: Array<string | number> = ['generator', 'select-type'],
  ) {
    const previousStep = this.getAdjacentGeneratorFlowStep(currentStepId, -1);
    return router.navigate(previousStep?.routeCommands ?? fallbackCommands);
  }

  async bootstrapStandardGenerator(mode: 'typ' | 'instanz') {
    const params = new HttpParams().set('mode', mode).set('iriPrefix', this.portalService.iriPrefix);
    const result = await lastValueFrom(
      this.http.get<StandardGeneratorBootstrapResult>(
        `${this.appConfigService.config.apiPath}/SubmodelTemplate/GetStandardGeneratorBootstrap`,
        { params },
      ),
    );

    const shell = this.parseShell(result.v3ShellPlain);
    const submodels = result.v3SubmodelsPlain.map((submodelPlain) => this.parseSubmodel(submodelPlain));
    const conceptDescriptions = result.v3ConceptDescriptionsPlain.map((conceptDescriptionPlain) =>
      this.parseConceptDescription(conceptDescriptionPlain),
    );

    return this.bootstrapGenerator(mode, {
      shell,
      submodels,
      conceptDescriptions,
      templateRoles: result.templateRoles ?? [],
      uiRules: result.uiRules ?? null,
    });
  }

  async bootstrapTemplateGenerator(
    mode: 'typ' | 'instanz',
    submodels: aas.types.Submodel[] = [],
    conceptDescriptions: aas.types.ConceptDescription[] = [],
  ) {
    return this.bootstrapGenerator(mode, {
      submodels,
      conceptDescriptions,
    });
  }

  private async bootstrapGenerator(mode: 'typ' | 'instanz', options: GeneratorBootstrapOptions) {
    const shell = options.shell ?? this.createGeneratorShell(mode);
    const submodels = options.submodels ?? [];
    const conceptDescriptions = options.conceptDescriptions ?? [];

    this.clearInitialNameplateMarkings(submodels);

    await this.ensureNameplateContactInformationLoaded(this.findStandardNameplateSubmodel(submodels));

    this.standardGeneratorTemplateRoles = options.templateRoles ?? [];
    this.standardGeneratorUiRules = options.uiRules ?? null;
    const snapshot = this.createImportedStateSnapshotFromEnvironment(shell, submodels, conceptDescriptions);

    this.importGeneratorStateSnapshot(snapshot);

    return snapshot;
  }

  async ensureNameplateContactInformationLoaded(nameplateSubmodel?: aas.types.Submodel | null) {
    if (nameplateSubmodel == null) {
      return;
    }

    if (!this.isStandardNameplateSubmodel(nameplateSubmodel)) {
      return;
    }

    const addressInformation = this.findCollectionBySemanticId(
      nameplateSubmodel.submodelElements ?? [],
      ADDRESS_INFORMATION_SEMANTIC_ID,
    );
    const hasNestedContactInformation = (addressInformation?.value ?? []).some((element: aas.types.ISubmodelElement) =>
      SemanticIdHelper.hasSemanticId(element, CONTACT_INFORMATION_SEMANTIC_ID),
    );
    const hasTopLevelContactInformation = (nameplateSubmodel.submodelElements ?? []).some(
      (element: aas.types.ISubmodelElement) => SemanticIdHelper.hasSemanticId(element, CONTACT_INFORMATION_SEMANTIC_ID),
    );

    if (hasNestedContactInformation || hasTopLevelContactInformation) {
      return;
    }

    const contactInformationTemplate = await this.loadNameplateContactInformationTemplate();
    if (contactInformationTemplate == null) {
      return;
    }

    this.mergeContactInformationIntoNameplate(nameplateSubmodel, contactInformationTemplate);
  }

  private findStandardNameplateSubmodel(submodels: aas.types.Submodel[]): aas.types.Submodel | undefined {
    return submodels.find((submodel) => this.isStandardNameplateSubmodel(submodel));
  }

  private isStandardNameplateSubmodel(submodel: aas.types.Submodel | null | undefined): boolean {
    if (submodel == null) {
      return false;
    }

    if (`${submodel.administration?.templateId ?? ''}` === STANDARD_NAMEPLATE_TEMPLATE_ID) {
      return true;
    }

    if (SemanticIdHelper.hasSemanticId(submodel, STANDARD_NAMEPLATE_SEMANTIC_ID)) {
      return true;
    }

    return this.findCollectionBySemanticId(submodel.submodelElements ?? [], ADDRESS_INFORMATION_SEMANTIC_ID) != null;
  }

  private async loadNameplateContactInformationTemplate() {
    try {
      const params = new HttpParams().append('url', CONTACT_INFORMATION_TEMPLATE_URL);

      const dto = await lastValueFrom(
        this.http.get<SubmodelResult>(
          `${this.appConfigService.config.apiPath}/SubmodelTemplate/GetRepoSubmodelTemplate`,
          {
            params,
          },
        ),
      );

      const templateResult = SubmodelResult.fromDto(dto);
      const contactInformationCollection = templateResult.v3Submodels
        ?.flatMap((submodel) => submodel.submodelElements ?? [])
        .find(
          (element): element is aas.types.SubmodelElementCollection =>
            element instanceof aas.types.SubmodelElementCollection &&
            SemanticIdHelper.hasSemanticId(element, CONTACT_INFORMATION_SEMANTIC_ID),
        );

      if (contactInformationCollection == null) {
        return null;
      }

      return contactInformationCollection;
    } catch {
      return null;
    }
  }

  private mergeContactInformationIntoNameplate(
    nameplateSubmodel: aas.types.Submodel,
    contactInformationTemplate: aas.types.SubmodelElementCollection,
  ) {
    const addressInformation = this.findCollectionBySemanticId(
      nameplateSubmodel.submodelElements ?? [],
      ADDRESS_INFORMATION_SEMANTIC_ID,
    );

    if (addressInformation == null) {
      nameplateSubmodel.submodelElements = [...(nameplateSubmodel.submodelElements ?? []), contactInformationTemplate];
      return;
    }

    this.resetSubmodelElementValues(addressInformation);

    addressInformation.value = [
      ...(addressInformation.value ?? []).filter(
        (element: aas.types.ISubmodelElement) =>
          !NAMEPLATE_ADDRESS_FIELD_ID_SHORTS.has(`${element.idShort ?? ''}`) &&
          !SemanticIdHelper.hasSemanticId(element, CONTACT_INFORMATION_SEMANTIC_ID),
      ),
      contactInformationTemplate,
    ];
  }

  private findCollectionBySemanticId(
    elements: aas.types.ISubmodelElement[],
    semanticId: string,
  ): aas.types.SubmodelElementCollection | null {
    for (const element of elements) {
      if (
        element instanceof aas.types.SubmodelElementCollection &&
        SemanticIdHelper.hasSemanticId(element, semanticId)
      ) {
        return element;
      }

      const nestedCollection: aas.types.SubmodelElementCollection | null = this.findCollectionBySemanticId(
        this.getChildElements(element),
        semanticId,
      );
      if (nestedCollection != null) {
        return nestedCollection;
      }
    }

    return null;
  }

  private getChildElements(element: aas.types.ISubmodelElement): aas.types.ISubmodelElement[] {
    if (element instanceof aas.types.SubmodelElementCollection) {
      return element.value ?? [];
    }

    if (element instanceof aas.types.SubmodelElementList) {
      return element.value ?? [];
    }

    return [];
  }

  private resetSubmodelElementValues(element: aas.types.ISubmodelElement): void {
    if (element instanceof aas.types.SubmodelElementCollection) {
      for (const childElement of element.value ?? []) {
        this.resetSubmodelElementValues(childElement);
      }
      return;
    }

    if (element instanceof aas.types.SubmodelElementList) {
      for (const childElement of element.value ?? []) {
        this.resetSubmodelElementValues(childElement);
      }
      return;
    }

    if (element instanceof aas.types.MultiLanguageProperty) {
      element.value = [];
      return;
    }

    if (element instanceof aas.types.Property) {
      element.value = null;
      return;
    }

    if (element instanceof aas.types.Range) {
      element.min = null;
      element.max = null;
      return;
    }

    if (element instanceof aas.types.File) {
      element.value = null;
      return;
    }

    if (element instanceof aas.types.Blob) {
      element.value = null;
      return;
    }

    if (element instanceof aas.types.ReferenceElement) {
      element.value = null;
    }
  }

  async createNewV3Aas(typ: string) {
    const params = new HttpParams().set('typ', typ);
    return lastValueFrom(this.http.get<number>(`${this.appConfigService.config.apiPath}/Aas/CreateNewV3`, { params }));
  }

  async getDataFromFile(file: File, fileName: string) {
    const formData = new FormData();
    formData.append('file', file, fileName);
    const headers = new HttpHeaders().append('ignoreContentType', 'true');

    const res = await lastValueFrom(
      this.http.post<any>(`${this.appConfigService.config.apiPath}/Aas/GetEnvironment`, formData, { headers: headers }),
    );

    return this.createImportedStateSnapshotFromDto(res);
  }

  async getAdressen() {
    const dtos = await lastValueFrom(
      this.http.get<HerstellerAdresse[]>(`${this.appConfigService.config.apiPath}/Adresse/GetAdressen`, {}),
    );

    return dtos.map((d: any) => HerstellerAdresse.fromDto(d));
  }

  private createExportStateV3() {
    this.syncGeneratorStateStore();
    const rootSnapshot = this.generatorStateStore.createRootSnapshot();

    return createGeneratorExportState({
      baseEnvironment: rootSnapshot.environment,
      baseShell: rootSnapshot.shell,
      mode: this.vwsTyp,
      iriPrefix: this.portalService.iriPrefix,
      standardGeneratorTemplateRoles: this.standardGeneratorTemplateRoles,
      additionalSubmodels: this.generatorStateStore.submodels(),
    });
  }

  private syncGeneratorStateStore() {
    if (this.generatorStateStore.shell() == null) {
      this.hydrateImportedGeneratorState();
    }
  }

  private async populateExportStateV3(exportState: GeneratorExportState) {
    exportState.documentItems = this.getCurrentGeneratorDocumentItems(this.portalService.currentLanguage);
    exportState.nameplateSource = this.getCurrentGeneratorNameplateSource();
    exportState.assetKind =
      this.getCurrentGeneratorRootShell()?.assetInformation.assetKind === aas.types.AssetKind.Instance
        ? 'Instance'
        : 'Type';
    exportState.generatorFiles = await this.getCurrentGeneratorExportFiles(
      exportState.nameplateSource,
      exportState.documentItems,
    );

    return this.generatorExportService.populateExportState(
      exportState,
      {
        applyDppFileReferences: () => this.applyDppFileReferences(),
        appendTemplateBackedCoreExportSubmodels: (state) => this.appendTemplateBackedCoreExportSubmodels(state),
        appendStandardAssistantCoreExportSubmodels: (state) => this.appendStandardAssistantCoreExportSubmodels(state),
        appendBatteryPassportExportSubmodels: (state) => this.appendBatteryPassportExportSubmodels(state),
        appendDppCoreExportSubmodels: (state) => this.appendDppCoreExportSubmodels(state),
        shouldIncludeAdditionalSubmodel: (state, submodel) =>
          this.shouldIncludeAdditionalGeneratorSubmodel(state, submodel),
        appendExportSubmodel,
        appendGeneratorFilesToExport: (state) => this.appendGeneratorFilesToExport(state),
      },
      this.additionalV3ConceptDescriptions,
    );
  }

  async getExportStateV3() {
    const exportState = this.createExportStateV3();

    return this.populateExportStateV3(exportState);
  }

  async getVerifiableEnvironmentV3() {
    const exportState = await this.getExportStateV3();

    return this.generatorExportService.getVerifiableEnvironment(exportState);
  }

  async applyCurrentExportFixes() {
    const exportState = this.createExportStateV3();
    await this.populateExportStateV3(exportState);

    const shell = exportState.env.assetAdministrationShells?.[0];
    if (shell == null) {
      throw new Error('Generator export state has no shell root after applying template fixes');
    }

    this.generatorStateStore.initialize(
      shell,
      exportState.env.submodels ?? [],
      exportState.env.conceptDescriptions ?? [],
    );

    return exportState.env;
  }

  async getFormDataV3() {
    const exportState = await this.getExportStateV3();

    return exportState.formData;
  }

  async saveShell() {
    const formData = await this.getFormDataV3();

    return lastValueFrom(
      this.http.post<SaveShellResult>(
        `${this.appConfigService.config.aasApiPath}/Shells/CreateFromAssistant`,
        formData,
      ),
    );
  }

  getSaveShellErrorMessage(error: unknown) {
    if (error instanceof ApiException) {
      const message = `${error.message ?? ''}`.trim();
      if (message !== '') {
        return message;
      }
    }

    if (typeof error === 'object' && error != null) {
      const httpError = error as {
        error?:
          | {
              Message?: string;
              error?: string;
              message?: string;
            }
          | string;
        message?: string;
      };

      const serviceMessage =
        typeof httpError.error === 'object' && httpError.error != null
          ? `${httpError.error.Message ?? httpError.error.error ?? httpError.error.message ?? ''}`.trim()
          : `${httpError.error ?? ''}`.trim();

      if (serviceMessage !== '') {
        return serviceMessage;
      }

      const fallbackMessage = `${httpError.message ?? ''}`.trim();
      if (fallbackMessage !== '') {
        return fallbackMessage;
      }
    }

    return 'COMMON_ERROR';
  }

  isStandardGeneratorCoreSubmodel(submodel: aas.types.Submodel | null | undefined) {
    if (submodel == null) {
      return false;
    }

    return this.standardGeneratorTemplateRoles.some(
      (role) => role.submodelId === submodel.id || role.templateId === `${submodel.administration?.templateId ?? ''}`,
    );
  }

  buildDppFileKey(submodel: aas.types.Submodel | null | undefined, path: string[] | string, index?: number) {
    const submodelKey = `${submodel?.id ?? submodel?.idShort ?? 'dbp-submodel'}`.trim() || 'dbp-submodel';
    const normalizedPath = (Array.isArray(path) ? path : [path]).filter((segment) => segment != null && segment !== '');
    const pathKey = normalizedPath.join('>');

    if (index == null) {
      return `${submodelKey}::${pathKey}`;
    }

    return `${submodelKey}::${pathKey}::${index}`;
  }

  setDppUploadedFile(key: string, file: File) {
    const sanitizedFilename = FilenameHelper.sanitizeFilename(file.name);
    const embeddedFilename = this.buildDppEmbeddedFilename(key, sanitizedFilename);
    const embeddedPath = `/aasx/files/${embeddedFilename}`;

    this.dppUploadedFilesByKey.set(key, {
      key,
      file,
      filename: sanitizedFilename,
      contentType: file.type || 'application/octet-stream',
      embeddedPath,
    });

    this.generatorStateStore.setFileAttachment(key, file);
  }

  getDppUploadedFile(key: string) {
    return this.dppUploadedFilesByKey.get(key) ?? null;
  }

  removeDppUploadedFile(key: string) {
    this.dppUploadedFilesByKey.delete(key);
    this.generatorStateStore.setFileAttachment(key, null);
  }

  syncEditedGeneratorSubmodel(submodel: aas.types.Submodel | null | undefined) {
    if (submodel == null) {
      return;
    }

    const nextSubmodels = [...this.additionalV3Submodels];
    const existingIndex = nextSubmodels.findIndex(
      (candidate) => candidate.id === submodel.id || `${candidate.idShort ?? ''}` === `${submodel.idShort ?? ''}`,
    );

    if (existingIndex === -1) {
      nextSubmodels.push(submodel);
    } else {
      nextSubmodels[existingIndex] = submodel;
    }

    this.additionalV3Submodels = nextSubmodels;
  }

  syncGeneratorDocumentationWorkState() {
    this.syncDocumentationSubmodelDocuments(this.getCurrentGeneratorDocumentItems(this.portalService.currentLanguage));
  }

  syncDocumentationSubmodelDocuments(documentItems: DocumentItem[], targetSubmodel?: aas.types.Submodel | null) {
    let documentationSubmodel =
      targetSubmodel ??
      this.getCurrentGeneratorDocumentationSubmodel() ??
      this.getStandardGeneratorTemplateSubmodel('handover-documentation');

    if (documentationSubmodel == null) {
      documentationSubmodel = buildDocumentationExportSubmodel(null, {
        iriPrefix: this.portalService.iriPrefix,
        currentLanguage: this.portalService.currentLanguage,
        documentItems,
        requiredSemanticIds: [],
      });
    } else {
      syncDocumentationDocuments(documentationSubmodel, {
        currentLanguage: this.portalService.currentLanguage,
        documentItems,
        requiredSemanticIds: [],
      });
    }

    this.syncEditedGeneratorSubmodel(documentationSubmodel);

    return documentationSubmodel;
  }

  getCurrentGeneratorAssetThumbnailFile() {
    return this.generatorStateStore.getFileAttachment('assetThumbnail');
  }

  getCurrentGeneratorPackageThumbnailFile() {
    return this.generatorStateStore.packageThumbnail().file;
  }

  getCurrentGeneratorPackageThumbnailFilename() {
    return this.generatorStateStore.packageThumbnail().filename;
  }

  appendDppFilesToFormData(formData: FormData) {
    this.dppUploadedFilesByKey.forEach((entry) => {
      formData.append(`addedfiles_${entry.embeddedPath}`, entry.file, entry.filename);
    });
  }

  applyDppFileReferences() {
    this.forEachDppFileElement((submodel, element, keyPath) => {
      const entry = this.getDppUploadedFile(this.buildDppFileKey(submodel, keyPath));
      if (entry == null) {
        return;
      }

      element.value = `file:${entry.embeddedPath}`;
      element.contentType = entry.contentType;
    });
  }

  private getStandardGeneratorTemplateSubmodel(role: string) {
    const templateRole = this.standardGeneratorTemplateRoles.find((candidate) => candidate.role === role);

    if (templateRole == null) {
      return null;
    }

    return (
      this.additionalV3Submodels.find(
        (submodel) =>
          submodel.id === templateRole.submodelId ||
          `${submodel.administration?.templateId ?? ''}` === templateRole.templateId,
      ) ?? this.parseSubmodel(templateRole.submodelPlain)
    );
  }

  private createEmptyDppPcfEntries(): DppPcfEntryCollection {
    return {
      productCarbonFootprints: [],
      productOrSectorSpecificCarbonFootprints: [],
    };
  }

  private appendTemplateBackedCoreExportSubmodels(exportState: GeneratorExportState) {
    exportState.shell.submodels = [];
    const nameplateTemplate = this.getStandardGeneratorTemplateSubmodel('digital-nameplate');
    if (nameplateTemplate != null) {
      appendExportSubmodel(
        exportState,
        buildTemplateBackedNameplateSubmodel({
          nameplateTemplate,
          currentNameplate: this.getCurrentGeneratorNameplateSubmodel() ?? undefined,
          source: exportState.nameplateSource,
          iriPrefix: this.portalService.iriPrefix,
          requiredSemanticIds: exportState.requiredSemanticIds,
        }),
      );
    }

    const handoverTemplate = this.getStandardGeneratorTemplateSubmodel('handover-documentation');
    if (handoverTemplate != null) {
      const documentation = buildDocumentationExportSubmodel(handoverTemplate, {
        iriPrefix: this.portalService.iriPrefix,
        currentLanguage: this.portalService.currentLanguage,
        documentItems: exportState.documentItems,
        requiredSemanticIds: exportState.requiredSemanticIds,
      });
      appendExportSubmodel(exportState, documentation);
    }
  }

  private appendStandardAssistantCoreExportSubmodels(exportState: GeneratorExportState) {
    const nameplate = createStandardAssistantNameplateSubmodel(
      exportState.nameplateSource,
      this.portalService.iriPrefix,
      exportState.requiredSemanticIds,
    );
    appendExportSubmodel(exportState, nameplate);

    const documentation = buildDocumentationExportSubmodel(null, {
      iriPrefix: this.portalService.iriPrefix,
      currentLanguage: this.portalService.currentLanguage,
      documentItems: exportState.documentItems,
      requiredSemanticIds: exportState.requiredSemanticIds,
    });
    appendExportSubmodel(exportState, documentation);
  }

  private appendBatteryPassportExportSubmodels(exportState: GeneratorExportState) {
    if (!exportState.isBatteryPassport) {
      return;
    }

    this.applyBatteryPassportValues(exportState);
    if (this.hasDppPcfValues()) {
      this.applyDppValues(exportState.requiredSemanticIds);
    }
  }

  private appendDppCoreExportSubmodels(exportState: GeneratorExportState) {
    if (!exportState.isDppCore) {
      return;
    }

    if (!exportState.usesTemplateBackedCoreSubmodels) {
      const dppNameplate = createDppDigitalNameplateSubmodel(
        exportState.nameplateSource,
        this.portalService.iriPrefix,
        exportState.requiredSemanticIds,
      );
      appendExportSubmodel(exportState, dppNameplate);

      const documentation = buildDocumentationExportSubmodel(null, {
        iriPrefix: this.portalService.iriPrefix,
        currentLanguage: this.portalService.currentLanguage,
        documentItems: exportState.documentItems,
        requiredSemanticIds: exportState.requiredSemanticIds,
      });
      appendExportSubmodel(exportState, documentation);
    }

    this.applyDppValues(exportState.requiredSemanticIds);

    createDppMetaSubmodels({
      assetGlobalId: exportState.assetGlobalId,
      dppId: exportState.dppId,
      iriPrefix: this.portalService.iriPrefix,
      assetKind: exportState.assetKind,
      includeCarbonFootprintSpecification: this.hasDppPcfValues(),
      requiredSemanticIds: exportState.requiredSemanticIds,
    }).forEach((submodel) => {
      appendExportSubmodel(exportState, submodel);
    });
  }

  private shouldIncludeAdditionalGeneratorSubmodel(exportState: GeneratorExportState, submodel: aas.types.Submodel) {
    return (
      !(exportState.usesTemplateBackedCoreSubmodels && this.isStandardGeneratorCoreSubmodel(submodel)) &&
      (!(exportState.isDppCore || exportState.isBatteryPassport) ||
        !this.isDppPcfTemplateSubmodel(submodel) ||
        this.hasDppPcfValues())
    );
  }

  private appendGeneratorFilesToExport(exportState: GeneratorExportState) {
    appendGeneratorFilesToFormData(exportState.formData, exportState.generatorFiles, {
      isBatteryPassport: exportState.isBatteryPassport,
      appendAdditionalFiles: (formData) => this.appendDppFilesToFormData(formData),
    });
  }

  private mergeByStableId<T>(existingValues: T[], nextValues: T[], getKeys: (value: T) => string[]) {
    const byId = new Map<string, T>();

    [...existingValues, ...nextValues].forEach((value) => {
      const key = getKeys(value).find((candidate) => candidate.trim() !== '');
      if (key != null) {
        byId.set(key, value);
      }
    });

    return [...byId.values()];
  }

  private getAdjacentGeneratorFlowStep(currentStepId: string, offset: -1 | 1) {
    const currentStepIndex = this.generatorFlowSteps.findIndex((step) => step.id === currentStepId);
    if (currentStepIndex === -1) {
      return null;
    }

    return this.generatorFlowSteps[currentStepIndex + offset] ?? null;
  }

  private formatGeneratorFlowLabel(value: string) {
    return value
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .replace(/[_-]+/g, ' ')
      .trim();
  }

  private parseShell(shellPlain: string) {
    const instanceOrError = aas.jsonization.assetAdministrationShellFromJsonable(JSON.parse(shellPlain));

    if (instanceOrError.value == null) {
      throw new Error('Failed to deserialize standard generator shell bootstrap payload');
    }

    return instanceOrError.value;
  }

  private parseSubmodel(submodelPlain: string) {
    const instanceOrError = aas.jsonization.submodelFromJsonable(JSON.parse(submodelPlain));

    if (instanceOrError.value == null) {
      throw new Error('Failed to deserialize standard generator submodel bootstrap payload');
    }

    return instanceOrError.value;
  }

  private parseConceptDescription(conceptDescriptionPlain: string) {
    const instanceOrError = aas.jsonization.conceptDescriptionFromJsonable(JSON.parse(conceptDescriptionPlain));

    if (instanceOrError.value == null) {
      throw new Error('Failed to deserialize standard generator concept description bootstrap payload');
    }

    return instanceOrError.value;
  }

  private hydrateImportedGeneratorState() {
    if (this.currentImportedStateSnapshot == null) {
      return;
    }

    const shell = this.normalizeShell(this.currentImportedStateSnapshot.environment?.assetAdministrationShells?.[0]);
    const submodels = this.normalizeSubmodels(this.currentImportedStateSnapshot.environment?.submodels);
    const conceptDescriptions = this.normalizeConceptDescriptions(
      this.currentImportedStateSnapshot.environment?.conceptDescriptions,
    );

    this.clearInitialNameplateMarkings(submodels);

    if (shell != null) {
      this.generatorStateStore.initialize(shell, submodels, conceptDescriptions);
    }

    this.generatorStateStore.updateAssetMetadata(
      this.currentImportedStateSnapshot.assetMetadata,
      this.portalService.iriPrefix,
    );
    this.generatorStateStore.setFileAttachment(
      'assetThumbnail',
      this.currentImportedStateSnapshot.assetMetadata?.assetThumbnailFile ?? null,
    );
    this.generatorStateStore.setPackageThumbnail(
      this.currentImportedStateSnapshot.packageThumbnailFile,
      this.currentImportedStateSnapshot.packageThumbnailFilename,
    );
  }

  private createImportedStateSnapshotFromDto(dto: any): GeneratorImportedStateSnapshot | null {
    if (dto == null) {
      return null;
    }

    const rawShell = dto?.assetAdministrationShells?.[0];
    const assetThumbnailFilename = `${rawShell?.assetInformation?.defaultThumbnail?.path ?? ''}`
      .replace(/^file:/, '')
      .split('/')
      .filter((segment) => segment !== '')
      .at(-1);

    return {
      environment: dto,
      assetMetadata:
        rawShell != null
          ? {
              kind:
                rawShell.assetInformation?.assetKind === aas.types.AssetKind.Instance ||
                `${rawShell.assetInformation?.assetKind ?? ''}` === 'Instance'
                  ? 'Instance'
                  : 'Type',
              assetId: `${rawShell.assetInformation?.globalAssetId ?? ''}`,
              assetShellId: `${rawShell.idShort ?? ''}`,
              assetShellIdentifier: `${rawShell.id ?? ''}`,
              assetShellDescription: rawShell.description ?? [],
              assetThumbnailFilename,
            }
          : null,
      packageThumbnailFile: null,
      packageThumbnailFilename: '',
    };
  }

  private createImportedStateSnapshotFromEnvironment(
    shell: aas.types.AssetAdministrationShell,
    submodels: aas.types.Submodel[] = [],
    conceptDescriptions: aas.types.ConceptDescription[] = [],
  ): GeneratorImportedStateSnapshot {
    const assetThumbnailFilename = `${shell.assetInformation?.defaultThumbnail?.path ?? ''}`
      .replace(/^file:/, '')
      .split('/')
      .filter((segment) => segment !== '')
      .at(-1);

    return {
      environment: {
        assetAdministrationShells: [aas.jsonization.toJsonable(shell)],
        submodels: submodels.map((submodel) => aas.jsonization.toJsonable(submodel)),
        conceptDescriptions: conceptDescriptions.map((conceptDescription) =>
          JSON.parse(JSON.stringify(aas.jsonization.toJsonable(conceptDescription))),
        ),
      },
      assetMetadata: {
        kind: shell.assetInformation?.assetKind === aas.types.AssetKind.Instance ? 'Instance' : 'Type',
        assetId: `${shell.assetInformation?.globalAssetId ?? ''}`,
        assetShellId: `${shell.idShort ?? ''}`,
        assetShellIdentifier: `${shell.id ?? ''}`,
        assetShellDescription: shell.description ?? [],
        assetThumbnailFilename,
      },
      packageThumbnailFile: null,
      packageThumbnailFilename: '',
    };
  }

  private normalizeShell(rawShell: unknown) {
    if (rawShell == null) {
      return null;
    }

    if (rawShell instanceof aas.types.AssetAdministrationShell) {
      return rawShell;
    }

    return this.parseShell(JSON.stringify(rawShell));
  }

  private normalizeSubmodels(rawSubmodels: unknown) {
    if (!Array.isArray(rawSubmodels)) {
      return [];
    }

    return rawSubmodels.map((submodel) => this.parseSubmodel(JSON.stringify(submodel)));
  }

  private normalizeConceptDescriptions(rawConceptDescriptions: unknown) {
    if (!Array.isArray(rawConceptDescriptions)) {
      return [];
    }

    return rawConceptDescriptions.map((conceptDescription) =>
      this.parseConceptDescription(JSON.stringify(conceptDescription)),
    );
  }

  private clearInitialNameplateMarkings(submodels: aas.types.Submodel[]) {
    submodels.forEach((submodel) => this.clearInitialNameplateMarkingsFromSubmodel(submodel));
  }

  private clearInitialNameplateMarkingsFromSubmodel(submodel: aas.types.Submodel | null | undefined) {
    if (!this.isGeneratorNameplateSubmodel(submodel)) {
      return;
    }

    const markingsElement = (submodel?.submodelElements ?? []).find(
      (element): element is aas.types.SubmodelElementCollection | aas.types.SubmodelElementList =>
        this.isCurrentGeneratorNameplateMarkingsElement(element) &&
        (element instanceof aas.types.SubmodelElementCollection || element instanceof aas.types.SubmodelElementList),
    );

    if (markingsElement != null) {
      markingsElement.value = null;
    }
  }

  private isGeneratorNameplateSubmodel(submodel: aas.types.Submodel | null | undefined) {
    return (
      submodel != null &&
      (`${submodel?.idShort ?? ''}`.includes('Nameplate') ||
        [`${submodel?.administration?.templateId ?? ''}`].includes('https://admin-shell.io/idta-02035-1') ||
        this.isStandardNameplateSubmodel(submodel))
    );
  }

  private setCurrentGeneratorNameplatePropertyValue(idShort: string, value: string) {
    const nameplateSubmodel = this.getCurrentGeneratorNameplateSubmodel();
    const property = (nameplateSubmodel?.submodelElements ?? []).find(
      (element) => `${element?.idShort ?? ''}` === idShort,
    ) as aas.types.Property | { value?: string | null } | undefined;

    if (property != null) {
      property.value = value;
    }
  }

  private createGeneratorShell(mode: 'typ' | 'instanz') {
    const shellId = IdGenerationUtil.generateIri('aas', this.portalService.iriPrefix);
    const assetInformation = new aas.types.AssetInformation(
      mode === 'typ' ? aas.types.AssetKind.Type : aas.types.AssetKind.Instance,
    );

    assetInformation.globalAssetId = '';

    const shell = new aas.types.AssetAdministrationShell(shellId, assetInformation);
    shell.idShort = '';
    shell.description = [];
    shell.submodels = [];

    return shell;
  }

  private applyBatteryPassportValues(exportState: GeneratorExportState) {
    const digitalNameplate = this.findBatteryPassportSubmodel('digital-nameplate');

    const technicalData = this.findBatteryPassportSubmodel('technical-data');
    if (technicalData != null && !this.batteryTechnicalDataEdited) {
      prefillBatteryPassportTechnicalData(digitalNameplate, technicalData, {
        manufacturer: exportState.nameplateSource?.nameplate?.manufacturer,
        productDesignation: exportState.nameplateSource?.nameplate?.productDesignation,
      });
    }
  }

  private getCurrentGeneratorDocumentationSubmodel() {
    return (
      this.additionalV3Submodels.find(
        (submodel) =>
          `${submodel?.idShort ?? ''}` === 'Documentation' ||
          `${submodel?.idShort ?? ''}` === 'HandoverDocumentation' ||
          ['https://admin-shell.io/idta-02004-2-0', 'https://admin-shell.io/idta-02035-2'].includes(
            `${submodel?.administration?.templateId ?? ''}`,
          ),
      ) ?? null
    );
  }

  private normalizeGeneratorFileReference(reference: string | null | undefined) {
    const normalizedReference = `${reference ?? ''}`.replace(/^file:/, '').trim();
    if (normalizedReference === '') {
      return '';
    }

    if (normalizedReference.startsWith('/aasx/files/')) {
      return normalizedReference;
    }

    const filename =
      normalizedReference
        .split('/')
        .filter((segment) => segment !== '')
        .at(-1) ?? normalizedReference;

    return `/aasx/files/${FilenameHelper.sanitizeFilename(filename)}`;
  }

  private getStoredGeneratorFile(reference: string | null | undefined) {
    const normalizedReference = this.normalizeGeneratorFileReference(reference);
    if (normalizedReference === '') {
      return null;
    }

    return this.generatorStateStore.getFileAttachment(normalizedReference);
  }

  private storeDocumentAttachment(documentItem: DocumentItem) {
    if (documentItem.file == null) {
      return;
    }

    const normalizedReference = this.normalizeGeneratorFileReference(documentItem.filePath || documentItem.file.name);
    if (normalizedReference === '') {
      return;
    }

    this.generatorStateStore.setFileAttachment(normalizedReference, documentItem.file);
  }

  private getCurrentGeneratorNameplateMultiLanguageValue(
    elements: aas.types.ISubmodelElement[] | null | undefined,
    aliases: string[],
  ) {
    const element = this.findCurrentGeneratorNameplateElementByAliases(elements, aliases);
    return Array.isArray((element as { value?: unknown } | undefined)?.value)
      ? (((element as unknown as { value?: MultiLanguagePropertyValue[] }).value ?? undefined) as
          | MultiLanguagePropertyValue[]
          | undefined)
      : undefined;
  }

  private getCurrentGeneratorNameplateStringValue(
    elements: aas.types.ISubmodelElement[] | null | undefined,
    aliases: string[],
  ) {
    const element = this.findCurrentGeneratorNameplateElementByAliases(elements, aliases) as
      | { value?: unknown }
      | undefined;
    return typeof element?.value === 'string' ? element.value : undefined;
  }

  private findCurrentGeneratorNameplateElementByAliases(
    elements: aas.types.ISubmodelElement[] | null | undefined,
    aliases: string[],
  ) {
    return elements?.find((element) => aliases.includes(`${element?.idShort ?? ''}`));
  }

  private findCurrentGeneratorNameplateContactInformationCollection(
    elements: aas.types.ISubmodelElement[] | null | undefined,
  ): aas.types.SubmodelElementCollection | undefined {
    for (const element of elements ?? []) {
      if (
        `${element?.idShort ?? ''}` === 'ContactInformation' &&
        element instanceof aas.types.SubmodelElementCollection
      ) {
        return element;
      }

      const children = (element as aas.types.SubmodelElementCollection | aas.types.SubmodelElementList | undefined)
        ?.value;
      if (!Array.isArray(children)) {
        continue;
      }

      const nestedMatch = this.findCurrentGeneratorNameplateContactInformationCollection(children);
      if (nestedMatch != null) {
        return nestedMatch;
      }
    }

    return undefined;
  }

  private getCurrentGeneratorNameplateMarkings(nameplateRaw: aas.types.Submodel): GeneratorNameplateMarkingSource[] {
    const markingsElement = (nameplateRaw.submodelElements ?? []).find((element) =>
      this.isCurrentGeneratorNameplateMarkingsElement(element),
    );
    const markingsValue = (
      markingsElement as aas.types.SubmodelElementCollection | aas.types.SubmodelElementList | null
    )?.value;

    if (!Array.isArray(markingsValue)) {
      return [];
    }

    return markingsValue
      .filter(
        (element): element is aas.types.SubmodelElementCollection =>
          element instanceof aas.types.SubmodelElementCollection,
      )
      .map((marking) => this.mapCurrentGeneratorNameplateMarking(marking))
      .filter((marking) => `${marking.name ?? ''}`.trim() !== '' && `${marking.filename ?? ''}`.trim() !== '');
  }

  private mapCurrentGeneratorNameplateMarking(
    marking: aas.types.SubmodelElementCollection,
  ): GeneratorNameplateMarkingSource {
    const markingFile = this.getCurrentGeneratorNameplateMarkingFile(marking);
    const markingName = this.findCurrentGeneratorNameplateElementByAliases(marking.value, ['MarkingName']) as
      | { value?: unknown }
      | undefined;
    const markingAdditionalText = this.findCurrentGeneratorNameplateElementByAliases(marking.value, [
      'MarkingAdditionalText',
    ]) as { value?: unknown } | undefined;
    const filename = `${markingFile?.value ?? ''}`.trim();

    return {
      name: typeof markingName?.value === 'string' ? markingName.value : undefined,
      filename: filename === '' ? undefined : filename,
      additionalText: typeof markingAdditionalText?.value === 'string' ? markingAdditionalText.value : undefined,
      file: this.getStoredGeneratorFile(filename) ?? undefined,
    };
  }

  private getCurrentGeneratorNameplateMarkingFile(marking: aas.types.SubmodelElementCollection) {
    return (marking.value ?? []).find(
      (element): element is aas.types.File =>
        element instanceof aas.types.File &&
        (`${element.idShort ?? ''}` === 'MarkingFile' ||
          SemanticIdHelper.hasSemanticId(
            element,
            'https://admin-shell.io/zvei/nameplate/2/0/Nameplate/Markings/Marking/MarkingFile',
          ) ||
          SemanticIdHelper.hasSemanticId(element, '0112/2///61987#ABO100#002')),
    );
  }

  private isCurrentGeneratorNameplateMarkingsElement(element: aas.types.ISubmodelElement) {
    return (
      `${element?.idShort ?? ''}` === 'Markings' ||
      SemanticIdHelper.hasSemanticId(element, '0173-1#01-AGZ673#001') ||
      SemanticIdHelper.hasSemanticId(element, '0112/2///61360_7#AAS006#001')
    );
  }

  private async getCurrentGeneratorExportFiles(
    nameplateSource: GeneratorNameplateSource | null,
    documentItems: DocumentItem[],
  ) {
    const rootShell = this.getCurrentGeneratorRootShell();
    const assetThumbnailFilename =
      `${rootShell?.assetInformation?.defaultThumbnail?.path ?? ''}`
        .replace(/^file:/, '')
        .split('/')
        .filter((segment) => segment !== '')
        .at(-1) ?? null;

    return {
      nameplateMarkingFiles: (nameplateSource?.nameplate?.markings ?? [])
        .map((marking) => marking.file ?? null)
        .filter((file): file is File => file instanceof File),
      documentFiles: documentItems
        .map((documentItem) => documentItem.file ?? this.getStoredGeneratorFile(documentItem.filePath))
        .filter((file): file is File => file instanceof File),
      packageThumbnailFile: this.getCurrentGeneratorPackageThumbnailFile(),
      packageThumbnailFilename: this.getCurrentGeneratorPackageThumbnailFilename(),
      assetThumbnailFile: this.getCurrentGeneratorAssetThumbnailFile(),
      assetThumbnailFilename,
    };
  }

  private findBatteryPassportSubmodel(type: 'digital-nameplate' | 'technical-data') {
    return batteryPassportTemplateRegistry.getBatteryPassportSubmodel(this.additionalV3Submodels, type);
  }

  private buildDppEmbeddedFilename(key: string, filename: string) {
    const normalizedKey = key
      .replace(/[^a-zA-Z0-9._-]+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
    const prefixedFilename = `${normalizedKey}_${filename}`;
    return FilenameHelper.sanitizeFilename(prefixedFilename);
  }

  private forEachDppFileElement(visitor: (submodel: aas.types.Submodel, element: any, keyPath: string[]) => void) {
    this.additionalV3Submodels.forEach((submodel) => {
      this.walkDppFileElements(submodel, this.getNestedSubmodelElements(submodel), [], visitor);
    });
  }

  private walkDppFileElements(
    submodel: aas.types.Submodel,
    elements: any[],
    parentKeyPath: string[],
    visitor: (submodel: aas.types.Submodel, element: any, keyPath: string[]) => void,
  ) {
    elements.forEach((element, index) => {
      const idShort = element?.idShort ?? 'unknown';
      const keyPath = [...parentKeyPath, `${idShort}[${index}]`];
      const modelTypeLower = this.getSubmodelElementModelTypeName(element).toLowerCase();

      if (this.isDppFileElement(element, modelTypeLower)) {
        visitor(submodel, element, keyPath);
      }

      const children = this.getNestedSubmodelElements(element);
      if (children.length > 0) {
        this.walkDppFileElements(submodel, children, keyPath, visitor);
      }
    });
  }

  private getNestedSubmodelElements(element: any): any[] {
    const submodelElements = element?.submodelElements;
    if (Array.isArray(submodelElements)) {
      return submodelElements;
    }
    if (this.isNestedIterable(submodelElements)) {
      return Array.from(submodelElements);
    }

    const value = element?.value;
    if (Array.isArray(value)) {
      return value;
    }
    if (this.isNestedIterable(value)) {
      return Array.from(value);
    }

    return [];
  }

  private isNestedIterable(value: any): value is Iterable<any> {
    return value != null && typeof value !== 'string' && typeof value[Symbol.iterator] === 'function';
  }

  private getSubmodelElementModelTypeName(element: any): string {
    const rawType = element?.modelType?.name ?? element?.modelType;
    if (typeof rawType === 'string') {
      return rawType;
    }

    const ctorName = rawType?.constructor?.name;
    if (typeof ctorName === 'string' && ctorName.length > 0 && ctorName !== 'Object') {
      return ctorName;
    }

    return rawType != null ? String(rawType) : '';
  }

  private isDppFileElement(element: any, modelTypeLower: string) {
    return modelTypeLower === 'file' || element instanceof aas.types.File || typeof element?.contentType === 'string';
  }

  private applyDppValues(requiredSemanticIds: string[]) {
    const pcfSubmodel = this.findDppPcfSubmodel();
    if (pcfSubmodel == null || !this.hasDppPcfValues()) {
      return;
    }

    requiredSemanticIds.push(...DPP_PCF_REQUIRED_SEMANTIC_IDS);
    pcfSubmodel.submodelElements = buildDppPcfSubmodelElements(this.dppPcfEntries);
  }

  private hasDppPcfValues() {
    return hasDppPcfValues(this.dppPcfEntries);
  }

  private findDppPcfSubmodel() {
    return this.additionalV3Submodels.find((submodel) => this.isDppPcfTemplateSubmodel(submodel));
  }

  private isDppPcfTemplateSubmodel(submodel: aas.types.Submodel) {
    return isDppPcfTemplateSubmodel(submodel);
  }

  async getUserSeatStats(orgaId: number) {
    const params = new HttpParams().set('orgaId', orgaId);
    const dto = await lastValueFrom(
      this.http.get<OrgaUserSeatStats>(`${this.appConfigService.config.apiPath}/Organisation/GetUserSeatStats`, {
        params,
      }),
    );

    return OrgaUserSeatStats.fromDto(dto);
  }

  getShellValidationErrors() {
    return this.generatorStateStore.getShellVerificationErrors();
  }
  getSubmodelValidationErrors() {
    return this.generatorStateStore.getSubmodelVerificationErrors();
  }
}
