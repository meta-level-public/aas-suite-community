import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { MultiLanguagePropertyValue } from '@aas/model';
import { SemanticIdHelper } from '@aas/helpers';
import { DppAssistantFieldValue, DppPcfEntryCollection } from 'battery-passport-assistant';

export const DPP_PCF_REQUIRED_SEMANTIC_IDS = [
  'https://admin-shell.io/idta/CarbonFootprint/CarbonFootprint/1/0',
  'https://admin-shell.io/idta/CarbonFootprint/ProductCarbonFootprints/1/0',
  'https://admin-shell.io/idta/CarbonFootprint/ProductCarbonFootprint/0/9',
  'https://admin-shell.io/idta/CarbonFootprint/ProductOrSectorSpecificCarbonFootprints/1/0',
  '0173-1#02-ABG855#003',
  '0173-1#02-ABG856#003',
  '0173-1#02-ABG857#001',
  '0173-1#02-ABG854#001',
  '0173-1#02-ABG858#001',
  'https://admin-shell.io/idta/CarbonFootprint/ExplanatoryStatement/1/0',
  'https://admin-shell.io/idta/CarbonFootprint/PublicationDate/1/0',
];

export function hasDppPcfValues(entries: DppPcfEntryCollection) {
  return (
    hasPcfEntryValues(entries.productCarbonFootprints) ||
    hasPcfEntryValues(entries.productOrSectorSpecificCarbonFootprints)
  );
}

export function isDppPcfTemplateSubmodel(submodel: aas.types.Submodel) {
  return (
    SemanticIdHelper.hasSemanticId(submodel, 'https://admin-shell.io/idta/CarbonFootprint/CarbonFootprint/1/0') ||
    SemanticIdHelper.hasSemanticId(submodel, 'https://admin-shell.io/idta/CarbonFootprint/1/0') ||
    [submodel.idShort ?? '', ...getAllSemanticValues(submodel)].some((candidate) =>
      candidate.includes('carbonfootprint'),
    )
  );
}

export function buildDppPcfSubmodelElements(entries: DppPcfEntryCollection) {
  const elements: aas.types.ISubmodelElement[] = [];
  const productList = createProductCarbonFootprintsList(entries);
  if (productList != null) {
    elements.push(productList);
  }

  const sectorList = createProductOrSectorSpecificCarbonFootprintsList(entries);
  if (sectorList != null) {
    elements.push(sectorList);
  }

  return elements;
}

function createProductCarbonFootprintsList(entries: DppPcfEntryCollection) {
  if (entries.productCarbonFootprints.length === 0) {
    return null;
  }

  const list = new aas.types.SubmodelElementList(
    aas.types.AasSubmodelElements.SubmodelElementCollection,
    null,
    null,
    'ProductCarbonFootprints',
  );
  list.semanticId = new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
    new aas.types.Key(
      aas.types.KeyTypes.GlobalReference,
      'https://admin-shell.io/idta/CarbonFootprint/ProductCarbonFootprints/1/0',
    ),
  ]);
  list.value = entries.productCarbonFootprints.map((entry, index) =>
    createProductCarbonFootprintEntry(entry.values, index),
  );

  return list;
}

function createProductCarbonFootprintEntry(values: Record<string, DppAssistantFieldValue>, index: number) {
  const collection = new aas.types.SubmodelElementCollection(null, null, `Element ${index}`);
  collection.semanticId = new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
    new aas.types.Key(
      aas.types.KeyTypes.GlobalReference,
      'https://admin-shell.io/idta/CarbonFootprint/ProductCarbonFootprint/0/9',
    ),
  ]);
  collection.value = [
    createStringPropertyList('PcfCalculationMethods', toLineItems(values['pcf-calculation-methods'])),
    createProperty(
      'PcfCo2eq',
      aas.types.DataTypeDefXsd.Decimal,
      '0173-1#02-ABG855#003',
      toStringValue(values['pcf-co2eq']),
    ),
    createProperty(
      'ReferenceImpactUnitForCalculation',
      aas.types.DataTypeDefXsd.String,
      '0173-1#02-ABG856#003',
      toStringValue(values['pcf-reference-impact-unit']),
    ),
    createProperty(
      'QuantityOfMeasureForCalculation',
      aas.types.DataTypeDefXsd.Decimal,
      '0173-1#02-ABG857#001',
      toStringValue(values['pcf-quantity-of-measure']),
    ),
    createStringPropertyList('LifeCyclePhases', toLineItems(values['pcf-life-cycle-phases'])),
    createProperty(
      'ExplanatoryStatement',
      aas.types.DataTypeDefXsd.String,
      'https://admin-shell.io/idta/CarbonFootprint/ExplanatoryStatement/1/0',
      toStringValue(values['pcf-explanatory-statement']),
    ),
    createStringCollection('GoodsHandoverAddress', 'Address', toStringValue(values['goods-handover-address'])),
    createProperty(
      'PublicationDate',
      aas.types.DataTypeDefXsd.DateTime,
      'https://admin-shell.io/idta/CarbonFootprint/PublicationDate/1/0',
      toStringValue(values['pcf-publication-date']),
    ),
    createProperty(
      'ExpirationDate',
      aas.types.DataTypeDefXsd.DateTime,
      '',
      toStringValue(values['pcf-expiration-date']),
    ),
  ];

  return collection;
}

