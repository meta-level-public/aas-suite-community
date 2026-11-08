import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { TestBed } from '@angular/core/testing';
import { DppPcfEntry } from 'battery-passport-assistant';
import { beforeEach, describe, expect, it } from 'vitest';
import { PcfEntryMapperService } from './pcf-entry-mapper.service';

const PRODUCT_CARBON_FOOTPRINT_SEMANTIC_ID = 'https://admin-shell.io/idta/CarbonFootprint/ProductCarbonFootprint/0/9';

function property(idShort: string, value: string | null, valueType = aas.types.DataTypeDefXsd.String) {
  const result = new aas.types.Property(valueType, null, null, idShort);
  result.value = value;
  return result;
}

function collection(idShort: string | null, children: aas.types.ISubmodelElement[]) {
  const result = new aas.types.SubmodelElementCollection(null, null, idShort);
  result.value = children;
  return result;
}

function stringList(idShort: string, children: aas.types.ISubmodelElement[]) {
  const result = new aas.types.SubmodelElementList(aas.types.AasSubmodelElements.Property, null, null, idShort);
  result.valueTypeListElement = aas.types.DataTypeDefXsd.String;
  result.value = children;
  return result;
}

function child<T extends aas.types.ISubmodelElement>(parent: aas.types.SubmodelElementCollection, idShort: string): T {
  const found = (parent.value ?? []).find((element) => element.idShort === idShort);
  if (found == null) {
    throw new Error(`Child ${idShort} not found`);
  }
  return found as T;
}

function semanticIdOf(element: aas.types.IHasSemantics) {
  return element.semanticId?.keys[0]?.value;
}

