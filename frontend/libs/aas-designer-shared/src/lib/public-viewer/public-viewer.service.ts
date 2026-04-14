import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfigService } from '@aas/common-services';
import { ShellResult } from '@aas/model';
import { lastValueFrom } from 'rxjs';
import { AuthenticateResponse } from '@aas-designer-model';

@Injectable({
  providedIn: 'root',
})
export class PublicViewerService {
  constructor(
    private http: HttpClient,
    private appConfigService: AppConfigService,
  ) {}

  async login(guid: string, password: string) {
    const url = this.appConfigService.config.apiPath + '/Auth/LoginPublicViewer';

    return lastValueFrom(this.http.post<AuthenticateResponse>(url, { guid: guid, passwort: password }));
  }

  async getRawData(guid: string) {
    const url = this.appConfigService.config.apiPath + '/PublicViewer/GetAas';
    const params = new HttpParams().append('guid', guid);

    const res = await lastValueFrom(this.http.get<ShellResult>(url, { params }));
    return ShellResult.fromDto(res);
  }
}
