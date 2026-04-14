import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { EClassItem } from '@aas/model';

export class DataspecificationIec61360Helper {
  static applyEclassToSpec(dataspecItem: aas.types.DataSpecificationIec61360, eclassItem: EClassItem) {
    const prefDe = eclassItem.preferredName['de-DE'];
    const prefEn = eclassItem.preferredName['en-US'];

    const defDe = eclassItem.fullItem.definition['de-DE'];
    const defEn = eclassItem.fullItem.definition['en-US'];

    dataspecItem.preferredName = [];
    if (prefDe != null) {
      dataspecItem.preferredName.push(new aas.types.LangStringPreferredNameTypeIec61360('de', prefDe));
    }
    if (prefEn != null) {
      dataspecItem.preferredName.push(new aas.types.LangStringPreferredNameTypeIec61360('en', prefEn));
    }
    dataspecItem.definition = [];
    if (defDe != null) {
      dataspecItem.definition.push(new aas.types.LangStringDefinitionTypeIec61360('de', defDe));
    }
    if (defEn != null) {
      dataspecItem.definition.push(new aas.types.LangStringDefinitionTypeIec61360('en', defEn));
    }
    dataspecItem.dataType = this.getEclassDatatype(eclassItem.fullItem.propertyDataType);

    if (eclassItem.unit != null && eclassItem.unit !== '') {
      dataspecItem.unit = eclassItem.unit;
    } else {
      dataspecItem.unit = null;
    }
    if (eclassItem.unitId != null) {
      dataspecItem.unitId = new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
        new aas.types.Key(aas.types.KeyTypes.GlobalReference, eclassItem.unitId),
      ]);
    } else {
      dataspecItem.unitId = null;
    }
    dataspecItem.sourceOfDefinition = 'ECLASS';

    if (eclassItem.valueList != null && eclassItem.valueList.length > 0) {
      const pairs: aas.types.ValueReferencePair[] = [];
      for (const value of eclassItem.valueList) {
        pairs.push(
          new aas.types.ValueReferencePair(
            value.value,
            new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
              new aas.types.Key(aas.types.KeyTypes.GlobalReference, value.id),
            ]),
          ),
        );
      }
      dataspecItem.valueList = new aas.types.ValueList(pairs);
      dataspecItem.value = null;
    } else {
      dataspecItem.valueList = null;
    }
  }

  static getEclassDatatype(datatype: string) {
    switch (datatype) {
      case 'Real (measure)':
        return aas.types.DataTypeIec61360.RealMeasure;
      case 'Real (count)':
        return aas.types.DataTypeIec61360.RealCount;
      case 'Real (currency)':
        return aas.types.DataTypeIec61360.RealCurrency;
      case 'Integer (measure)':
        return aas.types.DataTypeIec61360.IntegerMeasure;
      case 'Integer (count)':
        return aas.types.DataTypeIec61360.IntegerCount;
      case 'Integer (currency)':
        return aas.types.DataTypeIec61360.IntegerCurrency;
      case 'Rational (measure)':
        return aas.types.DataTypeIec61360.RationalMeasure;
      case 'Rational (count)':
        return aas.types.DataTypeIec61360.Rational;
      case 'Boolean':
        return aas.types.DataTypeIec61360.Boolean;
      case 'String':
        return aas.types.DataTypeIec61360.String;
      case 'StringTranslatable':
        return aas.types.DataTypeIec61360.StringTranslatable;
      case 'Time':
        return aas.types.DataTypeIec61360.Time;
      case 'Timestamp':
        return aas.types.DataTypeIec61360.Timestamp;
      case 'Uri':
        return aas.types.DataTypeIec61360.Iri;
      case 'File':
        return aas.types.DataTypeIec61360.File;
      case 'Blob':
        return aas.types.DataTypeIec61360.Blob;
      default:
        return aas.types.DataTypeIec61360.String;
    }
  }

  static getVecDatatype(datatype: string) {
    switch (datatype) {
      case 'http://www.w3.org/2001/XMLSchema#double':
        return aas.types.DataTypeIec61360.RealMeasure;
      case 'http://www.w3.org/2001/XMLSchema#integer':
      case 'http://www.w3.org/2001/XMLSchema#nonNegativeInteger':
        return aas.types.DataTypeIec61360.IntegerMeasure;
      case 'http://www.w3.org/2001/XMLSchema#boolean':
        return aas.types.DataTypeIec61360.Boolean;
      case 'http://www.w3.org/2001/XMLSchema#dateTime':
        return aas.types.DataTypeIec61360.Date;
      default:
        return aas.types.DataTypeIec61360.String;
    }
  }

  getEnValue(items: { label: string; lang: string }[]) {
    let value = '';

    value = items.find((i) => i.lang === 'en')?.label ?? items[0]?.label ?? '';

    return value;
  }

  static applyVecToSpec(dataspecItem: aas.types.DataSpecificationIec61360, vecItem: any) {
    if (vecItem.label != null) {
      dataspecItem.preferredName = [];
      for (const item of vecItem.label) {
        dataspecItem.preferredName.push(
          new aas.types.LangStringPreferredNameTypeIec61360(
            item.lang,
            item.label?.[0]?.toUpperCase() + item.label?.slice(1),
          ),
        );
      }
    }
    if (vecItem.comment != null) {
      dataspecItem.definition = [];
      for (const item of vecItem.comment) {
        dataspecItem.definition.push(new aas.types.LangStringDefinitionTypeIec61360(item.lang, item.label?.trim()));
      }
    }
    dataspecItem.dataType = this.getVecDatatype(vecItem.range);
    dataspecItem.sourceOfDefinition = vecItem.groupName.split('#')[0] + '#';
  }
}
