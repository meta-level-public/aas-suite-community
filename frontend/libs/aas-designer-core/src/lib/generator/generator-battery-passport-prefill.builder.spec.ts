import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { describe, expect, it } from 'vitest';
import { prefillBatteryPassportTechnicalData } from './generator-battery-passport-prefill.builder';

/*
 * Most cases use JSON-shaped elements like generator.service.spec.ts. The builder also handles parsed
 * aas-core instances (where `modelType` is a method); see the cases at the end.
 */

const SERIAL_NUMBER_ID = '0173-1#02-AAM556#002';
const MANUFACTURER_NAME_ID = '0173-1#02-AAO677#002';
const PRODUCT_DESIGNATION_ID = '0173-1#02-AAW338#001';
const COUNTRY_OF_ORIGIN_ID = '0173-1#02-AAO259#004';

interface JsonElement {
  idShort: string;
  modelType: { name: string };
  value?: unknown;
  semanticId?: { keys: { value: string }[] };
  supplementalSemanticIds?: { keys: { value: string }[] }[];
}

function semanticReference(value: string) {
  return { keys: [{ value }] };
}

function property(idShort: string, value: string | null, semanticId?: string): JsonElement {
  return {
    idShort,
    modelType: { name: 'Property' },
    value,
    ...(semanticId != null ? { semanticId: semanticReference(semanticId) } : {}),
  };
}

function mlp(idShort: string, values: [string, string][] | null, semanticId?: string): JsonElement {
  return {
    idShort,
    modelType: { name: 'MultiLanguageProperty' },
    value: values?.map(([language, text]) => ({ language, text })) ?? null,
    ...(semanticId != null ? { semanticId: semanticReference(semanticId) } : {}),
  };
}

function smc(idShort: string, children: JsonElement[]): JsonElement {
  return { idShort, modelType: { name: 'SubmodelElementCollection' }, value: children };
}

function sml(idShort: string, children: JsonElement[]): JsonElement {
  return { idShort, modelType: { name: 'SubmodelElementList' }, value: children };
}

function submodel(idShort: string, elements: JsonElement[]) {
  return { id: `urn:example:sm:${idShort}`, idShort, submodelElements: elements } as unknown as aas.types.Submodel;
}

function langStrings(element: JsonElement) {
  return ((element.value as { language: string; text: string }[] | null) ?? []).map((entry) => [
    entry.language,
    entry.text,
  ]);
}

