import { AssetAdministrationShell } from '@aas-core-works/aas-core3.1-typescript/types';
import { EncodingService } from '@aas/common-services';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { PagedResult } from '../search-for-asset/paged-result';

@Injectable({
  providedIn: 'root',
})
export class AasSearchService {
  http: HttpClient = inject(HttpClient);

  async findAasByDiscovery(assetId: string, discovery: string, httpHeader: { key: string; value: string }[] = []) {
    let headers = new HttpHeaders();
    if (httpHeader != null) {
      httpHeader.forEach((p: any) => {
        headers = headers.set(p.key, p.value);
      });
    }

    const specificAssetId = JSON.stringify({
      name: 'globalAssetId',
      value: assetId.trim(),
    });
    const params = new HttpParams().set('assetIds', [EncodingService.base64urlEncode(specificAssetId)].toString());

    const result = await lastValueFrom(this.http.get<PagedResult>(`${discovery}/lookup/shells`, { params, headers }));
    const pagedResult = PagedResult.fromDto(result);

    return pagedResult;
  }

  async findAasByRepo(assetId: string, url: string, httpHeader: { key: string; value: string }[] = []) {
    let headers = new HttpHeaders();
    if (httpHeader != null) {
      httpHeader.forEach((p: any) => {
        headers = headers.set(p.key, p.value);
      });
    }

    const specificAssetId = JSON.stringify({
      name: 'globalAssetId',
      value: assetId.trim(),
    });
    const params = new HttpParams().set('assetIds', [EncodingService.base64urlEncode(specificAssetId)].toString());

    const result = await lastValueFrom(this.http.get<PagedResult>(`${url}/shells`, { params, headers }));
    // eslint-disable-next-line no-console
    console.log('AasSearchService.findAasByRepo', result);
    const pagedResult = PagedResult.fromDto(result);

    // im pages result wollen wir nur die ids haben
    // pagedResult.result = pagedResult.result.map((item: any) => item.id);

    return pagedResult;
  }

  async getAasById(aasId: string, url: string, httpHeader: { key: string; value: string }[] = []) {
    let headers = new HttpHeaders();
    if (httpHeader != null) {
      httpHeader.forEach((p: any) => {
        headers = headers.set(p.key, p.value);
      });
    }

    const result = await lastValueFrom(
      this.http.get<AssetAdministrationShell>(`${url}/shells/${EncodingService.base64urlEncode(aasId)}`),
    );

    return result;
  }
}
