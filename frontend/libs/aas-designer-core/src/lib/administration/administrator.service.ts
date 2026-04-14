import { Benutzer, Organisation, OrganisationAdminBenutzer, OrganisationAdminUebersichtDto } from '@aas-designer-model';
import { AppConfigService } from '@aas/common-services';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { OrganisationUebersichtBenutzerDto } from '../organisation/model/organisation-uebersicht-benutzer-dto';

@Injectable({
  providedIn: 'root',
})
export class AdministratorService {
  constructor(
    private http: HttpClient,
    private appConfigService: AppConfigService,
  ) {}

  async getAllOrganisation() {
    const organisations = await lastValueFrom(
      this.http.get<Organisation[]>(`${this.appConfigService.config.apiPath}/Organisation/GetAll`, {}),
    );
    return organisations.map((d: any) => Organisation.fromDto(d));
  }
  async getAllOrganisationDto() {
    const organisations = await lastValueFrom(
      this.http.get<OrganisationAdminUebersichtDto[]>(
        `${this.appConfigService.config.apiPath}/Organisation/GetAdminOrgaUebersicht`,
        {},
      ),
    );
    return organisations.map((d: any) => OrganisationAdminUebersichtDto.fromDto(d));
  }

  async getOrganisation(id: number) {
    const params = new HttpParams().append('organisationId', id);
    const res = await lastValueFrom(
      this.http.get<Organisation>(`${this.appConfigService.config.apiPath}/Organisation/GetById`, { params }),
    );
    return Organisation.fromDto(res);
  }

  async getOrgaAdmins(id: number) {
    const params = new HttpParams().append('organisationId', id);
    return lastValueFrom(
      this.http.get<Benutzer[]>(`${this.appConfigService.config.apiPath}/Organisation/GetOrgaAdmins`, { params }),
    );
  }

  async getOrgaUsers(orgaId: number) {
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

  async createOrganisation(orga: Organisation, admin: OrganisationAdminBenutzer) {
    const responseOrga = await lastValueFrom(
      this.http.put<Organisation>(
        `${this.appConfigService.config.apiPath}/Organisation/Add`,
        { orga: orga.toDto(), admin: admin.toDto() },
        {},
      ),
    );

    return Organisation.fromDto(responseOrga);
  }

  async addAdminToOrganisation(admin: OrganisationAdminBenutzer) {
    const adminbenutzer = await lastValueFrom(
      this.http.post<any>(`${this.appConfigService.config.apiPath}/Benutzer/Add`, admin.toDto(), {}),
    );

    return OrganisationAdminBenutzer.fromDatabase(adminbenutzer);
  }

  async updateOrganisation(orga: Organisation) {
    if (orga.id === undefined) {
      return;
    }

    const params = new HttpParams().append('organisationId', orga.id as number);
    const responseOrga = await lastValueFrom(
      this.http.patch<Organisation>(`${this.appConfigService.config.apiPath}/Organisation/Update`, orga.toDto(), {
        params,
      }),
    );

    return Organisation.fromDto(responseOrga);
  }

  async changeStatus(newStatus: boolean, orgaId: number) {
    const params = new HttpParams().append('organisationId', orgaId).append('newStatus', newStatus.toString());
    const responseOrga = await lastValueFrom(
      this.http.patch<Organisation>(
        `${this.appConfigService.config.apiPath}/Organisation/ChangeStatus`,
        {},
        {
          params,
        },
      ),
    );

    return Organisation.fromDto(responseOrga);
  }

  async deleteOrganisationById(orgaId: number) {
    const params = new HttpParams().append('organisationId', orgaId);
    return lastValueFrom(
      this.http.delete<Organisation>(`${this.appConfigService.config.apiPath}/Organisation/Delete`, {
        params,
      }),
    );
  }

  organisationValidator(organisation: Organisation, orgaAdmin: OrganisationAdminBenutzer | null = null) {
    if (organisation.name.length === 0) {
      return false;
    }
    if (organisation.strasse.length === 0) {
      return false;
    }
    if (organisation.plz.length === 0) {
      return false;
    }
    if (organisation.ort.length === 0) {
      return false;
    }

    if (organisation.email.length === 0) {
      return false;
    }

    if (orgaAdmin != null) {
      if (orgaAdmin.name.length === 0) {
        return false;
      }
      if (orgaAdmin.vorname.length === 0) {
        return false;
      }
      if (orgaAdmin.email.length === 0) {
        return false;
      }
      if (orgaAdmin?.passwort === undefined || orgaAdmin?.passwort.length === 0) {
        return false;
      }
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
}
