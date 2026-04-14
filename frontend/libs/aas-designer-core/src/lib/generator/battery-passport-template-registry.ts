import * as aas from '@aas-core-works/aas-core3.1-typescript';

export type BatteryPassportTemplateEditorKind =
  | 'guided-nameplate'
  | 'guided-handover'
  | 'guided-technical-data'
  | 'guided-carbon-footprint'
  | 'generic-dbp-submodel'
  | 'display-only'
  | 'unknown';

export type BatteryPassportTemplateKey =
  | 'digital-nameplate'
  | 'handover-documentation'
  | 'product-carbon-footprint'
  | 'technical-data'
  | 'product-condition'
  | 'material-composition'
  | 'circularity';

export interface BatteryPassportTemplateDefinition {
  key: BatteryPassportTemplateKey;
  displayKey: string;
  flowOrder: number;
  required: boolean;
  editorKind: BatteryPassportTemplateEditorKind;
  exactTemplateIds: string[];
  exactSubmodelIds: string[];
  exactSemanticIds: string[];
  aliasSemanticIds: string[];
  fallbackSemanticFragments: string[];
  fallbackIdShortFragments: string[];
}

const primaryFlowExcludedKeys: BatteryPassportTemplateKey[] = [
  'digital-nameplate',
  'handover-documentation',
  'technical-data',
  'product-carbon-footprint',
];

export const BATTERY_PASSPORT_TEMPLATE_REGISTRY: BatteryPassportTemplateDefinition[] = [
  {
    key: 'digital-nameplate',
    displayKey: 'DIGITAL_NAMEPLATE',
    flowOrder: 10,
    required: true,
    editorKind: 'guided-nameplate',
    exactTemplateIds: ['https://admin-shell.io/idta-02035-1'],
    exactSubmodelIds: ['https://admin-shell.io/idta/SubmodelTemplate/DigitalBatteryPassport/DigitalNameplate/1/0'],
    exactSemanticIds: ['https://admin-shell.io/idta/digitalbatterypassport/nameplate/1/0/Nameplate'],
    aliasSemanticIds: [
      'urn:samm:io.admin-shell.idta.batterypass.digital_nameplate:1.0.0',
      'urn:samm:io.admin-shell.idta.digital_nameplate:3.0.0',
      'https://admin-shell.io/idta/nameplate/3/0/Nameplate',
    ],
    fallbackSemanticFragments: ['digitalbatterypassport/nameplate', 'batterypass.digital_nameplate'],
    fallbackIdShortFragments: ['batterynameplate', 'digitalnameplate', 'digital_nameplate'],
  },
  {
    key: 'handover-documentation',
    displayKey: 'HANDOVER_DOCUMENTATION',
    flowOrder: 20,
    required: true,
    editorKind: 'guided-handover',
    exactTemplateIds: ['https://admin-shell.io/idta-02035-2'],
    exactSubmodelIds: ['https://admin-shell.io/idta/SubmodelTemplate/DigitalBatteryPassport/HandoverDocumentation/1/0'],
    exactSemanticIds: ['0173-1#01-AHF578#003'],
    aliasSemanticIds: ['urn:samm:io.admin-shell.idta.batterypass.handover_documentation:1.0.0#HandoverDocumentation'],
    fallbackSemanticFragments: ['batterypass.handover_documentation', 'handoverdocumentation'],
    fallbackIdShortFragments: ['handoverdocumentation', 'handover_documentation'],
  },
  {
    key: 'product-carbon-footprint',
    displayKey: 'PRODUCT_CARBON_FOOTPRINT',
    flowOrder: 30,
    required: false,
    editorKind: 'guided-carbon-footprint',
    exactTemplateIds: ['https://admin-shell.io/idta-02023-1-0'],
    exactSubmodelIds: ['https://admin-shell.io/idta/SubmodelTemplate/DigitalBatteryPassport/CarbonFootprint/1/0'],
    exactSemanticIds: ['https://admin-shell.io/idta/CarbonFootprint/CarbonFootprint/1/0'],
    aliasSemanticIds: [
      'urn:samm:io.admin-shell.idta.batterypass.carbon_footprint:1.0.0#CarbonFootprintBattery',
      'https://admin-shell.io/idta/CarbonFootprint/1/0',
    ],
    fallbackSemanticFragments: ['digitalbatterypassport/carbonfootprint', 'batterypass.carbon_footprint'],
    fallbackIdShortFragments: ['carbonfootprintfordbpaas', 'carbonfootprint', 'productcarbonfootprints'],
  },
  {
    key: 'technical-data',
    displayKey: 'TECHNICAL_DATA',
    flowOrder: 40,
    required: true,
    editorKind: 'guided-technical-data',
    exactTemplateIds: ['idta-02003-2-0'],
    exactSubmodelIds: ['https://admin-shell.io/idta/SubmodelTemplate/DigitalBatteryPassport/TechnicalData/1/0'],
    exactSemanticIds: ['https://admin-shell.io/idta/digitalbatterypassport/TechnicalData/1/0'],
    aliasSemanticIds: [
      '0173-1#01-AHX837#002',
      'urn:samm:io.admin-shell.idta.batterypass.technical_data:1.0.0#TechnicalData',
    ],
    fallbackSemanticFragments: ['digitalbatterypassport/technicaldata', 'batterypass.technical_data'],
    fallbackIdShortFragments: ['technicaldata'],
  },
  {
    key: 'product-condition',
    displayKey: 'BATTERY_PASSPORT_PRODUCT_CONDITION',
    flowOrder: 50,
    required: false,
    editorKind: 'generic-dbp-submodel',
    exactTemplateIds: ['https://admin-shell.io/idta-02035-5'],
    exactSubmodelIds: ['urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#ProductCondition/submodel'],
    exactSemanticIds: ['urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#ProductCondition'],
    aliasSemanticIds: [],
    fallbackSemanticFragments: ['batterypass.product_condition'],
    fallbackIdShortFragments: ['productcondition'],
  },
  {
    key: 'material-composition',
    displayKey: 'BATTERY_PASSPORT_MATERIAL_COMPOSITION',
    flowOrder: 60,
    required: false,
    editorKind: 'generic-dbp-submodel',
    exactTemplateIds: ['https://admin-shell.io/idta-02035-6'],
    exactSubmodelIds: [
      'urn:samm:io.admin-shell.idta.batterypass.material_composition:1.0.0#MaterialComposition/submodel',
    ],
    exactSemanticIds: ['urn:samm:io.admin-shell.idta.batterypass.material_composition:1.0.0#MaterialComposition'],
    aliasSemanticIds: [],
    fallbackSemanticFragments: ['batterypass.material_composition'],
    fallbackIdShortFragments: ['materialcomposition'],
  },
  {
    key: 'circularity',
    displayKey: 'BATTERY_PASSPORT_CIRCULARITY',
    flowOrder: 70,
    required: false,
    editorKind: 'generic-dbp-submodel',
    exactTemplateIds: ['https://admin-shell.io/idta-02035-7'],
    exactSubmodelIds: ['urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#Circularity/submodel'],
    exactSemanticIds: ['urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#Circularity'],
    aliasSemanticIds: [],
    fallbackSemanticFragments: ['batterypass.circularity'],
    fallbackIdShortFragments: ['circularity'],
  },
];

