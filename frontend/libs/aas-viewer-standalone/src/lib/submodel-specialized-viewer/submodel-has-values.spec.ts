import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { submodelHasValues } from './submodel-has-values';

function submodel(elements: unknown[]) {
  const result = aas.jsonization.submodelFromJsonable({
    modelType: 'Submodel',
    id: 'urn:test:submodel',
    submodelElements: elements,
  } as never);
  if (result.value == null) throw new Error(String(result.error?.message));
  return result.value;
}

const property = (idShort: string, value?: string) => ({
  modelType: 'Property',
  idShort,
  valueType: 'xs:string',
  ...(value != null ? { value } : {}),
});
const collection = (idShort: string, value: unknown[]) => ({ modelType: 'SubmodelElementCollection', idShort, value });

describe('submodelHasValues', () => {
  it('is false for a submodel that only contains the empty template', () => {
    // Like the battery nameplate of a freshly created battery passport
    const empty = submodel([
      collection('AddressInformation', [collection('ContactInformation', [property('RoleOfContactPerson')])]),
      property('SerialNumber'),
      { modelType: 'MultiLanguageProperty', idShort: 'ManufacturerName' },
      property('Blank', '   '),
    ]);

    expect(submodelHasValues(empty)).toBe(false);
  });

  it('is true as soon as one nested element has a value', () => {
    const filled = submodel([collection('AddressInformation', [property('CityTown', 'Saarbrücken')])]);

    expect(submodelHasValues(filled)).toBe(true);
  });

  it('counts multi-language texts and ranges', () => {
    expect(
      submodelHasValues(
        submodel([{ modelType: 'MultiLanguageProperty', idShort: 'Name', value: [{ language: 'de', text: 'Akku' }] }]),
      ),
    ).toBe(true);
    expect(
      submodelHasValues(submodel([{ modelType: 'Range', idShort: 'Temp', valueType: 'xs:double', max: '60' }])),
    ).toBe(true);
  });

  it('is false for a submodel without elements', () => {
    expect(submodelHasValues(submodel([]))).toBe(false);
    expect(submodelHasValues(undefined)).toBe(false);
  });
});
