import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfigService } from '@aas/common-services';
import { lastValueFrom } from 'rxjs';
import { UserOrganisationUebersicht } from './user-organisation-uebersicht';

@Injectable({
  providedIn: 'root',
})
export class UserOrganisationUebersichtService {
  constructor(
    private http: HttpClient,
    private appConfigService: AppConfigService,
  ) {}

  async getUserOrgas() {
    const dtos = await lastValueFrom(
      this.http.get<UserOrganisationUebersicht[]>(
        `${this.appConfigService.config.apiPath}/Benutzer/GetUserOrgaUebersicht`,
      ),
    );

    return dtos.map((dto) => UserOrganisationUebersicht.fromDto(dto));
  }
}
