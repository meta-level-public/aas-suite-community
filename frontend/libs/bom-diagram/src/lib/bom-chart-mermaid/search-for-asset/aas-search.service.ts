import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { PagedResult } from './paged-result';

@Injectable({
  providedIn: 'root',
})
export class AasSearchService {
  http: HttpClient = inject(HttpClient);

  async search(
    registry: string,
    httpHeader: { key: string; value: string }[] = [],
    limit: number,
    offset: string | number | undefined | null,
  ) {
    let headers = new HttpHeaders();
    if (httpHeader != null) {
      httpHeader.forEach((p: any) => {
        headers = headers.set(p.key, p.value);
      });
    }

    // const params = { assetIds: EncodingService.base64urlEncode(assetId) };
    let params = new HttpParams().set('limit', limit);
    if (offset != null) {
      params = params.set('cursor', offset);
    }

    const res = await lastValueFrom(this.http.get(`${registry}/shells`, { params, headers }));
    return PagedResult.fromDto(res);
  }
}
