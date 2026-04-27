import { Benutzer, EclassCertificate, Organisation, OrgaUserSeatStats, UserInvitation } from '@aas-designer-model';
import { AppConfigService } from '@aas/common-services';
import { emailRegEx, urlRegEx } from '@aas/model';
import { OrgaTokenDto } from '@aas/webapi-client';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { Apikey } from './model/apikey';
import { EclassImportQueuedItem } from './model/eclass-import-queued-item';
import { OrganisationUebersichtBenutzerDto } from './model/organisation-uebersicht-benutzer-dto';

@Injectable({
  providedIn: 'root',
})
export class OrganisationService {
  readonly isValidUrl = urlRegEx;

  constructor(
    private http: HttpClient,
    private appConfigService: AppConfigService,
  ) {}

  async getMyOrganisationById(organisationId: number) {
    const params = new HttpParams().append('organisationId', organisationId);
    const responseOrga = await lastValueFrom(
      this.http.get<Organisation>(`${this.appConfigService.config.apiPath}/Organisation/GetById`, { params }),
    );

    return Organisation.fromDto(responseOrga);
  }

  async updateOrganisation(orga: Organisation) {
    if (orga.id == null) {
      return;
    }

    const params = new HttpParams().append('organisationId', orga.id);
    return lastValueFrom(
      this.http.patch<boolean>(`${this.appConfigService.config.apiPath}/Organisation/Update`, orga.toDto(), {
        params,
      }),
    );
  }

  async getAllOrganisationUsersById(orgaId: number) {
    const params = new HttpParams().append('organisationId', orgaId);
    const dtos = await lastValueFrom(
      this.http.get<OrganisationUebersichtBenutzerDto[]>(
        `${this.appConfigService.config.apiPath}/Organisation/GetOrganisationUsersById`,
        {
          params,
        },
      ),
    );

    return dtos.map((dto) => OrganisationUebersichtBenutzerDto.fromDto(dto));
  }

  async getOrganisationUserById(orgaId: number, userId: number) {
    const params = new HttpParams().append('organisationId', orgaId).append('userId', userId);
    const dto = await await lastValueFrom(
      this.http.get<OrganisationUebersichtBenutzerDto>(
        `${this.appConfigService.config.apiPath}/Organisation/GetUserById`,
        {
          params,
        },
      ),
    );

    return OrganisationUebersichtBenutzerDto.fromDto(dto);
  }

  async updateUserById(orgaId: number, userId: number, userData: Benutzer) {
    const params = new HttpParams().append('userId', userId).append('organisationId', orgaId);
    const dto = await lastValueFrom(
      this.http.patch<Benutzer>(`${this.appConfigService.config.apiPath}/Organisation/UpdateUser`, userData.toDto(), {
        params,
      }),
    );

    return Benutzer.fromDto(dto);
  }

  async updateUserRoles(orgaId: number, userId: number, roles: string[]) {
    const params = new HttpParams().append('userId', userId).append('organisationId', orgaId);
    const dto = await lastValueFrom(
      this.http.patch<Benutzer>(`${this.appConfigService.config.apiPath}/Organisation/UpdateUserRoles`, roles, {
        params,
      }),
    );

    return Benutzer.fromDto(dto);
  }

  async createNewUser(userData: Benutzer) {
    const dto = await lastValueFrom(
      this.http.post<Benutzer>(`${this.appConfigService.config.apiPath}/Benutzer/Add`, userData.toDto(), {}),
    );

    return Benutzer.fromDto(dto);
  }

  async inviteUser(userData: UserInvitation) {
    const dto = await lastValueFrom(
      this.http.post<UserInvitation>(`${this.appConfigService.config.apiPath}/Benutzer/Invite`, userData.toDto(), {}),
    );

    return UserInvitation.fromDto(dto);
  }

  async deleteUser(userId: number, orgaId: number) {
    const params = new HttpParams().append('userId', userId).append('organisationId', orgaId);
    return lastValueFrom(
      this.http.delete<boolean>(`${this.appConfigService.config.apiPath}/Organisation/DeleteUser`, {
        params,
      }),
    );
  }

  async deleteInvitation(invitationId: number) {
    const params = new HttpParams().append('id', invitationId);
    return lastValueFrom(
      this.http.delete(`${this.appConfigService.config.apiPath}/Organisation/DeleteInvitation`, {
        params,
      }),
    );
  }

  async resendInvitation(invitationId: number) {
    const params = new HttpParams().append('id', invitationId);
    return lastValueFrom(
      this.http.post(`${this.appConfigService.config.apiPath}/Benutzer/ResendInvitation`, null, {
        params,
      }),
    );
  }

  async getEclassCertificate() {
    return lastValueFrom(
      this.http.get<EclassCertificate>(`${this.appConfigService.config.apiPath}/Organisation/GetEclassCertificate`),
    );
  }

  async getAvailableRoles() {
    return lastValueFrom(
      this.http.get<string[]>(`${this.appConfigService.config.apiPath}/Organisation/GetOrganisationRoles`),
    );
  }
  async getInvitations() {
    const dtos = await lastValueFrom(
      this.http.get<UserInvitation[]>(`${this.appConfigService.config.apiPath}/Organisation/GetPendingInvitations`),
    );

    return dtos.map((dto) => UserInvitation.fromDto(dto));
  }

