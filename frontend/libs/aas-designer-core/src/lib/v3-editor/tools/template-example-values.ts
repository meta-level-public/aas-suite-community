import * as aas from '@aas-core-works/aas-core3.1-typescript';

/** Qualifier type in which IDTA templates keep example values. */
export const EXAMPLE_VALUE_QUALIFIER = 'ExampleValue';

/** Example value of an element (ExampleValue qualifier), if there is one. */
export function exampleValueOf(element: aas.types.ISubmodelElement): string | null {
  return element.qualifiers?.find((q) => q.type.toLowerCase() === EXAMPLE_VALUE_QUALIFIER.toLowerCase())?.value ?? null;
}

/**
 * Moves the value of a single element into an ExampleValue qualifier and empties it. Some IDTA templates
 * (e.g. Digital Nameplate 3.0, Contact Information) carry example data such as "Muster AG" as values,
 * which would otherwise look like real data. An existing ExampleValue qualifier is kept.
 * Returns true if a value was moved.
 */
export function moveValueToExampleValue(element: aas.types.ISubmodelElement): boolean {
  const example = currentValueText(element);
  if (example == null) return false;

  if (exampleValueOf(element) == null) {
    element.qualifiers = [
      ...(element.qualifiers ?? []),
      new aas.types.Qualifier(
        EXAMPLE_VALUE_QUALIFIER,
        aas.types.DataTypeDefXsd.String,
        null,
        null,
        // like in the IDTA templates: without kind, so it survives "remove template qualifiers"
        null,
        example,
      ),
    ];
  }

  if (element instanceof aas.types.Range) {
    element.min = null;
    element.max = null;
  } else if (
    element instanceof aas.types.Property ||
    element instanceof aas.types.MultiLanguageProperty ||
    element instanceof aas.types.File
  ) {
    element.value = null;
  }
  return true;
}

/** {@link moveValueToExampleValue} for the element and all its children. Returns the number of moved values. */
export function moveTemplateValuesToExampleValues(element: aas.types.ISubmodelElement): number {
  const own = moveValueToExampleValue(element) ? 1 : 0;
  return childrenOf(element).reduce((count, child) => count + moveTemplateValuesToExampleValues(child), own);
}

/** Value as text in the IDTA notation for examples, e.g. "Examplary title@en" for multi-language values. */
function currentValueText(element: aas.types.ISubmodelElement): string | null {
  if (element instanceof aas.types.Property || element instanceof aas.types.File) {
    return hasText(element.value) ? element.value!.trim() : null;
  }
  if (element instanceof aas.types.MultiLanguageProperty) {
    const filled = (element.value ?? []).filter((v) => hasText(v.text));
    return filled.length === 0 ? null : filled.map((v) => `${v.text.trim()}@${v.language}`).join('; ');
  }
  if (element instanceof aas.types.Range) {
    return hasText(element.min) || hasText(element.max) ? `${element.min ?? ''}...${element.max ?? ''}` : null;
  }
  return null;
}

function childrenOf(element: aas.types.ISubmodelElement): aas.types.ISubmodelElement[] {
  if (element instanceof aas.types.SubmodelElementCollection || element instanceof aas.types.SubmodelElementList) {
    return element.value ?? [];
  }
  if (element instanceof aas.types.Entity) {
    return element.statements ?? [];
  }
  return [];
}

function hasText(value: string | null | undefined): boolean {
  return (value?.trim().length ?? 0) > 0;
}
