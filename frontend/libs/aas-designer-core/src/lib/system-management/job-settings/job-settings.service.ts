import { AppConfigService } from '@aas/common-services';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';

export interface JobSettingsDto {
  intervalMinutes: number;
  isEnabled: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class JobSettingsService {
  private readonly http = inject(HttpClient);
  private readonly appConfigService = inject(AppConfigService);

  async getSettings(jobKey: string): Promise<JobSettingsDto> {
    return await lastValueFrom(this.http.get<JobSettingsDto>(`${this.baseUrl}/job-settings/${jobKey}`));
  }

  async updateSettings(jobKey: string, settings: JobSettingsDto): Promise<JobSettingsDto> {
    return await lastValueFrom(this.http.put<JobSettingsDto>(`${this.baseUrl}/job-settings/${jobKey}`, settings));
  }

  private get baseUrl(): string {
    return this.appConfigService.config.apiPath;
  }
}
