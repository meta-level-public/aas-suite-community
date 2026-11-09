import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { inject, Injectable, signal } from '@angular/core';
import { ConceptDescriptionService } from './concept-description.service';
import { ViewerStoreService } from './viewer-store.service';

/** Semantic ID and unit stored at an element; what a viewer field needs for its unit and its "?". */
export interface ViewerField {
  semanticId: string;
  unit: string;
}

export const EMPTY_VIEWER_FIELD: ViewerField = { semanticId: '', unit: '' };

export function viewerFieldOf(element: aas.types.ISubmodelElement | null | undefined): ViewerField {
  return { semanticId: semanticIdOf(element), unit: inlineUnitOf(element) };
}

/** First key of the semantic ID; the concept description is looked up by it. */
export function semanticIdOf(element: aas.types.IHasSemantics | null | undefined): string {
  return element?.semanticId?.keys?.[0]?.value?.trim() ?? '';
}

/** Unit stored at the element itself (IEC 61360 embedded data specification). */
export function inlineUnitOf(element: aas.types.ISubmodelElement | null | undefined): string {
  for (const spec of element?.embeddedDataSpecifications ?? []) {
    const unit = unitOfContent(spec.dataSpecificationContent);
    if (unit !== '') return unit;
  }
  return '';
}

/** Unit of an IEC 61360 data specification; an empty unit falls back to the symbol. */
function unitOfContent(content: aas.types.IDataSpecificationContent | null | undefined): string {
  if (!(content instanceof aas.types.DataSpecificationIec61360)) return '';
  return content.unit?.trim() || content.symbol?.trim() || '';
}

/**
 * Units of submodel elements for the formatted viewers. The unit stored at the element wins; otherwise it comes from
 * the concept description of the semantic ID, which is loaded once and shows up as soon as it has arrived.
 */
@Injectable({ providedIn: 'root' })
export class ConceptUnitService {
  private readonly cdService = inject(ConceptDescriptionService);
  private readonly viewerStore = inject(ViewerStoreService);

  /** Units by CD repository and semantic ID. */
  private readonly units = signal(new Map<string, string>());
  private readonly requested = new Set<string>();

  /** Unit of an element, read reactively (templates and computeds update once the concept description is there). */
  unit(semanticId: string | null | undefined, inlineUnit = ''): string {
    if (inlineUnit !== '') return inlineUnit;
    const id = semanticId?.trim() ?? '';
    const cdUrl = this.viewerStore.cdUrl();
    if (id === '' || cdUrl === '') return '';

    const key = `${cdUrl}|${id}`;
    if (!this.requested.has(key)) {
      this.requested.add(key);
      // Loaded outside the current reactive read; writing the signal here directly is not allowed
      queueMicrotask(() => void this.load(key, id, cdUrl));
    }
    return this.units().get(key) ?? '';
  }

  /** Unit of a viewer field, with a domain default (e.g. '%') if neither element nor concept description has one. */
  fieldUnit(field: ViewerField | null | undefined, fallbackUnit = ''): string {
    return this.unit(field?.semanticId, field?.unit ?? '') || fallbackUnit;
  }

  /** Value with its unit, for texts that cannot hold a separate unit element (e.g. a formatted mass in a table). */
  withUnit(value: string, field: ViewerField | null | undefined, fallbackUnit = ''): string {
    const text = value.trim();
    const unit = this.fieldUnit(field, fallbackUnit);
    return text === '' || unit === '' ? text : `${text} ${unit}`;
  }

  private async load(key: string, semanticId: string, cdUrl: string) {
    const cd = await this.cdService.loadCD(semanticId, cdUrl, this.viewerStore.apiKey() ?? '');
    const unit = unitOfContent(cd?.embeddedDataSpecifications?.[0]?.dataSpecificationContent);
    if (unit !== '') {
      this.units.update((units) => new Map(units).set(key, unit));
    }
  }
}
