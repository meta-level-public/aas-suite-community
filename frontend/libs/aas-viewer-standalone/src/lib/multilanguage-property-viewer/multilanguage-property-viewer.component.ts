import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { ConceptDescription, ISubmodelElement } from '@aas-core-works/aas-core3.1-typescript/types';
import { SubmodelElementUtil } from '@aas/helpers';
import { Component, inject, Input, OnChanges, OnDestroy, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ConceptDescriptionService } from '../concept-description.service';
import { ViewerStoreService } from '../viewer-store.service';

import { SemanticDescriptionPopupComponent } from '../semantic-description-popup/semantic-description-popup.component';

@Component({
  selector: 'aas-multilanguage-property-viewer',
  templateUrl: './multilanguage-property-viewer.component.html',
  imports: [SemanticDescriptionPopupComponent],
})
export class MultilanguagePropertyViewerComponent implements OnChanges, OnDestroy {
  @Input() properties: aas.types.MultiLanguageProperty | null | undefined;
  @Input() values: aas.types.LangStringTextType[] = [];
  @Input() compact: boolean = false;
  viewerStore = inject(ViewerStoreService);
  sanitizer = inject(DomSanitizer);
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
    if (this.properties?.semanticId?.keys[0]?.value) {
      this.semanticId.set(this.properties.semanticId.keys[0].value);
      this.conceptDescription = await this.cdService.loadCD(
        this.properties.semanticId.keys[0].value,
        this.viewerStore.cdUrl(),
        this.viewerStore.apiKey() ?? '',
      );
    } else {
      this.semanticId.set('');
    }
  }

  getLabel(element: ISubmodelElement) {
    return SubmodelElementUtil.getLabel(element, this.currentLang);
  }
  get value() {
    if (this.properties != null) {
      return this.properties.value;
    }
    return this.values;
  }

  get unit() {
    const foundEds = this.properties?.embeddedDataSpecifications?.find(
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
    const foundEds = this.properties?.embeddedDataSpecifications?.find(
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

  get currentLangPropertyValue() {
    if (this.properties?.value != null) {
      const elInLang = this.properties.value.find((d) => d.language === this.currentLang);
      if (elInLang != null) {
        return elInLang;
      } else {
        const elInEn = this.properties.value.find((d) => d.language === 'en');
        if (elInEn != null) {
          return elInEn;
        } else {
          // das erstbeste liefern
          return this.properties.value[0];
        }
      }
    } else {
      return null;
    }
  }

  get highlightedValueHtml(): SafeHtml | null {
    const q = this.viewerStore.highlightedTextQuery()?.trim();
    if (!q) return null;
    const txt = this.currentLangPropertyValue?.text ?? '';
    if (!txt) return null;
    try {
      const escapedQ = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(escapedQ, 'gi');
      const html = txt.replace(re, (m) => `<mark>${m}</mark>`);
      return this.sanitizer.bypassSecurityTrustHtml(html);
    } catch {
      return null;
    }
  }
}
