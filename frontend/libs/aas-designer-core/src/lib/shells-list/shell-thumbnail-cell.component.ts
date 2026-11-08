import { CommonModule } from '@angular/common';
import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { SkeletonModule } from '@openng/optimus-ui/skeleton';
import { TooltipModule } from '@openng/optimus-ui/tooltip';

import { ObserveVisibilityDirective } from './observe-visibility.directive';
import { ShellListDtoThumbData } from './shell-list-dto-thumb-data';

@Component({
  selector: 'aas-shell-thumbnail-cell',
  imports: [CommonModule, TranslateModule, SkeletonModule, TooltipModule, ObserveVisibilityDirective],
  styleUrl: './shell-thumbnail-cell.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './shell-thumbnail-cell.component.html',
})
export class ShellThumbnailCellComponent {
  thumb = input<ShellListDtoThumbData | undefined>(undefined);
  shellId = input.required<string>();
  alt = input.required<string>();

  thumbnailVisible = output<string>();
  thumbnailError = output<string>();
}
