import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { describe, expect, it } from 'vitest';
import { ReferenceElementComponent } from './reference-element.component';

function referenceElement(type: aas.types.ReferenceTypes, keys: aas.types.Key[]) {
  const element = new aas.types.ReferenceElement(null, null, 'AAS');
  element.value = new aas.types.Reference(type, keys);
  return element;
}

describe('ReferenceElementComponent', () => {
  it('shows key types of aas-core objects by name', () => {
    const component = new ReferenceElementComponent();

    expect(component.getReadableType(aas.types.KeyTypes.AssetAdministrationShell)).toBe('Asset Administration Shell');
    expect(component.getReadableType('GlobalReference')).toBe('Global Reference');
  });

  it('offers the AAS of a model reference to be opened', () => {
    const component = new ReferenceElementComponent();
    component.element = referenceElement(aas.types.ReferenceTypes.ModelReference, [
      new aas.types.Key(aas.types.KeyTypes.AssetAdministrationShell, 'urn:test:aas:schaukel'),
    ]);

    expect(component.getShellAasId(0)).toBe('urn:test:aas:schaukel');
  });

  it('does not offer other references to be opened', () => {
    const component = new ReferenceElementComponent();
    component.element = referenceElement(aas.types.ReferenceTypes.ExternalReference, [
      new aas.types.Key(aas.types.KeyTypes.GlobalReference, 'urn:test:aas:schaukel'),
    ]);
    expect(component.getShellAasId(0)).toBeNull();

    component.element = referenceElement(aas.types.ReferenceTypes.ModelReference, [
      new aas.types.Key(aas.types.KeyTypes.Submodel, 'urn:test:submodel'),
    ]);
    expect(component.getShellAasId(0)).toBeNull();
  });
});