describe('PcfEntryMapperService', () => {
  let service: PcfEntryMapperService;

  const productEntry: DppPcfEntry = {
    id: 'pcf-1',
    type: 'product-carbon-footprint',
    values: {
      'pcf-calculation-methods': ['ISO 14067', ' GHG Protocol ', ''],
      'pcf-co2eq': 42.5,
      'pcf-reference-impact-unit': 'kg',
      'pcf-quantity-of-measure': '1',
      'pcf-life-cycle-phases': 'A1 - raw material supply\nA3 - production, A4 - transport',
      'pcf-explanatory-statement': 'Calculated for battery pack BP-48V',
      'goods-handover-address': 'Werkstrasse 1, 70173 Stuttgart',
      'pcf-publication-date': '2025-03-01T00:00:00Z',
      'pcf-expiration-date': '2027-03-01T00:00:00Z',
    },
  };

  const sectorEntry: DppPcfEntry = {
    id: 'sector-1',
    type: 'product-or-sector-specific-carbon-footprint',
    values: {
      'pcf-calculation-methods': 'EN 15804',
      'pcf-rule-operator': 'PEF',
      'pcf-rule-name': 'Batteries PEFCR',
      'pcf-rule-version': '1.1',
      'pcf-rule-online-reference': 'https://example.com/pefcr/batteries',
      'pcf-api-endpoint': 'https://pcf.example.com/api',
      'pcf-api-query': 'productId=BP-48V',
      'pcf-arbitrary-content': 'Additional notes',
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PcfEntryMapperService);
  });

  describe('createEmptyEntry', () => {
    it('creates an entry of the requested type without values and with a type-prefixed id', () => {
      const entry = service.createEmptyEntry('product-or-sector-specific-carbon-footprint');

      expect(entry.type).toBe('product-or-sector-specific-carbon-footprint');
      expect(entry.values).toEqual({});
      expect(entry.id.startsWith('product-or-sector-specific-carbon-footprint-')).toBe(true);
    });
  });

  describe('createEntryElement', () => {
    it('builds a product carbon footprint collection with semantic id, typed properties and list items', () => {
      const element = service.createEntryElement(productEntry, 2);

      expect(element.idShort).toBe('Element_2');
      expect(semanticIdOf(element)).toBe(PRODUCT_CARBON_FOOTPRINT_SEMANTIC_ID);

      const methods = child<aas.types.SubmodelElementList>(element, 'PcfCalculationMethods');
      expect(methods.valueTypeListElement).toBe(aas.types.DataTypeDefXsd.String);
      expect((methods.value ?? []).map((item) => (item as aas.types.Property).value)).toEqual([
        'ISO 14067',
        'GHG Protocol',
      ]);

      const phases = child<aas.types.SubmodelElementList>(element, 'LifeCyclePhases');
      expect((phases.value ?? []).map((item) => (item as aas.types.Property).value)).toEqual([
        'A1 - raw material supply',
        'A3 - production',
        'A4 - transport',
      ]);

      const co2eq = child<aas.types.Property>(element, 'PcfCo2eq');
      expect(co2eq.value).toBe('42.5');
      expect(co2eq.valueType).toBe(aas.types.DataTypeDefXsd.Decimal);
      expect(semanticIdOf(co2eq)).toBe('0173-1#02-ABG855#003');

      const publicationDate = child<aas.types.Property>(element, 'PublicationDate');
      expect(publicationDate.valueType).toBe(aas.types.DataTypeDefXsd.DateTime);
      expect(publicationDate.value).toBe('2025-03-01T00:00:00Z');

      const address = child<aas.types.SubmodelElementCollection>(element, 'GoodsHandoverAddress');
      expect(child<aas.types.Property>(address, 'Address').value).toBe('Werkstrasse 1, 70173 Stuttgart');
    });

    it('does not add a semantic id to properties without a known concept', () => {
      const element = service.createEntryElement(productEntry, 0);

      expect(child<aas.types.Property>(element, 'ExpirationDate').semanticId).toBeNull();
    });

    it('writes empty strings for missing or unsupported values', () => {
      const element = service.createEntryElement(
        { id: 'x', type: 'product-carbon-footprint', values: { 'pcf-co2eq': true as never } },
        0,
      );

      expect(child<aas.types.Property>(element, 'PcfCo2eq').value).toBe('');
      expect(child<aas.types.Property>(element, 'ReferenceImpactUnitForCalculation').value).toBe('');
      expect(child<aas.types.SubmodelElementList>(element, 'PcfCalculationMethods').value).toEqual([]);
    });

    it('builds a sector specific collection with nested rule, api and information groups', () => {
      const element = service.createEntryElement(sectorEntry, 1);

      expect(element.idShort).toBe('Element_1');
      expect(element.semanticId).toBeNull();
      expect((element.value ?? []).map((item) => item.idShort)).toEqual([
        'PcfCalculationMethods',
        'ProductOrSectorSpecificRule',
        'ExternalPcfApi',
        'PcfInformation',
      ]);

      const rule = child<aas.types.SubmodelElementCollection>(element, 'ProductOrSectorSpecificRule');
      expect(child<aas.types.Property>(rule, 'PcfRuleName').value).toBe('Batteries PEFCR');
      expect(child<aas.types.Property>(rule, 'PcfRuleVersion').value).toBe('1.1');

      const api = child<aas.types.SubmodelElementCollection>(element, 'ExternalPcfApi');
      expect(child<aas.types.Property>(api, 'PcfApiEndpoint').value).toBe('https://pcf.example.com/api');
    });
  });

  it('creates entries with idShorts that pass the AAS verification', () => {
    const list = new aas.types.SubmodelElementList(
      aas.types.AasSubmodelElements.SubmodelElementCollection,
      null,
      null,
      'Entries',
    );
    list.value = [service.createEntryElement(productEntry, 0), service.createEntryElement(sectorEntry, 1)];
    const submodel = new aas.types.Submodel('urn:example:sm:pcf');
    submodel.submodelElements = [list];

    const idShortErrors = [...aas.verification.verify(submodel)].filter((error) =>
      error.path.toString().endsWith('.idShort'),
    );

    expect(idShortErrors).toEqual([]);
  });

  describe('readEntry', () => {
    it('reads back all values of a created product carbon footprint entry', () => {
      const element = service.createEntryElement(productEntry, 0);

      const entry = service.readEntry('product-carbon-footprint', element, 0);

      expect(entry).toEqual({
        id: 'Element_0',
        type: 'product-carbon-footprint',
        values: {
          'pcf-calculation-methods': ['ISO 14067', 'GHG Protocol'],
          'pcf-co2eq': '42.5',
          'pcf-reference-impact-unit': 'kg',
          'pcf-quantity-of-measure': '1',
          'pcf-life-cycle-phases': ['A1 - raw material supply', 'A3 - production', 'A4 - transport'],
          'pcf-explanatory-statement': 'Calculated for battery pack BP-48V',
          'goods-handover-address': 'Werkstrasse 1, 70173 Stuttgart',
          'pcf-publication-date': '2025-03-01T00:00:00Z',
          'pcf-expiration-date': '2027-03-01T00:00:00Z',
        },
      });
    });

    it('reads back all values of a created sector specific entry', () => {
      const element = service.createEntryElement(sectorEntry, 3);

      const entry = service.readEntry('product-or-sector-specific-carbon-footprint', element, 3);

      expect(entry.type).toBe('product-or-sector-specific-carbon-footprint');
      expect(entry.values).toEqual({
        'pcf-calculation-methods': ['EN 15804'],
        'pcf-rule-operator': 'PEF',
        'pcf-rule-name': 'Batteries PEFCR',
        'pcf-rule-version': '1.1',
        'pcf-rule-online-reference': 'https://example.com/pefcr/batteries',
        'pcf-api-endpoint': 'https://pcf.example.com/api',
        'pcf-api-query': 'productId=BP-48V',
        'pcf-arbitrary-content': 'Additional notes',
      });
    });

    it('falls back to an index based id when the collection has no idShort', () => {
      expect(service.readEntry('product-carbon-footprint', collection(null, []), 4).id).toBe(
        'product-carbon-footprint-4',
      );
      expect(service.readEntry('product-or-sector-specific-carbon-footprint', collection('  ', []), 1).id).toBe(
        'product-or-sector-specific-carbon-footprint-1',
      );
    });

    it('trims values and ignores blank or non-property list items', () => {
      const source = collection('ProductCarbonFootprint', [
        stringList('PcfCalculationMethods', [
          property('Element_0', '  ISO 14067  '),
          property('Element_1', '   '),
          property('Element_2', null),
          collection('Nested', []),
        ]),
        property('PcfCo2eq', ' 12.3 ', aas.types.DataTypeDefXsd.Decimal),
      ]);

      const entry = service.readEntry('product-carbon-footprint', source, 0);

      expect(entry.id).toBe('ProductCarbonFootprint');
      expect(entry.values['pcf-calculation-methods']).toEqual(['ISO 14067']);
      expect(entry.values['pcf-co2eq']).toBe('12.3');
    });

    it('returns empty values when elements are missing or have an unexpected type', () => {
      const source = collection('Broken', [
        property('PcfCalculationMethods', 'not a list'),
        collection('PcfCo2eq', []),
        property('GoodsHandoverAddress', 'flat instead of nested'),
      ]);

      const entry = service.readEntry('product-carbon-footprint', source, 0);

      expect(entry.values['pcf-calculation-methods']).toEqual([]);
      expect(entry.values['pcf-co2eq']).toBe('');
      expect(entry.values['goods-handover-address']).toBe('');
      expect(entry.values['pcf-expiration-date']).toBe('');
    });

    it('returns empty nested values when an intermediate collection is missing', () => {
      const source = collection('Sector', [
        collection('ProductOrSectorSpecificRule', [property('PcfRuleName', 'Batteries PEFCR')]),
      ]);

      const entry = service.readEntry('product-or-sector-specific-carbon-footprint', source, 0);

      expect(entry.values['pcf-rule-name']).toBe('Batteries PEFCR');
      expect(entry.values['pcf-rule-operator']).toBe('');
      expect(entry.values['pcf-api-endpoint']).toBe('');
      expect(entry.values['pcf-arbitrary-content']).toBe('');
    });
  });
});
