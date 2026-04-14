import { SubmodelTemplate } from '@aas-designer-model';
import { AppConfigService } from '@aas/common-services';
import { FilenameHelper } from '@aas/helpers';
import { AasMetamodelVersion, ShellResult, SupplementalFile } from '@aas/model';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { SubmodelResult } from '../generator/model/submodel-result';
import { BasyxFilenameSwitcher } from './basyx-filename-switcher';
import { V3EditorDataStoreService } from './v3-editor-data-store.service';

@Injectable({
  providedIn: 'root',
})
export class V3EditorService {
  v3EditorDataStoreService = inject(V3EditorDataStoreService);
  constructor(
    private http: HttpClient,
    private appConfigService: AppConfigService,
  ) {}

  async getData(id: number) {
    const params = new HttpParams().append('id', id);
    const res = await lastValueFrom(
      this.http.get<any>(`${this.appConfigService.config.apiPath}/Aas/ReadPackage`, { params }),
    );

    const shellResult = ShellResult.fromDto(res);
    shellResult.id = id;

    return shellResult;
  }

  async getDataByAasIdentifier(aasIdentifier: string) {
    const params = new HttpParams().append('aasIdentifier', aasIdentifier);
    const res = await lastValueFrom(
      this.http.get<any>(`${this.appConfigService.config.aasApiPath}/Shells/GetShell`, { params }),
    );

    return this.mapShellForEditingResult(res);
  }

  async save(shellResult: ShellResult) {
    const params = new HttpParams().append('id', shellResult.id);
    const formData = new FormData();
    for (const file of shellResult.addedFiles) {
      if (file.file != null) {
        const blob = new Blob([new Uint8Array(await file.file.arrayBuffer())], { type: file.contentType });

        if (file.isThumbnail) {
          // formData.append('thumbnailName', FilenameHelper.replaceFileUri(file.path) ?? '');
          formData.append('thumbnailfile_' + file.path, blob, FilenameHelper.sanitizeFilename(file.filename));
        } else {
          formData.append('addedfiles_' + file.path, blob, FilenameHelper.sanitizeFilename(file.filename));
        }
      }
    }
    formData.append(
      'deletedFiles',
      JSON.stringify(
        shellResult.deletedFiles.map((f) => ({
          Path: f.path,
          Id: f.id,
        })),
      ),
    );
    formData.append('plainJson', shellResult.getPlain());
    formData.append('filename', shellResult.packageMetadata.filename);
    formData.append('id', shellResult.id.toString());

    const res = await lastValueFrom(
      this.http.post<any>(`${this.appConfigService.config.apiPath}/Aas/SavePackage`, formData, { params }),
    );

    shellResult.addedFiles = [];
    shellResult.deletedFiles = [];

    return res;
  }

  async saveNew(shellResult: ShellResult) {
    const formData = new FormData();
    for (const file of shellResult.addedFiles) {
      if (file.file != null) {
        const blob = new Blob([new Uint8Array(await file.file.arrayBuffer())], { type: file.contentType });
        if (file.isThumbnail) {
          // formData.append('thumbnailName', FilenameHelper.replaceFileUri(file.path) ?? '');
          formData.append('thumbnailfile_' + file.path, blob, FilenameHelper.sanitizeFilename(file.filename));
        } else {
          formData.append('addedfiles_' + file.path, blob, FilenameHelper.sanitizeFilename(file.filename));
        }
      }
    }
    formData.append(
      'deletedFiles',
      JSON.stringify(
        shellResult.deletedFiles.map((f) => ({
          Path: f.path,
          Id: f.id,
        })),
      ),
    );
    formData.append('plainJson', shellResult.getPlain());
    formData.append('filename', shellResult.packageMetadata.filename);
    formData.append('id', shellResult.id.toString());
    formData.append('createChangelogEntry', 'false');
    formData.append('editorDescriptor', JSON.stringify(this.v3EditorDataStoreService.editorDescriptor()));
    formData.append('deletedSubmodels', JSON.stringify(shellResult.deletedSubmodels));

    const res = await lastValueFrom(
      this.http.post<string>(`${this.appConfigService.config.aasApiPath}/Shells/Save`, formData, {
        responseType: 'text' as 'json',
      }),
    );

    const resJson = JSON.parse(res);

    // jetzt noch die neuen Daten setzen
    if (resJson.oldNewFileNames != null) BasyxFilenameSwitcher.switchFilenames(resJson.oldNewFileNames, shellResult);

    shellResult.addedFiles = [];
    shellResult.deletedFiles = [];

    return res;
  }

  getSupplementalFile(id: number, filename: string) {
    const url = this.appConfigService.config.apiPath + '/Aas/GetFileFromAas';
    return lastValueFrom(
      this.http.get<Blob>(url, {
        params: new HttpParams().set('id', id ?? '').set('filename', filename),
        responseType: 'blob' as 'json',
      }),
    );
  }

  getFileById(id: number) {
    const url = this.appConfigService.config.apiPath + '/Aas/GetFileFromAasById';
    return lastValueFrom(
      this.http.get<Blob>(url, {
        params: new HttpParams().set('id', id ?? ''),
        responseType: 'blob' as 'json',
      }),
    );
  }

