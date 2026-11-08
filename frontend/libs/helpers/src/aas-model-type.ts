import * as aas from '@aas-core-works/aas-core3.1-typescript';

/**
 * Model type name (e.g. `Property`, `MultiLanguageProperty`, `SubmodelElementCollection`) of an AAS element.
 *
 * Works for parsed aas-core instances (where `modelType` is a method returning `aas.types.ModelType`) as well as
 * for plain JSON objects (where `modelType` is a string or `{ name: ... }`). Returns `null` if no type is known.
 */
export function getAasModelTypeName(element: unknown): string | null {
  if (element == null || typeof element !== 'object') {
    return null;
  }
  if (element instanceof aas.types.Class) {
    return aas.stringification.modelTypeToString(element.modelType());
  }

  const modelType = (element as { modelType?: unknown }).modelType;
  if (typeof modelType === 'string') {
    return modelType;
  }
  const name = (modelType as { name?: unknown } | null | undefined)?.name;
  return typeof modelType === 'object' && typeof name === 'string' ? name : null;
}
