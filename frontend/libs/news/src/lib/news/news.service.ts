import { NewsItem } from '@aas-designer-model';
import { AppConfigService, PortalService } from '@aas/common-services';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom, lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NewsService {
  private http = inject(HttpClient);
  private portalService = inject(PortalService);
  private appConfigService = inject(AppConfigService);

  async getAllNews() {
    const dtos = await firstValueFrom(
      this.http.get<NewsItem[]>(`${this.appConfigService.config.apiPath}/News/GetAll`, {}),
    );

    return dtos.map((d: any) => NewsItem.fromDto(d));
  }

  async checkForNews() {
    return firstValueFrom(this.http.get<boolean>(`${this.appConfigService.config.apiPath}/News/CheckForNews`, {}));
  }

  async getVisibleNews() {
    const dtos = await firstValueFrom(
      this.http.get<NewsItem[]>(`${this.appConfigService.config.apiPath}/News/GetAllVisible`, {}),
    );

    return dtos.map((d: any) => NewsItem.fromDto(d));
  }

  async getNewsItemById(id: number) {
    return lastValueFrom(
      this.http.get<NewsItem>(`${this.appConfigService.config.apiPath}/News/GetById?newsId=${id}`, {}),
    );
  }

  async createNewsItem(newsItem: NewsItem) {
    return lastValueFrom(this.http.put<NewsItem>(`${this.appConfigService.config.apiPath}/News/Add`, newsItem));
  }

  async adminUpdateNewsItem(newsItem: NewsItem) {
    return lastValueFrom(
      this.http.patch<NewsItem>(`${this.appConfigService.config.apiPath}/News/AdminUpdate`, newsItem),
    );
  }

  async userUpdateNewsItem(newsItem: NewsItem) {
    return lastValueFrom(
      this.http.patch<NewsItem>(`${this.appConfigService.config.apiPath}/News/UserUpdate`, newsItem),
    );
  }

  async updateSettings() {
    if (this.portalService.user != null) {
      await firstValueFrom(
        this.http.patch(
          `${this.appConfigService.config.apiPath}/Benutzer/UpdateSettings`,
          this.portalService.user.einstellungen,
        ),
      );
    }
  }
}
