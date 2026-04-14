import { emailRegEx } from '@aas/model';

export class AasEmailValidator {
  static isValidEmail(email: string | undefined | null) {
    return email != null && emailRegEx.test(email) === true;
  }
}
