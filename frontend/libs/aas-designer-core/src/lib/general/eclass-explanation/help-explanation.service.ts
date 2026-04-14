import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { EClassItem } from '@aas/model';
import { AppConfigService } from '@aas/common-services';

@Injectable({
  providedIn: 'root',
})
export class EclassExplanationService {
  constructor(
    private http: HttpClient,
    private appConfigService: AppConfigService,
  ) {}

  async getEclassData(irdi: string, language: string) {
    const params = new HttpParams()
      .append('irdi', irdi)
      .append('typ', 'properties')
      .append('language', EClassItem.mapGuiLanguageToEclass(language));
    const dto = await lastValueFrom(
      this.http.get<any>(`${this.appConfigService.config.apiPath}/Eclass/GetItem`, {
        params,
      }),
    );

    return EClassItem.parseDto(dto, language);
  }
}
