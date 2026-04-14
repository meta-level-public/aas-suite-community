import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { CorsConfig } from '@aas/model';
import { AppConfigService } from '@aas/common-services';

@Injectable({
  providedIn: 'root',
})
export class CorsConfigService {
  constructor(
    private http: HttpClient,
    private appConfigService: AppConfigService,
  ) {}

  async getAll() {
    const dtos = await lastValueFrom(
      this.http.get<CorsConfig[]>(`${this.appConfigService.config.apiPath}/Cors/GetAll`),
    );

    return dtos.map((dto) => CorsConfig.fromDto(dto));
  }

  delete(id: number) {
    const params = new HttpParams().append('id', id);

    return lastValueFrom(this.http.delete(`${this.appConfigService.config.apiPath}/Cors/Delete`, { params }));
  }

  async edit(config: CorsConfig) {
    return lastValueFrom(this.http.patch<number>(`${this.appConfigService.config.apiPath}/Cors/Update`, config));
  }

  async insert(config: CorsConfig) {
    return lastValueFrom(this.http.put<number>(`${this.appConfigService.config.apiPath}/Cors/Create`, config));
  }
}
