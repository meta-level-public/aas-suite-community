import { Component, inject, Input, OnChanges, OnDestroy, signal, ChangeDetectionStrategy } from '@angular/core';

import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { ConceptDescription, ISubmodelElement } from '@aas-core-works/aas-core3.1-typescript/types';
import { formatDateLike, highlightMatches, SubmodelElementUtil } from '@aas/helpers';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { InputGroup } from '@openng/optimus-ui/inputgroup';
import { InputGroupAddon } from '@openng/optimus-ui/inputgroupaddon';
import { InputText } from '@openng/optimus-ui/inputtext';
import { Tooltip } from '@openng/optimus-ui/tooltip';
import { Subscription } from 'rxjs';
import { ConceptDescriptionService } from '../concept-description.service';
import { ViewerStoreService } from '../viewer-store.service';

import { SemanticDescriptionPopupComponent } from '../semantic-description-popup/semantic-description-popup.component';

@Component({
  selector: 'aas-property-viewer',
  templateUrl: './property-viewer.component.html',
  styleUrls: ['./property-viewer.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [InputGroup, InputGroupAddon, InputText, SemanticDescriptionPopupComponent, TranslateModule, Tooltip],
})
export class PropertyViewerComponent implements OnChanges, OnDestroy {
  viewerStore = inject(ViewerStoreService);
  @Input({ required: true }) property: aas.types.Property | null | undefined;
  @Input() compact: boolean = false;

  conceptDescription: ConceptDescription | undefined | null = null;
  cdService = inject(ConceptDescriptionService);
  semanticId = signal<string>('');

  translate = inject(TranslateService);
  subscriptions: Subscription[] = [];

  currentLang = 'de';

  constructor() {
    this.subscriptions.push(
      this.translate.onLangChange.subscribe((event) => {
        this.currentLang = event.lang;
      }),
    );
    this.currentLang = this.translate.currentLang;
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }
  async ngOnChanges() {
    // load CD
    if (this.property?.semanticId?.keys[0]?.value) {
      this.semanticId.set(this.property.semanticId.keys[0].value);
      this.conceptDescription = await this.cdService.loadCD(
        this.property.semanticId.keys[0].value,
        this.viewerStore.cdUrl(),
        this.viewerStore.apiKey() ?? '',
      );
    } else {
      this.semanticId.set('');
    }
  }

  get formattedValue() {
    if (this.property != null) {
      if (
        this.property.valueType === aas.types.DataTypeDefXsd.Date ||
        this.property.valueType === aas.types.DataTypeDefXsd.DateTime ||
        this.property.valueType === aas.types.DataTypeDefXsd.Time
      ) {
        try {
          return formatDateLike(this.property.value, this.currentLang, 'L LTS') ?? this.property.value;
        } catch {
          // ignore format problem, just return raw
          return this.property.value;
        }
      }

      return this.property.value;
    }
    return '';
  }

  // Highlight matched query if this element is currently targeted
  get highlightedValueHtml(): string | null {
    const q = this.viewerStore.highlightedTextQuery()?.trim();
    if (!q) return null;
    // best-effort: only highlight when this element is the current highlight target prefix matches
    // The GenericViewer handles the block-level highlight via CSS; here we add inline highlight for value text.
    const raw = String(this.formattedValue ?? '');
    if (!raw) return null;
    return highlightMatches(raw, q);
  }

  get datatypeString() {
    if (this.property?.valueType) return aas.types.DataTypeDefXsd[this.property.valueType];
    else return null;
  }

  get isBool() {
    return this.property?.valueType === aas.types.DataTypeDefXsd.Boolean;
  }

  get unit() {
    const foundEds = this.property?.embeddedDataSpecifications?.find(
      (eds) => (eds.dataSpecificationContent as any).unit != null,
    );
    if (foundEds) {
      return (foundEds?.dataSpecificationContent as any)?.unit ?? '';
    }

    if (this.conceptDescription == null) return '';

    const foundContent = this.conceptDescription?.embeddedDataSpecifications?.[0]?.dataSpecificationContent;
    if (foundContent != null && foundContent instanceof aas.types.DataSpecificationIec61360) {
      return foundContent.unit ?? '';
    }

    return '';
  }

  get symbol() {
    const foundEds = this.property?.embeddedDataSpecifications?.find(
      (eds) => (eds.dataSpecificationContent as any).unit != null,
    );
    if (foundEds) {
      return (foundEds?.dataSpecificationContent as any)?.symbol ?? '';
    }

    if (this.conceptDescription == null) return '';

    const foundContent = this.conceptDescription?.embeddedDataSpecifications?.[0]?.dataSpecificationContent;
    if (foundContent != null && foundContent instanceof aas.types.DataSpecificationIec61360) {
      return foundContent.symbol ?? '';
    }

    return '';
  }

  getLabel(element: ISubmodelElement) {
    return SubmodelElementUtil.getLabel(element, this.currentLang);
  }

  getTooltipLabel(element: ISubmodelElement): string {
    return SubmodelElementUtil.getLabel(element, this.currentLang) ?? '';
  }
}
