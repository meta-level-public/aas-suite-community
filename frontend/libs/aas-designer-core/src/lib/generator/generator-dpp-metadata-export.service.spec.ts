import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { GeneratorDppMetadataExportService } from './generator-dpp-metadata-export.service';

describe('GeneratorDppMetadataExportService', () => {
  it('deserializes the official DPP metadata template used by the backend', () => {
    const templatePath = resolve(
      process.cwd(),
      '../services/aas-designer/AasDesignerAasApi/Resources/DppMetadata/1.0/template.json',
    );
    const json = JSON.parse(readFileSync(templatePath, 'utf8'));
    json.id = 'urn:test:aas/submodels/DppMetadata';
    json.kind = 'Instance';
    delete json.administration;
    removeTemplateQualifiers(json);

    const parsed = aas.jsonization.submodelFromJsonable(json);

    expect(parsed.error).toBeNull();
  });

  it('instantiates and deserializes the official DPP metadata submodel', async () => {
    const http = {
      post: vi.fn().mockReturnValue(
        of({
          modelType: 'Submodel',
          id: 'urn:test:aas/submodels/DppMetadata',
          idShort: 'DppMetadata',
          kind: 'Instance',
          semanticId: {
            type: 'ModelReference',
            keys: [{ type: 'Submodel', value: 'https://admin-shell.io/idta/cds/dppMetadata/1' }],
          },
          submodelElements: [],
        }),
      ),
    };
    const service = new GeneratorDppMetadataExportService(http as never);
    const input = {
      aasId: 'urn:test:aas',
      uniqueProductIdentifier: 'urn:test:asset',
      granularity: 'Item' as const,
      dppSchemaVersion: 'EN 18223:2026',
      dppStatus: 'Draft' as const,
      economicOperatorId: 'operator-1',
      facilityId: null,
      contentSpecificationIds: ['urn:test:semantic'],
    };

    const result = await service.instantiate(input);

    expect(result.idShort).toBe('DppMetadata');
    expect(http.post).toHaveBeenCalledWith('/aas-proxy/dpp/metadata/instantiate', input, { withCredentials: true });
  });
});

function removeTemplateQualifiers(value: unknown): void {
  if (Array.isArray(value)) {
    value.forEach(removeTemplateQualifiers);
    return;
  }
  if (value == null || typeof value !== 'object') return;

  delete (value as Record<string, unknown>)['qualifiers'];
  Object.values(value).forEach(removeTemplateQualifiers);
}
