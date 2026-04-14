import * as aas from '@aas-core-works/aas-core3.1-typescript';

export class UiLabelResolver {
  static getDatatypeLabel(spec: aas.types.IDataSpecificationContent | undefined | null) {
    const iecSpec = spec as unknown as aas.types.DataSpecificationIec61360;
    if (iecSpec == null || iecSpec.dataType == null) {
      return '';
    }
    switch (iecSpec?.dataType) {
      case aas.types.DataTypeIec61360.Blob:
        return 'Blob';

      case aas.types.DataTypeIec61360.Boolean:
        return 'Boolean';
      case aas.types.DataTypeIec61360.Date:
        return 'Date';
      case aas.types.DataTypeIec61360.File:
        return 'File';
      case aas.types.DataTypeIec61360.Html:
        return 'Html';
      case aas.types.DataTypeIec61360.IntegerCount:
        return 'IntegerCount';
      case aas.types.DataTypeIec61360.IntegerCurrency:
        return 'IntegerCurrency';
      case aas.types.DataTypeIec61360.IntegerMeasure:
        return 'IntegerMeasure';
      case aas.types.DataTypeIec61360.Irdi:
        return 'Irdi';
      case aas.types.DataTypeIec61360.Iri:
        return 'Iri';
      case aas.types.DataTypeIec61360.Rational:
        return 'Rational';
      case aas.types.DataTypeIec61360.RationalMeasure:
        return 'RationalMeasure';
      case aas.types.DataTypeIec61360.RealCount:
        return 'RealCount';
      case aas.types.DataTypeIec61360.RealCurrency:
        return 'RealCurrency';
      case aas.types.DataTypeIec61360.RealMeasure:
        return 'RealMeasure';
      case aas.types.DataTypeIec61360.String:
        return 'String';
      case aas.types.DataTypeIec61360.StringTranslatable:
        return 'StringTranslatable';
      case aas.types.DataTypeIec61360.Time:
        return 'Time';
      case aas.types.DataTypeIec61360.Timestamp:
        return 'Timestamp';
      default:
        // eslint-disable-next-line no-console
        console.log('Unknown datatype', iecSpec?.dataType);
        return 'Unknown';
    }
  }
}
