import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfigService } from '@aas/common-services';
import { lastValueFrom } from 'rxjs';
import { SharedLink } from '@aas-designer-model';
@Injectable({
  providedIn: 'root',
})
export class MySharedLinkService {
  constructor(
    private http: HttpClient,
    private appConfigService: AppConfigService,
  ) {}

  async load() {
    const dtos = await lastValueFrom(
      this.http.get<any[]>(`${this.appConfigService.config.apiPath}/PublicViewer/GetMyPublicViewerLinks`),
    );

    return dtos.map((d) => SharedLink.fromDto(d));
  }

  delete(id: number) {
    const params = new HttpParams().append('id', id);

    return lastValueFrom(this.http.delete(`${this.appConfigService.config.apiPath}/PublicViewer/Delete`, { params }));
  }
}
