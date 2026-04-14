import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { AppConfigService } from '@aas/common-services';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';

export interface BatteryPassportTemplateBundle {
  v3Submodels: aas.types.Submodel[];
  v3ConceptDescriptions: aas.types.ConceptDescription[];
}

@Injectable({
  providedIn: 'root',
})
export class BatteryPassportAssistantService {
  private readonly http = inject(HttpClient);
  private readonly appConfigService = inject(AppConfigService);
  private readonly conceptDescriptionCache = new Map<string, aas.types.ConceptDescription | null>();
  private readonly conceptDescriptionRequests = new Map<string, Promise<aas.types.ConceptDescription | null>>();

  async loadBatteryPassportTemplates(): Promise<BatteryPassportTemplateBundle> {
    const dto = await lastValueFrom(
      this.http.get<any>(`${this.appConfigService.config.apiPath}/SubmodelTemplate/GetBatteryPassportFromIdtaRepo`),
    );
    const submodels = this.parseSubmodels(dto?.v3SubmodelsPlain ?? []);
    const conceptDescriptions = await this.loadConceptDescriptionsForTemplates(
      submodels,
      this.parseConceptDescriptions(dto?.v3ConceptDescriptionsPlain ?? []),
    );

    return {
      v3Submodels: this.distinctById(submodels),
      v3ConceptDescriptions: this.distinctById(conceptDescriptions),
    };
  }

  async loadDppPcfTemplate(): Promise<BatteryPassportTemplateBundle> {
    const templates = await lastValueFrom(
      this.http.get<any[]>(`${this.appConfigService.config.apiPath}/SubmodelTemplate/GetAllFromIdtaRepo`),
    );

    const pcfTemplate = templates.find(
      (template) =>
        this.containsIgnoreCase(template?.semanticIds, 'https://admin-shell.io/idta/CarbonFootprint/1/0') ||
        this.containsIgnoreCase(template?.name, 'CarbonFootprint'),
    );

    if (pcfTemplate?.url == null || pcfTemplate.url === '') {
      return { v3Submodels: [], v3ConceptDescriptions: [] };
    }

    const dto = await lastValueFrom(
      this.http.get<any>(`${this.appConfigService.config.apiPath}/SubmodelTemplate/GetRepoSubmodelTemplate`, {
        params: { url: pcfTemplate.url },
      }),
    );

    const submodels = this.parseSubmodels(dto?.v3SubmodelsPlain ?? []);
    const conceptDescriptions = await this.loadConceptDescriptionsForTemplates(
      submodels,
      this.parseConceptDescriptions(dto?.v3ConceptDescriptionsPlain ?? []),
    );

    return {
      v3Submodels: this.distinctById(submodels),
      v3ConceptDescriptions: this.distinctById(conceptDescriptions),
    };
  }

  private parseSubmodels(v3SubmodelsPlain: string[]) {
    const resultSubmodels: aas.types.Submodel[] = [];
    for (const sm of v3SubmodelsPlain) {
      const parsed = this.parseSubmodelWithFallback(sm);
      if (parsed != null) {
        resultSubmodels.push(parsed);
      }
    }
    return resultSubmodels;
  }

  private parseConceptDescriptions(v3ConceptDescriptionsPlain: string[]) {
    const resultConceptDescriptions: aas.types.ConceptDescription[] = [];
    for (const cd of v3ConceptDescriptionsPlain) {
      const parsed = aas.jsonization.conceptDescriptionFromJsonable(JSON.parse(cd));
      if (parsed.value != null) {
        this.conceptDescriptionCache.set(parsed.value.id, parsed.value);
        resultConceptDescriptions.push(parsed.value);
      }
    }
    return resultConceptDescriptions;
  }

  private async loadConceptDescriptionsForTemplates(
    submodels: aas.types.Submodel[],
    existingConceptDescriptions: aas.types.ConceptDescription[],
  ) {
    const conceptDescriptions = this.distinctById(existingConceptDescriptions);
    const knownIds = new Set(conceptDescriptions.map((conceptDescription) => conceptDescription.id));
    const semanticIds = [...this.collectSemanticIds(submodels)].filter((semanticId) => !knownIds.has(semanticId));

    if (semanticIds.length === 0) {
      return conceptDescriptions;
    }

    const fetchedConceptDescriptions = await this.fetchConceptDescriptions(semanticIds);

    return this.distinctById([
      ...conceptDescriptions,
      ...fetchedConceptDescriptions.filter((conceptDescription) => conceptDescription != null),
    ]);
  }

