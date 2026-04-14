import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfigService } from '@aas/common-services';
import { lastValueFrom } from 'rxjs';
import { RequestForOffer } from '@aas/aas-designer-shared';

@Injectable({
  providedIn: 'root',
})
export class RequestForOfferService {
  constructor(
    private http: HttpClient,
    private appConfigService: AppConfigService,
  ) {}

  async getAll() {
    const dtos = await lastValueFrom(
      this.http.get<RequestForOffer[]>(`${this.appConfigService.config.apiPath}/RequestForOffer/GetAll`),
    );

    return dtos.map((dto) => RequestForOffer.fromDto(dto));
  }

  delete(id: number) {
    const params = new HttpParams().append('id', id);

    return lastValueFrom(
      this.http.delete(`${this.appConfigService.config.apiPath}/RequestForOffer/Delete`, { params }),
    );
  }

  // async edit(config: CorsConfig) {
  //   return lastValueFrom(this.http.patch<number>(`${this.appConfigService.config.apiPath}/Cors/Update`, config));
  // }

  // async insert(config: CorsConfig) {
  //   return lastValueFrom(this.http.put<number>(`${this.appConfigService.config.apiPath}/Cors/Create`, config));
  // }
}
