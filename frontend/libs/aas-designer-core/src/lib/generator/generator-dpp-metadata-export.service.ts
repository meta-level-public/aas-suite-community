import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';

export interface GeneratorDppMetadataInput {
  aasId: string;
  uniqueProductIdentifier: string;
  granularity: 'Item' | 'Model' | 'Batch';
  dppSchemaVersion: string;
  dppStatus: 'Draft' | 'Active' | 'Suspended' | 'Withdrawn';
  economicOperatorId: string;
  facilityId: string | null;
  contentSpecificationIds: string[];
}

@Injectable({ providedIn: 'root' })
export class GeneratorDppMetadataExportService {
  constructor(private readonly http: HttpClient) {}

  async instantiate(input: GeneratorDppMetadataInput): Promise<aas.types.Submodel> {
    const json = await lastValueFrom(
      this.http.post<unknown>('/aas-proxy/dpp/metadata/instantiate', input, { withCredentials: true }),
    );
    const parsed = aas.jsonization.submodelFromJsonable(JSON.parse(JSON.stringify(json)));
    if (parsed.value == null) {
      const detail = parsed.error == null ? '' : ` (${parsed.error.path}: ${parsed.error.message})`;
      throw new Error(`Das erzeugte DPP-Metadaten-Teilmodell ist ungültig${detail}.`);
    }

    return parsed.value;
  }
}
