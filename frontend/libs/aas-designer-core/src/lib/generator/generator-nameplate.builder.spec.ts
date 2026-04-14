import * as aas from '@aas-core-works/aas-core3.1-typescript';

import { describe, expect, it } from 'vitest';

import {
  buildNameplateMarkingElements,
  buildTemplateBackedNameplateSubmodel,
  createDppDigitalNameplateSubmodel,
  createStandardAssistantNameplateSubmodel,
  populateStandardNameplateSubmodel,
  syncNameplateMarkingsElement,
  syncTemplateBackedNameplateMirrorValues,
} from './generator-nameplate.builder';

describe('generator-nameplate.builder', () => {
  it('populates a standard nameplate submodel from generator state', () => {
    const nameplate = new aas.types.Submodel('urn:test:nameplate', undefined, undefined, 'Nameplate');
    const requiredSemanticIds: string[] = [];

    populateStandardNameplateSubmodel(
      nameplate,
      {
        nameplate: {
          manufacturer: [{ language: 'en', text: 'ACME' }],
          address: {
            street: [{ language: 'en', text: 'Main Street 1' }],
            zip: [{ language: 'en', text: '12345' }],
            cityTown: [{ language: 'en', text: 'Hamburg' }],
            countryCode: [{ language: 'en', text: 'DE' }],
          },
          productDesignation: [{ language: 'en', text: 'Battery Pack' }],
          productFamily: [{ language: 'en', text: 'Family A' }],
          serialNumber: 'SN-42',
          yearOfConstruction: '2026',
        },
      },
      'https://example.com/',
      requiredSemanticIds,
    );

    expect(nameplate.submodelElements?.some((element) => element.idShort === 'ManufacturerName')).toBe(true);
    expect(nameplate.submodelElements?.some((element) => element.idShort === 'ContactInformation')).toBe(true);
    expect(nameplate.submodelElements?.some((element) => element.idShort === 'AssetSpecificProperties')).toBe(true);
    expect(requiredSemanticIds).toContain('0173-1#02-AAO677#002');
  });

  it('builds and syncs nameplate markings', () => {
    const requiredSemanticIds: string[] = [];
    const markings = buildNameplateMarkingElements(
      [
        {
          name: 'CE',
          filename: '/aasx/files/ce.svg',
          additionalText: 'certified',
          file: new File(['ce'], 'ce.svg', { type: 'image/svg+xml' }),
        },
      ],
      requiredSemanticIds,
    );

    expect(markings).toHaveLength(1);

    const nameplate = new aas.types.Submodel('urn:test:nameplate', undefined, undefined, 'Nameplate');
    nameplate.submodelElements = [];
    syncNameplateMarkingsElement(
      nameplate,
      [{ name: 'CE', filename: '/aasx/files/ce.svg' }],
      requiredSemanticIds,
      () => [],
    );

    expect(nameplate.submodelElements?.some((element) => element.idShort === 'Markings')).toBe(true);
    expect(requiredSemanticIds).toContain('0173-1#01-AHD206#001');
  });

  it('syncs template-backed mirror values through callbacks', () => {
    const manufacturer = {
      idShort: 'ManufacturerName',
      modelType: { name: 'MultiLanguageProperty' },
      value: [new aas.types.LangStringTextType('en', 'Old')],
    };

    const company = {
      idShort: 'Company',
      modelType: { name: 'MultiLanguageProperty' },
      value: [new aas.types.LangStringTextType('en', 'Old')],
    };

    const stateCounty = {
      idShort: 'StateCounty',
      modelType: { name: 'MultiLanguageProperty' },
      value: [new aas.types.LangStringTextType('en', 'Old')],
    };

    const companyCollection = {
      idShort: 'ContactInformation',
      modelType: { name: 'SubmodelElementCollection' },
      value: [company, stateCounty],
    };

    const serialNumber = {
      idShort: 'SerialNumber',
      modelType: { name: 'Property' },
      value: 'OLD-SN',
    };

    const yearOfConstruction = {
      idShort: 'YearOfConstruction',
      modelType: { name: 'Property' },
      value: '1900',
    };

    const nameplate = {
      submodelElements: [manufacturer, companyCollection, serialNumber, yearOfConstruction],
    } as unknown as aas.types.Submodel;

    syncTemplateBackedNameplateMirrorValues(
      nameplate,
      {
        nameplate: {
          manufacturer: [{ language: 'en', text: 'ACME' }],
          address: {
            stateCounty: [{ language: 'en', text: 'Hamburg' }],
          },
          serialNumber: 'SN-42',
          yearOfConstruction: '2026',
        },
      },
      [],
    );

    expect((manufacturer.value ?? [])[0]?.text).toBe('ACME');
    expect((company.value ?? [])[0]?.text).toBe('ACME');
    expect((stateCounty.value ?? [])[0]?.text).toBe('Hamburg');
    expect(serialNumber.value).toBe('SN-42');
    expect(yearOfConstruction.value).toBe('2026');
  });

  it('builds a template-backed nameplate submodel from the current work state and overlays template metadata', () => {
    const requiredSemanticIds: string[] = [];
    const template = new aas.types.Submodel('urn:test:template-nameplate', undefined, undefined, 'NameplateTemplate');
    template.idShort = 'Nameplate';
    template.semanticId = new aas.types.Reference(aas.types.ReferenceTypes.ModelReference, [
      new aas.types.Key(aas.types.KeyTypes.ConceptDescription, 'urn:semantics:template-nameplate'),
    ]);

    const currentNameplate = new aas.types.Submodel(
      'urn:test:current-nameplate',
      undefined,
      undefined,
      'CurrentNameplate',
    );

    const manufacturer = new aas.types.MultiLanguageProperty(null, null, 'ManufacturerName');
    manufacturer.semanticId = new aas.types.Reference(aas.types.ReferenceTypes.ModelReference, [
      new aas.types.Key(aas.types.KeyTypes.ConceptDescription, 'urn:semantics:manufacturer'),
    ]);
    manufacturer.value = [new aas.types.LangStringTextType('en', 'Current ACME')];

    const serialNumber = new aas.types.Property(aas.types.DataTypeDefXsd.String, null, null, 'SerialNumber');
    serialNumber.value = 'CURRENT-SN';

    currentNameplate.submodelElements = [manufacturer, serialNumber];

    const nameplate = buildTemplateBackedNameplateSubmodel({
      nameplateTemplate: template,
      currentNameplate,
      source: {
        nameplate: {
          manufacturer: [{ language: 'en', text: 'ACME' }],
          serialNumber: 'SN-42',
        },
      },
      iriPrefix: 'https://example.com/',
      requiredSemanticIds,
    });

    const builtManufacturer = (nameplate.submodelElements ?? []).find(
      (element) => element.idShort === 'ManufacturerName',
    ) as aas.types.MultiLanguageProperty | undefined;
    const builtSerialNumber = (nameplate.submodelElements ?? []).find(
      (element) => element.idShort === 'SerialNumber',
    ) as aas.types.Property | undefined;

    expect(nameplate).not.toBe(currentNameplate);
    expect(nameplate.id).not.toBe(currentNameplate.id);
    expect(nameplate.idShort).toBe('Nameplate');
    expect(nameplate.semanticId?.keys?.[0]?.value).toBe('urn:semantics:template-nameplate');
    expect(builtManufacturer?.value?.[0]?.text).toBe('Current ACME');
    expect(builtSerialNumber?.value).toBe('CURRENT-SN');
    expect(requiredSemanticIds).toContain('urn:semantics:template-nameplate');
    expect(requiredSemanticIds).toContain('urn:semantics:manufacturer');
  });

  it('creates standard and dpp nameplate submodels through dedicated builders', () => {
    const standardSemanticIds: string[] = [];
    const dppSemanticIds: string[] = [];
    const source = {
      nameplate: {
        manufacturer: [{ language: 'en', text: 'ACME' }],
      },
    };

    const standardNameplate = createStandardAssistantNameplateSubmodel(
      source,
      'https://example.com/',
      standardSemanticIds,
    );
    const dppNameplate = createDppDigitalNameplateSubmodel(source, 'https://example.com/', dppSemanticIds);

    expect(standardNameplate.idShort).toBe('Nameplate');
    expect(standardNameplate.semanticId?.keys?.[0]?.value).toBe('https://admin-shell.io/zvei/nameplate/2/0/Nameplate');
    expect(dppNameplate.idShort).toBe('DigitalNameplate');
    expect(dppNameplate.semanticId?.keys?.[0]?.value).toBe('https://admin-shell.io/idta/nameplate/3/0/Nameplate');
    expect(standardSemanticIds).toContain('0173-1#02-AAO677#002');
    expect(dppSemanticIds).toContain('0173-1#02-AAO677#002');
  });
});
