import { Component, inject, Input, OnChanges, OnDestroy, signal } from '@angular/core';

import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { ConceptDescription, ISubmodelElement } from '@aas-core-works/aas-core3.1-typescript/types';
import { HelpLabelComponent } from '@aas/common-components';
import { formatDateLike, SubmodelElementUtil } from '@aas/helpers';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputText } from 'primeng/inputtext';
import { Subscription } from 'rxjs';
import { ConceptDescriptionService } from '../concept-description.service';
import { SemanticDescriptionPopupComponent } from '../semantic-description-popup/semantic-description-popup.component';
import { ViewerStoreService } from '../viewer-store.service';

@Component({
  selector: 'aas-range-viewer',
  templateUrl: './range-viewer.component.html',
  styleUrls: ['./range-viewer.component.css'],
  imports: [
    InputGroup,
    InputGroupAddon,
    InputText,
    SemanticDescriptionPopupComponent,
    TranslateModule,
    HelpLabelComponent,
  ],
})
export class RangeViewerComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) range: aas.types.Range | null | undefined;
  @Input() compact: boolean = false;
  viewerStore = inject(ViewerStoreService);

  conceptDescription: ConceptDescription | undefined | null = null;

  cdService = inject(ConceptDescriptionService);

  translate = inject(TranslateService);
  subscriptions: Subscription[] = [];

  currentLang = 'de';
  semanticId = signal<string>('');

  constructor() {
    this.subscriptions.push(
      this.translate.onLangChange.subscribe((event) => {
        this.currentLang = event.lang;
      }),
    );
    this.currentLang = this.translate.currentLang;
  }

  async ngOnChanges() {
    // load CD
    if (this.range?.semanticId?.keys[0]?.value) {
      this.semanticId.set(this.range.semanticId.keys[0].value);
      this.conceptDescription = await this.cdService.loadCD(
        this.range.semanticId.keys[0].value,
        this.viewerStore.cdUrl(),
        this.viewerStore.apiKey() ?? '',
      );
    } else {
      this.semanticId.set('');
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  getLabel(element: ISubmodelElement) {
    return SubmodelElementUtil.getLabel(element, this.currentLang);
  }

  get formattedMaxValue() {
    if (this.range == null) return '';
    return this.formatRangeBoundary(this.range.max, this.range.valueType);
  }

  get formattedMinValue() {
    if (this.range == null) return '';
    return this.formatRangeBoundary(this.range.min, this.range.valueType);
  }

  private formatRangeBoundary(
    value: string | null | undefined,
    valueType: aas.types.DataTypeDefXsd | undefined,
  ): string {
    if (value == null || value === '') return '';
    if (valueType == null) return value;

    try {
      if (valueType === aas.types.DataTypeDefXsd.Date) {
        return formatDateLike(value, this.currentLang, 'L') ?? value;
      }

      if (valueType === aas.types.DataTypeDefXsd.DateTime) {
        return formatDateLike(value, this.currentLang, 'L LTS') ?? value;
      }

      if (valueType === aas.types.DataTypeDefXsd.Time) {
        return formatDateLike(value, this.currentLang, 'LTS') ?? value;
      }
    } catch {
      return value;
    }

    return value;
  }

  get datatypeString() {
    if (this.range?.valueType) return aas.types.DataTypeDefXsd[this.range.valueType];
    else return null;
  }

  get unit() {
    const foundEds = this.range?.embeddedDataSpecifications?.find(
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
    const foundEds = this.range?.embeddedDataSpecifications?.find(
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
}
