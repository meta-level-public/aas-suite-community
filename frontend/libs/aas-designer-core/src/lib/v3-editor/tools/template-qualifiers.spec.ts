import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { isTemplateQualifier, removeTemplateQualifiersOf } from './template-qualifiers';

function qualifier(type: string, options: { kind?: aas.types.QualifierKind; semanticId?: string } = {}) {
  const semanticId =
    options.semanticId == null
      ? null
      : new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
          new aas.types.Key(aas.types.KeyTypes.GlobalReference, options.semanticId),
        ]);
  return new aas.types.Qualifier(type, aas.types.DataTypeDefXsd.String, semanticId, null, options.kind ?? null, 'x');
}

describe('template qualifiers', () => {
  it('recognizes template qualifiers without the invalidated kind', () => {
    expect(isTemplateQualifier(qualifier('SMT/Cardinality'))).toBe(true);
    expect(isTemplateQualifier(qualifier('SMT/AllowedValue'))).toBe(true);
    expect(isTemplateQualifier(qualifier('Multiplicity'))).toBe(true);
    expect(isTemplateQualifier(qualifier('Cardinality'))).toBe(true);
    expect(
      isTemplateQualifier(
        qualifier('Anything', { semanticId: 'https://admin-shell.io/SubmodelTemplates/Cardinality/1/0' }),
      ),
    ).toBe(true);
  });

  it('still reads kind = TemplateQualifier of older AAS', () => {
    expect(isTemplateQualifier(qualifier('Custom', { kind: aas.types.QualifierKind.TemplateQualifier }))).toBe(true);
    expect(isTemplateQualifier(qualifier('Custom', { kind: aas.types.QualifierKind.ValueQualifier }))).toBe(false);
  });

  it('keeps example values and own qualifiers', () => {
    expect(isTemplateQualifier(qualifier('ExampleValue'))).toBe(false);
    expect(isTemplateQualifier(qualifier('SMT/ExampleValue'))).toBe(false);
    expect(isTemplateQualifier(qualifier('ExampleValue', { kind: aas.types.QualifierKind.TemplateQualifier }))).toBe(
      false,
    );
    expect(isTemplateQualifier(qualifier('Plant/Location'))).toBe(false);
  });

  it('removes only the template qualifiers of an element', () => {
    const property = new aas.types.Property(aas.types.DataTypeDefXsd.String);
    property.qualifiers = [qualifier('SMT/Cardinality'), qualifier('ExampleValue')];

    expect(removeTemplateQualifiersOf(property)).toBe(1);
    expect(property.qualifiers?.map((q) => q.type)).toEqual(['ExampleValue']);

    property.qualifiers = [qualifier('SMT/Cardinality')];
    expect(removeTemplateQualifiersOf(property)).toBe(1);
    expect(property.qualifiers).toBeNull();
  });
});
