import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { exampleValueOf, moveTemplateValuesToExampleValues } from './template-example-values';

function property(idShort: string, value: string | null) {
  const p = new aas.types.Property(aas.types.DataTypeDefXsd.String);
  p.idShort = idShort;
  p.value = value;
  return p;
}

describe('template example values', () => {
  it('moves values of a template into ExampleValue qualifiers, recursively', () => {
    const company = new aas.types.MultiLanguageProperty();
    company.idShort = 'Company';
    company.value = [
      new aas.types.LangStringTextType('de', 'Muster AG'),
      new aas.types.LangStringTextType('en', 'Example Ltd'),
    ];
    const email = property('EmailAddress', 'email@muster-ag.de');
    const empty = property('Fax', null);
    const contact = new aas.types.SubmodelElementCollection();
    contact.idShort = 'ContactInformation';
    contact.value = [company, email, empty];

    const moved = moveTemplateValuesToExampleValues(contact);

    expect(moved).toBe(2);
    expect(company.value).toBeNull();
    expect(exampleValueOf(company)).toBe('Muster AG@de; Example Ltd@en');
    expect(email.value).toBeNull();
    expect(exampleValueOf(email)).toBe('email@muster-ag.de');
    expect(empty.qualifiers).toBeNull();
  });

  it('keeps an existing ExampleValue qualifier and does not mark it as template qualifier', () => {
    const classId = property('ClassId', '02-04');
    classId.qualifiers = [
      new aas.types.Qualifier('ExampleValue', aas.types.DataTypeDefXsd.String, null, null, null, '03-02'),
    ];
    const year = property('YearOfConstruction', '2022');

    moveTemplateValuesToExampleValues(classId);
    moveTemplateValuesToExampleValues(year);

    expect(classId.value).toBeNull();
    expect(classId.qualifiers?.map((q) => q.value)).toEqual(['03-02']);
    expect(year.qualifiers?.[0].kind).toBeNull();
  });
});
