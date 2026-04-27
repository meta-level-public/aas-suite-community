import { AuthenticateResponse, NewsItem } from '@aas-designer-model';
import { AppConfigService } from '@aas/common-services';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { AuthenticateRequest } from './model/authenticate-request';

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

    // neueste zuerst anzeigen, falls das Datum ungültig ist, wird es als ältestes behandelt.
    return (res?.map((dto) => NewsItem.fromDto(dto)) ?? []).sort(
      (left, right) => this.getNewsTimestamp(right) - this.getNewsTimestamp(left),
    );
  }

  private getNewsTimestamp(newsItem: NewsItem) {
    return newsItem.date instanceof Date && !Number.isNaN(newsItem.date.getTime()) ? newsItem.date.getTime() : 0;
  }
}