describe('prefillBatteryPassportTechnicalData', () => {
  it('copies nameplate values into technical data elements with the same semantic id', () => {
    const nameplate = submodel('Nameplate', [
      property('SerialNumber', 'BP-48V-000123', SERIAL_NUMBER_ID),
      mlp(
        'ManufacturerProductDesignation',
        [
          ['en', 'Battery pack 48 V'],
          ['de', 'Batteriepack 48 V'],
        ],
        PRODUCT_DESIGNATION_ID,
      ),
    ]);
    const serial = property('BatterySerialNumber', '', SERIAL_NUMBER_ID.toUpperCase());
    const designationAsProperty = property('DesignationText', '', PRODUCT_DESIGNATION_ID);
    const unrelated = property('RatedCapacity', '100', '0173-1#02-AAI048#004');
    const technicalData = submodel('TechnicalData', [
      smc('GeneralInformation', [serial, sml('Designations', [designationAsProperty])]),
      unrelated,
    ]);

    prefillBatteryPassportTechnicalData(nameplate, technicalData, {});

    expect(serial.value).toBe('BP-48V-000123');
    expect(designationAsProperty.value).toBe('Batteriepack 48 V');
    expect(unrelated.value).toBe('100');
  });

  it('converts a property value into an english lang string for multi language targets', () => {
    const nameplate = submodel('Nameplate', [property('CountryOfOrigin', 'DE', COUNTRY_OF_ORIGIN_ID)]);
    const country = mlp('CountryOfOrigin', null, COUNTRY_OF_ORIGIN_ID);

    prefillBatteryPassportTechnicalData(nameplate, submodel('TechnicalData', [country]), {});

    expect(langStrings(country)).toEqual([['en', 'DE']]);
  });

  it('keeps all languages when copying between multi language properties', () => {
    const nameplate = submodel('Nameplate', [
      mlp(
        'ManufacturerProductDesignation',
        [
          ['de', 'Batteriepack'],
          ['en', 'Battery pack'],
        ],
        PRODUCT_DESIGNATION_ID,
      ),
    ]);
    const target = mlp('ProductDesignationText', null, PRODUCT_DESIGNATION_ID);

    prefillBatteryPassportTechnicalData(nameplate, submodel('TechnicalData', [target]), {});

    expect(langStrings(target)).toEqual([
      ['de', 'Batteriepack'],
      ['en', 'Battery pack'],
    ]);
  });

  it('matches supplemental semantic ids of nested elements and ignores empty source values', () => {
    const filledSerial = property('ProductSerial', 'SN-777', 'urn:example:serial');
    filledSerial.supplementalSemanticIds = [semanticReference(SERIAL_NUMBER_ID)];
    const nameplate = submodel('Nameplate', [
      property('SerialNumber', '  ', SERIAL_NUMBER_ID),
      smc('Nested', [filledSerial]),
    ]);
    const target = property('SerialNumber', 'old', SERIAL_NUMBER_ID);

    prefillBatteryPassportTechnicalData(nameplate, submodel('TechnicalData', [target]), {});

    expect(target.value).toBe('SN-777');
  });

  it('uses the first matching nameplate element when several share a semantic id', () => {
    const nameplate = submodel('Nameplate', [
      property('SerialNumber', 'FIRST', SERIAL_NUMBER_ID),
      property('SerialNumberCopy', 'SECOND', SERIAL_NUMBER_ID),
    ]);
    const target = property('SerialNumber', '', SERIAL_NUMBER_ID);

    prefillBatteryPassportTechnicalData(nameplate, submodel('TechnicalData', [target]), {});

    expect(target.value).toBe('FIRST');
  });

  it('fills manufacturer and product designation aliases from the generator source, preferring german', () => {
    const manufacturerName = property('ManufacturerName', '', MANUFACTURER_NAME_ID);
    const productDesignation = mlp('productdesignation', null);
    const technicalData = submodel('TechnicalData', [
      smc('GeneralInformation', [manufacturerName, productDesignation]),
    ]);

    prefillBatteryPassportTechnicalData(null, technicalData, {
      manufacturer: [
        { language: 'en', text: 'ACME Batteries Ltd.' },
        { language: 'DE', text: 'ACME Batterien GmbH' },
      ],
      productDesignation: [{ language: 'fr', text: 'Pack batterie 48 V' }],
    });

    expect(manufacturerName.value).toBe('ACME Batterien GmbH');
    expect(langStrings(productDesignation)).toEqual([['en', 'Pack batterie 48 V']]);
  });

  it('lets the generator source win over a value copied from the nameplate', () => {
    const nameplate = submodel('Nameplate', [
      mlp('ManufacturerName', [['en', 'Nameplate Manufacturer']], MANUFACTURER_NAME_ID),
    ]);
    const manufacturerName = property('ManufacturerName', '', MANUFACTURER_NAME_ID);

    prefillBatteryPassportTechnicalData(nameplate, submodel('TechnicalData', [manufacturerName]), {
      manufacturer: [{ language: 'en', text: 'Generator Manufacturer' }],
    });

    expect(manufacturerName.value).toBe('Generator Manufacturer');
  });

  it('prefills parsed aas-core submodel instances', () => {
    const source = new aas.types.Property(aas.types.DataTypeDefXsd.String, null, null, 'SerialNumber');
    source.value = 'SN-1';
    source.semanticId = new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
      new aas.types.Key(aas.types.KeyTypes.GlobalReference, SERIAL_NUMBER_ID),
    ]);
    const nameplate = new aas.types.Submodel('urn:example:sm:nameplate');
    nameplate.submodelElements = [source];

    const target = new aas.types.Property(aas.types.DataTypeDefXsd.String, null, null, 'SerialNumber');
    target.semanticId = source.semanticId;
    const technicalData = new aas.types.Submodel('urn:example:sm:technical');
    technicalData.submodelElements = [target];

    prefillBatteryPassportTechnicalData(nameplate, technicalData, {});

    expect(target.value).toBe('SN-1');
  });
  it('prefills nested aas-core instances and takes the manufacturer from the generator source', () => {
    const manufacturer = new aas.types.MultiLanguageProperty(null, null, 'ManufacturerName');
    const collection = new aas.types.SubmodelElementCollection(null, null, 'General');
    collection.value = [manufacturer];
    const technicalData = new aas.types.Submodel('urn:example:sm:technical');
    technicalData.submodelElements = [collection];

    prefillBatteryPassportTechnicalData(null, technicalData, {
      manufacturer: [{ language: 'de', text: 'Hersteller GmbH' }],
    });

    expect(manufacturer.value?.map((entry) => entry.text)).toEqual(['Hersteller GmbH']);
  });

  it('keeps values from the nameplate when the generator source has no manufacturer', () => {
    const source = new aas.types.Property(aas.types.DataTypeDefXsd.String, null, null, 'ManufacturerName');
    source.value = 'Nameplate GmbH';
    source.semanticId = new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
      new aas.types.Key(aas.types.KeyTypes.GlobalReference, MANUFACTURER_NAME_ID),
    ]);
    const nameplate = new aas.types.Submodel('urn:example:sm:nameplate');
    nameplate.submodelElements = [source];

    const target = new aas.types.Property(aas.types.DataTypeDefXsd.String, null, null, 'ManufacturerName');
    target.semanticId = source.semanticId;
    const technicalData = new aas.types.Submodel('urn:example:sm:technical');
    technicalData.submodelElements = [target];

    prefillBatteryPassportTechnicalData(nameplate, technicalData, {});

    expect(target.value).toBe('Nameplate GmbH');
  });
});
