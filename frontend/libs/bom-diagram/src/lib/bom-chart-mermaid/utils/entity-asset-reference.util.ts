import {
  Entity,
  EntityType,
  ISubmodelElement,
  Key,
  KeyTypes,
  SpecificAssetId,
} from '@aas-core-works/aas-core3.1-typescript/types';

function hasText(value: string | null | undefined) {
  return (value?.trim().length ?? 0) > 0;
}

function isSpecificAssetIdComplete(specificAssetId: SpecificAssetId | undefined) {
  return hasText(specificAssetId?.name) && hasText(specificAssetId?.value);
}

function hasSpecificAssetIds(entity: Entity | undefined) {
  return (entity?.specificAssetIds?.length ?? 0) > 0;
}

export function specificAssetIdsAreComplete(entity: Entity | undefined) {
  const specificAssetIds = entity?.specificAssetIds;
  if (specificAssetIds == null || specificAssetIds.length === 0) {
    return true;
  }

  return specificAssetIds.every(isSpecificAssetIdComplete);
}

export function entityHasRequiredAssetReference(entity: Entity | undefined) {
  if (entity == null || entity.entityType !== EntityType.SelfManagedEntity) {
    return true;
  }

  return hasText(entity.globalAssetId) || (entity.specificAssetIds ?? []).some(isSpecificAssetIdComplete);
}

export function entityHasExclusiveAssetReference(entity: Entity | undefined) {
  if (entity == null || entity.entityType !== EntityType.SelfManagedEntity) {
    return true;
  }

  return !(hasText(entity.globalAssetId) && hasSpecificAssetIds(entity));
}

export function cloneSpecificAssetIds(
  specificAssetIds: Array<SpecificAssetId | { name: string; value: string }> | null | undefined,
) {
  if (specificAssetIds == null) {
    return null;
  }

  return specificAssetIds.map((specificAssetId) => new SpecificAssetId(specificAssetId.name, specificAssetId.value));
}

export function cloneKeys(keys: Array<Key | { type: KeyTypes; value: string }> | null | undefined) {
  return (keys ?? []).map((key) => new Key(key.type, key.value));
}

export function createUniqueSiblingIdShort(
  elements: ISubmodelElement[] | null | undefined,
  baseIdShort: string,
  currentElement?: ISubmodelElement,
) {
  const normalizedBaseIdShort = baseIdShort.trim();
  const usedIdShorts = new Set(
    (elements ?? [])
      .filter((element) => element !== currentElement)
      .map((element) => element.idShort?.trim() ?? '')
      .filter((idShort) => idShort.length > 0),
  );

  if (!usedIdShorts.has(normalizedBaseIdShort)) {
    return normalizedBaseIdShort;
  }

  let suffix = 2;
  while (usedIdShorts.has(`${normalizedBaseIdShort}_${suffix}`)) {
    suffix++;
  }

  return `${normalizedBaseIdShort}_${suffix}`;
}
