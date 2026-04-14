import { PaymentPeriod } from './payment-period';

export class PaymentModel {
  id: number | undefined;
  name: string = '';
  nameLabel: string = '';
  beschreibungInternal: string = '';
  beschreibungLabel: string = '';

  anzahlNutzer: number = 1;
  preis: number = 0;

  mehrfachBuchbar: boolean = false;
  exklusivBuchbar: boolean = true;
  userSelectable: boolean = true;

  paymentPeriod: PaymentPeriod = PaymentPeriod.MONTHLY;
  isSystemModel: boolean = false;

  anlageDatum: Date | null = null;
  aenderungsDatum: Date | null = null;

  static fromDto(dto: any) {
    const paymentModel = new PaymentModel();
    Object.assign(paymentModel, dto);

    if (dto.anlageDatum != null) paymentModel.anlageDatum = new Date(dto.anlageDatum);
    if (dto.aenderungsDatum != null) paymentModel.aenderungsDatum = new Date(dto.aenderungsDatum);

    return paymentModel;
  }
}
