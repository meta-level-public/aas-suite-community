import * as aas from '@aas-core-works/aas-core3.1-typescript';

/**
 * Pure helpers to de-serialize elements pasted or uploaded as JSON (JSON import dialog, snippets).
 */

export type JsonImportType = 'submodel' | 'element' | 'cd';

type DeserializationError = aas.jsonization.DeserializationError;

export interface JsonValidationResult {
  valid: boolean;
  error: string | null;
}

/** Message of a de-serialization error as shown to the user. */
export function formatDeserializationError(error: DeserializationError | null | undefined): string {
  return 'De-serialization failed: ' + `${error?.path}: ` + `${error?.message}`;
}

/**
 * Checks whether the JSON is a valid submodel (import type `submodel`) or submodel element (`element`).
 * Concept descriptions are not validated in advance.
 */
export function validateImportJson(plainJson: string | null | undefined, importType: JsonImportType) {
  const deserialize =
    importType === 'submodel'
      ? aas.jsonization.submodelFromJsonable
      : importType === 'element'
        ? aas.jsonization.submodelElementFromJsonable
        : null;
  if (deserialize == null) {
    return { valid: true, error: null } satisfies JsonValidationResult;
  }

  try {
    const instanceOrError = deserialize(JSON.parse(plainJson ?? ''));
    if (instanceOrError.error != null) {
      const err = instanceOrError.error;
      return { valid: false, error: err.path ? `${err.path}: ${err.message}` : err.message };
    }
  } catch (e) {
    return { valid: false, error: e instanceof Error ? e.message : String(e) };
  }
  return { valid: true, error: null };
}

const SNIPPET_DESERIALIZERS: Record<
  string,
  (jsonable: aas.jsonization.JsonValue) => aas.common.Either<aas.types.Class, DeserializationError>
> = {
  Submodel: aas.jsonization.submodelFromJsonable,
  Property: aas.jsonization.propertyFromJsonable,
  Range: aas.jsonization.rangeFromJsonable,
  File: aas.jsonization.fileFromJsonable,
  MultiLanguageProperty: aas.jsonization.multiLanguagePropertyFromJsonable,
  Operation: aas.jsonization.operationFromJsonable,
  Reference: aas.jsonization.referenceElementFromJsonable,
  SubmodelElementCollection: aas.jsonization.submodelElementCollectionFromJsonable,
  SubmodelElementList: aas.jsonization.submodelElementListFromJsonable,
  ConceptDescription: aas.jsonization.conceptDescriptionFromJsonable,
};

/**
 * De-serializes the JSON of a snippet of the given element type. Returns null if the JSON is not valid
 * for the type and throws for unknown element types.
 */
export function deserializeSnippet(elementType: string, data: string | undefined): aas.types.Class | null {
  const deserialize = SNIPPET_DESERIALIZERS[elementType];
  if (deserialize == null) {
    throw new Error('Unknown element type' + elementType);
  }
  return deserialize(JSON.parse(data ?? '')).value;
}
