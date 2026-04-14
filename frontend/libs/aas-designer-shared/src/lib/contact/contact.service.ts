import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfigService } from '@aas/common-services';
import { lastValueFrom } from 'rxjs';
import { PaymentModel } from '@aas-designer-model';
import { ContactResult } from './model/contact-result';
import { RequestData } from './model/request-data';

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  constructor(
    private http: HttpClient,
    private appConfigService: AppConfigService,
  ) {}

  async getAlPaymentModels() {
    const dtos = await lastValueFrom(
      this.http.get<PaymentModel[]>(`${this.appConfigService.config.apiPath}/PaymentModel/GetAllUserSelectable`),
    );

    return dtos.map((dto) => PaymentModel.fromDto(dto));
  }

  async sendMessage(data: RequestData) {
    return lastValueFrom(
      this.http.put<ContactResult>(`${this.appConfigService.config.apiPath}/Contact/Send`, data.toDto()),
    );
  }
}
