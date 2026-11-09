import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { describe, expect, it } from 'vitest';
import { SubmodelViewerResolver } from './submodel-viewer-resolver';

function semanticRef(value: string) {
  return new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
    new aas.types.Key(aas.types.KeyTypes.GlobalReference, value),
  ]);
}

function submodelWithSemanticId(value: string): aas.types.Submodel {
  const submodel = new aas.types.Submodel('urn:test:submodel', null, null, 'Nameplate');
  submodel.semanticId = semanticRef(value);
  return submodel;
}

describe('SubmodelViewerResolver', () => {
  it('resolves the IDTA DPP metadata to the DPP metadata viewer', () => {
    expect(
      SubmodelViewerResolver.resolve(submodelWithSemanticId('https://admin-shell.io/idta/cds/dppMetadata/1')),
    ).toBe('DppMetadata');
  });

  it('resolves Technical Data 1.2 and 2.0 to the technical data viewer', () => {
    expect(
      SubmodelViewerResolver.resolve(submodelWithSemanticId('https://admin-shell.io/ZVEI/TechnicalData/Submodel/1/2')),
    ).toBe('TechnicalData');
    // Technical Data 2.0 (IDTA 02003-2-0) identifies the submodel by its ECLASS IRDI
    expect(SubmodelViewerResolver.resolve(submodelWithSemanticId('0173-1#01-AHX837#002'))).toBe('TechnicalData');
    // The battery passport uses the same structure under its own ID
    expect(
      SubmodelViewerResolver.resolve(
        submodelWithSemanticId('https://admin-shell.io/idta/DigitalBatteryPassport/TechnicalData/1/0'),
      ),
    ).toBe('TechnicalData');
  });

  it('resolves the battery passport circularity submodel to the dedicated circularity viewer', () => {
    const submodel = submodelWithSemanticId('urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#Circularity');

    expect(SubmodelViewerResolver.resolve(submodel)).toBe('Circularity');
  });

  it('resolves the battery passport product condition submodel to the dedicated viewer', () => {
    const submodel = submodelWithSemanticId(
      'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#ProductCondition',
    );

    expect(SubmodelViewerResolver.resolve(submodel)).toBe('ProductCondition');
  });

  it('resolves the battery passport material composition submodel to the dedicated viewer', () => {
    const submodel = submodelWithSemanticId(
      'urn:samm:io.admin-shell.idta.batterypass.material_composition:1.0.0#MaterialComposition',
    );

    expect(SubmodelViewerResolver.resolve(submodel)).toBe('MaterialComposition');
  });

  it('resolves the battery passport digital nameplate to the dedicated battery nameplate viewer', () => {
    const submodel = submodelWithSemanticId(
      'https://admin-shell.io/idta/digitalbatterypassport/nameplate/1/0/Nameplate',
    );

    expect(SubmodelViewerResolver.resolve(submodel)).toBe('BatteryNameplate');
  });

  it('reports a specialized viewer for the battery passport digital nameplate', () => {
    const submodel = submodelWithSemanticId(
      'https://admin-shell.io/idta/digitalbatterypassport/nameplate/1/0/Nameplate',
    );

    expect(SubmodelViewerResolver.hasSpecializedViewer(submodel)).toBe(true);
  });

  it('reports a specialized viewer for the battery passport product condition submodel', () => {
    const submodel = submodelWithSemanticId(
      'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#ProductCondition',
    );

    expect(SubmodelViewerResolver.hasSpecializedViewer(submodel)).toBe(true);
  });

  it('resolves asset interfaces descriptions of version 1.0 and 1.2 to the dedicated viewer', () => {
    for (const semanticId of [
      'https://admin-shell.io/idta/AssetInterfacesDescription/1/0/Submodel',
      'https://admin-shell.io/idta/AssetInterfacesDescription/1/2/Submodel',
    ]) {
      expect(SubmodelViewerResolver.resolve(submodelWithSemanticId(semanticId))).toBe('AssetInterfacesDescription');
    }
  });

  it('keeps the standard nameplate on the existing nameplate viewer', () => {
    const submodel = submodelWithSemanticId('https://admin-shell.io/idta/nameplate/3/0/Nameplate');

    expect(SubmodelViewerResolver.resolve(submodel)).toBe('Nameplate');
  });
});
