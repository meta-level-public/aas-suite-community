import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfigService } from '@aas/common-services';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AasxViewerService {
  constructor(
    private http: HttpClient,
    private appConfigService: AppConfigService,
  ) {}

  async getThumbFile(id: number, apiUrl: string) {
    const url = `${apiUrl}/Aas/GetThumbFromAas`;
    return lastValueFrom(
      this.http.get<Blob>(url, {
        params: new HttpParams().set('id', id ?? ''),
        responseType: 'blob' as 'json',
      }),
    );
  }

  async getFile(id: number, fileName: string, apiUrl: string) {
    if (fileName === '') fileName = '_';
    const url = `${apiUrl}/Aas/GetFileFromAas`;
    return lastValueFrom(
      this.http.get<Blob>(url, {
        params: new HttpParams().set('id', id ?? '').set('filename', fileName),
        responseType: 'blob' as 'json',
      }),
    );
  }
}
