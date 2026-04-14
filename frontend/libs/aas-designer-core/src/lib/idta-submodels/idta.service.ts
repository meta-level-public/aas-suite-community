import { HttpClient, HttpParams } from '@angular/common/http';

import { Injectable } from '@angular/core';
import { AppConfigService } from '@aas/common-services';

import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class IdtaService {
  constructor(
    private http: HttpClient,
    private appConfigService: AppConfigService,
  ) {}

  async getTree() {
    return await lastValueFrom(this.http.get<any>(`${this.appConfigService.config.apiPath}/Idta/GetTree`));
  }

  async getFile(filename: string) {
    if (filename !== '') {
      const url = `${this.appConfigService.config.apiPath}/Idta/GetFile`;
      return lastValueFrom(
        this.http.get<Blob>(url, {
          params: new HttpParams().set('filename', filename),
          responseType: 'blob' as 'json',
        }),
      );
    } else {
      return null;
    }
  }
}
