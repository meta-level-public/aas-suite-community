import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfigService } from '@aas/common-services';
import { lastValueFrom } from 'rxjs';
import { UserInvitation } from '@aas-designer-model';
import { AuthenticateResponse } from '@aas-designer-model';

@Injectable({
  providedIn: 'root',
})
export class CreateInvitatedAccountService {
  constructor(
    private http: HttpClient,
    private appConfigService: AppConfigService,
  ) {}

  async getInvitation(guid: string) {
    const params = new HttpParams().append('guid', guid);
    const dto = await lastValueFrom(
      this.http.get<UserInvitation>(`${this.appConfigService.config.apiPath}/Benutzer/GetInvitation`, { params }),
    );

    return UserInvitation.fromDto(dto);
  }

  async createAccount(invitation: UserInvitation, password: string) {
    const body = {
      invitation: invitation.toDto(),
      password,
    };

    const dto = await lastValueFrom(
      this.http.post<AuthenticateResponse>(
        `${this.appConfigService.config.apiPath}/Benutzer/CreateAccountByInvitation`,
        body,
      ),
    );

    return AuthenticateResponse.fromDto(dto);
  }
}
