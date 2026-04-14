import { vi } from 'vitest';
import { BatteryTechnicalDataComponent } from './battery-technical-data.component';

function createTranslateServiceMock() {
  return {
    currentLang: 'en',
    getDefaultLang: () => 'en',
    instant: (key: string) => key,
  };
}

describe('BatteryTechnicalDataComponent', () => {
  it('navigates to battery-handover on nextPage', () => {
    const router = {
      navigate: vi.fn(),
    };
    const generatorService = {
      batteryTechnicalDataEdited: false,
      getCurrentGeneratorRootShell: vi.fn(() => ({})),
      navigateToNextGeneratorFlowStep: vi.fn(
        (targetRouter: typeof router, _stepId: string, fallbackCommands: unknown[]) =>
          targetRouter.navigate(fallbackCommands as never),
      ),
      navigateToPreviousGeneratorFlowStep: vi.fn(),
    };

    const component = new BatteryTechnicalDataComponent(
      router as never,
      generatorService as never,
      createTranslateServiceMock() as never,
    );

    component.nextPage();

    expect(generatorService.batteryTechnicalDataEdited).toBe(true);
    expect(router.navigate).toHaveBeenCalledWith(['generator', 'battery-handover']);
  });

  it('keeps property and multilanguage fields functional', () => {
    const router = {
      navigate: vi.fn(),
    };
    const generatorService = {
      vwsTyp: 'battery-passport',
      batteryTechnicalDataEdited: false,
      getCurrentGeneratorRootShell: vi.fn(() => ({})),
      getCurrentGeneratorConceptDescriptions: vi.fn(() => []),
      buildDppFileKey: vi.fn((submodel: any, path: string[]) => `${submodel.id}::${path.join('>')}`),
      navigateToNextGeneratorFlowStep: vi.fn(),
      navigateToPreviousGeneratorFlowStep: vi.fn(),
      additionalV3Submodels: [
        {
          id: 'https://admin-shell.io/idta/SubmodelTemplate/DigitalBatteryPassport/TechnicalData/1/0',
          idShort: 'TechnicalData',
          submodelElements: [
            {
              idShort: 'General',
              value: [
                {
                  idShort: 'BatteryType',
                  modelType: 'Property',
                  valueType: 'xs:string',
                  value: 'LFP',
                },
                {
                  idShort: 'MarketingText',
                  modelType: 'MultiLanguageProperty',
                  value: [{ language: 'en', text: 'Battery' }],
                },
              ],
            },
          ],
        },
      ],
    };

    const component = new BatteryTechnicalDataComponent(
      router as never,
      generatorService as never,
      createTranslateServiceMock() as never,
    );

    component.ngOnInit();

    expect(component.activeGroup?.fields.map((field) => field.type)).toEqual(['Property', 'MultiLanguageProperty']);

    const propertyField = component.activeGroup?.fields.find((field) => field.type === 'Property');
    propertyField!.element.value = 'NMC';
    component.onFieldChanged();

    expect(generatorService.batteryTechnicalDataEdited).toBe(true);
    expect(propertyField?.element.value).toBe('NMC');
  });

  it('derives hierarchical step labels from the technical data tree', () => {
    const router = {
      navigate: vi.fn(),
    };
    const generatorService = {
      batteryTechnicalDataEdited: false,
      getCurrentGeneratorRootShell: vi.fn(() => ({})),
      navigateToNextGeneratorFlowStep: vi.fn(),
      navigateToPreviousGeneratorFlowStep: vi.fn(),
    };

    const component = new BatteryTechnicalDataComponent(
      router as never,
      generatorService as never,
      createTranslateServiceMock() as never,
    );

    component.technicalDataItems = [
      {
        key: 'general',
        label: 'General',
        path: 'General',
        description: '',
        kind: 'container',
        fields: [],
        children: [
          {
            key: 'general__batteryType',
            label: 'Battery Type',
            path: 'General / Battery Type',
            description: '',
            kind: 'field',
            fields: [],
            children: [],
          },
        ],
      },
      {
        key: 'compliance',
        label: 'Compliance',
        path: 'Compliance',
        description: '',
        kind: 'field',
        fields: [],
        children: [],
      },
    ] as any;
    component.activeItemKey = 'general__batteryType';

    expect(component.activeStepLabel).toBe('1.1');
  });

  it('collects range, reference, blob and unsupported fields from technical data', () => {
    const router = {
      navigate: vi.fn(),
    };
    const generatorService = {
      vwsTyp: 'battery-passport',
      batteryTechnicalDataEdited: false,
      getCurrentGeneratorRootShell: vi.fn(() => ({})),
      getCurrentGeneratorConceptDescriptions: vi.fn(() => []),
      buildDppFileKey: vi.fn((submodel: any, path: string[]) => `${submodel.id}::${path.join('>')}`),
      navigateToNextGeneratorFlowStep: vi.fn(),
      navigateToPreviousGeneratorFlowStep: vi.fn(),
      additionalV3Submodels: [
        {
          id: 'https://admin-shell.io/idta/SubmodelTemplate/DigitalBatteryPassport/TechnicalData/1/0',
          idShort: 'TechnicalData',
          submodelElements: [
            {
              idShort: 'Measurements',
              value: [
                {
                  idShort: 'OperatingWindow',
                  modelType: 'Range',
                  valueType: 'xs:decimal',
                  min: '1',
                  max: '5',
                },
                {
                  idShort: 'ManualReference',
                  modelType: 'ReferenceElement',
                  value: {
                    type: 'ExternalReference',
                    keys: [{ type: 'GlobalReference', value: 'urn:test:manual' }],
                  },
                },
                {
                  idShort: 'FutureThing',
                  modelType: 'Blob',
                  contentType: 'application/json',
                  value: 'abc',
                },
                {
                  idShort: 'StillUnsupported',
                  modelType: 'Entity',
                  value: 'abc',
                },
              ],
            },
          ],
        },
      ],
    };

    const component = new BatteryTechnicalDataComponent(
      router as never,
      generatorService as never,
      createTranslateServiceMock() as never,
    );

    component.ngOnInit();

    expect(component.activeGroup?.fields.map((field) => field.type)).toEqual(
      expect.arrayContaining(['Range', 'ReferenceElement', 'Blob', 'Unsupported']),
    );
  });

  it('tolerates empty or irregular technical data structures without crashing', () => {
    const router = {
      navigate: vi.fn(),
    };
    const generatorService = {
      vwsTyp: 'battery-passport',
      batteryTechnicalDataEdited: false,
      getCurrentGeneratorRootShell: vi.fn(() => ({})),
      getCurrentGeneratorConceptDescriptions: vi.fn(() => []),
      buildDppFileKey: vi.fn((submodel: any, path: string[]) => `${submodel.id}::${path.join('>')}`),
      navigateToNextGeneratorFlowStep: vi.fn(),
      navigateToPreviousGeneratorFlowStep: vi.fn(),
      additionalV3Submodels: [
        {
          id: 'https://admin-shell.io/idta/SubmodelTemplate/DigitalBatteryPassport/TechnicalData/1/0',
          idShort: 'TechnicalData',
          submodelElements: [
            null,
            {
              idShort: 'EmptyCollection',
              modelType: 'SubmodelElementCollection',
              value: [],
            },
            {
              idShort: 'WeirdNode',
              modelType: 'SubmodelElementCollection',
              value: null,
            },
          ],
        },
      ],
    };

    const component = new BatteryTechnicalDataComponent(
      router as never,
      generatorService as never,
      createTranslateServiceMock() as never,
    );

    expect(() => component.ngOnInit()).not.toThrow();
    expect(component.technicalDataFields).toEqual([]);
    expect(component.technicalDataGroups).toEqual([]);
  });

  it('handles file elements with the shared generator upload flow', async () => {
    const router = {
      navigate: vi.fn(),
    };
    const uploadedFiles = new Map<string, { file: File; filename: string; contentType: string }>();
    const generatorService = {
      vwsTyp: 'battery-passport',
      batteryTechnicalDataEdited: false,
      getCurrentGeneratorRootShell: vi.fn(() => ({})),
      getCurrentGeneratorConceptDescriptions: vi.fn(() => []),
      buildDppFileKey: vi.fn((submodel: any, path: string[]) => `${submodel.id}::${path.join('>')}`),
      setDppUploadedFile: vi.fn((key: string, file: File) => {
        uploadedFiles.set(key, { file, filename: file.name, contentType: file.type });
      }),
      getDppUploadedFile: vi.fn((key: string) => uploadedFiles.get(key) ?? null),
      removeDppUploadedFile: vi.fn((key: string) => {
        uploadedFiles.delete(key);
      }),
      navigateToNextGeneratorFlowStep: vi.fn(),
      navigateToPreviousGeneratorFlowStep: vi.fn(),
      additionalV3Submodels: [
        {
          id: 'https://admin-shell.io/idta/SubmodelTemplate/DigitalBatteryPassport/TechnicalData/1/0',
          idShort: 'TechnicalData',
          submodelElements: [
            {
              idShort: 'Visuals',
              value: [
                {
                  idShort: 'CompanyLogo',
                  modelType: 'File',
                  contentType: 'image/png',
                  value: 'file:/aasx/files/company-logo.png',
                },
              ],
            },
          ],
        },
      ],
    };

    const component = new BatteryTechnicalDataComponent(
      router as never,
      generatorService as never,
      createTranslateServiceMock() as never,
    );

    component.ngOnInit();

    const fileField = component.activeGroup?.fields.find((field) => field.type === 'File');
    expect(fileField).toBeDefined();
    expect(component.getDisplayedFileName(fileField!)).toBe('company-logo.png');
    expect(component.getStoredFileReference(fileField!)).toBe('file:/aasx/files/company-logo.png');

    const selectedFile = new File(['logo'], 'company-logo-new.png', { type: 'image/png' });
    component.onFileSelected(fileField!, { files: [selectedFile] } as never);

    expect(component.hasFileSelection(fileField!)).toBe(true);
    expect(component.getDisplayedFileName(fileField!)).toBe('company-logo-new.png');

    component.removeFileSelection(fileField!);

    expect(component.getStoredFileReference(fileField!)).toBeNull();
    expect(component.hasFileSelection(fileField!)).toBe(false);
  });
});
