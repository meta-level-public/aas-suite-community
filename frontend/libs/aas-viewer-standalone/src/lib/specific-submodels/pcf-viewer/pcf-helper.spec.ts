import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { describe, expect, it } from 'vitest';
import { PcfHelper } from './pcf-helper';

function ref(value: string) {
  return new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
    new aas.types.Key(aas.types.KeyTypes.GlobalReference, value),
  ]);
}

function property(semanticId: string, value: string, unit?: string) {
  const element = new aas.types.Property(aas.types.DataTypeDefXsd.String);
  element.semanticId = ref(semanticId);
  element.value = value;
  if (unit != null) {
    const content = new aas.types.DataSpecificationIec61360([
      new aas.types.LangStringPreferredNameTypeIec61360('en', 'x'),
    ]);
    content.unit = unit;
    element.embeddedDataSpecifications = [
      new aas.types.EmbeddedDataSpecification(
        ref('http://admin-shell.io/DataSpecificationTemplates/DataSpecificationIec61360/3'),
        content,
      ),
    ];
  }
  return element;
}

function collection(...value: aas.types.ISubmodelElement[]) {
  const element = new aas.types.SubmodelElementCollection();
  element.value = value;
  return element;
}

describe('PcfHelper.field', () => {
  it('returns the semantic ID and the unit stored at the element', () => {
    const pcf = collection(property(` ${PcfHelper.PCF_CO2_EQ}`, '12.5', 'kg CO2 eq'));

    expect(PcfHelper.field(pcf, PcfHelper.PCF_CO2_EQ)).toEqual({
      semanticId: PcfHelper.PCF_CO2_EQ,
      unit: 'kg CO2 eq',
    });
  });

  it('finds the element by any of the alternative semantic IDs', () => {
    const tcf = collection(property('FL40-1#02-PCFEq1#001', '3'));

    expect(PcfHelper.field(tcf, ...PcfHelper.TCF_CO2_EQ)).toEqual({ semanticId: 'FL40-1#02-PCFEq1#001', unit: '' });
  });

  it('returns empty values if the element is missing', () => {
    expect(PcfHelper.field(collection(), PcfHelper.PCF_CO2_EQ)).toEqual({ semanticId: '', unit: '' });
    expect(PcfHelper.field(undefined, PcfHelper.PCF_CO2_EQ)).toEqual({ semanticId: '', unit: '' });
  });
});
