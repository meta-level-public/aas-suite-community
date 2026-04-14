import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { HandoverSemantics } from '@aas/helpers';
import { of } from 'rxjs';
import { prefillBatteryPassportTechnicalData } from './generator-battery-passport-prefill.builder';
import { getDocumentationDocumentHost } from './generator-documentation.builder';
import { GeneratorService } from './generator.service';
import { DocumentItem } from './model/document-item';

function createGeneratorService() {
  return new GeneratorService({} as never, {} as never, {} as never);
}

function createNameplateSummary(overrides: Record<string, unknown> = {}) {
  const defaultAddress = {
    street: [],
    zip: [],
    cityTown: [],
    stateCounty: [],
    countryCode: [],
  };

  return {
    manufacturer: [],
    productDesignation: [],
    productRoot: [],
    productFamily: [],
    serialNumber: '',
    yearOfConstruction: '',
    markings: [],
    address: {
      ...defaultAddress,
      ...((overrides.address as Record<string, unknown> | undefined) ?? {}),
    },
    ...overrides,
  };
}

function serializeConceptDescription(conceptDescription: aas.types.ConceptDescription | Record<string, unknown>) {
  return conceptDescription instanceof aas.types.ConceptDescription
    ? JSON.parse(JSON.stringify(aas.jsonization.toJsonable(conceptDescription)))
    : JSON.parse(JSON.stringify(conceptDescription));
}

function hydrateGeneratorExportStore(
  service: GeneratorService,
  options: {
    kind?: 'Type' | 'Instance';
    assetId?: string;
    assetShellId?: string;
    assetShellIdentifier?: string;
    assetShellDescription?: { language: string; text: string }[];
    assetThumbnailFilename?: string;
    assetThumbnailFile?: File;
    packageThumbnailFilename?: string;
    packageThumbnailFile?: File;
    documentItems?: DocumentItem[];
    submodels?: aas.types.Submodel[];
    conceptDescriptions?: aas.types.ConceptDescription[];
  } = {},
) {
  const kind = options.kind ?? 'Type';
  const assetShellId = options.assetShellId ?? 'exampleAas';
  const assetShellIdentifier = options.assetShellIdentifier ?? `https://example.com/ids/aas/${assetShellId}`;
  const assetId = options.assetId ?? 'https://example.com/ids/asset/example';
  const shell = new aas.types.AssetAdministrationShell(
    assetShellIdentifier,
    new aas.types.AssetInformation(kind === 'Instance' ? aas.types.AssetKind.Instance : aas.types.AssetKind.Type),
  );

  shell.idShort = assetShellId;
  shell.assetInformation.globalAssetId = assetId;
  shell.description = (options.assetShellDescription ?? []).map(
    (entry) => new aas.types.LangStringTextType(entry.language, entry.text),
  );
  shell.submodels = [];

  const assetThumbnailFilename = `${options.assetThumbnailFilename ?? ''}`.trim();
  if (assetThumbnailFilename !== '') {
    shell.assetInformation.defaultThumbnail = new aas.types.Resource(
      `file:/aasx/files/${assetThumbnailFilename}`,
      options.assetThumbnailFile?.type,
    );
  }

  service.importGeneratorStateSnapshot({
    environment: {
      assetAdministrationShells: [aas.jsonization.toJsonable(shell)],
      submodels: (options.submodels ?? service.additionalV3Submodels).map((submodel) =>
        aas.jsonization.toJsonable(submodel),
      ),
      conceptDescriptions: (options.conceptDescriptions ?? service.additionalV3ConceptDescriptions).map(
        (conceptDescription) => serializeConceptDescription(conceptDescription as any),
      ),
    },
    assetMetadata: {
      kind,
      assetId,
      assetShellId,
      assetShellIdentifier,
      assetShellDescription: options.assetShellDescription ?? [],
      assetThumbnailFilename,
      assetThumbnailFile: options.assetThumbnailFile,
    },
    packageThumbnailFile: options.packageThumbnailFile ?? null,
    packageThumbnailFilename: options.packageThumbnailFilename ?? '',
  });

  if ((options.documentItems?.length ?? 0) > 0) {
    service.syncDocumentationSubmodelDocuments(options.documentItems ?? []);
    for (const documentItem of options.documentItems ?? []) {
      (service as any).storeDocumentAttachment(documentItem);
    }
  }
}

function createTemplateSubmodel(options: { id: string; templateId: string; semanticId: string; idShort: string }) {
  const submodel = new aas.types.Submodel(
    options.id,
    undefined,
    undefined,
    options.idShort,
    undefined,
    undefined,
    new aas.types.AdministrativeInformation(undefined, undefined, undefined, undefined, options.templateId),
    aas.types.ModellingKind.Instance,
    new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
      new aas.types.Key(aas.types.KeyTypes.GlobalReference, options.semanticId),
    ]),
  );
  submodel.submodelElements = [];
  return submodel;
}

function createNameplateSubmodelWithMarkings(options?: { standard?: boolean }) {
  const isStandard = options?.standard ?? true;
  const submodel = createTemplateSubmodel({
    id: 'urn:test:nameplate',
    idShort: 'Nameplate',
    semanticId: isStandard ? 'https://admin-shell.io/idta/nameplate/3/0/Nameplate' : 'urn:test:nameplate',
    templateId: isStandard ? 'https://admin-shell.io/idta-02006-3-0' : 'urn:test:template:nameplate',
  });
  const marking = new aas.types.SubmodelElementCollection();
  marking.idShort = 'Marking00';
  marking.value = [];

  const markings = new aas.types.SubmodelElementCollection();
  markings.idShort = 'Markings';
  markings.value = [marking];

  submodel.submodelElements = [markings];

  return submodel;
}

function createExternalReference(value: string) {
  return new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
    new aas.types.Key(aas.types.KeyTypes.GlobalReference, value),
  ]);
}

function _createPropertyElement(options: { idShort: string; value?: string; semanticId?: string }) {
  const property = new aas.types.Property(aas.types.DataTypeDefXsd.String);
  property.idShort = options.idShort;
  property.value = options.value ?? '';
  if (options.semanticId != null) {
    property.semanticId = createExternalReference(options.semanticId);
  }

  return property;
}

function _createMultiLanguagePropertyElement(options: {
  idShort: string;
  value?: Array<{ language: string; text: string }>;
  semanticId?: string;
}) {
  const property = new aas.types.MultiLanguageProperty();
  property.idShort = options.idShort;
  property.value = (options.value ?? []).map((entry) => new aas.types.LangStringTextType(entry.language, entry.text));
  if (options.semanticId != null) {
    property.semanticId = createExternalReference(options.semanticId);
  }

  return property;
}

function createFileElement(options: { idShort: string; value?: string; contentType?: string }) {
  const file = new aas.types.File(undefined, undefined, options.idShort);
  file.contentType = options.contentType ?? '';
  file.value = options.value ?? '';
  return file;
}

