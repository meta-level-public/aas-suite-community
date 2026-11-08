import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { describe, expect, it } from 'vitest';
import { prefillBatteryPassportTechnicalData } from './generator-battery-passport-prefill.builder';

const T = aas.types;

const SERIAL_NUMBER_ID = '0173-1#02-AAM556#002';
const MANUFACTURER_NAME_ID = '0173-1#02-AAO677#002';
const PRODUCT_DESIGNATION_ID = '0173-1#02-AAW338#001';
const COUNTRY_OF_ORIGIN_ID = '0173-1#02-AAO259#004';

function reference(value: string) {
  return new T.Reference(T.ReferenceTypes.ExternalReference, [new T.Key(T.KeyTypes.GlobalReference, value)]);
}

function property(idShort: string, value: string | null, semanticId?: string) {
  const result = new T.Property(T.DataTypeDefXsd.String, null, null, idShort);
  result.value = value;
  if (semanticId != null) {
    result.semanticId = reference(semanticId);
  }
  return result;
}

function mlp(idShort: string, values: [string, string][] | null, semanticId?: string) {
  const result = new T.MultiLanguageProperty(null, null, idShort);
  result.value = values?.map(([language, text]) => new T.LangStringTextType(language, text)) ?? null;
  if (semanticId != null) {
    result.semanticId = reference(semanticId);
  }
  return result;
}

function smc(idShort: string, children: aas.types.ISubmodelElement[]) {
  const result = new T.SubmodelElementCollection(null, null, idShort);
  result.value = children;
  return result;
}

function submodel(id: string, idShort: string, elements: aas.types.ISubmodelElement[]) {
  const result = new T.Submodel(id);
  result.idShort = idShort;
  result.submodelElements = elements;
  return result;
}

function langStrings(element: aas.types.MultiLanguageProperty) {
  return (element.value ?? []).map((entry) => [entry.language, entry.text]);
}

describe('prefillBatteryPassportTechnicalData', () => {
  it('copies nameplate values into technical data elements with the same semantic id', () => {
    const nameplate = submodel('urn:sm:nameplate', 'Nameplate', [
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
    const technicalData = submodel('urn:sm:technical', 'TechnicalData', [
      smc('GeneralInformation', [serial, designationAsProperty]),
      unrelated,
    ]);

    prefillBatteryPassportTechnicalData(nameplate, technicalData, {
      manufacturer: [{ language: 'en', text: 'ACME Batteries' }],
    });

    expect(serial.value).toBe('BP-48V-000123');
    expect(designationAsProperty.value).toBe('Batteriepack 48 V');
    expect(unrelated.value).toBe('100');
  });

  it('converts a property value into an english lang string for multi language targets', () => {
    const nameplate = submodel('urn:sm:nameplate', 'Nameplate', [
      property('CountryOfOrigin', 'DE', COUNTRY_OF_ORIGIN_ID),
    ]);
    const country = mlp('CountryOfOrigin', null, COUNTRY_OF_ORIGIN_ID);
    const technicalData = submodel('urn:sm:technical', 'TechnicalData', [country]);

    prefillBatteryPassportTechnicalData(nameplate, technicalData, {});

    expect(langStrings(country)).toEqual([['en', 'DE']]);
  });

  it('keeps all languages when copying between multi language properties', () => {
    const nameplate = submodel('urn:sm:nameplate', 'Nameplate', [
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
    const technicalData = submodel('urn:sm:technical', 'TechnicalData', [target]);

    prefillBatteryPassportTechnicalData(nameplate, technicalData, {});

    expect(langStrings(target)).toEqual([
      ['de', 'Batteriepack'],
      ['en', 'Battery pack'],
    ]);
  });

  it('matches supplemental semantic ids and ignores empty source values', () => {
    const emptySerial = property('SerialNumber', '  ', SERIAL_NUMBER_ID);
    const filledSerial = property('ProductSerial', 'SN-777', 'urn:example:serial');
    filledSerial.supplementalSemanticIds = [reference(SERIAL_NUMBER_ID)];
    const nameplate = submodel('urn:sm:nameplate', 'Nameplate', [emptySerial, smc('Nested', [filledSerial])]);
    const target = property('SerialNumber', 'old', SERIAL_NUMBER_ID);
    const technicalData = submodel('urn:sm:technical', 'TechnicalData', [target]);

    prefillBatteryPassportTechnicalData(nameplate, technicalData, {});

    expect(target.value).toBe('SN-777');
  });

  it('uses the first matching nameplate element when several share a semantic id', () => {
    const nameplate = submodel('urn:sm:nameplate', 'Nameplate', [
      property('SerialNumber', 'FIRST', SERIAL_NUMBER_ID),
      property('SerialNumberCopy', 'SECOND', SERIAL_NUMBER_ID),
    ]);
    const target = property('SerialNumber', '', SERIAL_NUMBER_ID);

    prefillBatteryPassportTechnicalData(nameplate, submodel('urn:sm:technical', 'TechnicalData', [target]), {});

    expect(target.value).toBe('FIRST');
  });

  it('fills manufacturer and product designation aliases from the generator source, preferring german', () => {
    const manufacturerName = property('ManufacturerName', '', MANUFACTURER_NAME_ID);
    const productDesignation = mlp('productdesignation', null);
    const technicalData = submodel('urn:sm:technical', 'TechnicalData', [
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
    const nameplate = submodel('urn:sm:nameplate', 'Nameplate', [
      mlp('ManufacturerName', [['en', 'Nameplate Manufacturer']], MANUFACTURER_NAME_ID),
    ]);
    const manufacturerName = property('ManufacturerName', '', MANUFACTURER_NAME_ID);
    const technicalData = submodel('urn:sm:technical', 'TechnicalData', [manufacturerName]);

    prefillBatteryPassportTechnicalData(nameplate, technicalData, {
      manufacturer: [{ language: 'en', text: 'Generator Manufacturer' }],
    });

    expect(manufacturerName.value).toBe('Generator Manufacturer');
  });
});
