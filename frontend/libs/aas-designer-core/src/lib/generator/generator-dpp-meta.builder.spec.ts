import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { HandoverSemantics } from '@aas/helpers';

import { describe, expect, it, vi } from 'vitest';

import { createDppMetaSubmodels } from './generator-dpp-meta.builder';

describe('generator-dpp-meta.builder', () => {
  it('creates a DPP meta submodel with model granularity by default', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-02T03:04:05.000Z'));

    const requiredSemanticIds: string[] = [];
    const [submodel] = createDppMetaSubmodels({
      assetGlobalId: 'urn:asset:test',
      dppId: 'urn:dpp:test',
      iriPrefix: 'https://example.com/',
      includeCarbonFootprintSpecification: false,
      requiredSemanticIds,
    });

    expect(submodel.idShort).toBe('DppMeta');
    expect(readPropertyValue(submodel, 'granularity')).toBe('Model');
    expect(readPropertyValue(submodel, 'digitalProductPassportId')).toBe('urn:dpp:test');
    expect(readPropertyValue(submodel, 'uniqueProductIdentifier')).toBe('urn:asset:test');
    expect(readPropertyValue(submodel, 'lastUpdate')).toBe('2025-01-02T03:04:05.000Z');
    expect(readContentSpecificationIds(submodel)).toEqual([
      'urn:samm:io.admin-shell.idta.dpp_meta:1.0.0#DppMeta',
      'https://admin-shell.io/idta/nameplate/3/0/Nameplate',
      HandoverSemantics.SUBMODEL_V3,
    ]);
    expect(requiredSemanticIds).toContain('urn:samm:io.admin-shell.idta.dpp_meta:1.0.0#DppMeta');

    vi.useRealTimers();
  });

  it('includes carbon footprint specification and item granularity for instance assets', () => {
    const [submodel] = createDppMetaSubmodels({
      assetGlobalId: 'urn:asset:test',
      dppId: 'urn:dpp:test',
      iriPrefix: 'https://example.com/',
      assetKind: 'Instance',
      includeCarbonFootprintSpecification: true,
      requiredSemanticIds: [],
    });

    expect(readPropertyValue(submodel, 'granularity')).toBe('Item');
    expect(readContentSpecificationIds(submodel)).toContain(
      'https://admin-shell.io/idta/CarbonFootprint/CarbonFootprint/1/0',
    );
  });
});

function readPropertyValue(submodel: aas.types.Submodel, idShort: string) {
  const property = submodel.submodelElements?.find(
    (element): element is aas.types.Property => element instanceof aas.types.Property && element.idShort === idShort,
  );

  return property?.value;
}

function readContentSpecificationIds(submodel: aas.types.Submodel) {
  const list = submodel.submodelElements?.find(
    (element): element is aas.types.SubmodelElementList =>
      element instanceof aas.types.SubmodelElementList && element.idShort === 'contentSpecificationIds',
  );

  return (
    list?.value
      ?.filter((element): element is aas.types.Property => element instanceof aas.types.Property)
      .map((element) => element.value ?? '') ?? []
  );
}