export function getBatteryPassportTemplateDefinitions() {
  return [...BATTERY_PASSPORT_TEMPLATE_REGISTRY];
}

export function getBatteryPassportTemplateDefinitionsInFlowOrder() {
  return [...BATTERY_PASSPORT_TEMPLATE_REGISTRY].sort((left, right) => left.flowOrder - right.flowOrder);
}

export function getBatteryPassportTemplateDefinition(key: BatteryPassportTemplateKey) {
  return BATTERY_PASSPORT_TEMPLATE_REGISTRY.find((definition) => definition.key === key) ?? null;
}

export function getBatteryPassportTemplateKey(submodel: aas.types.Submodel | null | undefined) {
  return classifyBatteryPassportSubmodel(submodel)?.key ?? null;
}

export function getBatteryPassportSubmodel(submodels: aas.types.Submodel[], key: BatteryPassportTemplateKey) {
  return submodels.find((submodel) => getBatteryPassportTemplateKey(submodel) === key);
}

export function hasBatteryPassportSubmodel(submodels: aas.types.Submodel[], key: BatteryPassportTemplateKey) {
  return getBatteryPassportSubmodel(submodels, key) != null;
}

export function getBatteryPassportAdditionalSubmodels(
  submodels: aas.types.Submodel[],
  excludedKeys: BatteryPassportTemplateKey[] = primaryFlowExcludedKeys,
) {
  return submodels.filter((submodel) => {
    const key = getBatteryPassportTemplateKey(submodel);
    return key == null || !excludedKeys.includes(key);
  });
}

