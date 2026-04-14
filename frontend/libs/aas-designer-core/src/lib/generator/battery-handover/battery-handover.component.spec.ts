import { HandoverSemantics } from '@aas/helpers';
import { vi } from 'vitest';
import { syncDocumentationDocuments } from '../generator-documentation.builder';
import { BatteryHandoverComponent } from './battery-handover.component';

function createRouterMock() {
  return {
    navigate: vi.fn(),
  };
}

function createDialogServiceMock() {
  let closeHandler: ((value: any) => void) | null = null;

  return {
    open: vi.fn(() => ({
      onClose: {
        subscribe: vi.fn((handler: (value: any) => void) => {
          closeHandler = handler;
        }),
      },
    })),
    emitClose(value: any) {
      closeHandler?.(value);
    },
  };
}

function createTranslateServiceMock() {
  return {
    currentLang: 'en',
    instant: (key: string) => key,
  };
}

function createGeneratorService(additionalV3Submodels: any[] = []) {
  const uploadedFiles = new Map<string, { filename: string; contentType: string; file: File }>();
  let documentItems: any[] = [];

  const syncEditedGeneratorSubmodel = vi.fn((submodel: any) => {
    if (submodel == null) {
      return;
    }

    const existingIndex = additionalV3Submodels.findIndex(
      (candidate) => candidate.id === submodel.id || `${candidate.idShort ?? ''}` === `${submodel.idShort ?? ''}`,
    );

    if (existingIndex === -1) {
      additionalV3Submodels.push(submodel);
    } else {
      additionalV3Submodels[existingIndex] = submodel;
    }
  });

  const syncDocumentationSubmodelDocuments = vi.fn((nextItems: any[], submodel: any) => {
    const nextDocumentItems = [...nextItems];
    documentItems = nextDocumentItems;

    if (submodel != null) {
      syncDocumentationDocuments(submodel, {
        currentLanguage: 'en',
        documentItems: nextDocumentItems,
        requiredSemanticIds: [],
      });
      syncEditedGeneratorSubmodel(submodel);
    }
  });

  return {
    vwsTyp: 'battery-passport',
    additionalV3Submodels,
    batteryTechnicalDataEdited: false,
    getCurrentGeneratorRootShell: vi.fn(() => ({ idShort: 'batteryPassportAas' })),
    getCurrentGeneratorDocumentItems: vi.fn(() => [...documentItems]),
    navigateToNextGeneratorFlowStep: vi.fn(
      (targetRouter: { navigate: (commands: unknown[]) => void }, _stepId: string, fallbackCommands: unknown[]) =>
        targetRouter.navigate(fallbackCommands),
    ),
    navigateToPreviousGeneratorFlowStep: vi.fn(),
    getCurrentGeneratorDocumentationSemanticId: vi.fn(() => ''),
    buildDppFileKey: vi.fn((submodel: any, path: string[]) => `${submodel.id}::${path.join('>')}`),
    createDocument: vi.fn((count: number, _requiredSemanticIds: string[], document: any) => ({
      idShort: `Document${count.toString().padStart(2, '0')}`,
      semanticId: { keys: [{ value: '0173-1#02-ABI500#001/0173-1#01-AHF579#001' }] },
      value: [
        {
          idShort: 'DocumentVersion',
          semanticId: { keys: [{ value: '0173-1#02-ABI503#001/0173-1#01-AHF582#001' }] },
          value: [
            {
              idShort: 'File_List_V2',
              semanticId: { keys: [{ value: HandoverSemantics.FILE_LIST_V2 }] },
              value: [
                {
                  idShort: 'DigitalFile',
                  value: document.filePath ?? document.file?.name ?? '',
                  contentType: document.mimeType ?? '',
                },
              ],
            },
          ],
        },
      ],
    })),
    setDppUploadedFile: vi.fn((key: string, file: File) => {
      uploadedFiles.set(key, {
        filename: file.name,
        contentType: file.type,
        file,
        embeddedPath: `/aasx/files/${file.name}`,
      });
    }),
    getDppUploadedFile: vi.fn((key: string) => uploadedFiles.get(key) ?? null),
    removeDppUploadedFile: vi.fn((key: string) => uploadedFiles.delete(key)),
    syncEditedGeneratorSubmodel,
    syncDocumentationSubmodelDocuments,
  };
}

