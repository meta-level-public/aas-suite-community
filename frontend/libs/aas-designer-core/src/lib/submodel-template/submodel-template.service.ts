import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { SubmodelTemplate } from '@aas-designer-model';
import { AasMetamodelVersion } from '@aas/model';
import { AppConfigService } from '@aas/common-services';

@Injectable({
  providedIn: 'root',
})
export class SubmodelTemplateService {
  constructor(
    private http: HttpClient,
    private appConfigService: AppConfigService,
  ) {}

  async getAll() {
    const params = new HttpParams().append('version', AasMetamodelVersion.ALL);
    const dtos = await lastValueFrom(
      this.http.get<SubmodelTemplate[]>(`${this.appConfigService.config.apiPath}/SubmodelTemplate/GetAll`, { params }),
    );

    return dtos.map((dto) => SubmodelTemplate.fromDto(dto));
  }

  delete(id: number) {
    const params = new HttpParams().append('id', id);

    return lastValueFrom(
      this.http.delete(`${this.appConfigService.config.apiPath}/SubmodelTemplate/Delete`, { params }),
    );
  }

  async download(id: number) {
    const params = new HttpParams().append('id', id);

    return await lastValueFrom(
      this.http.get<any>(`${this.appConfigService.config.apiPath}/SubmodelTemplate/Download`, {
        responseType: 'blob' as any,
        observe: 'response',
        params,
      }),
    );
  }

  async upload(
    file: File,
    filename: string,
    name: string,
    label: string,
    semanticIds: string,
    version: AasMetamodelVersion,
    group: string,
  ) {
    const formData = new FormData();
    formData.append('file', file, filename);
    formData.append('filename', filename);
    formData.append('name', name);
    formData.append('label', label);
    formData.append('semanticIds', semanticIds);
    formData.append('version', version);
    formData.append('group', group);

    return lastValueFrom(
      this.http.post<number>(`${this.appConfigService.config.apiPath}/SubmodelTemplate/Import`, formData),
    );
  }

  async bulkUpload(files: File[], version: AasMetamodelVersion, group: string) {
    const formData = new FormData();
    formData.append('version', version);
    formData.append('group', group);

    files.forEach((f) => formData.append('files', f));

    return lastValueFrom(
      this.http.post<number>(`${this.appConfigService.config.apiPath}/SubmodelTemplate/BulkImport`, formData),
    );
  }

  async edit(smt: SubmodelTemplate) {
    return lastValueFrom(this.http.put<number>(`${this.appConfigService.config.apiPath}/SubmodelTemplate/Update`, smt));
  }
}