describe('GeneratorService', () => {
  it('clears existing markings to null when importing generator state', () => {
    const service = createGeneratorService();
    const shell = new aas.types.AssetAdministrationShell(
      'https://example.com/ids/aas/example',
      new aas.types.AssetInformation(aas.types.AssetKind.Type),
    );
    const nameplate = createNameplateSubmodelWithMarkings();

    service.importGeneratorStateSnapshot({
      environment: {
        assetAdministrationShells: [aas.jsonization.toJsonable(shell)],
        submodels: [aas.jsonization.toJsonable(nameplate)],
        conceptDescriptions: [],
      },
      assetMetadata: {
        kind: 'Type',
        assetShellId: 'exampleAas',
        assetShellIdentifier: 'https://example.com/ids/aas/example',
      },
    });

    const importedNameplate = service.getCurrentGeneratorNameplateSubmodel();
    const importedMarkings = importedNameplate?.submodelElements?.find((element) => element.idShort === 'Markings') as
      | aas.types.SubmodelElementCollection
      | undefined;

    expect(importedMarkings?.value).toBeNull();
    expect(service.getCurrentGeneratorNameplateSource()?.nameplate.markings).toEqual([]);
  });

  it('prefills technical data fields from matching nameplate semantic ids', () => {
    const sharedSerialSemanticId = 'urn:test:shared:serial-number';
    const sharedPlantSemanticId = 'urn:test:shared:plant';
    const digitalNameplate = {
      submodelElements: [
        {
          idShort: 'ProductionSerial',
          modelType: { name: 'Property' },
          value: 'SN-42',
          semanticId: {
            keys: [{ value: sharedSerialSemanticId }],
          },
        },
        {
          idShort: 'ProductionPlant',
          modelType: { name: 'MultiLanguageProperty' },
          value: [{ language: 'de', text: 'Werk Nord' }],
          semanticId: {
            keys: [{ value: sharedPlantSemanticId }],
          },
        },
      ],
    } as never;
    const technicalData = {
      submodelElements: [
        {
          idShort: 'TechnicalSerialField',
          modelType: { name: 'Property' },
          value: '',
          semanticId: {
            keys: [{ value: sharedSerialSemanticId }],
          },
        },
        {
          idShort: 'PlantField',
          modelType: { name: 'Property' },
          value: '',
          semanticId: {
            keys: [{ value: sharedPlantSemanticId }],
          },
        },
        {
          idShort: 'UntouchedField',
          modelType: { name: 'Property' },
          value: 'keep-me',
          semanticId: {
            keys: [{ value: 'urn:test:shared:other' }],
          },
        },
      ],
    } as never;

    prefillBatteryPassportTechnicalData(digitalNameplate, technicalData, createNameplateSummary());

    expect(technicalData.submodelElements[0].value).toBe('SN-42');
    expect(technicalData.submodelElements[1].value).toBe('Werk Nord');
    expect(technicalData.submodelElements[2].value).toBe('keep-me');
  });

  it('falls back to nameplate summary values for battery passport technical data aliases', () => {
    const nameplateSource = {
      nameplate: createNameplateSummary({
        manufacturer: [{ language: 'de', text: 'ACME GmbH' }],
        productDesignation: [{ language: 'en', text: 'Battery Pack X' }],
      }),
    };

    const technicalData = {
      submodelElements: [
        {
          idShort: 'ManufacturerName',
          modelType: { name: 'Property' },
          value: '',
        },
        {
          idShort: 'ProductDesignation',
          modelType: { name: 'MultiLanguageProperty' },
          value: null,
        },
      ],
    } as never;

    prefillBatteryPassportTechnicalData(null, technicalData, nameplateSource.nameplate);

    expect(technicalData.submodelElements[0].value).toBe('ACME GmbH');
    expect(technicalData.submodelElements[1].value?.[0]?.text).toBe('Battery Pack X');
  });

  it('stores uploaded DBP files by stable key', () => {
    const service = createGeneratorService();
    const submodel = {
      id: 'urn:test:handover',
      idShort: 'HandoverDocumentation',
    } as never;
    const key = service.buildDppFileKey(submodel, ['DigitalFiles[0]', 'BatteryPassportPdf[0]']);
    const file = new File(['battery passport'], 'battery-passport.pdf', { type: 'application/pdf' });

    service.setDppUploadedFile(key, file);

    expect(service.getDppUploadedFile(key)).toMatchObject({
      filename: 'battery_passport.pdf',
      contentType: 'application/pdf',
      embeddedPath: expect.stringContaining('/aasx/files/'),
    });

    service.removeDppUploadedFile(key);

    expect(service.getDppUploadedFile(key)).toBeNull();
  });

  it('applies DBP file references and appends uploaded files to form data', () => {
    const service = createGeneratorService();
    const fileElement = createFileElement({ idShort: 'BatteryPassportPdf' });
    const digitalFiles = new aas.types.SubmodelElementCollection(undefined, undefined, 'DigitalFiles');
    digitalFiles.value = [fileElement];
    const submodel = createTemplateSubmodel({
      id: 'urn:test:handover',
      idShort: 'HandoverDocumentation',
      semanticId: 'urn:test:handover',
      templateId: 'urn:test:template:handover',
    });
    submodel.submodelElements = [digitalFiles];

    service.vwsTyp = 'battery-passport';
    service.additionalV3Submodels = [submodel];

    const key = service.buildDppFileKey(submodel, ['DigitalFiles[0]', 'BatteryPassportPdf[0]']);
    const file = new File(['battery passport'], 'battery-passport.pdf', { type: 'application/pdf' });
    service.setDppUploadedFile(key, file);

    service.applyDppFileReferences();

    const uploadedFile = service.getDppUploadedFile(key);
    expect(uploadedFile).not.toBeNull();
    expect(fileElement.contentType).toBe('application/pdf');
    expect(fileElement.value).toBe(`file:${uploadedFile?.embeddedPath}`);

    const formData = new FormData();
    service.appendDppFilesToFormData(formData);

    const appendedFile = formData.get(`addedfiles_${uploadedFile?.embeddedPath}`) as File | null;

    expect(appendedFile).not.toBeNull();
    expect(appendedFile?.name).toBe('battery_passport.pdf');
    expect(appendedFile?.type).toBe('application/pdf');
  });

  it('bootstraps the standard generator from the dedicated backend endpoint', async () => {
    const shell = new aas.types.AssetAdministrationShell(
      'https://example.com/ids/aas/example',
      new aas.types.AssetInformation(aas.types.AssetKind.Type),
    );
    shell.idShort = 'exampleAas';
    shell.assetInformation.globalAssetId = 'https://example.com/ids/asset/example';
    shell.description = [new aas.types.LangStringTextType('de', 'Beispielanlage')];
    const nameplate = createTemplateSubmodel({
      id: 'https://admin-shell.io/idta/SubmodelTemplate/DigitalNameplate/3/0',
      idShort: 'Nameplate',
      semanticId: 'https://admin-shell.io/idta/nameplate/3/0/Nameplate',
      templateId: 'https://admin-shell.io/idta-02006-3-0',
    });
    const addressInformation = new aas.types.SubmodelElementCollection(undefined, undefined, 'AddressInformation');
    addressInformation.semanticId = new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
      new aas.types.Key(
        aas.types.KeyTypes.GlobalReference,
        'https://admin-shell.io/zvei/nameplate/1/0/ContactInformations/AddressInformation',
      ),
    ]);
    const handover = createTemplateSubmodel({
      id: 'https://admin-shell.io/idta/SubmodelTemplate/HandoverDocumentation/2/0',
      idShort: 'HandoverDocumentation',
      semanticId: '0173-1#01-AHF578#003',
      templateId: 'https://admin-shell.io/idta-02004-2-0',
    });
    const contactInformation = new aas.types.SubmodelElementCollection(undefined, undefined, 'ContactInformation');
    contactInformation.semanticId = new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
      new aas.types.Key(
        aas.types.KeyTypes.GlobalReference,
        'https://admin-shell.io/zvei/nameplate/1/0/ContactInformations/ContactInformation',
      ),
    ]);
    const company = new aas.types.MultiLanguageProperty(undefined, undefined, 'Company');
    company.value = [new aas.types.LangStringTextType('en', '')];
    contactInformation.value = [company];
    addressInformation.value = [contactInformation];
    nameplate.submodelElements = [addressInformation];

    const http = {
      get: vi.fn().mockImplementation((_url: string) => {
        return of({
          mode: 'typ',
          v3ShellPlain: JSON.stringify(aas.jsonization.toJsonable(shell)),
          v3SubmodelsPlain: [
            JSON.stringify(aas.jsonization.toJsonable(nameplate)),
            JSON.stringify(aas.jsonization.toJsonable(handover)),
          ],
          v3ConceptDescriptionsPlain: [],
          templateRoles: [
            {
              role: 'nameplate',
              label: 'Digital Nameplate',
              semanticId: 'https://admin-shell.io/idta/nameplate/3/0/Nameplate',
              templateId: 'https://admin-shell.io/idta-02006-3-0',
              sourceUrl: 'https://example.com/nameplate',
              submodelId: nameplate.id,
              submodelIdShort: nameplate.idShort,
              submodelPlain: JSON.stringify(aas.jsonization.toJsonable(nameplate)),
            },
            {
              role: 'handover-documentation',
              label: 'Handover Documentation',
              semanticId: '0173-1#01-AHF578#003',
              templateId: 'https://admin-shell.io/idta-02004-2-0',
              sourceUrl: 'https://example.com/handover',
              submodelId: handover.id,
              submodelIdShort: handover.idShort,
              submodelPlain: JSON.stringify(aas.jsonization.toJsonable(handover)),
            },
          ],
          uiRules: {
            showSerialNumber: false,
            showManufacturingDate: false,
          },
        });
      }),
    } as any;
    const service = new GeneratorService(
      http,
      { iriPrefix: 'https://example.com/ids' } as never,
      {
        config: { apiPath: '/api' },
      } as never,
    );

    const snapshot = await service.bootstrapStandardGenerator('typ');

    expect(http.get).toHaveBeenCalledWith('/api/SubmodelTemplate/GetStandardGeneratorBootstrap', {
      params: expect.anything(),
    });
    expect(snapshot.assetMetadata?.kind).toBe('Type');
    expect(snapshot.assetMetadata?.assetShellIdentifier).toBe('https://example.com/ids/aas/example');
    expect(service.additionalV3Submodels).toHaveLength(2);
    const bootstrappedAddressInformation = service.additionalV3Submodels[0].submodelElements?.find(
      (element) => element.idShort === 'AddressInformation',
    ) as aas.types.ISubmodelElementCollection;
    expect(bootstrappedAddressInformation.value?.some((element) => element.idShort === 'ContactInformation')).toBe(
      true,
    );
    expect(service.standardGeneratorTemplateRoles.map((role) => role.role)).toEqual([
      'nameplate',
      'handover-documentation',
    ]);
    expect(service.showStandardGeneratorSerialNumber).toBe(false);
    expect(service.showStandardGeneratorManufacturingDate).toBe(false);
  });

  it('uses bootstrapped standard templates when exporting a standard flow', async () => {
    const nameplateTemplate = createTemplateSubmodel({
      id: 'https://admin-shell.io/idta/SubmodelTemplate/DigitalNameplate/3/0',
      idShort: 'Nameplate',
      semanticId: 'https://admin-shell.io/idta/nameplate/3/0/Nameplate',
      templateId: 'https://admin-shell.io/idta-02006-3-0',
    });
    const manufacturerName = new aas.types.MultiLanguageProperty(undefined, undefined, 'ManufacturerName');
    manufacturerName.value = [new aas.types.LangStringTextType('en', 'Initial manufacturer')];
    nameplateTemplate.submodelElements = [
      manufacturerName,
      new aas.types.Property(aas.types.DataTypeDefXsd.String, undefined, undefined, 'SerialNumber'),
      new aas.types.File(undefined, undefined, 'CompanyLogo'),
      new aas.types.Property(aas.types.DataTypeDefXsd.String, undefined, undefined, 'OrderCodeOfManufacturer'),
    ];
    const handoverTemplate = createTemplateSubmodel({
      id: 'https://admin-shell.io/idta/SubmodelTemplate/HandoverDocumentation/2/0',
      idShort: 'HandoverDocumentation',
      semanticId: '0173-1#01-AHF578#003',
      templateId: 'https://admin-shell.io/idta-02004-2-0',
    });
    const http = {
      get: vi.fn().mockReturnValue(of({ id: '' })),
    } as any;
    const service = new GeneratorService(
      http,
      { iriPrefix: 'https://example.com/ids', currentLanguage: 'en' } as never,
      { config: { apiPath: '/api' } } as never,
    );

    service.vwsTyp = 'typ';
    (nameplateTemplate.submodelElements[3] as aas.types.Property).value = 'OC-42';
    service.additionalV3Submodels = [nameplateTemplate, handoverTemplate];
    service.standardGeneratorTemplateRoles = [
      {
        role: 'nameplate',
        label: 'Digital Nameplate',
        semanticId: 'https://admin-shell.io/idta/nameplate/3/0/Nameplate',
        templateId: 'https://admin-shell.io/idta-02006-3-0',
        sourceUrl: 'https://example.com/nameplate',
        submodelId: nameplateTemplate.id,
        submodelIdShort: nameplateTemplate.idShort,
        submodelPlain: JSON.stringify({ id: nameplateTemplate.id }),
      },
      {
        role: 'handover-documentation',
        label: 'Handover Documentation',
        semanticId: '0173-1#01-AHF578#003',
        templateId: 'https://admin-shell.io/idta-02004-2-0',
        sourceUrl: 'https://example.com/handover',
        submodelId: handoverTemplate.id,
        submodelIdShort: handoverTemplate.idShort,
        submodelPlain: JSON.stringify({ id: handoverTemplate.id }),
      },
    ] as never;
    const logoKey = service.buildDppFileKey(nameplateTemplate, ['CompanyLogo[2]']);
    const logoFile = new File(['logo'], 'company-logo.png', { type: 'image/png' });
    service.setDppUploadedFile(logoKey, logoFile);

    hydrateGeneratorExportStore(service, { kind: 'Type' });

    const formData = await service.getFormDataV3();
    const plainJson = formData.get('plainJson');
    const env = JSON.parse(`${plainJson ?? ''}`);
    const exportedNameplate = env.submodels[0];
    const exportedLogo = exportedNameplate.submodelElements.find((element: any) => element.idShort === 'CompanyLogo');
    const appendedLogoKey = `addedfiles_${`${exportedLogo?.value ?? ''}`.replace(/^file:/, '')}`;

    expect(env.submodels).toHaveLength(2);
    expect(exportedNameplate.administration.templateId).toBe('https://admin-shell.io/idta-02006-3-0');
    expect(exportedNameplate.semanticId.keys[0].value).toBe('https://admin-shell.io/idta/nameplate/3/0/Nameplate');
    expect(
      exportedNameplate.submodelElements.find((element: any) => element.idShort === 'OrderCodeOfManufacturer')?.value,
    ).toBe('OC-42');
    expect(exportedLogo?.value).toContain('/aasx/files/');
    expect(formData.has(appendedLogoKey)).toBe(true);
    expect(env.submodels[1].administration.templateId).toBe('https://admin-shell.io/idta-02004-2-0');
    expect(env.submodels[1].semanticId.keys[0].value).toBe('0173-1#01-AHF578#003');
  });

  it('prefers the edited raw nameplate work state over stale imported summary values', async () => {
    const _nameplateTemplate = createTemplateSubmodel({
      id: 'https://admin-shell.io/idta/SubmodelTemplate/DigitalNameplate/3/0',
      idShort: 'Nameplate',
      semanticId: 'https://admin-shell.io/idta/nameplate/3/0/Nameplate',
      templateId: 'https://admin-shell.io/idta-02006-3-0',
    });
    const rawNameplate = createTemplateSubmodel({
      id: 'https://admin-shell.io/idta/SubmodelTemplate/DigitalNameplate/3/0',
      idShort: 'Nameplate',
      semanticId: 'https://admin-shell.io/idta/nameplate/3/0/Nameplate',
      templateId: 'https://admin-shell.io/idta-02006-3-0',
    });
    const rawManufacturer = new aas.types.MultiLanguageProperty(undefined, undefined, 'ManufacturerName');
    rawManufacturer.value = [new aas.types.LangStringTextType('en', 'Edited in component')];
    const rawSerial = new aas.types.Property(aas.types.DataTypeDefXsd.String, undefined, undefined, 'SerialNumber');
    rawSerial.value = 'RAW-42';
    rawNameplate.submodelElements = [rawManufacturer, rawSerial];

    const http = {
      get: vi.fn().mockReturnValue(of({ id: '' })),
    } as any;
    const service = new GeneratorService(
      http,
      { iriPrefix: 'https://example.com/ids', currentLanguage: 'en' } as never,
      { config: { apiPath: '/api' } } as never,
    );

    service.vwsTyp = 'typ';
    service.additionalV3Submodels = [rawNameplate];
    service.standardGeneratorTemplateRoles = [
      {
        role: 'nameplate',
        label: 'Digital Nameplate',
        semanticId: 'https://admin-shell.io/idta/nameplate/3/0/Nameplate',
        templateId: 'https://admin-shell.io/idta-02006-3-0',
        sourceUrl: 'https://example.com/nameplate',
        submodelId: rawNameplate.id,
        submodelIdShort: rawNameplate.idShort,
        submodelPlain: JSON.stringify({ id: rawNameplate.id }),
      },
    ] as never;

    hydrateGeneratorExportStore(service, { kind: 'Type' });

    const formData = await service.getFormDataV3();
    const env = JSON.parse(`${formData.get('plainJson') ?? ''}`);
    const exportedNameplate = env.submodels.find((submodel: any) => submodel.idShort === 'Nameplate');

    expect(
      exportedNameplate.submodelElements.find((element: any) => element.idShort === 'ManufacturerName')?.value?.[0]
        ?.text,
    ).toBe('Edited in component');
    expect(exportedNameplate.submodelElements.find((element: any) => element.idShort === 'SerialNumber')?.value).toBe(
      'RAW-42',
    );
  });

  it('preserves non-document handover template elements when exporting template-backed flows', async () => {
    const handoverTemplate = createTemplateSubmodel({
      id: 'https://admin-shell.io/idta/SubmodelTemplate/HandoverDocumentation/2/0',
      idShort: 'HandoverDocumentation',
      semanticId: '0173-1#01-AHF578#003',
      templateId: 'https://admin-shell.io/idta-02004-2-0',
    });
    const documentHost = new aas.types.SubmodelElementCollection(undefined, undefined, 'DocumentContainer');
    documentHost.semanticId = new aas.types.Reference(aas.types.ReferenceTypes.ModelReference, [
      new aas.types.Key(aas.types.KeyTypes.ConceptDescription, HandoverSemantics.CONTAINER_V2),
    ]);
    documentHost.value = [
      new aas.types.Property(aas.types.DataTypeDefXsd.String, undefined, undefined, 'GeneralNote'),
      new aas.types.SubmodelElementCollection(undefined, undefined, 'Document99'),
    ];
    handoverTemplate.submodelElements = [documentHost];

    const http = {
      get: vi.fn().mockReturnValue(of({ id: '' })),
    } as any;
    const service = new GeneratorService(
      http,
      { iriPrefix: 'https://example.com/ids', currentLanguage: 'en' } as never,
      { config: { apiPath: '/api' } } as never,
    );

    service.vwsTyp = 'typ';
    const documentItems = [
      {
        documentId: [{ documentDomainId: 'DOC', valueId: '001', isPrimary: true }],
        documentClassification: [],
        documentVersion: [
          {
            language: 'en',
            documentVersionId: '1.0',
            title: 'Document 1',
            subtitle: '',
            summary: 'Summary',
            keywords: 'manual',
            statusSetDate: new Date('2026-01-15'),
            statusValue: 'Released',
            organizationName: 'ACME',
            organizationOfficialName: 'ACME GmbH',
            digitalFile: null,
            previewFile: null,
            refersTo: [],
            basedOn: [],
            translationOf: [],
          },
        ],
        filePath: 'file:/aasx/files/operation-manual.pdf',
        mimeType: 'application/pdf',
      },
    ] as DocumentItem[];
    service.additionalV3Submodels = [handoverTemplate];
    service.standardGeneratorTemplateRoles = [
      {
        role: 'handover-documentation',
        label: 'Handover Documentation',
        semanticId: '0173-1#01-AHF578#003',
        templateId: 'https://admin-shell.io/idta-02004-2-0',
        sourceUrl: 'https://example.com/handover',
        submodelId: handoverTemplate.id,
        submodelIdShort: handoverTemplate.idShort,
        submodelPlain: JSON.stringify({ id: handoverTemplate.id }),
      },
    ] as never;

    hydrateGeneratorExportStore(service, { kind: 'Type', documentItems });

    const formData = await service.getFormDataV3();
    const env = JSON.parse(`${formData.get('plainJson') ?? ''}`);
    const exportedHandover = env.submodels.find((submodel: any) => submodel.idShort === 'HandoverDocumentation');
    const exportedHost = exportedHandover.submodelElements[0];

    expect(exportedHost.value.some((element: any) => element.idShort === 'GeneralNote')).toBe(true);
    expect(exportedHost.value.some((element: any) => element.idShort === 'Document00')).toBe(true);
    expect(exportedHost.value.some((element: any) => element.idShort === 'Document99')).toBe(false);
  });

  it('uses bootstrapped template submodels when exporting a dpp core flow', async () => {
    const nameplateTemplate = createTemplateSubmodel({
      id: 'https://admin-shell.io/idta/SubmodelTemplate/DigitalNameplate/3/0',
      idShort: 'Nameplate',
      semanticId: 'https://admin-shell.io/idta/nameplate/3/0/Nameplate',
      templateId: 'https://admin-shell.io/idta-02006-3-0',
    });
    const handoverTemplate = createTemplateSubmodel({
      id: 'https://admin-shell.io/idta/SubmodelTemplate/HandoverDocumentation/2/0',
      idShort: 'HandoverDocumentation',
      semanticId: '0173-1#01-AHF578#003',
      templateId: 'https://admin-shell.io/idta-02004-2-0',
    });
    const pcfTemplate = createTemplateSubmodel({
      id: 'https://admin-shell.io/idta/SubmodelTemplate/DigitalBatteryPassport/CarbonFootprint/1/0',
      idShort: 'CarbonFootprintForDbpAas',
      semanticId: 'https://admin-shell.io/idta/CarbonFootprint/CarbonFootprint/1/0',
      templateId: 'https://admin-shell.io/idta-02023-1-0',
    });
    const http = {
      get: vi.fn().mockReturnValue(of({ id: '' })),
    } as any;
    const service = new GeneratorService(
      http,
      { iriPrefix: 'https://example.com/ids', currentLanguage: 'en' } as never,
      { config: { apiPath: '/api' } } as never,
    );

    service.vwsTyp = 'dpp-core';
    service.additionalV3Submodels = [nameplateTemplate, handoverTemplate, pcfTemplate];
    service.standardGeneratorTemplateRoles = [
      {
        role: 'nameplate',
        label: 'Digital Nameplate',
        semanticId: 'https://admin-shell.io/idta/nameplate/3/0/Nameplate',
        templateId: 'https://admin-shell.io/idta-02006-3-0',
        sourceUrl: 'https://example.com/nameplate',
        submodelId: nameplateTemplate.id,
        submodelIdShort: nameplateTemplate.idShort,
        submodelPlain: JSON.stringify(aas.jsonization.toJsonable(nameplateTemplate)),
      },
      {
        role: 'handover-documentation',
        label: 'Handover Documentation',
        semanticId: '0173-1#01-AHF578#003',
        templateId: 'https://admin-shell.io/idta-02004-2-0',
        sourceUrl: 'https://example.com/handover',
        submodelId: handoverTemplate.id,
        submodelIdShort: handoverTemplate.idShort,
        submodelPlain: JSON.stringify(aas.jsonization.toJsonable(handoverTemplate)),
      },
    ] as never;

    hydrateGeneratorExportStore(service, { kind: 'Instance' });

    const formData = await service.getFormDataV3();
    const plainJson = formData.get('plainJson');
    const env = JSON.parse(`${plainJson ?? ''}`);

    expect(
      env.submodels.some(
        (submodel: any) => submodel.administration?.templateId === 'https://admin-shell.io/idta-02006-3-0',
      ),
    ).toBe(true);
    expect(
      env.submodels.some(
        (submodel: any) => submodel.administration?.templateId === 'https://admin-shell.io/idta-02004-2-0',
      ),
    ).toBe(true);
    expect(env.submodels.some((submodel: any) => submodel.idShort === 'DppMeta')).toBe(true);
  });

  it('exports battery passport handover files via the shared document path', async () => {
    const handoverTemplate = createTemplateSubmodel({
      id: 'https://admin-shell.io/idta/SubmodelTemplate/DigitalBatteryPassport/HandoverDocumentation/1/0',
      idShort: 'HandoverDocumentation',
      semanticId: '0173-1#01-AHF578#003',
      templateId: 'https://admin-shell.io/idta-02035-2',
    });
    const http = {
      get: vi.fn().mockReturnValue(of({ id: '' })),
    } as any;
    const service = new GeneratorService(
      http,
      { iriPrefix: 'https://example.com/ids', currentLanguage: 'en' } as never,
      { config: { apiPath: '/api' } } as never,
    );
    const handoverFile = new File(['battery passport'], 'battery-passport.pdf', { type: 'application/pdf' });
    const handoverDocument = DocumentItem.createDraft('en');
    handoverDocument.file = handoverFile;
    handoverDocument.documentVersion[0].title = 'Battery passport';

    service.vwsTyp = 'battery-passport';
    service.additionalV3Submodels = [handoverTemplate];
    service.addOrReplaceDocumentItem(handoverDocument);

    hydrateGeneratorExportStore(service, { kind: 'Instance' });

    const formData = await service.getFormDataV3();

    expect(formData.has('addedfiles_/aasx/files/battery_passport.pdf')).toBe(true);
  });

  it('preserves the edited battery-passport digital nameplate work state during export', async () => {
    const digitalNameplate = createTemplateSubmodel({
      id: 'https://admin-shell.io/idta/SubmodelTemplate/DigitalBatteryPassport/DigitalNameplate/1/0',
      idShort: 'DigitalNameplate',
      semanticId: 'https://admin-shell.io/idta/digitalbatterypassport/nameplate/1/0/Nameplate',
      templateId: 'https://admin-shell.io/idta-02035-1',
    });
    const manufacturer = new aas.types.MultiLanguageProperty(undefined, undefined, 'ManufacturerName');
    manufacturer.value = [new aas.types.LangStringTextType('en', 'Edited in component')];
    const serialNumber = new aas.types.Property(aas.types.DataTypeDefXsd.String, undefined, undefined, 'SerialNumber');
    serialNumber.value = 'RAW-BP-42';
    digitalNameplate.submodelElements = [manufacturer, serialNumber];

    const http = {
      get: vi.fn().mockReturnValue(of({ id: '' })),
    } as any;
    const service = new GeneratorService(
      http,
      { iriPrefix: 'https://example.com/ids', currentLanguage: 'en' } as never,
      { config: { apiPath: '/api' } } as never,
    );

    service.vwsTyp = 'battery-passport';
    service.additionalV3Submodels = [digitalNameplate];

    hydrateGeneratorExportStore(service, {
      kind: 'Instance',
      assetShellId: 'batteryPassportAas',
      assetShellIdentifier: 'https://example.com/ids/aas/batteryPassportAas',
    });

    const formData = await service.getFormDataV3();
    const env = JSON.parse(`${formData.get('plainJson') ?? ''}`);
    const exportedNameplate = env.submodels.find((submodel: any) => submodel.idShort === 'DigitalNameplate');

    expect(
      exportedNameplate.submodelElements.find((element: any) => element.idShort === 'ManufacturerName')?.value?.[0]
        ?.text,
    ).toBe('Edited in component');
    expect(exportedNameplate.submodelElements.find((element: any) => element.idShort === 'SerialNumber')?.value).toBe(
      'RAW-BP-42',
    );
  });

  it('includes shared export metadata and thumbnail files in the form data payload', async () => {
    const http = {
      get: vi.fn().mockReturnValue(of({ id: '' })),
    } as any;
    const service = new GeneratorService(
      http,
      { iriPrefix: 'https://example.com/ids', currentLanguage: 'en' } as never,
      { config: { apiPath: '/api' } } as never,
    );

    service.vwsTyp = 'typ';
    hydrateGeneratorExportStore(service, {
      kind: 'Type',
      assetThumbnailFilename: 'asset-thumb.png',
      assetThumbnailFile: new File(['asset-thumb'], 'asset-thumb.png', { type: 'image/png' }),
      packageThumbnailFilename: 'package-thumb.png',
      packageThumbnailFile: new File(['package-thumb'], 'package-thumb.png', { type: 'image/png' }),
    });

    const formData = await service.getFormDataV3();
    const plainJson = `${formData.get('plainJson') ?? ''}`;
    const env = JSON.parse(plainJson);

    expect(formData.get('aasxFilename')).toBe('exampleAas.aasx');
    expect(formData.get('thumbnailFilename')).toBe('package-thumb.png');
    expect(formData.get('id')).toBe('-1');
    expect(formData.has('addedfiles_/aasx/files/package-thumb.png')).toBe(true);
    expect(formData.has('addedfiles_/aasx/files/asset-thumb.png')).toBe(true);
    expect(env.assetAdministrationShells[0].idShort).toBe('exampleAas');
  });

  it('provides the generated aas environment directly for in-memory validation', async () => {
    const http = {
      get: vi.fn().mockReturnValue(of({ id: '' })),
    } as any;
    const service = new GeneratorService(
      http,
      { iriPrefix: 'https://example.com/ids', currentLanguage: 'en' } as never,
      { config: { apiPath: '/api' } } as never,
    );

    service.vwsTyp = 'typ';
    hydrateGeneratorExportStore(service, { kind: 'Type' });

    const exportState = await service.getExportStateV3();
    const plainJson = `${exportState.formData.get('plainJson') ?? ''}`;
    const serializedEnvironment = JSON.parse(plainJson);

    expect(exportState.env.assetAdministrationShells?.[0].idShort).toBe('exampleAas');
    expect(exportState.formData.get('aasxFilename')).toBe('exampleAas.aasx');
    expect(serializedEnvironment.assetAdministrationShells[0].idShort).toBe('exampleAas');
  });

  it('removes duplicate language entries from template concept descriptions before validation and save', async () => {
    const http = {
      get: vi.fn().mockReturnValue(of({ id: '' })),
    } as any;
    const service = new GeneratorService(
      http,
      { iriPrefix: 'https://example.com/ids', currentLanguage: 'en' } as never,
      { config: { apiPath: '/api' } } as never,
    );

    const conceptDescription = new aas.types.ConceptDescription('https://example.com/cd/1');
    const embeddedDataSpecification = new aas.types.EmbeddedDataSpecification(
      new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
        new aas.types.Key(
          aas.types.KeyTypes.GlobalReference,
          'https://admin-shell.io/DataSpecificationTemplates/DataSpecificationIEC61360/3/0',
        ),
      ]),
      new aas.types.DataSpecificationIec61360([new aas.types.LangStringTextType('en', 'Example preferred name')]),
    );

    embeddedDataSpecification.dataSpecificationContent.definition = [
      new aas.types.LangStringDefinitionTypeIec61360('de', 'Erste Definition'),
      new aas.types.LangStringDefinitionTypeIec61360('de', 'Doppelte Definition'),
      new aas.types.LangStringDefinitionTypeIec61360('en', 'English Definition'),
    ];
    conceptDescription.embeddedDataSpecifications = [embeddedDataSpecification];

    service.vwsTyp = 'typ';
    service.additionalV3ConceptDescriptions = [conceptDescription];

    hydrateGeneratorExportStore(service, { kind: 'Type' });

    const exportState = await service.getExportStateV3();
    const exportedDefinition =
      exportState.env.conceptDescriptions?.[0]?.embeddedDataSpecifications?.[0]?.dataSpecificationContent.definition;
    const serializedEnvironment = JSON.parse(`${exportState.formData.get('plainJson') ?? ''}`);
    const serializedDefinition =
      serializedEnvironment.conceptDescriptions[0].embeddedDataSpecifications[0].dataSpecificationContent.definition;

    expect(exportedDefinition).toHaveLength(2);
    expect(exportedDefinition?.map((entry) => entry.language)).toEqual(['de', 'en']);
    expect(serializedDefinition).toHaveLength(2);
    expect(serializedDefinition.map((entry: any) => entry.language)).toEqual(['de', 'en']);
  });

  it('returns a verification-safe typed environment for the verify flow', async () => {
    const http = {
      get: vi.fn().mockReturnValue(of({ id: '' })),
    } as any;
    const service = new GeneratorService(
      http,
      { iriPrefix: 'https://example.com/ids', currentLanguage: 'en' } as never,
      { config: { apiPath: '/api' } } as never,
    );

    const conceptDescription = new aas.types.ConceptDescription('https://example.com/cd/typed');
    const embeddedDataSpecification = new aas.types.EmbeddedDataSpecification(
      new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
        new aas.types.Key(
          aas.types.KeyTypes.GlobalReference,
          'https://admin-shell.io/DataSpecificationTemplates/DataSpecificationIEC61360/3/0',
        ),
      ]),
      new aas.types.DataSpecificationIec61360([new aas.types.LangStringTextType('en', 'Preferred name')]),
    );
    embeddedDataSpecification.dataSpecificationContent.definition = [
      new aas.types.LangStringDefinitionTypeIec61360('en', 'Definition'),
    ];
    conceptDescription.embeddedDataSpecifications = [embeddedDataSpecification];

    service.vwsTyp = 'typ';
    service.additionalV3ConceptDescriptions = [
      JSON.parse(JSON.stringify(aas.jsonization.toJsonable(conceptDescription))) as never,
    ];

    hydrateGeneratorExportStore(service, {
      kind: 'Type',
      assetShellDescription: [{ language: 'en', text: 'Example AAS' }],
    });

    const env = await service.getVerifiableEnvironmentV3();

    expect(() => Array.from(aas.verification.verify(env))).not.toThrow();
  });

  it('stages document edits before applying them to the typed documentation work state', () => {
    const service = createGeneratorService();
    const originalDocument = DocumentItem.createDraft('en');
    originalDocument.documentVersion[0].title = 'Original title';
    const handoverTemplate = createTemplateSubmodel({
      id: 'https://admin-shell.io/idta/SubmodelTemplate/HandoverDocumentation/2/0',
      idShort: 'HandoverDocumentation',
      semanticId: '0173-1#01-AHF578#003',
      templateId: 'https://admin-shell.io/idta-02004-2-0',
    });

    service.additionalV3Submodels = [handoverTemplate];
    service.syncDocumentationSubmodelDocuments([originalDocument]);

    service.beginDocumentEdit(originalDocument, 0, 'en');
    expect(service.currentEditDocument).not.toBe(originalDocument);

    service.currentEditDocument!.documentVersion[0].title = 'Updated title';
    expect(service.getCurrentGeneratorDocumentItems('en')[0].documentVersion[0].title).toBe('Original title');

    service.discardCurrentDocumentEdit();
    expect(service.getCurrentGeneratorDocumentItems('en')[0].documentVersion[0].title).toBe('Original title');

    service.beginDocumentEdit(originalDocument, 0, 'en');
    service.currentEditDocument!.documentVersion[0].title = 'Applied title';
    service.applyCurrentDocumentEdit();

    const syncedDocumentation = service.additionalV3Submodels[0] as aas.types.Submodel;

    expect(service.getCurrentGeneratorDocumentItems('en')[0].documentVersion[0].title).toBe('Applied title');
    expect(syncedDocumentation).toBeInstanceOf(aas.types.Submodel);
    expect(service.additionalV3Submodels[0]).toBe(syncedDocumentation);
    expect(service.currentEditDocument).toBeNull();
    expect(service.currentEditDocumentIndex).toBeNull();
  });

  it('syncs document additions into the generator handover work state immediately', () => {
    const service = createGeneratorService();
    const handoverTemplate = createTemplateSubmodel({
      id: 'https://admin-shell.io/idta/SubmodelTemplate/HandoverDocumentation/2/0',
      idShort: 'HandoverDocumentation',
      semanticId: '0173-1#01-AHF578#003',
      templateId: 'https://admin-shell.io/idta-02004-2-0',
    });
    const documentItem = DocumentItem.createDraft('en');
    documentItem.documentVersion[0].title = 'Immediate sync manual';

    service.additionalV3Submodels = [handoverTemplate];

    service.addOrReplaceDocumentItem(documentItem);

    const syncedDocumentation = service.additionalV3Submodels[0] as aas.types.Submodel;
    const documentHost = getDocumentationDocumentHost(syncedDocumentation);

    expect(service.getCurrentGeneratorDocumentItems('en')).toHaveLength(1);
    expect(documentHost).not.toBeNull();
    expect(JSON.stringify(documentHost)).toContain('"idShort":"Document00"');
  });

  it('bootstraps a template-driven instance generator without calling GetEmptyAas', async () => {
    const technicalDataTemplate = createTemplateSubmodel({
      id: 'https://admin-shell.io/idta/SubmodelTemplate/DigitalBatteryPassport/TechnicalData/1/0',
      idShort: 'TechnicalData',
      semanticId: 'https://admin-shell.io/idta/digitalbatterypassport/TechnicalData/1/0',
      templateId: 'idta-02003-2-0',
    });
    const http = {
      get: vi.fn(),
    } as any;
    const service = new GeneratorService(
      http,
      { iriPrefix: 'https://example.com/ids', currentLanguage: 'en' } as never,
      { config: { apiPath: '/api' } } as never,
    );

    const snapshot = await service.bootstrapTemplateGenerator('instanz', [technicalDataTemplate], []);

    expect(http.get).not.toHaveBeenCalled();
    expect(snapshot.assetMetadata?.kind).toBe('Instance');
    expect(snapshot.assetMetadata?.assetShellIdentifier).toContain('/aas/');
    expect(service.additionalV3Submodels).toHaveLength(1);
    expect(service.standardGeneratorTemplateRoles).toEqual([]);
    expect(service.standardGeneratorUiRules).toBeNull();
  });

  it('clears existing markings to null when bootstrapping template-driven generator state', async () => {
    const nameplate = createNameplateSubmodelWithMarkings({ standard: false });
    const service = new GeneratorService(
      { get: vi.fn() } as never,
      { iriPrefix: 'https://example.com/ids', currentLanguage: 'en' } as never,
      { config: { apiPath: '/api' } } as never,
    );

    await service.bootstrapTemplateGenerator('instanz', [nameplate], []);

    const bootstrappedNameplate = service.getCurrentGeneratorNameplateSubmodel();
    const markings = bootstrappedNameplate?.submodelElements?.find((element) => element.idShort === 'Markings') as
      | aas.types.SubmodelElementCollection
      | undefined;

    expect(markings?.value).toBeNull();
    expect(service.getCurrentGeneratorNameplateSource()?.nameplate.markings).toEqual([]);
  });

  it('bootstraps dpp and dbp helper flows with a blank editable nameplate and document model', async () => {
    const pcfTemplate = createTemplateSubmodel({
      id: 'https://admin-shell.io/idta/SubmodelTemplate/DigitalBatteryPassport/CarbonFootprint/1/0',
      idShort: 'CarbonFootprintForDbpAas',
      semanticId: 'https://admin-shell.io/idta/CarbonFootprint/CarbonFootprint/1/0',
      templateId: 'https://admin-shell.io/idta-02023-1-0',
    });
    const service = new GeneratorService(
      { get: vi.fn() } as never,
      { iriPrefix: 'https://example.com/ids', currentLanguage: 'en' } as never,
      { config: { apiPath: '/api' } } as never,
    );

    await service.bootstrapTemplateGenerator('instanz', [pcfTemplate], []);

    expect(service.getCurrentGeneratorNameplateSource()).toBeNull();
    expect(service.getCurrentGeneratorDocumentItems('en')).toEqual([]);
    expect(service.additionalV3Submodels[0].idShort).toBe('CarbonFootprintForDbpAas');
  });

  it('builds a shared flow definition for battery passport templates', () => {
    const service = createGeneratorService();

    service.vwsTyp = 'battery-passport';
    service.additionalV3Submodels = [
      createTemplateSubmodel({
        id: 'https://admin-shell.io/idta/SubmodelTemplate/DigitalBatteryPassport/TechnicalData/1/0',
        idShort: 'TechnicalData',
        semanticId: 'urn:test:technical-data',
        templateId: 'urn:test:template:technical-data',
      }),
      createTemplateSubmodel({
        id: 'https://admin-shell.io/idta/SubmodelTemplate/DigitalBatteryPassport/HandoverDocumentation/1/0',
        idShort: 'HandoverDocumentation',
        semanticId: 'urn:test:handover',
        templateId: 'urn:test:template:handover',
      }),
      createTemplateSubmodel({
        id: 'https://admin-shell.io/idta/SubmodelTemplate/DigitalBatteryPassport/CarbonFootprint/1/0',
        idShort: 'CarbonFootprintForDbpAas',
        semanticId: 'urn:test:carbon-footprint',
        templateId: 'urn:test:template:carbon-footprint',
      }),
      createTemplateSubmodel({
        id: 'urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#Circularity/submodel',
        idShort: 'Circularity',
        semanticId: 'urn:test:circularity',
        templateId: 'urn:test:template:circularity',
      }),
    ];

    service.rebuildGeneratorFlow();

    expect(service.generatorFlowSteps.map((step) => step.id)).toEqual([
      'asset-metadata',
      'nameplate',
      'technical-data',
      'battery-handover',
      'battery-carbon-footprint',
      'battery-submodels:0',
      'confirmation',
    ]);
  });

  it('builds a shared flow definition for dpp core', () => {
    const service = createGeneratorService();

    service.vwsTyp = 'dpp-core';
    service.rebuildGeneratorFlow();

    expect(service.generatorFlowSteps.map((step) => step.id)).toEqual([
      'asset-metadata',
      'nameplate',
      'document',
      'dpp-core',
      'confirmation',
    ]);
  });

  it('clears generator session state including uploaded files', () => {
    const service = createGeneratorService();

    service.vwsTyp = 'battery-passport';
    service.additionalV3Submodels = [
      createTemplateSubmodel({
        id: 'urn:test:submodel',
        idShort: 'TestSubmodel',
        semanticId: 'urn:test:submodel',
        templateId: 'urn:test:template:submodel',
      }),
    ];
    service.additionalV3ConceptDescriptions = [new aas.types.ConceptDescription('urn:test:cd')];
    service.standardGeneratorTemplateRoles = [{ role: 'nameplate' }] as never;
    service.standardGeneratorUiRules = {
      showSerialNumber: false,
      showManufacturingDate: false,
    };
    service.generatorFlowSteps = [{ id: 'nameplate', routeCommands: ['generator', 'nameplate'] }];
    service.batteryTechnicalDataEdited = true;
    service.dppAssistantValues = { companyName: { value: 'ACME' } } as never;
    service.dppUploadedFilesByKey.set('file-key', {
      key: 'file-key',
      file: new File(['content'], 'evidence.txt', { type: 'text/plain' }),
      filename: 'evidence.txt',
      contentType: 'text/plain',
      embeddedPath: '/aasx/files/evidence.txt',
    });
    service.dppPcfEntries = {
      productCarbonFootprints: [{ id: 'pcf-entry' }] as never,
      productOrSectorSpecificCarbonFootprints: [{ id: 'sector-entry' }] as never,
    };

    service.resetGeneratorSessionState('dpp-core');

    expect(service.vwsTyp).toBe('dpp-core');
    expect(service.additionalV3Submodels).toEqual([]);
    expect(service.additionalV3ConceptDescriptions).toEqual([]);
    expect(service.standardGeneratorTemplateRoles).toEqual([]);
    expect(service.standardGeneratorUiRules).toBeNull();
    expect(service.generatorFlowSteps).toEqual([]);
    expect(service.batteryTechnicalDataEdited).toBe(false);
    expect(service.dppAssistantValues).toEqual({});
    expect(service.dppUploadedFilesByKey.size).toBe(0);
    expect(service.dppPcfEntries).toEqual({
      productCarbonFootprints: [],
      productOrSectorSpecificCarbonFootprints: [],
    });
  });

  it('merges additional template bundles by stable ids', () => {
    const service = createGeneratorService();
    const firstNameplate = createTemplateSubmodel({
      id: 'urn:test:nameplate',
      idShort: 'Nameplate',
      semanticId: 'urn:test:nameplate',
      templateId: 'urn:test:template:nameplate:v1',
    });
    const updatedNameplate = createTemplateSubmodel({
      id: 'urn:test:nameplate',
      idShort: 'Nameplate',
      semanticId: 'urn:test:nameplate',
      templateId: 'urn:test:template:nameplate:v2',
    });

    service.setAdditionalTemplateBundle([firstNameplate], [new aas.types.ConceptDescription('urn:test:cd:nameplate')]);
    service.mergeAdditionalTemplateBundle(
      [
        updatedNameplate,
        createTemplateSubmodel({
          id: 'urn:test:handover',
          idShort: 'HandoverDocumentation',
          semanticId: 'urn:test:handover',
          templateId: 'urn:test:template:handover',
        }),
      ],
      [
        new aas.types.ConceptDescription('urn:test:cd:nameplate'),
        new aas.types.ConceptDescription('urn:test:cd:handover'),
      ],
    );

    expect(service.additionalV3Submodels).toHaveLength(2);
    expect(service.additionalV3Submodels[0].administration?.templateId).toBe('urn:test:template:nameplate:v2');
    expect(service.additionalV3ConceptDescriptions.map((conceptDescription) => conceptDescription.id)).toEqual([
      'urn:test:cd:nameplate',
      'urn:test:cd:handover',
    ]);
  });

  it('applies current aas defaults for kind and current year', () => {
    const service = createGeneratorService();
    const nameplateSubmodel = createTemplateSubmodel({
      id: 'urn:test:nameplate',
      idShort: 'Nameplate',
      semanticId: 'https://admin-shell.io/idta/nameplate/3/0/Nameplate',
      templateId: 'https://admin-shell.io/idta-02006-3-0',
    });
    nameplateSubmodel.submodelElements = [
      new aas.types.Property(aas.types.DataTypeDefXsd.String, undefined, undefined, 'YearOfConstruction'),
    ];

    service.additionalV3Submodels = [nameplateSubmodel];
    (service as any).generatorStateStore.initialize(
      new aas.types.AssetAdministrationShell(
        'https://example.com/ids/aas/example',
        new aas.types.AssetInformation(aas.types.AssetKind.Type),
      ),
      service.additionalV3Submodels,
      [],
    );

    service.applyCurrentAasDefaults({
      assetKind: 'Instance',
      initializeCurrentYear: true,
    });

    expect(service.getCurrentGeneratorRootShell()?.assetInformation.assetKind).toBe(aas.types.AssetKind.Instance);
    expect((service.additionalV3Submodels[0].submodelElements?.[0] as aas.types.Property).value).toBe(
      new Date().getFullYear().toString(),
    );
  });

  it('does not resync generator state store collections when they are already in sync', () => {
    const service = createGeneratorService();
    const conceptDescription = new aas.types.ConceptDescription('urn:test:cd');
    const submodel = createTemplateSubmodel({
      id: 'urn:test:submodel',
      idShort: 'TestSubmodel',
      semanticId: 'urn:test:semantic',
      templateId: 'urn:test:template',
    });
    const shell = new aas.types.AssetAdministrationShell(
      'https://example.com/ids/aas/example',
      new aas.types.AssetInformation(aas.types.AssetKind.Type),
    );
    const generatorStateStore = (service as any).generatorStateStore;

    service.additionalV3Submodels = [submodel];
    service.additionalV3ConceptDescriptions = [conceptDescription];
    generatorStateStore.initialize(shell, service.additionalV3Submodels, service.additionalV3ConceptDescriptions);

    const setSubmodelsSpy = vi.spyOn(generatorStateStore, 'setSubmodels');
    const setConceptDescriptionsSpy = vi.spyOn(generatorStateStore, 'setConceptDescriptions');

    expect(service.getCurrentGeneratorRootShell()).toBe(shell);
    expect(setSubmodelsSpy).not.toHaveBeenCalled();
    expect(setConceptDescriptionsSpy).not.toHaveBeenCalled();
  });
});
