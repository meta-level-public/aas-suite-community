import { DataSpecificationIec61360 } from '@aas-core-works/aas-core3.1-typescript/types';
import { HelpLabelComponent, UiLabelResolver } from '@aas/common-components';
import { CURRENT_LANGUAGE_KEY, DEFAULT_LANGUAGE } from '@aas/common-services';
import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, input, signal, viewChild } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { Popover, PopoverModule } from 'primeng/popover';
import { TableModule } from 'primeng/table';
import { ConceptDescriptionService } from '../concept-description.service';
import { ViewerStoreService } from '../viewer-store.service';
import { LocalizedTextComponent } from './localized-text.component';

// Only one semantic description is shown at a time
let openPopover: Popover | null = null;

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
  popover = viewChild<Popover>('op');

  constructor() {
    // The popover is appended to the body. If this component is destroyed while it is open
    // (e.g. when switching the submodel), PrimeNG leaves the container behind, so remove it here.
    inject(DestroyRef).onDestroy(() => {
      if (openPopover === this.popover()) openPopover = null;
      this.popover()?.container?.remove();
    });
  }

  async toggleOverlay(op: Popover, event: MouseEvent) {
    // Keep the click from reaching surrounding elements, e.g. an accordion header that would toggle.
    // As the popover's outside click detection is skipped by this, close another open description here.
    event.stopPropagation();
    if (openPopover != null && openPopover !== op && openPopover.overlayVisible) openPopover.hide();
    openPopover = op;

    this.toLoad.set(true);
    op.toggle(event);

    // The position is calculated on opening, before the concept description is loaded.
    // Realign once the content has been rendered so the popover stays inside the viewport.
    await this.conceptDescription();
    setTimeout(() => {
      if (op.overlayVisible) op.align();
    });
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
