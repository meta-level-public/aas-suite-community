import { AppConfigService } from '@aas/common-services';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';

export interface ApplicationMailSettingsDto {
  smtpServer: string;
  smtpPort: number;
  smtpUseSsl: boolean;
  smtpUseTls: boolean;
  smtpNeedsAuthentication: boolean;
  senderAddress: string;
  senderUsername: string;
  senderPassword: string;
  newOrgaNotificationAddress: string;
  subjectPrefix: string;
}

export interface KeycloakMailSettingsDto {
  host: string;
  port: string;
  from: string;
  fromDisplayName: string;
  replyTo: string;
  replyToDisplayName: string;
  user: string;
  password: string;
  auth: boolean;
  startTls: boolean;
  ssl: boolean;
}

export interface MailSettingsDto {
  keycloakEnabled: boolean;
  canManageKeycloakMailSettings: boolean;
  application: ApplicationMailSettingsDto;
  keycloak: KeycloakMailSettingsDto;
}

export interface SendApplicationTestMailRequestDto {
  targetEmail: string;
  settings: ApplicationMailSettingsDto;
}

export interface SendKeycloakTestMailRequestDto {
  targetEmail: string;
  settings: KeycloakMailSettingsDto;
}

@Injectable({
  providedIn: 'root',
})
export class MailSettingsService {
  private readonly http = inject(HttpClient);
  private readonly appConfigService = inject(AppConfigService);

  async getMailSettings(): Promise<MailSettingsDto> {
    return await lastValueFrom(this.http.get<MailSettingsDto>(`${this.baseUrl}/SystemManagement/GetMailSettings`));
  }

  async updateMailSettings(settings: MailSettingsDto): Promise<MailSettingsDto> {
    return await lastValueFrom(
      this.http.put<MailSettingsDto>(`${this.baseUrl}/SystemManagement/UpdateMailSettings`, settings),
    );
  }

  async sendApplicationTestMail(request: SendApplicationTestMailRequestDto): Promise<void> {
    await lastValueFrom(this.http.post<void>(`${this.baseUrl}/SystemManagement/SendApplicationTestMail`, request));
  }

  async sendKeycloakTestMail(request: SendKeycloakTestMailRequestDto): Promise<void> {
    await lastValueFrom(this.http.post<void>(`${this.baseUrl}/SystemManagement/SendKeycloakTestMail`, request));
  }

  private get baseUrl(): string {
    return this.appConfigService.config.aasSystemManagementApiPath;
  }
}
