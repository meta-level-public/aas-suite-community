import { AppConfigService } from '@aas/common-services';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';

export interface LegalLinksSettingsDto {
  datenschutzLinkDe: string;
  datenschutzLinkEn: string;
  agbLinkDe: string;
  agbLinkEn: string;
  avvLinkDe: string;
  avvLinkEn: string;
  imprintLink: string;
}

@Injectable({
  providedIn: 'root',
})
export class LegalLinksSettingsService {
  private readonly http = inject(HttpClient);
  private readonly appConfigService = inject(AppConfigService);

  async getLegalLinksSettings(): Promise<LegalLinksSettingsDto> {
    return await lastValueFrom(
      this.http.get<LegalLinksSettingsDto>(`${this.baseUrl}/SystemManagement/GetLegalLinksSettings`),
    );
  }

  async updateLegalLinksSettings(settings: LegalLinksSettingsDto): Promise<LegalLinksSettingsDto> {
    return await lastValueFrom(
      this.http.put<LegalLinksSettingsDto>(`${this.baseUrl}/SystemManagement/UpdateLegalLinksSettings`, settings),
    );
  }

  private get baseUrl(): string {
    return this.appConfigService.config.aasSystemManagementApiPath;
  }
}