export function classifyBatteryPassportSubmodel(submodel: aas.types.Submodel | null | undefined) {
  if (submodel == null) {
    return null;
  }

  for (const definition of getBatteryPassportTemplateDefinitionsInFlowOrder()) {
    if (matchesBatteryPassportTemplateDefinition(submodel, definition)) {
      return definition;
    }
  }

  return null;
}

export function matchesBatteryPassportTemplateDefinition(
  submodel: aas.types.Submodel | null | undefined,
  definition: BatteryPassportTemplateDefinition,
) {
  if (submodel == null) {
    return false;
  }

  const templateId = getSubmodelTemplateId(submodel);
  const submodelId = getSubmodelId(submodel);
  const idShort = getIdShort(submodel);
  const semanticValues = getSubmodelSemanticValues(submodel);
  const batteryPassportContext = hasBatteryPassportContext([submodelId, templateId, idShort, ...semanticValues]);

  if (matchesExactValue(submodelId, definition.exactSubmodelIds)) {
    return true;
  }

  const exactSemanticMatches = getMatchingValues(semanticValues, definition.exactSemanticIds);
  if (
    exactSemanticMatches.length > 0 &&
    (batteryPassportContext || exactSemanticMatches.some(isBatteryPassportSignalValue))
  ) {
    return true;
  }

  const aliasSemanticMatches = getMatchingValues(semanticValues, definition.aliasSemanticIds);
  if (
    aliasSemanticMatches.length > 0 &&
    (batteryPassportContext || aliasSemanticMatches.some(isBatteryPassportSignalValue))
  ) {
    return true;
  }

  if (
    matchesExactValue(templateId, definition.exactTemplateIds) &&
    (batteryPassportContext || (definition.exactSubmodelIds.length === 0 && definition.exactSemanticIds.length === 0))
  ) {
    return true;
  }

  if (
    batteryPassportContext &&
    (matchesFragmentValue(idShort, definition.fallbackIdShortFragments) ||
      semanticValues.some((value) => matchesFragmentValue(value, definition.fallbackSemanticFragments)))
  ) {
    return true;
  }

  if (definition.key === 'technical-data' && batteryPassportContext && hasTechnicalDataStructure(submodel)) {
    return true;
  }

  return false;
}

function getSubmodelTemplateId(submodel: aas.types.Submodel) {
  return normalizeValue(submodel.administration?.templateId);
}

function getSubmodelId(submodel: aas.types.Submodel) {
  return normalizeValue(submodel.id);
}

function getIdShort(submodel: aas.types.Submodel) {
  return normalizeValue(submodel.idShort);
}

function getSubmodelSemanticValues(submodel: aas.types.Submodel) {
  return [submodel.semanticId, ...(submodel.supplementalSemanticIds ?? [])]
    .flatMap((reference) => reference?.keys ?? [])
    .map((key) => normalizeValue(key.value))
    .filter((value) => value !== '');
}

function getMatchingValues(values: string[], expected: string[]) {
  const expectedSet = new Set(expected.map((value) => normalizeValue(value)).filter((value) => value !== ''));
  return values.filter((value) => expectedSet.has(normalizeValue(value)));
}

function matchesExactValue(value: string, expected: string[]) {
  if (value === '') {
    return false;
  }

  return expected.some((candidate) => normalizeValue(candidate) === value);
}

function matchesFragmentValue(value: string, fragments: string[]) {
  if (value === '') {
    return false;
  }

  return fragments.some((fragment) => value.includes(normalizeValue(fragment)));
}

function hasBatteryPassportContext(values: string[]) {
  return values.some((value) => isBatteryPassportSignalValue(value));
}

function isBatteryPassportSignalValue(value: string) {
  return (
    value.includes('digitalbatterypassport') ||
    value.includes('idta.batterypass') ||
    value.includes('batterypass.') ||
    value.includes('carbonfootprintfordbpaas') ||
    value.includes('batterynameplate')
  );
}

function hasTechnicalDataStructure(submodel: aas.types.Submodel) {
  const childIdShorts = (submodel.submodelElements ?? [])
    .map((element) => normalizeValue(element?.idShort))
    .filter((value) => value !== '');
  return childIdShorts.includes('generalinformation') || childIdShorts.includes('technicalpropertyareas');
}

function normalizeValue(value: string | null | undefined) {
  return `${value ?? ''}`.trim().toLowerCase();
}
