import * as aas from '@aas-core-works/aas-core3.1-typescript';

import { describe, expect, it } from 'vitest';

import { GeneratorExportService } from './generator-export.service';

function createGeneratorExportService() {
  return new GeneratorExportService({} as never, { config: { apiPath: '' } } as never);
}

function createEnvironmentWithEmptyPropertyValue() {
  const shell = new aas.types.AssetAdministrationShell(
    'urn:test:aas',
    new aas.types.AssetInformation(aas.types.AssetKind.Instance),
  );
  const property = new aas.types.Property(aas.types.DataTypeDefXsd.String, undefined, undefined, 'SerialNumber');
  property.value = '';

  const submodel = new aas.types.Submodel('urn:test:submodel');
  submodel.submodelElements = [property];

  shell.submodels = [
    new aas.types.Reference(aas.types.ReferenceTypes.ModelReference, [
      new aas.types.Key(aas.types.KeyTypes.Submodel, submodel.id),
    ]),
  ];

  return new aas.types.Environment([shell], [submodel], []);
}

function createEnvironmentWithEmptyLangStringText() {
  const shell = new aas.types.AssetAdministrationShell(
    'urn:test:aas',
    new aas.types.AssetInformation(aas.types.AssetKind.Instance),
  );
  const property = new aas.types.MultiLanguageProperty(undefined, undefined, 'ManufacturerName');
  property.value = [new aas.types.LangStringTextType('en', '')];

  const submodel = new aas.types.Submodel('urn:test:submodel');
  submodel.submodelElements = [property];

  shell.submodels = [
    new aas.types.Reference(aas.types.ReferenceTypes.ModelReference, [
      new aas.types.Key(aas.types.KeyTypes.Submodel, submodel.id),
    ]),
  ];

  return new aas.types.Environment([shell], [submodel], []);
}

describe('GeneratorExportService', () => {
  it('sets empty string values to null on object verification paths', () => {
    const service = createGeneratorExportService();
    const environment = createEnvironmentWithEmptyPropertyValue();

    const changed = service['fixEmptyStringValue'](environment, '.submodels[0].submodelElements[0]');

    expect(changed).toBe(true);

    const property = environment.submodels?.[0]?.submodelElements?.[0] as aas.types.Property | undefined;
    expect(property?.value).toBeNull();
  });

  it('sets empty string values to null on nested value verification paths', () => {
    const service = createGeneratorExportService();
    const environment = createEnvironmentWithEmptyPropertyValue();

    const changed = service['fixEmptyStringValue'](environment, '.submodels[0].submodelElements[0].value');

    expect(changed).toBe(true);

    const property = environment.submodels?.[0]?.submodelElements?.[0] as aas.types.Property | undefined;
    expect(property?.value).toBeNull();
  });

  it('removes empty lang string entries and nulls empty parent values on nested text verification paths', () => {
    const service = createGeneratorExportService();
    const environment = createEnvironmentWithEmptyLangStringText();

    const changed = service['fixEmptyStringValue'](environment, '.submodels[0].submodelElements[0].value[0].text');

    expect(changed).toBe(true);

    const property = environment.submodels?.[0]?.submodelElements?.[0] as aas.types.MultiLanguageProperty | undefined;
    expect(property?.value).toBeNull();
  });

  it('keeps template fixes verifiable when empty lang string texts are removed', () => {
    const service = createGeneratorExportService();
    const environment = createEnvironmentWithEmptyLangStringText();

    const fixedEnvironment = service.applyTemplateFixes(environment);

    expect(() => Array.from(aas.verification.verify(fixedEnvironment))).not.toThrow();

    const property = fixedEnvironment.submodels?.[0]?.submodelElements?.[0] as
      | aas.types.MultiLanguageProperty
      | undefined;
    expect(property?.value).toBeNull();
  });
});
