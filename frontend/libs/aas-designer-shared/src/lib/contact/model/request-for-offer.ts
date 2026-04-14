import { Organisation } from '@aas-designer-model';
import { OfferStatus } from './offer-status';

export class RequestForOffer {
  static fromDto(dto: any): any {
    const req = new RequestForOffer();
    Object.assign(req, dto);

    req.price = +dto.price;
    req.firstname = dto.vorname;

    if (dto.organisation != null) req.organisation = Organisation.fromDto(dto.organisation);
    if (dto.anlageDatum != null) req.anlageDatum = new Date(dto.anlageDatum);
    if (dto.aenderungsDatum != null) req.aenderungsDatum = new Date(dto.aenderungsDatum);

    return req;
  }

  id: number | undefined = undefined;

  firstname: string = '';
  name: string = '';
  _email: string = '';
  organisation: Organisation | null = null;
  status: OfferStatus = OfferStatus.New;

  paymentPeriod: 'MONTHLY' | 'YEARLY' = 'MONTHLY';
  numberOfLicences: string = '';
  price: number = 0;
  anlageDatum: Date | undefined;
  aenderungsDatum: Date | undefined;

  set email(value: string | number) {
    this._email = value.toString();
  }

  get email(): string {
    return this._email.toString();
  }

  toDto() {
    return {
      id: this.id,
      name: this.name,
      vorname: this.firstname,
      email: this.email,
      paymentPeriod: this.paymentPeriod,
      numberOfLicences: this.numberOfLicences,
      status: this.status,
      organisation: this.organisation?.toDto(),
    };
  }
}
