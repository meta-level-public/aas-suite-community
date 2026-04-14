import { AppConfigService } from '@aas/common-services';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BomViewerService {
  constructor(
    private http: HttpClient,
    private appConfigService: AppConfigService,
  ) {}

  getFileById(id: number, apiUrl: string) {
    const url = apiUrl + '/Aas/GetFileFromAasById';
    return lastValueFrom(
      this.http.get<Blob>(url, {
        params: new HttpParams().set('id', id ?? ''),
        responseType: 'blob' as 'json',
      }),
    );
  }
}