describe('BatteryHandoverComponent', () => {
  it('collects property, multilanguage property and file elements from the handover submodel', () => {
    const router = createRouterMock();
    const dialogService = createDialogServiceMock();
    const translateService = createTranslateServiceMock();
    const generatorService = createGeneratorService([
      {
        id: 'https://admin-shell.io/idta/SubmodelTemplate/DigitalBatteryPassport/HandoverDocumentation/1/0',
        idShort: 'HandoverDocumentation',
        submodelElements: [
          {
            idShort: 'GeneralInformation',
            value: [
              { idShort: 'DocumentTitle', modelType: 'Property', value: 'Battery passport' },
              {
                idShort: 'DocumentDescription',
                modelType: 'MultiLanguageProperty',
                value: [{ language: 'de', text: 'Beschreibung' }],
              },
              {
                idShort: 'Attachment',
                modelType: 'File',
                contentType: 'application/pdf',
                value: '/files/passport.pdf',
              },
            ],
          },
        ],
      },
    ]);

    const component = new BatteryHandoverComponent(
      router as never,
      generatorService as never,
      dialogService as never,
      translateService as never,
    );

    component.ngOnInit();

    expect(component.handoverFields.map((field) => field.type)).toEqual(['Property', 'MultiLanguageProperty', 'File']);
    expect(component.handoverGroups.map((group) => group.key)).toEqual(['documents', 'GeneralInformation']);
  });

  it('derives hierarchical step labels from the handover tree', () => {
    const component = new BatteryHandoverComponent(
      createRouterMock() as never,
      createGeneratorService() as never,
      createDialogServiceMock() as never,
      createTranslateServiceMock() as never,
    );

    component.handoverItems = [
      {
        key: 'documents',
        label: 'Documents',
        path: 'Documents',
        description: '',
        kind: 'special',
        fields: [],
        children: [],
      },
      {
        key: 'general',
        label: 'General',
        path: 'General',
        description: '',
        kind: 'container',
        fields: [],
        children: [
          {
            key: 'general__attachment',
            label: 'Attachment',
            path: 'General / Attachment',
            description: '',
            kind: 'field',
            fields: [],
            children: [],
          },
        ],
      },
    ] as any;

    component.activeItemKey = 'general__attachment';

    expect(component.activeStepLabel).toBe('2.1');
  });

  it('routes to additional DBP submodels after handover when further DBP submodels exist', () => {
    const router = createRouterMock();
    const dialogService = createDialogServiceMock();
    const translateService = createTranslateServiceMock();
    const generatorService = createGeneratorService([
      {
        id: 'https://admin-shell.io/idta/SubmodelTemplate/DigitalBatteryPassport/HandoverDocumentation/1/0',
        idShort: 'HandoverDocumentation',
        submodelElements: [],
      },
      {
        id: 'urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#Circularity/submodel',
        idShort: 'Circularity',
        submodelElements: [],
      },
    ]);

    const component = new BatteryHandoverComponent(
      router as never,
      generatorService as never,
      dialogService as never,
      translateService as never,
    );

    component.nextPage();

    expect(router.navigate).toHaveBeenCalledWith(['generator', 'battery-submodels', 0]);
  });

  it('stores and removes selected files via the generator service', () => {
    const router = createRouterMock();
    const dialogService = createDialogServiceMock();
    const translateService = createTranslateServiceMock();
    const generatorService = createGeneratorService([
      {
        id: 'https://admin-shell.io/idta/SubmodelTemplate/DigitalBatteryPassport/HandoverDocumentation/1/0',
        idShort: 'HandoverDocumentation',
        submodelElements: [
          {
            idShort: 'DigitalFiles',
            value: [
              {
                idShort: 'BatteryPassportPdf',
                modelType: 'File',
                contentType: '',
                value: '',
              },
            ],
          },
        ],
      },
    ]);

    const component = new BatteryHandoverComponent(
      router as never,
      generatorService as never,
      dialogService as never,
      translateService as never,
    );
    component.ngOnInit();

    const fileField = component.handoverFields.find((field) => field.type === 'File');
    expect(fileField).toBeDefined();

    const selectedFile = new File(['pdf'], 'battery-passport.pdf', { type: 'application/pdf' });
    component.onFileSelected(fileField!, { files: [selectedFile] } as never);

    expect(component.hasFileSelection(fileField!)).toBe(true);
    expect(component.getDisplayedFileName(fileField!)).toBe('battery-passport.pdf');
    expect(component.getDisplayedContentType(fileField!)).toBe('application/pdf');
    expect(fileField?.element.value).toBe('file:/aasx/files/battery-passport.pdf');
    expect(generatorService.syncEditedGeneratorSubmodel).toHaveBeenCalledWith(
      generatorService.additionalV3Submodels[0],
    );

    component.removeFileSelection(fileField!);

    expect(component.hasFileSelection(fileField!)).toBe(false);
    expect(fileField?.element.value).toBeNull();
    expect(fileField?.element.contentType).toBeNull();
  });

  it('loads existing handover documents as document entries', () => {
    const router = createRouterMock();
    const dialogService = createDialogServiceMock();
    const translateService = createTranslateServiceMock();
    const generatorService = createGeneratorService([
      {
        id: 'https://admin-shell.io/idta/SubmodelTemplate/DigitalBatteryPassport/HandoverDocumentation/1/0',
        idShort: 'HandoverDocumentation',
        submodelElements: [
          {
            idShort: 'Document00',
            semanticId: { keys: [{ value: '0173-1#02-ABI500#001/0173-1#01-AHF579#001' }] },
            value: [
              {
                idShort: 'DocumentId',
                semanticId: { keys: [{ value: '0173-1#02-ABI501#001/0173-1#01-AHF580#001' }] },
                value: [
                  { idShort: 'DocumentDomainId', value: 'domain' },
                  { idShort: 'ValueId', value: 'doc-1' },
                  { idShort: 'IsPrimary', value: 'true' },
                ],
              },
              {
                idShort: 'DocumentVersion',
                semanticId: { keys: [{ value: '0173-1#02-ABI503#001/0173-1#01-AHF582#001' }] },
                value: [
                  { idShort: 'Language', value: 'en' },
                  { idShort: 'DocumentVersionId', value: '1.0' },
                  { idShort: 'Title', value: [{ language: 'en', text: 'Battery passport PDF' }] },
                  { idShort: 'Summary', value: [{ language: 'en', text: 'Main export' }] },
                  { idShort: 'KeyWords', value: [{ language: 'en', text: 'passport' }] },
                  { idShort: 'StatusSetDate', value: '2024-01-10' },
                  { idShort: 'StatusValue', value: 'released' },
                  { idShort: 'OrganizationName', value: 'Org' },
                  { idShort: 'OrganizationOfficialName', value: 'Official Org' },
                  {
                    idShort: 'DigitalFile',
                    semanticId: { keys: [{ value: '0173-1#02-ABI504#001/0173-1#01-AHF583#001' }] },
                    value: 'battery-passport.pdf',
                    contentType: 'application/pdf',
                  },
                ],
              },
            ],
          },
        ],
      },
    ]);

    const component = new BatteryHandoverComponent(
      router as never,
      generatorService as never,
      dialogService as never,
      translateService as never,
    );

    component.ngOnInit();

    expect(component.handoverDocuments).toHaveLength(1);
    expect(component.getDocumentLabel(component.handoverDocuments[0], 0)).toContain('Battery passport PDF');
    expect(component.getDocumentFileName(component.handoverDocuments[0])).toBe('battery-passport.pdf');
  });

  it('ignores empty template placeholder documents in a top-level handover SML', () => {
    const router = createRouterMock();
    const dialogService = createDialogServiceMock();
    const translateService = createTranslateServiceMock();
    const generatorService = createGeneratorService([
      {
        id: 'https://admin-shell.io/idta/SubmodelTemplate/DigitalBatteryPassport/HandoverDocumentation/1/0',
        idShort: 'HandoverDocumentation',
        submodelElements: [
          {
            idShort: 'Documents',
            modelType: 'SubmodelElementList',
            semanticId: { keys: [{ value: HandoverSemantics.CONTAINER_V2 }] },
            value: [
              {
                idShort: 'document',
                modelType: 'SubmodelElementCollection',
                value: [
                  {
                    idShort: 'DocumentVersion',
                    modelType: 'SubmodelElementCollection',
                    value: [{ idShort: 'Title', modelType: 'MultiLanguageProperty', value: [] }],
                  },
                ],
              },
            ],
          },
        ],
      },
    ]);

    const component = new BatteryHandoverComponent(
      router as never,
      generatorService as never,
      dialogService as never,
      translateService as never,
    );

    component.ngOnInit();

    expect(component.handoverDocuments).toHaveLength(0);
    expect(component.handoverGroups.map((group) => group.key)).toEqual(['documents']);
  });

  it('adds a handover document through the shared document dialog', () => {
    const router = createRouterMock();
    const dialogService = createDialogServiceMock();
    const translateService = createTranslateServiceMock();
    const generatorService = createGeneratorService([
      {
        id: 'https://admin-shell.io/idta/SubmodelTemplate/DigitalBatteryPassport/HandoverDocumentation/1/0',
        idShort: 'HandoverDocumentation',
        submodelElements: [],
      },
    ]);

    const component = new BatteryHandoverComponent(
      router as never,
      generatorService as never,
      dialogService as never,
      translateService as never,
    );

    component.ngOnInit();
    component.startAddDocument();

    dialogService.emitClose({
      idShort: 'Document00',
      documentId: [{ documentDomainId: 'domain', valueId: 'doc-1', isPrimary: true }],
      documentClassification: [{ classId: '', className: [], classificationSystem: '' }],
      documentVersion: [
        {
          language: 'en',
          documentVersionId: '1.0',
          title: 'Battery Passport PDF',
          subtitle: '',
          summary: '',
          keywords: '',
          statusSetDate: new Date('2024-01-10'),
          statusValue: '',
          organizationName: '',
          organizationOfficialName: '',
          digitalFile: null,
          previewFile: null,
          refersTo: [],
          basedOn: [],
          translationOf: [],
        },
      ],
      filePath: 'battery-passport.pdf',
      file: null,
      mimeType: 'application/pdf',
    });

    expect(component.handoverDocuments).toHaveLength(1);
    expect(generatorService.syncDocumentationSubmodelDocuments).toHaveBeenCalled();
    expect(generatorService.additionalV3Submodels[0].submodelElements[0]?.idShort).toBe('Document00');
  });

  it('preserves non-document template elements when syncing documents', () => {
    const router = createRouterMock();
    const dialogService = createDialogServiceMock();
    const translateService = createTranslateServiceMock();
    const generatorService = createGeneratorService([
      {
        id: 'https://admin-shell.io/idta/SubmodelTemplate/DigitalBatteryPassport/HandoverDocumentation/1/0',
        idShort: 'HandoverDocumentation',
        submodelElements: [
          {
            idShort: 'Documents',
            semanticId: { keys: [{ value: HandoverSemantics.CONTAINER_V2 }] },
            value: [{ idShort: 'Title', modelType: 'Property', value: 'Keep me' }],
          },
        ],
      },
    ]);

    const component = new BatteryHandoverComponent(
      router as never,
      generatorService as never,
      dialogService as never,
      translateService as never,
    );

    component.ngOnInit();
    component['handoverDocuments'] = [
      {
        documentId: [{ documentDomainId: 'domain', valueId: 'doc-1', isPrimary: true }],
        documentClassification: [],
        documentVersion: [
          {
            language: 'en',
            documentVersionId: '1.0',
            title: 'Battery Passport PDF',
            subtitle: '',
            summary: '',
            keywords: '',
            statusSetDate: new Date('2024-01-10'),
            statusValue: '',
            organizationName: '',
            organizationOfficialName: '',
            digitalFile: null,
            previewFile: null,
            refersTo: [],
            basedOn: [],
            translationOf: [],
          },
        ],
        filePath: 'battery-passport.pdf',
        file: null,
        mimeType: 'application/pdf',
      },
    ] as any;

    component['syncHandoverDocuments']();

    const serializedSubmodel = JSON.stringify(generatorService.additionalV3Submodels[0]);
    expect(generatorService.syncDocumentationSubmodelDocuments).toHaveBeenCalled();
    expect(serializedSubmodel).toContain('"idShort":"Title"');
    expect(serializedSubmodel).toContain('"idShort":"Document00"');
  });

  it('reads and writes documents via a top-level document SML host', () => {
    const router = createRouterMock();
    const dialogService = createDialogServiceMock();
    const translateService = createTranslateServiceMock();
    const generatorService = createGeneratorService([
      {
        id: 'https://admin-shell.io/idta/SubmodelTemplate/DigitalBatteryPassport/HandoverDocumentation/1/0',
        idShort: 'HandoverDocumentation',
        submodelElements: [
          {
            idShort: 'Documents',
            modelType: 'SubmodelElementList',
            semanticId: { keys: [{ value: HandoverSemantics.CONTAINER_V2 }] },
            value: [
              {
                idShort: 'KeepMe',
                modelType: 'Property',
                value: 'Title',
              },
              {
                idShort: 'Document00',
                semanticId: { keys: [{ value: HandoverSemantics.DOCUMENT_V2 }] },
                value: [
                  {
                    idShort: 'DocumentId',
                    semanticId: { keys: [{ value: '0173-1#02-ABI501#001/0173-1#01-AHF580#001' }] },
                    value: [
                      { idShort: 'DocumentDomainId', value: 'domain' },
                      { idShort: 'ValueId', value: 'doc-1' },
                      { idShort: 'IsPrimary', value: 'true' },
                    ],
                  },
                  {
                    idShort: 'DocumentVersion',
                    semanticId: { keys: [{ value: '0173-1#02-ABI503#001/0173-1#01-AHF582#001' }] },
                    value: [
                      { idShort: 'Language', value: 'en' },
                      { idShort: 'DocumentVersionId', value: '1.0' },
                      { idShort: 'Title', value: [{ language: 'en', text: 'Battery passport PDF' }] },
                      {
                        idShort: 'File_List_V2',
                        semanticId: { keys: [{ value: HandoverSemantics.FILE_LIST_V2 }] },
                        value: [
                          {
                            idShort: 'DigitalFile',
                            value: 'battery-passport.pdf',
                            contentType: 'application/pdf',
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ]);

    const component = new BatteryHandoverComponent(
      router as never,
      generatorService as never,
      dialogService as never,
      translateService as never,
    );

    component.ngOnInit();

    expect(component.handoverDocumentCount).toBe(1);
    expect(component.getDocumentFileName(component.handoverDocuments[0])).toBe('battery-passport.pdf');

    component['handoverDocuments'] = [
      {
        idShort: 'Document00',
        documentId: [{ documentDomainId: 'domain', valueId: 'doc-1', isPrimary: true }],
        documentClassification: [],
        documentVersion: [
          {
            language: 'en',
            documentVersionId: '1.0',
            title: 'Battery Passport PDF',
            subtitle: '',
            summary: '',
            keywords: '',
            statusSetDate: new Date('2024-01-10'),
            statusValue: '',
            organizationName: '',
            organizationOfficialName: '',
            digitalFile: null,
            previewFile: null,
            refersTo: [],
            basedOn: [],
            translationOf: [],
          },
        ],
        filePath: 'battery-passport.pdf',
        file: null,
        mimeType: 'application/pdf',
      },
    ] as any;

    component['syncHandoverDocuments']();

    const documentList = generatorService.additionalV3Submodels[0].submodelElements[0];
    expect(documentList.value.some((element: any) => element.idShort === 'KeepMe')).toBe(true);
    expect(documentList.value.some((element: any) => element.idShort === 'Document00')).toBe(true);
  });

  it('falls back to numbering-only document labels when no document metadata exists', () => {
    const router = createRouterMock();
    const dialogService = createDialogServiceMock();
    const translateService = createTranslateServiceMock();
    const generatorService = createGeneratorService();

    const component = new BatteryHandoverComponent(
      router as never,
      generatorService as never,
      dialogService as never,
      translateService as never,
    );

    expect(
      component.getDocumentLabel(
        {
          idShort: '',
          documentId: [{ documentDomainId: '', valueId: '', isPrimary: true }],
          documentClassification: [],
          documentVersion: [
            {
              language: 'en',
              documentVersionId: '',
              title: '',
              subtitle: '',
              summary: '',
              keywords: '',
              statusSetDate: new Date('2024-01-10'),
              statusValue: '',
              organizationName: '',
              organizationOfficialName: '',
              digitalFile: null,
              previewFile: null,
              refersTo: [],
              basedOn: [],
              translationOf: [],
            },
          ],
          filePath: '',
          file: null,
          mimeType: '',
        } as any,
        0,
      ),
    ).toBe('1');
  });
});
