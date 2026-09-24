import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, of, switchMap, throwError } from 'rxjs';

export interface TemplateMapping {
  templateId: string;
  pattern: string;
}
export interface NameRule {
  submodelName: string;
  patterns: string[];
}
export interface ProductIdExtractionRule {
  pattern: string;
  index: number;
  strategy: string;
  description: string;
}
export interface TwinEngineConfig {
  version: number;
  dataEngine: {
    defaultLanguages: string[];
    templateMappings: TemplateMapping[];
    shellTemplateMapping: TemplateMapping;
    aasIdExtractionRule: { strategy: string; pattern: string; index: number };
  };
  dppPlugin: {
    submodelNameRules: NameRule[];
    productIdExtractionRule: ProductIdExtractionRule;
  };
}

interface AvailableInfrastructure {
  id: number;
  name: string;
  description: string;
  smRepositoryUrl: string;
}

export interface ConfigHistoryEntry {
  version: number;
  savedAtUtc: string;
}

export interface TemplateMappingValidationResult {
  mappingWarnings: Record<number, string[]>;
  mappingSuccesses: Record<number, string>;
  shellTemplateWarning?: string;
  shellTemplateSuccess?: string;
  generalWarning?: string;
}

@Injectable({ providedIn: 'root' })
export class ConfigApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/designer-api/plugin-api/twinengine-config';

  getConfig(): Observable<TwinEngineConfig> {
    return this.http.get<TwinEngineConfig>(`${this.baseUrl}/api/config`);
  }
  saveConfig(config: TwinEngineConfig): Observable<TwinEngineConfig> {
    return this.http.put<TwinEngineConfig>(`${this.baseUrl}/api/config`, config);
  }
  validateConfig(config: TwinEngineConfig): Observable<{ valid: boolean; errors: string[] }> {
    return this.http.post<{ valid: boolean; errors: string[] }>(
      `${this.baseUrl}/api/config/validate`,
      config,
    );
  }
  validateTemplateMappings(
    mappings: TemplateMapping[],
    shellTemplateMapping: TemplateMapping,
  ): Observable<TemplateMappingValidationResult> {
    return this.getAvailableInfrastructures().pipe(
      switchMap((infrastructures) => {
        const templateRepository = infrastructures.find((infrastructure) =>
          `${infrastructure.name} ${infrastructure.description}`
            .toLowerCase()
            .includes('template repository'),
        );
        if (!templateRepository) {
          return of({
            mappingWarnings: {},
            mappingSuccesses: {},
            shellTemplateWarning: undefined,
            shellTemplateSuccess: undefined,
            generalWarning:
              'Keine Infrastruktur mit der Bezeichnung "Template Repository" verfügbar.',
          });
        }

        const mappingChecks = mappings.map((mapping, index) =>
          this.http
            .get(
              `/designer-api/aas-proxy/${templateRepository.id}/sm-reg/submodel-descriptors/${this.base64UrlEncode(mapping.templateId)}`,
              { observe: 'response' },
            )
            .pipe(
              map(() => ({ index, missing: false, failed: false })),
              catchError((error: { status?: number }) =>
                of({ index, missing: error.status === 404, failed: error.status !== 404 }),
              ),
            ),
        );
        const shellCheck = this.http
          .get(
            `/designer-api/aas-proxy/${templateRepository.id}/aas-repo/shells/${this.base64UrlEncode(shellTemplateMapping.templateId)}`,
            { observe: 'response' },
          )
          .pipe(
            map(() => ({ missing: false, failed: false })),
            catchError((error: { status?: number }) =>
              of({ missing: error.status === 404, failed: error.status !== 404 }),
            ),
          );

        const mappingResults = mappingChecks.length > 0 ? forkJoin(mappingChecks) : of([]);
        return forkJoin({ mappingResults, shellResult: shellCheck }).pipe(
          map(({ mappingResults, shellResult }) => {
            const missingIndexes = mappingResults
              .filter((result) => result.missing)
              .map((result) => result.index);
            const successfulIndexes = mappingResults
              .filter((result) => !result.missing && !result.failed)
              .map((result) => result.index);
            return {
              mappingWarnings: Object.fromEntries(
                missingIndexes.map((index) => [
                  index,
                  ['Submodel-Template ist im Template Repository nicht vorhanden.'],
                ]),
              ),
              mappingSuccesses: Object.fromEntries(
                successfulIndexes.map((index) => [
                  index,
                  'Submodel-Template im Template Repository gefunden.',
                ]),
              ),
              shellTemplateWarning: shellResult.missing
                ? 'Shell-Template ist im Template Repository nicht vorhanden.'
                : undefined,
              shellTemplateSuccess:
                !shellResult.missing && !shellResult.failed
                  ? 'Shell-Template im Template Repository gefunden.'
                  : undefined,
              generalWarning:
                mappingResults.some((result) => result.failed) || shellResult.failed
                  ? 'Einige Templates konnten im Template Repository nicht geprüft werden.'
                  : undefined,
            };
          }),
        );
      }),
      catchError(() =>
        of({
          mappingWarnings: {},
          mappingSuccesses: {},
          shellTemplateWarning: undefined,
          shellTemplateSuccess: undefined,
          generalWarning: 'Template Repository-Infrastruktur konnte nicht geladen werden.',
        }),
      ),
    );
  }
  exportConfig(): Observable<{
    exported: boolean;
    version: number;
    dataEnginePath: string;
    dppPluginPath: string;
  }> {
    return this.http.post<{
      exported: boolean;
      version: number;
      dataEnginePath: string;
      dppPluginPath: string;
    }>(`${this.baseUrl}/api/config/export`, {});
  }
  recreateDataEngine(): Observable<{
    recreated: boolean;
    containerId: string;
    containerName: string;
  }> {
    return this.http.post<{
      recreated: boolean;
      containerId: string;
      containerName: string;
    }>(`${this.baseUrl}/api/config/recreate-dataengine`, {});
  }
  getConfigHistory(): Observable<ConfigHistoryEntry[]> {
    return this.http.get<ConfigHistoryEntry[]>(`${this.baseUrl}/api/config/history`);
  }
  getConfigHistoryVersion(version: number): Observable<TwinEngineConfig> {
    return this.http.get<TwinEngineConfig>(`${this.baseUrl}/api/config/history/${version}`);
  }
  getConfigDefaults(): Observable<TwinEngineConfig> {
    return this.http.get<TwinEngineConfig>(`${this.baseUrl}/api/config/defaults`);
  }

  private base64UrlEncode(value: string): string {
    const bytes = new TextEncoder().encode(value);
    const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
    return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
  }

  private getAvailableInfrastructures(): Observable<AvailableInfrastructure[]> {
    const url = '/designer-api/aas-api/AasInfrastructure/GetAvailableInfrastructures';
    return this.http.get<AvailableInfrastructure[]>(url).pipe(
      catchError((error: { status?: number }) => {
        if (error.status !== 401) {
          return throwError(() => error);
        }

        return this.http
          .post('/bff/session/refresh', {})
          .pipe(switchMap(() => this.http.get<AvailableInfrastructure[]>(url)));
      }),
    );
  }
}
