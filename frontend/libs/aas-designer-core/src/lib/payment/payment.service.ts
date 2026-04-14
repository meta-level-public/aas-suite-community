import { OrgaPaymentModel, OrgaUserSeatStats, PaymentModel } from '@aas-designer-model';
import { AppConfigService } from '@aas/common-services';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  constructor(
    private http: HttpClient,
    private appConfigService: AppConfigService,
  ) {}

  async getAll() {
    const dtos = await lastValueFrom(
      this.http.get<PaymentModel[]>(`${this.appConfigService.config.apiPath}/PaymentModel/GetAll`),
    );

    return dtos.map((dto) => PaymentModel.fromDto(dto));
  }

  delete(id: number) {
    const params = new HttpParams().append('id', id);

    return lastValueFrom(this.http.delete(`${this.appConfigService.config.apiPath}/PaymentModel/Delete`, { params }));
  }

  async update(paymentModel: PaymentModel) {
    return lastValueFrom(
      this.http.patch<number>(`${this.appConfigService.config.apiPath}/PaymentModel/Update`, paymentModel),
    );
  }

  async create(paymentModel: PaymentModel) {
    return lastValueFrom(
      this.http.put<number>(`${this.appConfigService.config.apiPath}/PaymentModel/Add`, paymentModel),
    );
  }

  async getById(id: number) {
    const params = new HttpParams().append('id', id);
    const res = await lastValueFrom(
      this.http.get<PaymentModel>(`${this.appConfigService.config.apiPath}/PaymentModel/GetById`, { params }),
    );
    return PaymentModel.fromDto(res);
  }

  async addPaymentModel(paymentModelId: number, orgaId: number) {
    const params = new HttpParams().append('paymentModelId', paymentModelId).append('orgaId', orgaId);

    return lastValueFrom(
      this.http.put<boolean>(`${this.appConfigService.config.apiPath}/Organisation/AddPaymentModel`, {}, { params }),
    );
  }

  async updatePaymentModel(oldPaymentId: number, newPaymentId: number, orgaId: number, endDate: Date | null) {
    const params = new HttpParams()
      .append('oldPaymentModelId', oldPaymentId)
      .append('newPaymentModelId', newPaymentId)
      .append('orgaId', orgaId);
    if (endDate != null) params.append('endDate', endDate.toString());

    return lastValueFrom(
      this.http.patch<boolean>(
        `${this.appConfigService.config.apiPath}/Organisation/UpdatePaymentModel`,
        {},
        { params },
      ),
    );
  }
  async updatePaymentModelEndDate(paymentId: number, orgaId: number, endDate: Date | null) {
    let params = new HttpParams().append('paymentModelId', paymentId).append('orgaId', orgaId);
    if (endDate != null) params = params.append('endDate', endDate.toISOString());

    return lastValueFrom(
      this.http.patch<boolean>(
        `${this.appConfigService.config.apiPath}/Organisation/UpdatePaymentModelEndDate`,
        {},
        { params },
      ),
    );
  }

  async getUserSeatStats(orgaId: number) {
    const params = new HttpParams().set('orgaId', orgaId);
    const dto = await lastValueFrom(
      this.http.get<OrgaUserSeatStats>(`${this.appConfigService.config.apiPath}/Organisation/GetUserSeatStats`, {
        params,
      }),
    );

    return OrgaUserSeatStats.fromDto(dto);
  }

  removePaymentModel(id: number) {
    const params = new HttpParams().append('id', id);

    return lastValueFrom(
      this.http.delete(`${this.appConfigService.config.apiPath}/Organisation/RemovePaymentOption`, { params }),
    );
  }

  async getByOrga(orgaId: number) {
    const params = new HttpParams().append('orgaId', orgaId);
    const dtos = await lastValueFrom(
      this.http.get<OrgaPaymentModel[]>(`${this.appConfigService.config.apiPath}/Organisation/GetPaymentModels`, {
        params,
      }),
    );

    return dtos.map((dto) => OrgaPaymentModel.fromDto(dto));
  }
}
