import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface TemplateMapping { templateId: string; pattern: string; }
export interface NameRule { submodelName: string; patterns: string[]; }
export interface SplitRule { strategy: string; pattern: string; index: number; }
export interface TwinEngineConfig {
  version: number;
  general: { dataEngineRepositoryBaseUrl: string; customerDomainUrl: string; defaultLanguages: string[]; };
  plugin: { baseUrl: string; healthEndpoint: string; authorizationHeader: string; organizationHeader: string; };
  templateMappings: TemplateMapping[];
  idRules: { aas: SplitRule; product: SplitRule; };
  dppPlugin: {
    indexContextPrefix: string; hasShellDescriptor: boolean; hasAssetInformation: boolean; hasAssetIdSearch: boolean;
    submodelNameRules: NameRule[]; productIdRule: SplitRule;
  };
}

@Injectable({ providedIn: 'root' })
export class ConfigApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/designer-api/plugin-api/twinengine-config';

  getConfig(): Observable<TwinEngineConfig> { return this.http.get<TwinEngineConfig>(`${this.baseUrl}/api/config`); }
  saveConfig(config: TwinEngineConfig): Observable<TwinEngineConfig> { return this.http.put<TwinEngineConfig>(`${this.baseUrl}/api/config`, config); }
  validateConfig(config: TwinEngineConfig): Observable<{ valid: boolean; errors: string[] }> {
    return this.http.post<{ valid: boolean; errors: string[] }>(`${this.baseUrl}/api/config/validate`, config);
  }
  exportConfig(): Observable<{ exported: boolean; version: number; path: string }> {
    return this.http.post<{ exported: boolean; version: number; path: string }>(`${this.baseUrl}/api/config/export`, {});
  }
}
