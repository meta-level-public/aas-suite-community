import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { ConceptDescription } from '@aas-core-works/aas-core3.1-typescript/types';
import { EncodingService } from '@aas/common-services';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ConceptDescriptionService {
  loadedCds: ConceptDescription[] = [];
  http = inject(HttpClient);
  pendingLoads = new Map<string, Promise<ConceptDescription | undefined>>();

  notFoundCds: string[] = [];

  async loadCD(id: string, server: string, apikey: string) {
    const existing = this.loadedCds.find((loadedCd) => loadedCd.id === id);
    if (existing != null) {
      return existing;
    }

    if (this.notFoundCds.includes(id)) {
      return undefined;
    }

    const pending = this.pendingLoads.get(id);
    if (pending != null) {
      return pending;
    }

    const request = this.fetchCD(id, server, apikey);
    this.pendingLoads.set(id, request);

    try {
      return await request;
    } finally {
      this.pendingLoads.delete(id);
    }
  }

  private async fetchCD(id: string, server: string, apikey: string) {
    try {
      const headers = new HttpHeaders().append('Apikey', apikey);
      const res = await lastValueFrom(
        this.http.get(`${server}/concept-descriptions/${EncodingService.base64urlEncode(id)}`, {
          headers,
          responseType: 'text',
        }),
      );

      const payload = typeof res === 'string' ? JSON.parse(res) : res;
      const instanceOrErrorPlain = aas.jsonization.conceptDescriptionFromJsonable(payload);
      if (instanceOrErrorPlain.value != null) {
        this.loadedCds.push(instanceOrErrorPlain.value);
        return instanceOrErrorPlain.value;
      }

      this.notFoundCds.push(id);
      return undefined;
    } catch {
      this.notFoundCds.push(id);
      return undefined;
    }
  }
}
