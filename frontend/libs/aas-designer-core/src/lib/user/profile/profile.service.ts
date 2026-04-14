import { BenutzerEinstellungen } from '@aas-designer-model';
import { AppConfigService } from '@aas/common-services';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { Profile } from './profile';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  constructor(
    private http: HttpClient,
    private appConfigService: AppConfigService,
  ) {}

  async saveProfile(profile: Profile) {
    return lastValueFrom(
      this.http.post<boolean>(`${this.appConfigService.config.apiPath}/Profil/UpdateProfil`, profile),
    );
  }

  async checkEmail(email: string) {
    const params = new HttpParams().set('email', email);
    return lastValueFrom(
      this.http.get<boolean>(`${this.appConfigService.config.apiPath}/Benutzer/EmailAvailable`, {
        params,
      }),
    );
  }

  async resetHilfe(einstellungen: BenutzerEinstellungen) {
    lastValueFrom(this.http.patch(`${this.appConfigService.config.apiPath}/Benutzer/UpdateSettings`, einstellungen));
  }
}
