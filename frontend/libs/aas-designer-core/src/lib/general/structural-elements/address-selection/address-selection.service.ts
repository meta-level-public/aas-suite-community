import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { HerstellerAdresse } from '../../../generator/model/hersteller-adresse';
import { AppConfigService } from '@aas/common-services';

@Injectable({
  providedIn: 'root',
})
export class AddressSelectionService {
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
}
