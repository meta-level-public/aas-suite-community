import { DataSpecificationIec61360 } from '@aas-core-works/aas-core3.1-typescript/types';
import { HelpLabelComponent, UiLabelResolver } from '@aas/common-components';
import { CURRENT_LANGUAGE_KEY, DEFAULT_LANGUAGE } from '@aas/common-services';
import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
  viewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from '@openng/optimus-ui/button';
import { MessageModule } from '@openng/optimus-ui/message';
import { Popover, PopoverModule } from '@openng/optimus-ui/popover';
import { TableModule } from '@openng/optimus-ui/table';
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
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './semantic-description-popup.component.html',
})
export class SemanticDescriptionPopupComponent {
  semanticId = input.required<string>();
  /** Small, muted icon next to a label in the formatted viewers instead of the regular button. */
  compact = input(false);

  cdService = inject(ConceptDescriptionService);
  translate = inject(TranslateService);

  toLoad = signal(false);
  viewerStore = inject(ViewerStoreService);
  popover = viewChild<Popover>('op');

  // The popover is appended to the body. If this component is destroyed before change detection
  // has removed it there (e.g. when switching the submodel while it is open, or right after it has
  // been closed), PrimeNG leaves the element behind and makes it visible again. Remember it to remove it.
  // onShow is emitted last when opening, so fall back to the current container if opening was interrupted.
  private overlayElement: HTMLElement | null = null;

  /** Compact mode only shows the "?" if a concept description exists (it is cached, so opening is instant). */
  available = signal(false);
  private availabilityRun = 0;

  constructor() {
    effect(() => {
      const id = this.semanticId();
      const cdUrl = this.viewerStore.cdUrl();
      if (!this.compact()) return;
      const run = ++this.availabilityRun;
      this.available.set(false);
      if (id == null || id === '' || cdUrl === '') return;
      void this.cdService.loadCD(id, cdUrl, this.viewerStore.apiKey() ?? '').then((cd) => {
        if (run === this.availabilityRun) this.available.set(cd != null);
      });
    });

    inject(DestroyRef).onDestroy(() => {
      const popover = this.popover();
      if (openPopover === popover) openPopover = null;
      (this.overlayElement ?? popover?.container)?.remove();
    });
  }

  rememberOverlayElement(op: Popover) {
    this.overlayElement = op.container ?? null;
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
