import { AppConfigService } from '@aas/common-services';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';

export interface LegalLinksDocumentInfoDto {
  fileName: string;
  contentType: string;
}

export interface LegalLinksDocumentUploadDto {
  fileName: string;
  contentType: string;
  /** Base64-encoded file content. Empty string signals document deletion. */
  contentBase64: string;
}

export interface LegalLinksSettingsDto {
  datenschutzLinkDe: string;
  datenschutzLinkEn: string;
  agbLinkDe: string;
  agbLinkEn: string;
  avvLinkDe: string;
  avvLinkEn: string;
  imprintLink: string;
  datenschutzLinkDeDocument?: LegalLinksDocumentInfoDto;
  datenschutzLinkEnDocument?: LegalLinksDocumentInfoDto;
  agbLinkDeDocument?: LegalLinksDocumentInfoDto;
  agbLinkEnDocument?: LegalLinksDocumentInfoDto;
  avvLinkDeDocument?: LegalLinksDocumentInfoDto;
  avvLinkEnDocument?: LegalLinksDocumentInfoDto;
  imprintLinkDocument?: LegalLinksDocumentInfoDto;
}

export interface UpdateLegalLinksSettingsRequest {
  datenschutzLinkDe: string;
  datenschutzLinkEn: string;
  agbLinkDe: string;
  agbLinkEn: string;
  avvLinkDe: string;
  avvLinkEn: string;
  imprintLink: string;
  datenschutzLinkDeDocument: LegalLinksDocumentUploadDto | null;
  datenschutzLinkEnDocument: LegalLinksDocumentUploadDto | null;
  agbLinkDeDocument: LegalLinksDocumentUploadDto | null;
  agbLinkEnDocument: LegalLinksDocumentUploadDto | null;
  avvLinkDeDocument: LegalLinksDocumentUploadDto | null;
  avvLinkEnDocument: LegalLinksDocumentUploadDto | null;
  imprintLinkDocument: LegalLinksDocumentUploadDto | null;
  /** Base URL of the system-management API as seen by the client. */
  servingBaseUrl: string;
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

  async updateLegalLinksSettings(request: UpdateLegalLinksSettingsRequest): Promise<LegalLinksSettingsDto> {
    return await lastValueFrom(
      this.http.put<LegalLinksSettingsDto>(`${this.baseUrl}/SystemManagement/UpdateLegalLinksSettings`, request),
    );
  }

  private get baseUrl(): string {
    return this.appConfigService.config.aasSystemManagementApiPath;
  }
}