  private async fetchConceptDescriptions(semanticIds: string[]) {
    const result: Array<aas.types.ConceptDescription | null> = [];
    const idsToFetch: string[] = [];

    for (const semanticId of semanticIds) {
      if (this.conceptDescriptionCache.has(semanticId)) {
        result.push(this.conceptDescriptionCache.get(semanticId) ?? null);
        continue;
      }

      const pendingRequest = this.conceptDescriptionRequests.get(semanticId);
      if (pendingRequest != null) {
        result.push(await pendingRequest);
        continue;
      }

      idsToFetch.push(semanticId);
    }

    if (idsToFetch.length === 0) {
      return result;
    }

    const fetchedConceptDescriptions = await this.fetchConceptDescriptionsFromApi(idsToFetch);
    const byId = new Map(
      fetchedConceptDescriptions
        .filter((conceptDescription) => conceptDescription?.id != null)
        .map((conceptDescription) => [conceptDescription!.id, conceptDescription!]),
    );

    idsToFetch.forEach((semanticId) => {
      const conceptDescription = byId.get(semanticId) ?? null;
      this.conceptDescriptionCache.set(semanticId, conceptDescription);
      result.push(conceptDescription);
    });

    return result;
  }

  private async fetchConceptDescription(semanticId: string) {
    if (this.conceptDescriptionCache.has(semanticId)) {
      return this.conceptDescriptionCache.get(semanticId) ?? null;
    }

    const pendingRequest = this.conceptDescriptionRequests.get(semanticId);
    if (pendingRequest != null) {
      return pendingRequest;
    }

    const request = this.fetchConceptDescriptionFromApi(semanticId);
    this.conceptDescriptionRequests.set(semanticId, request);

    try {
      const conceptDescription = await request;
      this.conceptDescriptionCache.set(semanticId, conceptDescription);
      return conceptDescription;
    } finally {
      this.conceptDescriptionRequests.delete(semanticId);
    }
  }

  private async fetchConceptDescriptionsFromApi(semanticIds: string[]) {
    try {
      const payloads = await lastValueFrom(
        this.http.post<any[]>(
          `${this.appConfigService.config.apiPath}/SubmodelTemplate/GetRepoConceptDescriptions`,
          semanticIds,
        ),
      );

      return (payloads ?? [])
        .map((payload) => this.parseConceptDescriptionPayload(payload))
        .filter((conceptDescription) => conceptDescription != null);
    } catch {
      return Promise.all(semanticIds.map((semanticId) => this.fetchConceptDescription(semanticId)));
    }
  }

  private async fetchConceptDescriptionFromApi(semanticId: string) {
    try {
      const dto = await lastValueFrom(
        this.http.get<any>(`${this.appConfigService.config.apiPath}/SubmodelTemplate/GetRepoConceptDescription`, {
          params: { id: semanticId },
        }),
      );

      return this.parseConceptDescriptionPayload(dto);
    } catch {
      return null;
    }
  }

  private parseConceptDescriptionPayload(dto: unknown) {
    const payload = typeof dto === 'string' ? JSON.parse(dto) : dto;
    if (payload == null || (payload as any).id === '') {
      return null;
    }

    const parsed = aas.jsonization.conceptDescriptionFromJsonable(payload);
    if (parsed.value?.embeddedDataSpecifications != null) {
      parsed.value.embeddedDataSpecifications.forEach((embeddedDataSpecification) => {
        if ((embeddedDataSpecification.dataSpecificationContent as any).value === '') {
          (embeddedDataSpecification.dataSpecificationContent as any).value = null;
        }
      });
    }

    return parsed.value ?? null;
  }

  private collectSemanticIds(submodels: aas.types.Submodel[]) {
    const semanticIds = new Set<string>();

    const visitReference = (reference: aas.types.Reference | null | undefined) => {
      reference?.keys?.forEach((key) => {
        if (key.value != null && `${key.value}`.trim() !== '') {
          semanticIds.add(`${key.value}`.trim());
        }
      });
    };

    const visitElement = (element: aas.types.ISubmodelElement) => {
      visitReference(element.semanticId);
      element.supplementalSemanticIds?.forEach((reference) => visitReference(reference));

      if (element instanceof aas.types.SubmodelElementCollection || element instanceof aas.types.SubmodelElementList) {
        element.value?.forEach((childElement) => visitElement(childElement));
      }
    };

    submodels.forEach((submodel) => {
      visitReference(submodel.semanticId);
      submodel.supplementalSemanticIds?.forEach((reference) => visitReference(reference));
      submodel.submodelElements?.forEach((element) => visitElement(element));
    });

    return semanticIds;
  }

