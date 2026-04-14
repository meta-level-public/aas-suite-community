import * as aas from '@aas-core-works/aas-core3.1-typescript';
import {
  ConceptDescription,
  ISubmodelElement,
  SubmodelElementCollection,
  SubmodelElementList,
} from '@aas-core-works/aas-core3.1-typescript/types';
import { SubmodelElementUtil } from '@aas/helpers';
import { Component, effect, inject, Input, OnChanges, OnDestroy, signal } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from 'primeng/accordion';
import { SortEvent } from 'primeng/api';
import { Subscription } from 'rxjs';
import { ConceptDescriptionService } from '../concept-description.service';
import { SemanticDescriptionPopupComponent } from '../semantic-description-popup/semantic-description-popup.component';
import { SubmodelElementsListComponent } from '../submodel-elements-list/submodel-elements-list.component';
import { ViewerStoreService } from '../viewer-store.service';

@Component({
  selector: 'aas-smc-viewer-v3',
  templateUrl: './smc-viewer.component.html',
  styleUrls: ['./smc-viewer.component.css'],
  imports: [
    Accordion,
    AccordionPanel,
    AccordionHeader,
    AccordionContent,
    SubmodelElementsListComponent,
    TranslateModule,
    SemanticDescriptionPopupComponent,
  ],
})
export class SmcViewerComponent implements OnDestroy, OnChanges {
  @Input() smc: SubmodelElementCollection | SubmodelElementList | undefined | null = undefined;
  @Input({ required: true }) idShortPath: string = '';
  @Input({ required: true }) submodelId: string = '';
  @Input() idShort: any;
  @Input() compact: boolean = false;
  @Input() withIdShort: boolean = true;
  @Input() fallbackLabel: string = '';

  viewerStore = inject(ViewerStoreService);
  conceptDescription: ConceptDescription | undefined | null = null;
  cdService = inject(ConceptDescriptionService);
  semanticId = signal<string>('');

  translate = inject(TranslateService);
  subscriptions: Subscription[] = [];

  currentLang = 'de';

  // expanded latch: once true due to a matching highlight path, stays open until user collapses manually
  expanded = signal<boolean>(false);

  toggleExpand() {
    this.expanded.set(!this.expanded());
  }

  isExpanded() {
    return this.expanded();
  }

  constructor() {
    this.subscriptions.push(
      this.translate.onLangChange.subscribe((event) => {
        this.currentLang = event.lang;
      }),
    );
    this.currentLang = this.translate.currentLang;

    // Auto-expand if the global highlighted path targets a descendant of this SMC
    effect(() => {
      const target = this.viewerStore.highlightedIdShortPath();
      const myPath = this.idShortPath;
      if (!target) return;
      if (!myPath) return;
      if (target === myPath || target.startsWith(myPath + '.') || target.startsWith(myPath + '[')) {
        this.expanded.set(true);
      }
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }
  async ngOnChanges() {
    // load CD
    if (this.smc?.semanticId?.keys[0]?.value) {
      this.semanticId.set(this.smc.semanticId.keys[0].value);
      this.conceptDescription = await this.cdService.loadCD(
        this.smc.semanticId.keys[0].value,
        this.viewerStore.cdUrl(),
        this.viewerStore.apiKey() ?? '',
      );
    } else {
      this.semanticId.set('');
    }
  }

  getLabel(element: ISubmodelElement) {
    const label = SubmodelElementUtil.getLabel(element, this.currentLang);
    if (label === '' || label == null) {
      return this.fallbackLabel;
    }
    return label;
  }

  customSort(event: SortEvent) {
    if (event.data != null)
      event.data.sort((data1: any, data2: any) => {
        if (event.field != null) {
          const value1 = data1[event.field];
          const value2 = data2[event.field];

          return (event.order ?? 1) * value1.localeCompare(value2, undefined, { numeric: true, sensitivity: 'base' });
        }
        return 0;
      });
  }

  isArray(el: any) {
    return el?.value instanceof Array;
  }

  isProperty(el: any) {
    return el instanceof aas.types.Property || el instanceof aas.types.MultiLanguageProperty;
  }
}
