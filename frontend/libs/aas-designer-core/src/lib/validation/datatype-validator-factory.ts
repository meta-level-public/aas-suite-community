import { PropertyDatatype } from '@aas/model';
import { DatatypeValidator } from './datatype-validator';

export class DatatypeValidatorFactory {
  static getValidator(datatype: PropertyDatatype) {
    switch (datatype) {
      case PropertyDatatype.DATATYPE_INTEGER:
      case PropertyDatatype.DATATYPE_INT:
        return {
          filterRegex: /^([+-]?[1-9]\d*|0)?$/,
          errorMessage: 'NOT_A_VALID_INTEGER',
          validatorType: 'regex',
        } as DatatypeValidator;
      case PropertyDatatype.DATATYPE_DECIMAL:
        return {
          filterRegex: /^([+-]?([0-9]+[,.]?)?[0-9]+)?$/,
          errorMessage: 'NOT_A_VALID_DECIMAL',
          validatorType: 'regex',
        } as DatatypeValidator;

      case PropertyDatatype.DATATYPE_DOUBLE: // eigentlich 64bit
        return {
          filterRegex: /^([+-]?([0-9]+[,.]?)?[0-9]+|NaN|[+-]?INF|[+-]?\d+(?:\.\d*(?:[eE][+-]?\d+)?)?)?$/,
          errorMessage: 'NOT_A_VALID_DOUBLE',
          validatorType: 'regex',
        } as DatatypeValidator;
      case PropertyDatatype.DATATYPE_FLOAT: // eigentlich 32bit
        return {
          filterRegex: /^([+-]?([0-9]+[,.]?)?[0-9]+|NaN|[+-]?INF|[+-]?\d+(?:\.\d*(?:[eE][+-]?\d+)?)?)?$/,
          errorMessage: 'NOT_A_VALID_FLOAT',
          validatorType: 'regex',
        } as DatatypeValidator;

      case PropertyDatatype.DATATYPE_GREG_YEAR:
        return {
          filterRegex: /^([0-9]{1,4}(\+[0-9][0-9]:[0-9][0-9])?)?$/,
          errorMessage: 'NOT_A_VALID_GREG_YEAR',
          validatorType: 'regex',
        } as DatatypeValidator;

      case PropertyDatatype.DATATYPE_GREG_MONTH:
        return {
          filterRegex: /^(--[0-9][0-9](\+[0-9][0-9]:[0-9][0-9])?)?$/,
          errorMessage: 'NOT_A_VALID_GREG_MONTH',
          validatorType: 'regex',
        } as DatatypeValidator;

      case PropertyDatatype.DATATYPE_GREG_DAY:
        return {
          filterRegex: /^(----[0-9][0-9](\+[0-9][0-9]:[0-9][0-9])?)?$/,
          errorMessage: 'NOT_A_VALID_GREG_DAY',
          validatorType: 'regex',
        } as DatatypeValidator;

      case PropertyDatatype.DATATYPE_GREG_MONTH_DAY:
        return {
          filterRegex: /^(--[0-9][0-9]-[0-9][0-9](\+[0-9][0-9]:[0-9][0-9])?)?$/,
          errorMessage: 'NOT_A_VALID_GREG_MONTH_DAY',
          validatorType: 'regex',
        } as DatatypeValidator;

      case PropertyDatatype.DATATYPE_GREG_YEAR_MONTH:
        return {
          filterRegex: /^([0-9]{1,4}-[0-9][0-9](\+[0-9][0-9]:[0-9][0-9])?)?$/,
          errorMessage: 'NOT_A_VALID_GREG_YEAR_MONTH',
          validatorType: 'regex',
        } as DatatypeValidator;

      case PropertyDatatype.DATATYPE_POSITIVE_INTEGER:
        return {
          filterRegex: /^[+]?[0-9]+$/,
          errorMessage: 'NOT_A_VALID_POSITIVE_INTEGER',
          validatorType: 'regex',
        } as DatatypeValidator;
      case PropertyDatatype.DATATYPE_BYTE:
        return {
          filterRegex: /^([01]?[0-9][0-9]?|2[0-4][0-9]|25[0-5]){0,1}$/,
          errorMessage: 'NOT_A_VALID_BYTE',
          validatorType: 'regex',
        } as DatatypeValidator;
      case PropertyDatatype.DATATYPE_ANY_URI:
        return {
          filterRegex: /^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?$/,
          errorMessage: 'NOT_A_VALID_URI',
          validatorType: 'apiCall',
          customValidator: 'ValidateUri',
        } as DatatypeValidator;
      default:
        return {
          filterRegex: /.*/,
          errorMessage: 'INVALID_VALUE',
          validatorType: 'regex',
        } as DatatypeValidator;
    }
  }
}
