import { AppConfigService, PortalService } from '@aas/common-services';
import { EClassItem } from '@aas/model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EclassSearchService {
  constructor(
    private http: HttpClient,
    private portalService: PortalService,
    private appConfigService: AppConfigService,
  ) {}

  async search(keyword: string, typ: string, lang: string[]) {
    const params = new HttpParams()
      .append('preferredName', keyword)
      .append('language', lang.join(','))
      .append('typ', typ);
    const dtos = await lastValueFrom(
      this.http.get<any>(`${this.appConfigService.config.apiPath}/Eclass/Search`, {
        params,
      }),
    );

    return dtos.data?.map((dto: any) => EClassItem.fromDto(dto, this.portalService.currentLanguage)) as EClassItem[];
  }

  async tableSearch(keyword: string, irdi: string, typ: string, lang: string[], first: number, rows: number) {
    const params = new HttpParams()
      .append('preferredName', keyword)
      .append('irdi', irdi)
      .append('language', lang.join(','))
      .append('typ', typ)
      .append('offset', first)
      .append('limit', rows);

    return await lastValueFrom(
      this.http.get<any>(`${this.appConfigService.config.apiPath}/Eclass/Search`, {
        params,
      }),
    );
  }

  async getItem(irdi: string, typ: string, lang: string[]) {
    const params = new HttpParams().append('irdi', irdi).append('language', lang.join(',')).append('typ', typ);
    const dto = await lastValueFrom(
      this.http.get<any>(`${this.appConfigService.config.apiPath}/Eclass/GetItem`, { params }),
    );

    return EClassItem.fromDto(dto, this.portalService.currentLanguage);
  }

  async hasEclass() {
    return lastValueFrom(this.http.get<boolean>(`${this.appConfigService.config.apiPath}/Eclass/HasEclassCert`));
  }
}