  async deleteEclassCertificate() {
    return lastValueFrom(
      this.http.delete<any>(`${this.appConfigService.config.apiPath}/Organisation/DeleteEclasseCertificate`),
    );
  }

  async uploadEclassCertificate(cert: File) {
    const formData = new FormData();
    formData.append('file', cert, cert.name);
    const headers = new HttpHeaders().append('enctype', 'multipart/form-data').append('accept', 'application/x-pkcs12');

    return lastValueFrom(
      this.http.post<EclassCertificate>(
        `${this.appConfigService.config.apiPath}/Organisation/UploadEclasseCertificate`,
        formData,
        {
          headers: headers,
        },
      ),
    );
  }

  async uploadEclassKatalog(cert: File) {
    const formData = new FormData();
    formData.append('file', cert, cert.name);
    const headers = new HttpHeaders().append('enctype', 'multipart/form-data').append('accept', 'application/x-pkcs12');

    return lastValueFrom(
      this.http.post<EclassCertificate>(
        `${this.appConfigService.config.apiPath}/Organisation/ImportEclassFile`,
        formData,
        {
          headers: headers,
        },
      ),
    );
  }

  validateData(user: Benutzer | UserInvitation) {
    if (user.benutzerRollen.length === 0) {
      return false;
    }
    if (user.name.length === 0) {
      return false;
    }
    if (user.vorname.length === 0) {
      return false;
    }
    if (user.email.length === 0 || emailRegEx.test(user.email) === false) {
      return false;
    }
    return true;
  }

  validateOrganisationData(organisation: Organisation) {
    if (organisation.name.length === 0) {
      return false;
    }

    if (organisation?.strasse.length === 0) {
      return false;
    }

    if (organisation?.plz.length === 0) {
      return false;
    }

    if (organisation?.ort.length === 0) {
      return false;
    }

    if (organisation.email.length === 0 || emailRegEx.test(organisation.email) === false) {
      return false;
    }

    if (organisation.iriPrefix.length === 0 || this.isValidUrl.test(organisation.iriPrefix) === false) {
      return false;
    }

    return true;
  }

  generatePassword(length = 16) {
    const numberChars = '0123456789';
    const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÄÜÖ';
    const lowerChars = 'abcdefghijklmnopqrstuvwxyzÄÜÖ';
    const allChars = numberChars + upperChars + lowerChars + ';:?!_-.,&%';
    let randPasswordArray = Array(length);
    randPasswordArray[0] = numberChars;
    randPasswordArray[1] = upperChars;
    randPasswordArray[2] = lowerChars;
    randPasswordArray = randPasswordArray.fill(allChars, 3);
    return this.shuffleArray(
      randPasswordArray.map(function (x) {
        return x[Math.floor(Math.random() * x.length)];
      }),
    ).join('');
  }

  private shuffleArray(array: any) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  }

  async getOrgaTokens() {
    const dtos = await lastValueFrom(
      this.http.get<any>(`${this.appConfigService.config.apiPath}/Organisation/getOrgaTokens`),
    );
    return dtos.map((d: any) => Apikey.fromDto(d));
  }

  async getAvailableScopes() {
    return lastValueFrom(
      this.http.get<string[]>(`${this.appConfigService.config.apiPath}/Organisation/getAvailableScopes`),
    );
  }

  async getUserSeatStats(orgaId: number) {
    const params = new HttpParams().set('orgaId', orgaId);
    const dto = await lastValueFrom(
      this.http.get<OrgaUserSeatStats>(`${this.appConfigService.config.apiPath}/Organisation/GetUserSeatStats`, {
        params,
      }),
    );

    return OrgaUserSeatStats.fromDto(dto);
  }

  deleteToken(id: number) {
    const params = new HttpParams().append('id', id);
    return lastValueFrom(
      this.http.delete<any>(`${this.appConfigService.config.apiPath}/Organisation/DeleteToken`, { params }),
    );
  }

  deactivateToken(id: number) {
    const params = new HttpParams().append('id', id);

    return lastValueFrom(
      this.http.patch<Benutzer>(
        `${this.appConfigService.config.apiPath}/Organisation/DeactivateToken`,
        {},
        {
          params,
        },
      ),
    );
  }

  activateToken(id: number) {
    const params = new HttpParams().append('id', id);

    return lastValueFrom(
      this.http.patch<Benutzer>(
        `${this.appConfigService.config.apiPath}/Organisation/ActivateToken`,
        {},
        {
          params,
        },
      ),
    );
  }

  addOrgaToken(newOrgaToken: OrgaTokenDto) {
    return lastValueFrom(
      this.http.put<OrgaTokenDto>(`${this.appConfigService.config.apiPath}/Organisation/AddToken`, newOrgaToken),
    );
  }

  async checkPendingImport() {
    const dtos = await lastValueFrom(
      this.http.get<any[]>(`${this.appConfigService.config.apiPath}/Organisation/checkPendingImport`),
    );

    return dtos.map((dto) => EclassImportQueuedItem.fromDto(dto));
  }

  async deletePendingItem(id: number) {
    const params = new HttpParams().append('id', id);
    const dtos = await lastValueFrom(
      this.http.delete<any[]>(`${this.appConfigService.config.apiPath}/Organisation/deletePendingImport`, { params }),
    );

    return dtos.map((dto) => EclassImportQueuedItem.fromDto(dto));
  }
}