  private sanitizeIdtaPayload(payload: string) {
    return payload
      .replaceAll('urn:samurn:samm:', 'urn:samm:')
      .replaceAll('urn:samurn:samurn:samm:', 'urn:samm:')
      .replaceAll('urn:samurn:samm', 'urn:samm')
      .replaceAll('urn:samurn:samurn:samm', 'urn:samm');
  }

  private parseSubmodelWithFallback(payload: string): aas.types.Submodel | null {
    const parsed = aas.jsonization.submodelFromJsonable(JSON.parse(payload));
    if (parsed.value != null) {
      return parsed.value;
    }

    const sanitized = this.sanitizeIdtaPayload(payload);
    const retryParsed = aas.jsonization.submodelFromJsonable(JSON.parse(sanitized));
    if (retryParsed.value != null) {
      return retryParsed.value;
    }

    const minimal = this.createMinimalSubmodelJson(JSON.parse(sanitized));
    const minimalParsed = aas.jsonization.submodelFromJsonable(minimal);
    return minimalParsed.value ?? null;
  }

  private createMinimalSubmodelJson(input: any): any {
    const createReference = (reference: any) => {
      if (reference == null || !Array.isArray(reference.keys)) {
        return undefined;
      }
      const keys = reference.keys
        .map((key: any) => {
          if (key?.type == null || key?.value == null) {
            return null;
          }
          return { type: key.type, value: `${key.value}` };
        })
        .filter((key: any) => key != null);
      if (keys.length === 0) {
        return undefined;
      }
      return { type: reference.type ?? 'ExternalReference', keys };
    };

    const mapElement = (element: any): any => {
      const modelType = element?.modelType?.name ?? element?.modelType;
      const mapped: any = {
        idShort: element?.idShort,
        modelType,
      };

      const semanticId = createReference(element?.semanticId);
      if (semanticId != null) {
        mapped.semanticId = semanticId;
      }

      if (element?.valueType != null) {
        mapped.valueType = element.valueType;
      }
      if (element?.contentType != null) {
        mapped.contentType = element.contentType;
      }
      if (element?.typeValueListElement != null) {
        mapped.typeValueListElement = element.typeValueListElement;
      }
      if (element?.valueTypeListElement != null) {
        mapped.valueTypeListElement = element.valueTypeListElement;
      }
      if (element?.orderRelevant != null) {
        mapped.orderRelevant = element.orderRelevant;
      }

      if (modelType === 'Property' || modelType === 'Range') {
        mapped.value = element?.value ?? '';
      } else if (modelType === 'MultiLanguageProperty') {
        mapped.value = Array.isArray(element?.value) ? element.value : [];
      } else if (modelType === 'File' || modelType === 'Blob') {
        mapped.value = element?.value;
      } else if (modelType === 'SubmodelElementCollection' || modelType === 'SubmodelElementList') {
        mapped.value = Array.isArray(element?.value) ? element.value.map((child: any) => mapElement(child)) : [];
      }

      return mapped;
    };

    return {
      id: input?.id,
      idShort: input?.idShort,
      kind: input?.kind ?? 'Instance',
      modelType: 'Submodel',
      administration: input?.administration,
      semanticId: createReference(input?.semanticId),
      submodelElements: Array.isArray(input?.submodelElements)
        ? input.submodelElements.map((element: any) => mapElement(element))
        : [],
    };
  }

  private distinctById<T extends { id: string }>(items: T[]) {
    const distinct = new Map<string, T>();
    items.forEach((item) => {
      if (!distinct.has(item.id)) {
        distinct.set(item.id, item);
      }
    });
    return [...distinct.values()];
  }

  private containsIgnoreCase(value: unknown, needle: string): boolean {
    if (value == null) {
      return false;
    }

    if (Array.isArray(value)) {
      return value.some((entry) => this.containsIgnoreCase(entry, needle));
    }

    return `${value}`.toLowerCase().includes(needle.toLowerCase());
  }
}
