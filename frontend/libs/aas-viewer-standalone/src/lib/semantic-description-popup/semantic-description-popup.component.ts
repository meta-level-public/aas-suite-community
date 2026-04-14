import { DataSpecificationIec61360 } from '@aas-core-works/aas-core3.1-typescript/types';
import { HelpLabelComponent, UiLabelResolver } from '@aas/common-components';
import { CURRENT_LANGUAGE_KEY, DEFAULT_LANGUAGE } from '@aas/common-services';
import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { Popover, PopoverModule } from 'primeng/popover';
import { TableModule } from 'primeng/table';
import { ConceptDescriptionService } from '../concept-description.service';
import { ViewerStoreService } from '../viewer-store.service';
import { LocalizedTextComponent } from './localized-text.component';

@Component({
  selector: 'aas-semantic-description-popup',
  imports: [
    CommonModule,
    TranslateModule,
    ButtonModule,
    HelpLabelComponent,
    TableModule,
    PopoverModule,
    LocalizedTextComponent,
    MessageModule,
  ],
  templateUrl: './semantic-description-popup.component.html',
})
export class SemanticDescriptionPopupComponent {
  semanticId = input.required<string>();

  cdService = inject(ConceptDescriptionService);
  translate = inject(TranslateService);

  toLoad = signal(false);
  viewerStore = inject(ViewerStoreService);

  toggleOverlay(op: Popover, event: any) {
    this.toLoad.set(true);
    op.toggle(event);
  }

  currentLanguage = computed(() => {
    return this.translate.currentLang || window.localStorage.getItem(CURRENT_LANGUAGE_KEY) || DEFAULT_LANGUAGE;
  });

  conceptDescription = computed(async () => {
    const id = this.semanticId();
    if (this.toLoad() === true) {
      if (id != null && id !== '') {
        return await this.cdService.loadCD(
          this.semanticId(),
          this.viewerStore.cdUrl(),
          this.viewerStore.apiKey() ?? '',
        );
      }
    }
    return null;
  });

  dataSpecificationContent = computed(async () => {
    return (await this.conceptDescription())?.embeddedDataSpecifications?.[0]
      ?.dataSpecificationContent as DataSpecificationIec61360;
  });

  datatypeLabel = computed(async () => {
    const spec = await this.dataSpecificationContent();
    return UiLabelResolver.getDatatypeLabel(spec);
  });
}
