import { vi } from 'vitest';
import { BatterySubmodelsComponent } from './battery-submodels.component';

function createTranslateServiceMock() {
  return {
    currentLang: 'en',
    getDefaultLang: () => 'en',
    instant: (key: string) => key,
  };
}

describe('BatterySubmodelsComponent', () => {
  it('navigates back to battery-handover when no carbon footprint step exists', () => {
    const router = {
      navigate: vi.fn(),
    };
    const route = {
      paramMap: {
        subscribe: vi.fn(),
      },
    };
    const generatorService = {
      additionalV3Submodels: [],
      getCurrentGeneratorRootShell: vi.fn(() => ({})),
      navigateToPreviousGeneratorFlowStep: vi.fn(
        (targetRouter: typeof router, _stepId: string, fallbackCommands: unknown[]) =>
          targetRouter.navigate(fallbackCommands as never),
      ),
      navigateToNextGeneratorFlowStep: vi.fn(),
    };

    const component = new BatterySubmodelsComponent(
      route as never,
      router as never,
      generatorService as never,
      createTranslateServiceMock() as never,
    );

    component.prevPage();

    expect(router.navigate).toHaveBeenCalledWith(['generator', 'battery-handover']);
  });

  it('keeps property and multilanguage fields functional in additional DBP submodels', () => {
    const router = {
      navigate: vi.fn(),
    };
    const route = {
      paramMap: {
        subscribe: vi.fn((callback: (value: { get: (key: string) => string }) => void) => {
          callback({
            get: () => '0',
          });
        }),
      },
    };
    const generatorService = {
      vwsTyp: 'battery-passport',
      batteryTechnicalDataEdited: false,
      getCurrentGeneratorRootShell: vi.fn(() => ({})),
      getCurrentGeneratorConceptDescriptions: vi.fn(() => []),
      navigateToPreviousGeneratorFlowStep: vi.fn(),
      navigateToNextGeneratorFlowStep: vi.fn(),
      additionalV3Submodels: [
        {
          id: 'urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#Circularity/submodel',
          idShort: 'Circularity',
          submodelElements: [
            {
              idShort: 'CircularityPassport',
              value: [
                {
                  idShort: 'CurrentStatus',
                  modelType: 'Property',
                  valueType: 'xs:string',
                  value: 'Active',
                },
                {
                  idShort: 'StatusLabel',
                  modelType: 'MultiLanguageProperty',
                  value: [{ language: 'en', text: 'Active' }],
                },
              ],
            },
          ],
        },
      ],
      buildDppFileKey: vi.fn((submodel: any, path: string[]) => `${submodel.id}::${path.join('>')}`),
      setDppUploadedFile: vi.fn(),
      getDppUploadedFile: vi.fn(() => null),
      removeDppUploadedFile: vi.fn(),
    };

    const component = new BatterySubmodelsComponent(
      route as never,
      router as never,
      generatorService as never,
      createTranslateServiceMock() as never,
    );

    component.ngOnInit();

    expect(component.activeModel?.groups[0].fields.map((field) => field.type)).toEqual([
      'Property',
      'MultiLanguageProperty',
    ]);

    const propertyField = component.activeModel?.groups[0].fields.find((field) => field.type === 'Property');
    propertyField!.element.value = 'Inactive';
    component.onFieldChanged();

    expect(generatorService.batteryTechnicalDataEdited).toBe(true);
    expect(propertyField?.element.value).toBe('Inactive');
  });

  it('derives hierarchical step labels from the active submodel tree', () => {
    const router = {
      navigate: vi.fn(),
    };
    const route = {
      paramMap: {
        subscribe: vi.fn(),
      },
    };
    const component = new BatterySubmodelsComponent(
      route as never,
      router as never,
      {
        navigateToPreviousGeneratorFlowStep: vi.fn(),
        navigateToNextGeneratorFlowStep: vi.fn(),
      } as never,
      createTranslateServiceMock() as never,
    );

    component.editorModels = [
      {
        submodel: {},
        items: [
          {
            key: 'circularity',
            label: 'Circularity',
            path: 'Circularity',
            description: '',
            kind: 'container',
            fields: [],
            children: [
              {
                key: 'circularity__status',
                label: 'Status',
                path: 'Circularity / Status',
                description: '',
                kind: 'field',
                fields: [],
                children: [],
              },
            ],
          },
        ],
        nodes: [],
        groups: [],
      },
    ] as any;
    component.activeSubmodelIndex = 0;
    component.activeItemKey = 'circularity__status';

    expect(component.activeStepLabel).toBe('1.1');
  });

  it('collects file elements from additional DBP submodels', () => {
    const router = {
      navigate: vi.fn(),
    };
    const route = {
      paramMap: {
        subscribe: vi.fn((callback: (value: { get: (key: string) => string }) => void) => {
          callback({
            get: () => '0',
          });
        }),
      },
    };
    const generatorService = {
      vwsTyp: 'battery-passport',
      batteryTechnicalDataEdited: false,
      getCurrentGeneratorRootShell: vi.fn(() => ({})),
      getCurrentGeneratorConceptDescriptions: vi.fn(() => []),
      navigateToPreviousGeneratorFlowStep: vi.fn(),
      navigateToNextGeneratorFlowStep: vi.fn(),
      additionalV3Submodels: [
        {
          id: 'urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#Circularity/submodel',
          idShort: 'Circularity',
          submodelElements: [
            {
              idShort: 'CircularityPassport',
              value: [
                {
                  idShort: 'CircularityAttachment',
                  modelType: 'File',
                  contentType: 'application/pdf',
                  value: '',
                },
              ],
            },
          ],
        },
      ],
      buildDppFileKey: vi.fn((submodel: any, path: string[]) => `${submodel.id}::${path.join('>')}`),
      setDppUploadedFile: vi.fn(),
      getDppUploadedFile: vi.fn(() => null),
      removeDppUploadedFile: vi.fn(),
    };

    const component = new BatterySubmodelsComponent(
      route as never,
      router as never,
      generatorService as never,
      createTranslateServiceMock() as never,
    );

    component.ngOnInit();

    expect(component.activeModel?.groups[0].fields.map((field) => field.type)).toContain('File');
  });

  it('collects range, reference, blob and unsupported fields from additional DBP submodels', () => {
    const router = {
      navigate: vi.fn(),
    };
    const route = {
      paramMap: {
        subscribe: vi.fn((callback: (value: { get: (key: string) => string }) => void) => {
          callback({
            get: () => '0',
          });
        }),
      },
    };
    const generatorService = {
      vwsTyp: 'battery-passport',
      batteryTechnicalDataEdited: false,
      getCurrentGeneratorRootShell: vi.fn(() => ({})),
      getCurrentGeneratorConceptDescriptions: vi.fn(() => []),
      navigateToPreviousGeneratorFlowStep: vi.fn(),
      navigateToNextGeneratorFlowStep: vi.fn(),
      additionalV3Submodels: [
        {
          id: 'urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#Circularity/submodel',
          idShort: 'Circularity',
          submodelElements: [
            {
              idShort: 'CircularityPassport',
              value: [
                {
                  idShort: 'ReuseCycles',
                  modelType: 'Range',
                  valueType: 'xs:int',
                  min: '1',
                  max: '10',
                },
                {
                  idShort: 'EvidenceReference',
                  modelType: 'ReferenceElement',
                  value: {
                    type: 'ExternalReference',
                    keys: [{ type: 'GlobalReference', value: 'urn:test:evidence' }],
                  },
                },
                {
                  idShort: 'FutureBlob',
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
      buildDppFileKey: vi.fn((submodel: any, path: string[]) => `${submodel.id}::${path.join('>')}`),
      setDppUploadedFile: vi.fn(),
      getDppUploadedFile: vi.fn(() => null),
      removeDppUploadedFile: vi.fn(),
    };

    const component = new BatterySubmodelsComponent(
      route as never,
      router as never,
      generatorService as never,
      createTranslateServiceMock() as never,
    );

    component.ngOnInit();

    expect(component.activeModel?.groups[0].fields.map((field) => field.type)).toEqual(
      expect.arrayContaining(['Range', 'ReferenceElement', 'Blob', 'Unsupported']),
    );
  });

  it('tolerates empty or irregular additional submodel structures without crashing', () => {
    const router = {
      navigate: vi.fn(),
    };
    const route = {
      paramMap: {
        subscribe: vi.fn((callback: (value: { get: (key: string) => string }) => void) => {
          callback({
            get: () => '0',
          });
        }),
      },
    };
    const generatorService = {
      vwsTyp: 'battery-passport',
      batteryTechnicalDataEdited: false,
      getCurrentGeneratorRootShell: vi.fn(() => ({})),
      getCurrentGeneratorConceptDescriptions: vi.fn(() => []),
      navigateToPreviousGeneratorFlowStep: vi.fn(),
      navigateToNextGeneratorFlowStep: vi.fn(),
      additionalV3Submodels: [
        {
          id: 'urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#Circularity/submodel',
          idShort: 'Circularity',
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
      buildDppFileKey: vi.fn((submodel: any, path: string[]) => `${submodel.id}::${path.join('>')}`),
      setDppUploadedFile: vi.fn(),
      getDppUploadedFile: vi.fn(() => null),
      removeDppUploadedFile: vi.fn(),
    };

    const component = new BatterySubmodelsComponent(
      route as never,
      router as never,
      generatorService as never,
      createTranslateServiceMock() as never,
    );

    expect(() => component.ngOnInit()).not.toThrow();
    expect(component.activeModel?.groups).toEqual([]);
  });
});
