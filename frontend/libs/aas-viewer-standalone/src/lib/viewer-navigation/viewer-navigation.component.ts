import { afterRenderEffect, Component, ElementRef, inject, input, output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ProgressBar } from 'primeng/progressbar';
import { Tooltip } from 'primeng/tooltip';
import { ViewerStoreService } from '../viewer-store.service';

/**
 * Navigation between the AAS details and the submodels of the viewed AAS.
 * "list" is the vertical navigation of the side column, "chips" a horizontally scrollable bar for small screens.
 */
@Component({
  selector: 'aas-viewer-navigation',
  templateUrl: './viewer-navigation.component.html',
  styleUrls: ['./viewer-navigation.component.css'],
  host: { class: 'block min-w-0' },
  imports: [ProgressBar, Tooltip, TranslateModule],
})
export class ViewerNavigationComponent {
  layout = input<'list' | 'chips'>('list');
  metadataActive = input(false);
  activeSubmodelId = input<string | null>(null);

  metadataSelected = output<void>();
  submodelSelected = output<string>();

  viewerStore = inject(ViewerStoreService);
  private elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  // Keeps the active entry visible when the selection changes, e.g. on the initial selection
  private scrollActiveEntryIntoView = afterRenderEffect(() => {
    this.metadataActive();
    this.activeSubmodelId();
    this.viewerStore.submodelLoadStates();

    const host = this.elementRef.nativeElement;
    if (this.layout() === 'chips') {
      const active = host.querySelector<HTMLElement>('.viewer-chip.active');
      active?.scrollIntoView?.({ block: 'nearest', inline: 'center' });
      return;
    }
    // In the side column only the navigation scrolls, never the page around it
    const active = host.querySelector<HTMLElement>('.navigation-item.active');
    const scroller = active?.closest<HTMLElement>('.p-card-body');
    if (active == null || scroller == null) return;
    const activeRect = active.getBoundingClientRect();
    const scrollerRect = scroller.getBoundingClientRect();
    if (activeRect.top < scrollerRect.top) {
      scroller.scrollTop -= scrollerRect.top - activeRect.top;
    } else if (activeRect.bottom > scrollerRect.bottom) {
      scroller.scrollTop += activeRect.bottom - scrollerRect.bottom;
    }
  });
}
