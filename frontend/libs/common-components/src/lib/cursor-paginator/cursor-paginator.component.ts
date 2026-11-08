import { Component, input, model, output, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Button } from '@openng/optimus-ui/button';
import { Select } from '@openng/optimus-ui/select';
import { Tooltip } from '@openng/optimus-ui/tooltip';

/**
 * Paginator for cursor based lists (AAS repository API): the API only allows going to the first and to the
 * next page, so there are no page numbers or totals as in the standard table paginator.
 */
@Component({
  selector: 'aas-cursor-paginator',
  imports: [FormsModule, TranslateModule, Button, Select, Tooltip],
  templateUrl: './cursor-paginator.component.html',
  styleUrl: './cursor-paginator.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CursorPaginatorComponent {
  isFirstPage = input.required<boolean>();
  hasNextPage = input.required<boolean>();
  pageOptions = input.required<number[]>();
  pageSize = model.required<number>();

  firstRequested = output<void>();
  nextRequested = output<void>();
  pageSizeChanged = output<number>();

  onPageSizeChange(size: number) {
    this.pageSize.set(size);
    this.pageSizeChanged.emit(size);
  }
}
