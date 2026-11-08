import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { SemanticIdHelper } from '@aas/helpers';

/** Pure helpers for the capability addon (IDTA Capability Description). */

export const CAPABILITY_DESCRIPTION_SUBMODEL_SEMANTIC_ID =
  'https://admin-shell.io/idta/SubmodelTemplate/CapabilityDescription/1/0';
export const CAPABILITY_SET_SEMANTIC_ID = 'https://admin-shell.io/idta/CapabilityDescription/CapabilitySet/1/0';
export const CAPABILITY_CONTAINER_SEMANTIC_ID =
  'https://admin-shell.io/idta/CapabilityDescription/CapabilityContainer/1/0';
export const CAPABILITY_SEMANTIC_ID = 'https://admin-shell.io/idta/CapabilityDescription/Capability/1/0';

export function isCapabilitySet(content: unknown): content is aas.types.SubmodelElementCollection {
  return (
    content instanceof aas.types.SubmodelElementCollection &&
    SemanticIdHelper.hasSemanticId(content, CAPABILITY_SET_SEMANTIC_ID)
  );
}

export function isCapabilityDescriptionSubmodel(content: unknown): content is aas.types.Submodel {
  return (
    content instanceof aas.types.Submodel &&
    SemanticIdHelper.hasSemanticId(content, CAPABILITY_DESCRIPTION_SUBMODEL_SEMANTIC_ID)
  );
}

/** New, empty CapabilitySet collection. */
export function createCapabilitySet(): aas.types.SubmodelElementCollection {
  const capabilitySet = new aas.types.SubmodelElementCollection(null, null, 'CapabilitySet');
  capabilitySet.semanticId = new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
    new aas.types.Key(aas.types.KeyTypes.GlobalReference, CAPABILITY_SET_SEMANTIC_ID),
  ]);
  capabilitySet.value = [];
  return capabilitySet;
}

/** Number of capability containers inside a CapabilitySet (0 for other content). */
export function countCapabilityContainers(capabilitySet: unknown): number {
  if (!(capabilitySet instanceof aas.types.SubmodelElementCollection)) {
    return 0;
  }
  return (capabilitySet.value ?? []).filter((el) =>
    SemanticIdHelper.hasSemanticId(el, CAPABILITY_CONTAINER_SEMANTIC_ID),
  ).length;
}

/** idShorts of the capabilities inside the containers of a CapabilitySet (to reference them). */
export function collectAvailableCapabilityRefs(capabilitySet: unknown): string[] {
  if (!(capabilitySet instanceof aas.types.SubmodelElementCollection)) {
    return [];
  }
  const refs: string[] = [];
  for (const element of capabilitySet.value ?? []) {
    if (
      !(element instanceof aas.types.SubmodelElementCollection) ||
      !SemanticIdHelper.hasSemanticId(element, CAPABILITY_CONTAINER_SEMANTIC_ID)
    ) {
      continue;
    }
    const capabilityElement = element.value?.find((child) =>
      SemanticIdHelper.hasSemanticId(child, CAPABILITY_SEMANTIC_ID),
    );
    const idShort = capabilityElement?.idShort?.trim();
    if (idShort != null && idShort !== '') {
      refs.push(idShort);
    }
  }
  return refs;
}
