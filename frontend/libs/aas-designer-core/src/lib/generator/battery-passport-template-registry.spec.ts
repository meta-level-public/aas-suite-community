import * as aas from '@aas-core-works/aas-core3.1-typescript';
import {
  classifyBatteryPassportSubmodel,
  getBatteryPassportAdditionalSubmodels,
  getBatteryPassportTemplateDefinition,
  getBatteryPassportTemplateKey,
  matchesBatteryPassportTemplateDefinition,
} from './battery-passport-template-registry';

function createSubmodel(overrides: Partial<aas.types.Submodel> = {}) {
  return {
    id: '',
    idShort: '',
    administration: undefined,
    semanticId: undefined,
    supplementalSemanticIds: [],
    submodelElements: [],
    ...overrides,
  } as aas.types.Submodel;
}

describe('battery-passport-template-registry', () => {
  it('classifies the DBP digital nameplate by exact submodel id', () => {
    const submodel = createSubmodel({
      id: 'https://admin-shell.io/idta/SubmodelTemplate/DigitalBatteryPassport/DigitalNameplate/1/0',
      idShort: 'BatteryNameplate',
    });

    expect(getBatteryPassportTemplateKey(submodel)).toBe('digital-nameplate');
  });

  it('does not classify a generic standard nameplate as DBP digital nameplate', () => {
    const submodel = createSubmodel({
      id: 'https://admin-shell.io/idta/SubmodelTemplate/Nameplate/3/0',
      idShort: 'Nameplate',
      semanticId: {
        keys: [{ value: 'https://admin-shell.io/idta/nameplate/3/0/Nameplate' }],
      } as aas.types.Submodel['semanticId'],
    });

    expect(classifyBatteryPassportSubmodel(submodel)).toBeNull();
  });

  it('classifies handover documentation by its exact semantic id when DBP context is present', () => {
    const submodel = createSubmodel({
      id: 'https://admin-shell.io/idta/SubmodelTemplate/DigitalBatteryPassport/HandoverDocumentation/1/0',
      administration: { templateId: 'https://admin-shell.io/idta-02035-2' } as aas.types.Submodel['administration'],
      semanticId: {
        keys: [{ value: '0173-1#01-AHF578#003' }],
      } as aas.types.Submodel['semanticId'],
    });

    expect(getBatteryPassportTemplateKey(submodel)).toBe('handover-documentation');
  });

  it('classifies technical data by template id only when DBP context is present', () => {
    const submodel = createSubmodel({
      id: 'https://admin-shell.io/idta/SubmodelTemplate/DigitalBatteryPassport/TechnicalData/1/0',
      administration: { templateId: 'IDTA-02003-2-0' } as aas.types.Submodel['administration'],
    });

    expect(getBatteryPassportTemplateKey(submodel)).toBe('technical-data');
  });

  it('does not classify generic technical data by shared template id alone', () => {
    const submodel = createSubmodel({
      id: 'https://admin-shell.io/idta/SubmodelTemplate/TechnicalData/2/0',
      idShort: 'TechnicalData',
      administration: { templateId: 'IDTA-02003-2-0' } as aas.types.Submodel['administration'],
    });

    expect(classifyBatteryPassportSubmodel(submodel)).toBeNull();
  });

  it('classifies DBP carbon footprint by semantic id when DBP context is present', () => {
    const submodel = createSubmodel({
      id: 'https://admin-shell.io/idta/SubmodelTemplate/DigitalBatteryPassport/CarbonFootprint/1/0',
      semanticId: {
        keys: [{ value: 'https://admin-shell.io/idta/CarbonFootprint/CarbonFootprint/1/0' }],
      } as aas.types.Submodel['semanticId'],
    });

    expect(getBatteryPassportTemplateKey(submodel)).toBe('product-carbon-footprint');
  });

  it('excludes handover from additional DBP submodels once the dedicated flow step is introduced', () => {
    const nameplate = createSubmodel({
      id: 'https://admin-shell.io/idta/SubmodelTemplate/DigitalBatteryPassport/DigitalNameplate/1/0',
    });
    const technicalData = createSubmodel({
      id: 'https://admin-shell.io/idta/SubmodelTemplate/DigitalBatteryPassport/TechnicalData/1/0',
    });
    const handover = createSubmodel({
      id: 'https://admin-shell.io/idta/SubmodelTemplate/DigitalBatteryPassport/HandoverDocumentation/1/0',
    });

    expect(getBatteryPassportAdditionalSubmodels([nameplate, technicalData, handover])).toEqual([]);
  });

  it('matches product condition using the central definition', () => {
    const definition = getBatteryPassportTemplateDefinition('product-condition');
    const submodel = createSubmodel({
      id: 'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#ProductCondition/submodel',
    });

    expect(definition).not.toBeNull();
    expect(matchesBatteryPassportTemplateDefinition(submodel, definition!)).toBe(true);
  });
});
