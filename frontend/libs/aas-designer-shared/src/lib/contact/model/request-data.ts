import { Benutzer, Organisation } from '@aas-designer-model';
import { RequestForOffer } from './request-for-offer';

export class RequestData {
  topic: string = '';
  message: string = '';
  organisation: Organisation | null = null;
  admin: Benutzer | null = null;
  _email: string = '';
  lizenz: string = '';
  selectedLanguage: string = '';

  requestForOffer: RequestForOffer | null = null;

  set email(value: string | number) {
    this._email = value.toString();
  }

  get email(): string {
    return this._email.toString();
  }

  toDto() {
    return {
      topic: this.topic,
      message: this.message,
      organisation: this.organisation?.toDto(),
      admin: this.admin,
      email: this._email,
      lizenz: this.lizenz,
      selectedLanguage: this.selectedLanguage,
      requestForOffer: this.requestForOffer?.toDto(),
    };
  }
}
