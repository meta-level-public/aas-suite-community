import { PaymentModel } from './payment-model';

export class OrgaPaymentModel {
  id: number | undefined;

  paymentModel: PaymentModel = new PaymentModel();

  anlageDatum: Date | null = null;
  aenderungsDatum: Date | null = null;
  endDate: Date | null = null;

  static fromDto(dto: any) {
    const orgaPaymentModel = new OrgaPaymentModel();
    Object.assign(orgaPaymentModel, dto);

    if (dto.anlageDatum != null) orgaPaymentModel.anlageDatum = new Date(dto.anlageDatum);
    if (dto.aenderungsDatum != null) orgaPaymentModel.aenderungsDatum = new Date(dto.aenderungsDatum);
    if (dto.endDate != null) orgaPaymentModel.endDate = new Date(dto.endDate);

    if (dto.paymentModel != null) orgaPaymentModel.paymentModel = PaymentModel.fromDto(dto.paymentModel);

    return orgaPaymentModel;
  }
}
