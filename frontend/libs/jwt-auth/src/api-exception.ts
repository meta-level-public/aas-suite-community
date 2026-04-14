export class ApiException implements Error {
  readonly name = 'ApiException';
  readonly message: string;
  displayError = true;
  additionalInfo = '';
  title = '';
  stacktrace = '';
  exceptionType = '';

  constructor(message: string, title: string = '') {
    this.message = message;
    this.title = title;
  }
}
