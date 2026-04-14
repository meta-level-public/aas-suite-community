import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';

import { ObserveVisibilityDirective } from './observe-visibility.directive';
import { ShellListDtoThumbData } from './shell-list-dto-thumb-data';

@Component({
  selector: 'aas-shell-thumbnail-cell',
  imports: [CommonModule, TranslateModule, SkeletonModule, TooltipModule, ObserveVisibilityDirective],
  styles: [
    `
      :host {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 50px;
        min-width: 50px;
        height: 48px;
        vertical-align: middle;
      }

      .thumb-cell {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 50px;
        height: 48px;
        overflow: hidden;
      }

      img.shell-thumb {
        box-shadow: 2px 2px 5px color-mix(in srgb, var(--p-surface-900) 30%, transparent);
        border-radius: var(--aas-radius-xs);
        max-width: 50px;
        max-height: 48px;
        width: auto;
        height: auto;
        object-fit: contain;
        display: block;
      }

      .shell-thumb-placeholder {
        width: 50px;
        height: 48px;
        border-radius: var(--aas-radius-xs);
        border: 1px solid var(--p-content-border-color);
        color: var(--p-text-muted-color);
        display: flex;
        align-items: center;
        justify-content: center;
      }
    `,
  ],
  template: `
    <div class="thumb-cell" aasObserveVisibility (visible)="thumbnailVisible.emit(shellId())">
      @if (thumb()?.thumbLoaded && !thumb()?.thumbError) {
        <img
          [src]="thumb()?.fileUrl"
          class="shell-thumb"
          [alt]="alt()"
          loading="lazy"
          decoding="async"
          (error)="thumbnailError.emit(shellId())"
        />
      } @else if (thumb()?.thumbLoading) {
        <p-skeleton width="50px" height="48px"></p-skeleton>
      } @else {
        <div class="shell-thumb-placeholder" [pTooltip]="'NO_DATA_FOUND' | translate" tooltipPosition="top">
          <i class="pi pi-image"></i>
        </div>
      }
    </div>
  `,
})
export class ShellThumbnailCellComponent {
  thumb = input<ShellListDtoThumbData | undefined>(undefined);
  shellId = input.required<string>();
  alt = input.required<string>();

  thumbnailVisible = output<string>();
  thumbnailError = output<string>();
}
