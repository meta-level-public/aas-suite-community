import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfigService } from '@aas/common-services';
import { lastValueFrom } from 'rxjs';
import { OrganisationUebersichtBenutzerDto } from '../model/organisation-uebersicht-benutzer-dto';

@Injectable({
  providedIn: 'root',
})
export class DeleteUserMovePackageService {
  constructor(
    private http: HttpClient,
    private appConfigService: AppConfigService,
  ) {}

  async getTargetOptions(organisationId: number, userToMoveId: number) {
    const params = new HttpParams().append('orgaId', organisationId).append('userTomoveId', userToMoveId);
    const dtos = await lastValueFrom(
      this.http.get<OrganisationUebersichtBenutzerDto[]>(
        `${this.appConfigService.config.apiPath}/Organisation/GetMoveTargets`,
        { params },
      ),
    );

    return dtos.map((dto) => OrganisationUebersichtBenutzerDto.fromDto(dto));
  }
}
