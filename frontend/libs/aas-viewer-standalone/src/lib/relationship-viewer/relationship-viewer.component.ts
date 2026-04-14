import { ConceptDescription, ISubmodelElement } from '@aas-core-works/aas-core3.1-typescript/types';
import { SubmodelElementUtil } from '@aas/helpers';
import { Component, inject, Input, OnChanges, OnDestroy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from 'primeng/accordion';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputText } from 'primeng/inputtext';
import { Ripple } from 'primeng/ripple';
import { Subscription } from 'rxjs';
import { ConceptDescriptionService } from '../concept-description.service';
import { SemanticDescriptionPopupComponent } from '../semantic-description-popup/semantic-description-popup.component';
import { ViewerStoreService } from '../viewer-store.service';
import { RelationshipElementViewerComponent } from './relationship-element/relationship-element-viewer.component';

@Component({
  selector: 'aas-relationship-viewer-v3',
  templateUrl: './relationship-viewer.component.html',
  imports: [
    InputGroup,
    InputGroupAddon,
    FormsModule,
    InputText,
    SemanticDescriptionPopupComponent,
    Accordion,
    AccordionPanel,
    Ripple,
    AccordionHeader,
    AccordionContent,
    RelationshipElementViewerComponent,
    TranslateModule,
  ],
})
export class RelationshipViewerComponent implements OnChanges, OnDestroy {
  @Input() entity: any;
  @Input() aasId: number | undefined;
  @Input() idShort: any;
  viewerStore = inject(ViewerStoreService);

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

  async ngOnChanges() {
    // load CD
    if (this.entity?.semanticId?.keys[0]?.value) {
      this.semanticId.set(this.entity.semanticId.keys[0].value);
      this.conceptDescription = await this.cdService.loadCD(
        this.entity.semanticId.keys[0].value,
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
  getLabel(_element: ISubmodelElement) {
    return SubmodelElementUtil.getLabel(this.entity, this.currentLang);
  }
}
