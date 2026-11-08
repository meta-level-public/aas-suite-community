import * as aas from '@aas-core-works/aas-core3.1-typescript';
import {
  CAPABILITY_CONTAINER_SEMANTIC_ID,
  CAPABILITY_DESCRIPTION_SUBMODEL_SEMANTIC_ID,
  CAPABILITY_SEMANTIC_ID,
  collectAvailableCapabilityRefs,
  countCapabilityContainers,
  createCapabilitySet,
  isCapabilityDescriptionSubmodel,
  isCapabilitySet,
} from './v3-capability-addon-helpers';

function withSemanticId<T extends aas.types.IHasSemantics>(element: T, semanticId: string): T {
  element.semanticId = new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
    new aas.types.Key(aas.types.KeyTypes.GlobalReference, semanticId),
  ]);
  return element;
}

function container(capabilityIdShort: string | null) {
  const capability = withSemanticId(new aas.types.Capability(), CAPABILITY_SEMANTIC_ID);
  capability.idShort = capabilityIdShort;
  const smc = withSemanticId(new aas.types.SubmodelElementCollection(), CAPABILITY_CONTAINER_SEMANTIC_ID);
  smc.value = [capability];
  return smc;
}

describe('v3 capability addon helpers', () => {
  it('creates an empty capability set that is recognized as such', () => {
    const set = createCapabilitySet();

    expect(set.idShort).toBe('CapabilitySet');
    expect(set.value).toEqual([]);
    expect(isCapabilitySet(set)).toBe(true);
    expect(isCapabilitySet(new aas.types.SubmodelElementCollection())).toBe(false);
  });

  it('recognizes capability description submodels by their semantic id', () => {
    const submodel = withSemanticId(new aas.types.Submodel('urn:sm'), CAPABILITY_DESCRIPTION_SUBMODEL_SEMANTIC_ID);

    expect(isCapabilityDescriptionSubmodel(submodel)).toBe(true);
    expect(isCapabilityDescriptionSubmodel(new aas.types.Submodel('urn:other'))).toBe(false);
  });

  it('counts the containers and collects the idShorts of their capabilities', () => {
    const set = createCapabilitySet();
    set.value = [
      container('Drilling'),
      container(' '),
      container('Milling'),
      new aas.types.Property(aas.types.DataTypeDefXsd.String),
    ];

    expect(countCapabilityContainers(set)).toBe(3);
    expect(collectAvailableCapabilityRefs(set)).toEqual(['Drilling', 'Milling']);
    expect(countCapabilityContainers(new aas.types.Submodel('urn:sm'))).toBe(0);
    expect(collectAvailableCapabilityRefs(undefined)).toEqual([]);
  });
});
