import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, lastValueFrom, Observable, switchMap, throwError } from 'rxjs';

import { AssetAdministrationShell, Submodel, base64UrlEncode } from './aas-json';

export interface Infrastructure {
  id: number;
  name: string;
  description: string;
  isReadonly: boolean;
  noShellsListEndpoint: boolean;
}

interface PagedResult<T> {
  result?: T[];
  paging_metadata?: { cursor?: string };
}

const PAGE_SIZE = 100;
const MAX_PAGES = 20;

/**
 * Zugriff auf die AAS Suite.
 * Lesen läuft über den aas-proxy (nur GET), Schreiben über die Speicher-Endpunkte des Designers.
 * Beides arbeitet auf der Infrastruktur aus dem Header X-Infrastructure-ID.
 */
@Injectable({ providedIn: 'root' })
export class AasApiService {
  private readonly http = inject(HttpClient);

  getInfrastructures(): Promise<Infrastructure[]> {
    const url = '/designer-api/aas-api/AasInfrastructure/GetAvailableInfrastructures';
    return lastValueFrom(this.withSessionRefresh(() => this.http.get<Infrastructure[]>(url)));
  }

  async listShells(infrastructureId: number): Promise<AssetAdministrationShell[]> {
    const shells: AssetAdministrationShell[] = [];
    let cursor: string | undefined;
    for (let page = 0; page < MAX_PAGES; page++) {
      const query = `limit=${PAGE_SIZE}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`;
      const response = await lastValueFrom(
        this.http.get<PagedResult<AssetAdministrationShell>>(
          `${this.proxy(infrastructureId)}/aas-repo/shells?${query}`,
          { headers: this.infrastructureHeader(infrastructureId) },
        ),
      );
      shells.push(...(response.result ?? []));
      cursor = response.paging_metadata?.cursor;
      if (!cursor) {
        break;
      }
    }
    return shells;
  }

  getShell(infrastructureId: number, aasId: string): Promise<AssetAdministrationShell> {
    return lastValueFrom(
      this.http.get<AssetAdministrationShell>(
        `${this.proxy(infrastructureId)}/aas-repo/shells/${base64UrlEncode(aasId)}`,
        { headers: this.infrastructureHeader(infrastructureId) },
      ),
    );
  }

  getSubmodel(infrastructureId: number, submodelId: string): Promise<Submodel> {
    return lastValueFrom(
      this.http.get<Submodel>(
        `${this.proxy(infrastructureId)}/sm-repo/submodels/${base64UrlEncode(submodelId)}`,
        { headers: this.infrastructureHeader(infrastructureId) },
      ),
    );
  }

  /** Legt eine leere AAS an (wie "Neue AAS" im Designer) und liefert ihre ID. */
  async createShell(infrastructureId: number): Promise<string> {
    const result = await lastValueFrom(
      this.http.post<{ aasId: string }>('/designer-api/aas-api/Shells/Create', null, {
        headers: this.infrastructureHeader(infrastructureId),
      }),
    );
    return result.aasId;
  }

  /** Speichert eine bestehende AAS zusammen mit den übergebenen Teilmodellen. */
  async saveShell(
    infrastructureId: number,
    shell: AssetAdministrationShell,
    submodels: Submodel[],
  ): Promise<void> {
    const environment = {
      assetAdministrationShells: [{ ...shell, modelType: 'AssetAdministrationShell' }],
      submodels,
      conceptDescriptions: [],
    };
    const form = new FormData();
    form.append('plainJson', JSON.stringify(environment));
    form.append('createChangelogEntry', 'false');
    form.append('deletedSubmodels', '[]');
    await lastValueFrom(
      this.http.post('/designer-api/aas-api/Shells/Save', form, {
        headers: this.infrastructureHeader(infrastructureId),
      }),
    );
  }

  async saveSubmodel(infrastructureId: number, submodel: Submodel): Promise<void> {
    const form = new FormData();
    form.append('plainJson', JSON.stringify(submodel));
    await lastValueFrom(
      this.http.post('/designer-api/aas-api/Submodel/SaveSm', form, {
        headers: this.infrastructureHeader(infrastructureId),
      }),
    );
  }

  private proxy(infrastructureId: number): string {
    return `/designer-api/aas-proxy/${infrastructureId}`;
  }

  private infrastructureHeader(infrastructureId: number): HttpHeaders {
    return new HttpHeaders({ 'X-Infrastructure-ID': String(infrastructureId) });
  }

  private withSessionRefresh<T>(request: () => Observable<T>): Observable<T> {
    return request().pipe(
      catchError((error: { status?: number }) =>
        error.status === 401
          ? this.http.post('/bff/session/refresh', {}).pipe(switchMap(() => request()))
          : throwError(() => error),
      ),
    );
  }
}
