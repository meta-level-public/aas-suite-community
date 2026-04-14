import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { SubmodelResult } from './model/submodel-result';
import { AppConfigService } from '@aas/common-services';

@Injectable({
  providedIn: 'root',
})
export class AasContextMenuService {
  constructor(
    private http: HttpClient,
    private appConfigService: AppConfigService,
  ) {}

  async getTemplate(id: number) {
    const params = new HttpParams().append('id', id);
    const dto = await lastValueFrom(
      this.http.get<SubmodelResult>(`${this.appConfigService.config.apiPath}/SubmodelTemplate/GetModelTemplate`, {
        params,
      }),
    );

    return SubmodelResult.fromDto(dto);
  }

  async getTemplateByName(name: string) {
    const params = new HttpParams().append('name', name);
    const dto = await lastValueFrom(
      this.http.get<SubmodelResult>(`${this.appConfigService.config.apiPath}/SubmodelTemplate/GetModelTemplateByName`, {
        params,
      }),
    );

    return SubmodelResult.fromDto(dto);
  }
}
