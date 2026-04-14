import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { HerstellerAdresse } from '../../generator/model/hersteller-adresse';
import { AppConfigService } from '@aas/common-services';

@Injectable({
  providedIn: 'root',
})
export class AddressCatalogService {
  constructor(
    private http: HttpClient,
    private appConfigService: AppConfigService,
  ) {}

  async getAllAddressData() {
    const dtos = await lastValueFrom(
      this.http.get<HerstellerAdresse[]>(`${this.appConfigService.config.apiPath}/Adresse/GetAdressen`, {}),
    );

    return dtos.map((d: any) => HerstellerAdresse.fromDto(d));
  }

  async getAddressById(id: number) {
    return lastValueFrom(
      this.http.get<HerstellerAdresse>(`${this.appConfigService.config.apiPath}/Adresse/GetById?addressId=${id}`, {}),
    );
  }

  async deleteAddressById(id: number) {
    const params = new HttpParams().append('id', id);
    return lastValueFrom(
      this.http.delete<HerstellerAdresse>(`${this.appConfigService.config.apiPath}/Adresse/Remove`, {
        params,
      }),
    );
  }

  async createAddress(address: HerstellerAdresse) {
    return lastValueFrom(
      this.http.put<HerstellerAdresse>(`${this.appConfigService.config.apiPath}/Adresse/Add`, address),
    );
  }

  async updateAddress(address: HerstellerAdresse) {
    return lastValueFrom(
      this.http.patch<HerstellerAdresse>(`${this.appConfigService.config.apiPath}/Adresse/Update`, address),
    );
  }
}
