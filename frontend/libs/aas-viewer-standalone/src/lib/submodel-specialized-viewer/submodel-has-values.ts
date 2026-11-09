import * as aas from '@aas-core-works/aas-core3.1-typescript';

/**
 * Whether any element of the submodel carries content. A submodel freshly created from a template has only empty
 * properties and collections; the specialized viewers would then show nothing but section headings.
 */
export function submodelHasValues(submodel: aas.types.Submodel | null | undefined): boolean {
  return (submodel?.submodelElements ?? []).some(elementHasValue);
}

function elementHasValue(element: aas.types.ISubmodelElement): boolean {
  if (element instanceof aas.types.SubmodelElementCollection || element instanceof aas.types.SubmodelElementList) {
    return (element.value ?? []).some(elementHasValue);
  }
  if (element instanceof aas.types.Property) {
    return hasText(element.value);
  }
  if (element instanceof aas.types.MultiLanguageProperty) {
    return (element.value ?? []).some((entry) => hasText(entry.text));
  }
  if (element instanceof aas.types.Range) {
    return hasText(element.min) || hasText(element.max);
  }
  if (element instanceof aas.types.File) {
    return hasText(element.value);
  }
  if (element instanceof aas.types.Blob) {
    return (element.value?.length ?? 0) > 0;
  }
  if (element instanceof aas.types.ReferenceElement) {
    return (element.value?.keys.length ?? 0) > 0;
  }
  if (element instanceof aas.types.Entity) {
    return (
      hasText(element.globalAssetId) ||
      (element.specificAssetIds?.length ?? 0) > 0 ||
      (element.statements ?? []).some(elementHasValue)
    );
  }
  // Operations, capabilities, events and relationships describe something by their mere existence
  return true;
}

function hasText(value: string | null | undefined) {
  return (value?.trim().length ?? 0) > 0;
}
