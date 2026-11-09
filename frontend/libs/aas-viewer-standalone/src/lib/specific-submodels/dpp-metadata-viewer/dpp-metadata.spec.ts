import * as aas from '@aas-core-works/aas-core3.1-typescript';
import {
  buildDppMetadataView,
  contentSpecificationName,
  dppGranularityLabel,
  dppStatusLabel,
  dppStatusTone,
} from './dpp-metadata';

const prop = (idShort: string, value: string, semanticId = `https://admin-shell.io/idta/cds/${idShort}/1`) => ({
  modelType: 'Property',
  idShort,
  valueType: 'xs:string',
  value,
  semanticId: { type: 'ExternalReference', keys: [{ type: 'GlobalReference', value: semanticId }] },
});

function submodel(elements: unknown[]) {
  const result = aas.jsonization.submodelFromJsonable({
    modelType: 'Submodel',
    id: 'urn:test:dpp-metadata',
    idShort: 'DppMetadata',
    submodelElements: elements,
  } as never);
  if (result.value == null) throw new Error(String(result.error?.message));
  return result.value;
}

describe('buildDppMetadataView', () => {
  it('reads the fields of the DPP metadata with their semantic IDs', () => {
    const view = buildDppMetadataView(
      submodel([
        prop('digitalProductPassportId', 'https://www.example.org/dpp/1234545'),
        prop('dppStatus', 'Active'),
        prop('granularity', 'Item'),
        // matched by idShort if the semantic ID differs
        prop('economicOperatorId', 'gxx:ppp456789', 'urn:other'),
        {
          modelType: 'SubmodelElementList',
          idShort: 'contentSpecificationIds',
          typeValueListElement: 'Property',
          valueTypeListElement: 'xs:string',
          value: [
            { modelType: 'Property', valueType: 'xs:string', value: 'urn:spec:battery' },
            { modelType: 'Property', valueType: 'xs:string', value: '' },
          ],
        },
      ]),
    );

    expect(view.digitalProductPassportId).toEqual({
      value: 'https://www.example.org/dpp/1234545',
      semanticId: 'https://admin-shell.io/idta/cds/digitalProductPassportId/1',
    });
    expect(view.dppStatus.value).toBe('Active');
    expect(view.economicOperatorId.value).toBe('gxx:ppp456789');
    expect(view.facilityId.value).toBe('');
    expect(view.contentSpecificationIds.map((entry) => entry.value)).toEqual(['urn:spec:battery']);
  });

  it('names content specifications by known submodel or by the name part of their ID', () => {
    expect(contentSpecificationName('https://admin-shell.io/idta/CarbonFootprint/CarbonFootprint/1/0')).toEqual({
      key: 'MARKT_SUBMODEL_PCF',
      text: '',
    });
    expect(
      contentSpecificationName(
        'urn:samm:io.admin-shell.idta.batterypass.material_composition:1.0.0#MaterialComposition',
      ),
    ).toEqual({ key: '', text: 'Material composition' });
    expect(contentSpecificationName('https://admin-shell.io/idta/DigitalBatteryPassport/TechnicalData/1/0').key).toBe(
      'MARKT_SUBMODEL_TECHNICAL_DATA',
    );
    expect(contentSpecificationName('0173-1#01-XYZ123#001')).toEqual({ key: '', text: '' });
  });

  it('translates and colours status and granularity', () => {
    expect(dppStatusLabel('active')).toBe('DPP_STATUS_ACTIVE');
    expect(dppStatusLabel('Archived')).toBe('Archived');
    expect(dppGranularityLabel('Batch')).toBe('DPP_GRANULARITY_BATCH');
    expect([
      dppStatusTone('Active'),
      dppStatusTone('Suspended'),
      dppStatusTone('Withdrawn'),
      dppStatusTone('Draft'),
    ]).toEqual(['success', 'warning', 'danger', 'neutral']);
  });
});
