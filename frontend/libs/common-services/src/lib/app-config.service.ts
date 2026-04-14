import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { AppConfig } from './app-config';

interface PublicSystemConfigurationDto {
  singleTenantMode?: boolean;
  singleTenantTheme?: string;
  datenschutzLinkDe?: string;
  datenschutzLinkEn?: string;
  agbLinkDe?: string;
  agbLinkEn?: string;
  avvLinkDe?: string;
  avvLinkEn?: string;
  imprintLink?: string;
}

interface LegalLinksConfigValues {
  datenschutzLinkDe?: string;
  datenschutzLinkEn?: string;
  agbLinkDe?: string;
  agbLinkEn?: string;
  avvLinkDe?: string;
  avvLinkEn?: string;
  imprintLink?: string;
}

function getRuntimeVar(key: string): string | null {
  const runtimeWindow = window as unknown as Record<string, unknown>;
  const value = runtimeWindow[key];
  if (typeof value === 'string' && value.trim() !== '') {
    return value.trim();
  }

  return null;
}

@Injectable({ providedIn: 'root' })
export class AppConfigService {
  private _config: AppConfig | undefined;
  private configuredDefaultTheme = '';

  constructor(private http: HttpClient) {}

  async loadConfig() {
    this._config = await lastValueFrom(this.http.get<AppConfig>('/config/app-config.json'));

    const runtimeTheme = getRuntimeVar('__AAS_FRONTEND_THEME');
    if (runtimeTheme != null) {
      this._config.defaultTheme = runtimeTheme;
    }

    this.configuredDefaultTheme = (this._config.defaultTheme ?? '').trim();
    await this.refreshSingleTenantThemeOverride();
  }

  async refreshSingleTenantThemeOverride() {
    if (!this._config?.aasSystemManagementApiPath) {
      return;
    }

    const fallbackTheme = this.configuredDefaultTheme || this._config.defaultTheme || '';

    try {
      const systemConfig = await lastValueFrom(
        this.http.get<PublicSystemConfigurationDto>(
          `${this._config.aasSystemManagementApiPath}/SystemManagement/GetConfiguration`,
        ),
      );

      this.applyLegalLinksOverride(systemConfig);

      if (systemConfig?.singleTenantMode === true) {
        const singleTenantTheme = (systemConfig.singleTenantTheme ?? '').trim();
        if (singleTenantTheme !== '' && singleTenantTheme !== 'default') {
          this._config.defaultTheme = singleTenantTheme;
          return;
        }
      }

      this._config.defaultTheme = fallbackTheme;
    } catch {
      // Keep static/runtime theme if system configuration is unavailable.
    }
  }

  private applyLegalLinksOverride(systemConfig: PublicSystemConfigurationDto) {
    if (this._config == null) {
      return;
    }

    this.applyLegalLinksToConfig(systemConfig, true);
  }

  updateLegalLinksInMemory(settings: LegalLinksConfigValues) {
    if (this._config == null) {
      return;
    }

    this.applyLegalLinksToConfig(settings, false);
  }

  private applyLegalLinksToConfig(settings: LegalLinksConfigValues, preferExistingWhenEmpty: boolean) {
    if (this._config == null) {
      return;
    }

    this._config.datenschutzLinkDe = this.resolveLegalLinkValue(
      this._config.datenschutzLinkDe,
      settings.datenschutzLinkDe,
      preferExistingWhenEmpty,
    );
    this._config.datenschutzLinkEn = this.resolveLegalLinkValue(
      this._config.datenschutzLinkEn,
      settings.datenschutzLinkEn,
      preferExistingWhenEmpty,
    );
    this._config.agbLinkDe = this.resolveLegalLinkValue(
      this._config.agbLinkDe,
      settings.agbLinkDe,
      preferExistingWhenEmpty,
    );
    this._config.agbLinkEn = this.resolveLegalLinkValue(
      this._config.agbLinkEn,
      settings.agbLinkEn,
      preferExistingWhenEmpty,
    );
    this._config.avvLinkDe = this.resolveLegalLinkValue(
      this._config.avvLinkDe,
      settings.avvLinkDe,
      preferExistingWhenEmpty,
    );
    this._config.avvLinkEn = this.resolveLegalLinkValue(
      this._config.avvLinkEn,
      settings.avvLinkEn,
      preferExistingWhenEmpty,
    );
    this._config.imprintLink = this.resolveLegalLinkValue(
      this._config.imprintLink,
      settings.imprintLink,
      preferExistingWhenEmpty,
    );
  }

  private resolveLegalLinkValue(
    currentValue: string | undefined,
    nextValue: string | undefined,
    preferExistingWhenEmpty: boolean,
  ): string {
    const normalizedNextValue = nextValue?.trim() ?? '';
    if (normalizedNextValue !== '') {
      return normalizedNextValue;
    }

    return preferExistingWhenEmpty ? (currentValue ?? '') : '';
  }

  get config(): AppConfig {
    return this._config ?? ({} as AppConfig);
  }
}
