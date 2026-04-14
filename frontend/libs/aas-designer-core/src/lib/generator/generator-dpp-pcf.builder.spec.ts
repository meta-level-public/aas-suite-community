import * as aas from '@aas-core-works/aas-core3.1-typescript';

import { describe, expect, it } from 'vitest';

import {
  buildDppPcfSubmodelElements,
  DPP_PCF_REQUIRED_SEMANTIC_IDS,
  hasDppPcfValues,
  isDppPcfTemplateSubmodel,
} from './generator-dpp-pcf.builder';

describe('generator-dpp-pcf.builder', () => {
  it('detects whether any PCF values are present', () => {
    expect(
      hasDppPcfValues({
        productCarbonFootprints: [{ values: { 'pcf-co2eq': '12.3' } }] as never,
        productOrSectorSpecificCarbonFootprints: [],
      }),
    ).toBe(true);

    expect(
      hasDppPcfValues({
        productCarbonFootprints: [{ values: { 'pcf-co2eq': '   ' } }] as never,
        productOrSectorSpecificCarbonFootprints: [],
      }),
    ).toBe(false);
  });

  it('recognizes carbon-footprint template submodels', () => {
    const submodel = new aas.types.Submodel('urn:test:pcf', undefined, undefined, 'CarbonFootprintForDbpAas');
    submodel.semanticId = new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
      new aas.types.Key(
        aas.types.KeyTypes.GlobalReference,
        'https://admin-shell.io/idta/CarbonFootprint/CarbonFootprint/1/0',
      ),
    ]);

    expect(isDppPcfTemplateSubmodel(submodel)).toBe(true);
  });

  it('builds product and sector PCF elements', () => {
    const elements = buildDppPcfSubmodelElements({
      productCarbonFootprints: [
        {
          values: {
            'pcf-calculation-methods': ['ISO 14067'],
            'pcf-co2eq': '42.5',
            'pcf-reference-impact-unit': 'kg',
            'pcf-quantity-of-measure': '1',
            'pcf-life-cycle-phases': 'A1,A2',
            'pcf-explanatory-statement': 'Calculated externally',
            'goods-handover-address': 'Hamburg',
            'pcf-publication-date': '2025-01-02T03:04:05.000Z',
            'pcf-expiration-date': '2026-01-02T03:04:05.000Z',
          },
        },
      ] as never,
      productOrSectorSpecificCarbonFootprints: [
        {
          values: {
            'pcf-calculation-methods': 'Rule A',
            'pcf-rule-operator': 'Operator',
            'pcf-rule-name': 'Rule Name',
            'pcf-rule-version': '1.0',
            'pcf-rule-online-reference': 'https://example.com/rule',
            'pcf-api-endpoint': 'https://example.com/api',
            'pcf-api-query': 'product=1',
            'pcf-arbitrary-content': 'content',
          },
        },
      ] as never,
    });

    expect(elements).toHaveLength(2);
    expect(elements[0]).toBeInstanceOf(aas.types.SubmodelElementList);
    expect(elements[1]).toBeInstanceOf(aas.types.SubmodelElementList);
    expect(DPP_PCF_REQUIRED_SEMANTIC_IDS).toContain('0173-1#02-ABG855#003');

    const productList = elements[0] as aas.types.SubmodelElementList;
    const productEntry = productList.value?.[0] as aas.types.SubmodelElementCollection;
    expect(productEntry.value).toHaveLength(9);

    const sectorList = elements[1] as aas.types.SubmodelElementList;
    const sectorEntry = sectorList.value?.[0] as aas.types.SubmodelElementCollection;
    expect(sectorEntry.value).toHaveLength(4);
  });
});
