import * as aas from '@aas-core-works/aas-core3.1-typescript';

/** semanticId prefix of the qualifiers that IDTA defines for submodel templates (e.g. Cardinality). */
const SMT_QUALIFIER_SEMANTIC_ID = 'https://admin-shell.io/submodeltemplates/';

/** Qualifier types of submodel templates without the "SMT/" prefix, as used by older templates. */
const LEGACY_SMT_TYPES = ['multiplicity', 'cardinality'];

/**
 * true if the qualifier only describes the template (e.g. SMT/Cardinality) and does not belong in an
 * instance. Qualifier/kind is invalidated in the AAS metamodel (aas-specs-metamodel #451, PR 713), so
 * template qualifiers are recognized by type and semanticId; kind = TemplateQualifier is still read
 * for older AAS. Example values are never template qualifiers here: they stay as information.
 */
export function isTemplateQualifier(qualifier: aas.types.Qualifier): boolean {
  const type = qualifier.type.trim().toLowerCase();
  if (type.endsWith('examplevalue')) return false;

  const semanticId = qualifier.semanticId?.keys?.[0]?.value?.toLowerCase() ?? '';
  return (
    qualifier.kind === aas.types.QualifierKind.TemplateQualifier ||
    type.startsWith('smt/') ||
    LEGACY_SMT_TYPES.includes(type) ||
    semanticId.startsWith(SMT_QUALIFIER_SEMANTIC_ID)
  );
}

/** Removes the template qualifiers of a single element, returns how many were removed. */
export function removeTemplateQualifiersOf(element: { qualifiers: aas.types.Qualifier[] | null }): number {
  if (element.qualifiers == null) return 0;
  const kept = element.qualifiers.filter((q) => !isTemplateQualifier(q));
  const removed = element.qualifiers.length - kept.length;
  element.qualifiers = kept.length > 0 ? kept : null;
  return removed;
}