function createProductOrSectorSpecificCarbonFootprintsList(entries: DppPcfEntryCollection) {
  if (entries.productOrSectorSpecificCarbonFootprints.length === 0) {
    return null;
  }

  const list = new aas.types.SubmodelElementList(
    aas.types.AasSubmodelElements.SubmodelElementCollection,
    null,
    null,
    'ProductOrSectorSpecificCarbonFootprints',
  );
  list.value = entries.productOrSectorSpecificCarbonFootprints.map((entry, index) =>
    createProductOrSectorSpecificCarbonFootprintEntry(entry.values, index),
  );

  return list;
}

function createProductOrSectorSpecificCarbonFootprintEntry(
  values: Record<string, DppAssistantFieldValue>,
  index: number,
) {
  const collection = new aas.types.SubmodelElementCollection(null, null, `Element ${index}`);
  collection.value = [
    createStringPropertyList('PcfCalculationMethods', toLineItems(values['pcf-calculation-methods'])),
    createNamedCollection('ProductOrSectorSpecificRule', [
      createProperty(
        'PcfRuleOperator',
        aas.types.DataTypeDefXsd.String,
        '',
        toStringValue(values['pcf-rule-operator']),
      ),
      createProperty('PcfRuleName', aas.types.DataTypeDefXsd.String, '', toStringValue(values['pcf-rule-name'])),
      createProperty('PcfRuleVersion', aas.types.DataTypeDefXsd.String, '', toStringValue(values['pcf-rule-version'])),
      createProperty(
        'PcfRuleOnlineReference',
        aas.types.DataTypeDefXsd.String,
        '',
        toStringValue(values['pcf-rule-online-reference']),
      ),
    ]),
    createNamedCollection('ExternalPcfApi', [
      createProperty('PcfApiEndpoint', aas.types.DataTypeDefXsd.String, '', toStringValue(values['pcf-api-endpoint'])),
      createProperty('PcfApiQuery', aas.types.DataTypeDefXsd.String, '', toStringValue(values['pcf-api-query'])),
    ]),
    createNamedCollection('PcfInformation', [
      createProperty(
        'ArbitraryContent',
        aas.types.DataTypeDefXsd.String,
        '',
        toStringValue(values['pcf-arbitrary-content']),
      ),
    ]),
  ];

  return collection;
}

function createStringPropertyList(idShort: string, values: string[]) {
  const list = new aas.types.SubmodelElementList(aas.types.AasSubmodelElements.Property, null, null, idShort);
  list.valueTypeListElement = aas.types.DataTypeDefXsd.String;
  list.value = values.map((value, index) => {
    const property = new aas.types.Property(aas.types.DataTypeDefXsd.String, null, null, `Element ${index}`);
    property.value = value;
    return property;
  });

  return list;
}

function createStringCollection(idShort: string, propertyIdShort: string, value: string) {
  return createNamedCollection(idShort, [createProperty(propertyIdShort, aas.types.DataTypeDefXsd.String, '', value)]);
}

function createNamedCollection(idShort: string, elements: aas.types.ISubmodelElement[]) {
  const collection = new aas.types.SubmodelElementCollection(null, null, idShort);
  collection.value = elements;
  return collection;
}

function createProperty(idShort: string, datatype: aas.types.DataTypeDefXsd, semanticId: string, value: string) {
  const property = new aas.types.Property(
    datatype,
    null,
    null,
    idShort,
    null,
    null,
    semanticId !== '' ? createSemanticId(semanticId) : null,
  );
  property.value = value;

  return property;
}

function createSemanticId(semanticId: string) {
  return new aas.types.Reference(aas.types.ReferenceTypes.ModelReference, [
    new aas.types.Key(aas.types.KeyTypes.ConceptDescription, semanticId),
  ]);
}

function toLineItems(value: DppAssistantFieldValue | undefined) {
  if (Array.isArray(value)) {
    if (value.length === 0 || typeof value[0] === 'string') {
      return (value as string[]).map((item) => item.trim()).filter((item) => item !== '');
    }

    return [];
  }

  return toStringValue(value)
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter((item) => item !== '');
}

function toStringValue(value: DppAssistantFieldValue | undefined) {
  if (isMultiLanguagePropertyValueArray(value)) {
    return toSingleString(value);
  }

  if (isStringArray(value)) {
    return value.join(', ');
  }

  if (value == null) {
    return '';
  }

  return `${value}`;
}

function toSingleString(value: MultiLanguagePropertyValue[] | undefined) {
  return (
    value?.find((item) => item.language.toLowerCase() === 'de')?.text ??
    value?.find((item) => item.language.toLowerCase() === 'en')?.text ??
    value?.[0]?.text ??
    ''
  );
}

function isMultiLanguagePropertyValueArray(
  value: DppAssistantFieldValue | undefined,
): value is MultiLanguagePropertyValue[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'object' && item != null && 'text' in item);
}

function isStringArray(value: DppAssistantFieldValue | undefined): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function hasPcfEntryValues(entries: { values: Record<string, DppAssistantFieldValue> }[]) {
  return entries.some((entry) =>
    Object.values(entry.values).some((value) => {
      if (isStringArray(value)) {
        return value.some((item) => item.trim() !== '');
      }

      if (isMultiLanguagePropertyValueArray(value)) {
        return value.some((item) => item.text.trim() !== '');
      }

      if (typeof value === 'string') {
        return value.trim() !== '';
      }

      return value != null;
    }),
  );
}

function getAllSemanticValues(submodel: aas.types.Submodel) {
  return [submodel.semanticId, ...(submodel.supplementalSemanticIds ?? [])]
    .flatMap((reference) => reference?.keys ?? [])
    .map((key) => key.value.toLowerCase());
}
