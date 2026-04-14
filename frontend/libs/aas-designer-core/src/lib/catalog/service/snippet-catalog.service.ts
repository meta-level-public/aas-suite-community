import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { Snippet } from '@aas-designer-model';
import { AasMetamodelVersion } from '@aas/model';
import { AppConfigService } from '@aas/common-services';

@Injectable({
  providedIn: 'root',
})
export class SnippetCatalogService {
  constructor(
    private http: HttpClient,
    private appConfigService: AppConfigService,
  ) {}

  async getAllSnippets(version: AasMetamodelVersion) {
    const params = new HttpParams().set('version', version);
    const dtos = await lastValueFrom(
      this.http.get<any[]>(`${this.appConfigService.config.apiPath}/Snippet/GetSnippets`, { params }),
    );
    return dtos.map((d) => Snippet.fromDto(d));
  }

  async deleteSnippet(id: string) {
    const params = new HttpParams().set('id', id ?? '');
    return await lastValueFrom(
      this.http.delete<any>(`${this.appConfigService.config.apiPath}/Snippet/Delete?${params.toString()}`),
    );
  }

  async share(id: number) {
    return lastValueFrom(
      this.http.get<boolean>(`${this.appConfigService.config.apiPath}/Snippet/Share`, {
        params: new HttpParams().append('id', id),
      }),
    );
  }
  async unshare(id: number) {
    return lastValueFrom(
      this.http.get<boolean>(`${this.appConfigService.config.apiPath}/Snippet/Unshare`, {
        params: new HttpParams().append('id', id),
      }),
    );
  }
}
