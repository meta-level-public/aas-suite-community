export interface DatatypeValidator {
  filterRegex: RegExp;
  errorMessage: string;
  validatorType: 'regex' | 'apiCall';
  customValidator: any;
}