  async share(id: number) {
    return lastValueFrom(
      this.http.get<boolean>(`${this.appConfigService.config.apiPath}/Aas/share`, {
        params: new HttpParams().append('id', id),
      }),
    );
  }
  async unshare(id: number) {
    return lastValueFrom(
      this.http.get<boolean>(`${this.appConfigService.config.apiPath}/Aas/unshare`, {
        params: new HttpParams().append('id', id),
      }),
    );
  }

  async downloadFile(id: number, filename: string) {
    return await lastValueFrom(
      this.http.get<any>(`${this.appConfigService.config.apiPath}/Aas/GetFileFromAas`, {
        params: new HttpParams().append('id', id ?? '').append('filename', filename),
        responseType: 'blob' as any,
        observe: 'response',
      }),
    );
  }

  getFile(aasId: number, filename: string) {
    const url = `${this.appConfigService.config.apiPath}/Aas/GetFileFromAas`;
    return lastValueFrom(
      this.http.get<Blob>(url, {
        params: new HttpParams().set('id', aasId).set('filename', filename),
        responseType: 'blob' as 'json',
      }),
    );
  }

  async getAvailableSubmodelTemplates() {
    const params = new HttpParams().append('version', AasMetamodelVersion.V3);
    const dtos = await lastValueFrom(
      this.http.get<SubmodelTemplate[][]>(`${this.appConfigService.config.apiPath}/SubmodelTemplate/GetAll`, {
        params,
      }),
    );

    return dtos.map((dto) => SubmodelTemplate.fromDto(dto));
  }

  async getIdtaSmtRepoTemplates() {
    const dtos = await lastValueFrom(
      this.http.get<SubmodelTemplate[][]>(
        `${this.appConfigService.config.apiPath}/SubmodelTemplate/GetAllFromIdtaRepo`,
      ),
    );

    return dtos.map((dto) => SubmodelTemplate.fromDto(dto));
  }

  async getTemplate(id: number) {
    const params = new HttpParams().append('id', id);
    const dto = await lastValueFrom(
      this.http.get<SubmodelResult>(`${this.appConfigService.config.apiPath}/SubmodelTemplate/GetModelTemplate`, {
        params,
      }),
    );

    return SubmodelResult.fromDto(dto);
  }

  async getRepoSubmodelTemplate(url: string, knownConceptDescriptionIds: string[] = []) {
    const dto = await lastValueFrom(
      this.http.post<SubmodelResult>(
        `${this.appConfigService.config.apiPath}/SubmodelTemplate/GetRepoSubmodelTemplatePost`,
        {
          url,
          knownConceptDescriptionIds: [
            ...new Set(
              knownConceptDescriptionIds.filter(
                (conceptDescriptionId) => conceptDescriptionId != null && conceptDescriptionId !== '',
              ),
            ),
          ],
        },
      ),
    );

    return SubmodelResult.fromDto(dto);
  }

  async getTemplateByName(submodelId: string, semanticId: string) {
    const params = new HttpParams()
      .append('semanticId', encodeURIComponent(semanticId))
      .append('idShort', submodelId)
      .append('version', AasMetamodelVersion.V3);

    const dto = await lastValueFrom(
      this.http.get<SubmodelResult>(`${this.appConfigService.config.apiPath}/SubmodelTemplate/GetByIdentification`, {
        params,
      }),
    );

    return SubmodelResult.fromDto(dto);
  }

  async saveSnippetItem(templateName: string, templateDescription: string, templateData: string, elementType: string) {
    const headers = new HttpHeaders().append('ignoreContentType', 'true');

    const formData = new FormData();

    formData.append('templateData', JSON.stringify(templateData));
    formData.append('templateName', templateName);
    formData.append('templateDescription', templateDescription);
    formData.append('templateTyp', elementType);
    formData.append('version', AasMetamodelVersion.V3);

    const request = this.http.put<boolean>(`${this.appConfigService.config.apiPath}/Snippet/Add`, formData, {
      headers: headers,
    });

    return lastValueFrom(request);
  }

  async downloadThumb(id: number) {
    const url = this.appConfigService.config.apiPath + '/Aas/GetThumbFromAas';
    return lastValueFrom(
      this.http.get<Blob>(url, {
        params: new HttpParams().append('id', id ?? ''),
        responseType: 'blob' as 'json',
      }),
    );
  }

  async downloadThumbByAasIdentifier(aasIdentifier: string) {
    const url = this.appConfigService.config.aasApiPath + '/Shells/GetThumbnail';
    return lastValueFrom(
      this.http.get<Blob>(url, {
        params: new HttpParams().append('shellId', aasIdentifier),
        responseType: 'blob' as 'json',
      }),
    );
  }

  private mapShellForEditingResult(dto: any) {
    const shellResult = ShellResult.fromDto({
      plainJson: dto.plainJson,
      supplementalFiles:
        dto.aasFiles?.map((file: any) => ({
          filename: file.filename,
          path: file.path,
          contentType: file.contentType,
          isThumbnail: file.isThumbnail,
          id: null,
        })) ?? [],
    });

    this.v3EditorDataStoreService.editorDescriptor.set(dto.editorDescriptor);
    shellResult.supplementalFiles =
      dto.aasFiles?.map(
        (file: any) =>
          ({
            filename: file.filename,
            path: file.path,
            fileApiUrl: file.endpoint,
            contentType: file.contentType,
            isThumbnail: file.isThumbnail,
            id: null,
          }) as SupplementalFile,
      ) ?? [];

    return shellResult;
  }
}
