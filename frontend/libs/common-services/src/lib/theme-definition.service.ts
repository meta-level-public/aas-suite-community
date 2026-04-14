import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { AppConfigService } from './app-config.service';
import { ThemeDefinition, ThemeDefinitionsImport } from './theme-definition';

const IMMUTABLE_THEME_KEYS = new Set(['ml', 'cobalt', 'evergreen', 'amber']);

const SUPPORTED_BASE_THEME_KEYS = new Set(['ml', 'cobalt', 'evergreen', 'amber']);

@Injectable({ providedIn: 'root' })
export class ThemeDefinitionService {
  private readonly http = inject(HttpClient);
  private readonly appConfigService = inject(AppConfigService);

  async getThemeDefinitions(): Promise<ThemeDefinition[]> {
    const definitions = await lastValueFrom(
      this.http.get<ThemeDefinition[]>(`${this.baseUrl}/SystemManagement/GetThemeDefinitions`),
    );

    return definitions.map((theme) => ({
      ...theme,
      isBuiltIn: IMMUTABLE_THEME_KEYS.has(theme.key) && theme.isBuiltIn === true,
      baseTheme: this.resolveCompatibleBaseTheme(theme),
    }));
  }

  async upsertThemeDefinition(theme: ThemeDefinition): Promise<ThemeDefinition> {
    return await lastValueFrom(
      this.http.post<ThemeDefinition>(`${this.baseUrl}/SystemManagement/UpsertThemeDefinition`, theme),
    );
  }

  async deleteThemeDefinition(key: string): Promise<boolean> {
    return await lastValueFrom(
      this.http.delete<boolean>(`${this.baseUrl}/SystemManagement/DeleteThemeDefinition`, { params: { key } }),
    );
  }

  async exportThemeDefinitions(): Promise<{ data: Blob; fileName?: string }> {
    const response = await lastValueFrom(
      this.http.post(
        `${this.baseUrl}/SystemManagement/ExportThemeDefinitions`,
        {},
        { observe: 'response', responseType: 'blob' },
      ),
    );

    const contentDisposition = response.headers.get('content-disposition');
    const fileName = contentDisposition?.match(/filename\*?=(?:UTF-8''|")?([^";]+)/)?.[1]?.replace(/"/g, '');
    return {
      data: response.body ?? new Blob(),
      fileName,
    };
  }

  async importThemeDefinitions(fileAsBase64: string): Promise<boolean> {
    const payload: ThemeDefinitionsImport = { fileAsBase64 };
    return await lastValueFrom(
      this.http.post<boolean>(`${this.baseUrl}/SystemManagement/ImportThemeDefinitions`, payload),
    );
  }

  private get baseUrl(): string {
    return this.appConfigService.config.aasSystemManagementApiPath;
  }

  private resolveCompatibleBaseTheme(theme: ThemeDefinition): string {
    const normalizedKey = (theme.key ?? '').trim().toLowerCase();
    const normalizedBaseTheme = (theme.baseTheme ?? '').trim().toLowerCase();
    if (SUPPORTED_BASE_THEME_KEYS.has(normalizedBaseTheme)) {
      if (normalizedBaseTheme === 'ml' && SUPPORTED_BASE_THEME_KEYS.has(normalizedKey) && normalizedKey !== 'ml') {
        return normalizedKey;
      }

      return normalizedBaseTheme;
    }

    if (SUPPORTED_BASE_THEME_KEYS.has(normalizedKey)) {
      return normalizedKey;
    }

    return 'ml';
  }
}
