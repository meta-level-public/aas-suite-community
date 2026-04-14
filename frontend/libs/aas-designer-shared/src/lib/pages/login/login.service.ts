import { AppConfigService } from '@aas/common-services';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { NewsItem } from '@aas-designer-model';
import { AuthenticateRequest } from './model/authenticate-request';
import { AuthenticateResponse } from '@aas-designer-model';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  constructor(
    private http: HttpClient,
    private appConfigService: AppConfigService,
  ) {}

  async login(credentials: AuthenticateRequest) {
    const res = await lastValueFrom(
      this.http.post<AuthenticateResponse>(`${this.appConfigService.config.apiPath}/Auth/authenticate/`, credentials),
    );

    return AuthenticateResponse.fromDto(res);
  }

  async getNews() {
    const res = await lastValueFrom(
      this.http.get<NewsItem[]>(`${this.appConfigService.config.apiPath}/News/GetAllPublic`),
    );

    return res?.map((dto) => NewsItem.fromDto(dto)) ?? [];
  }
}
