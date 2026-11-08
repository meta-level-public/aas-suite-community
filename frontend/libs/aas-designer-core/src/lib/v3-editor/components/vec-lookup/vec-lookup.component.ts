import { Clipboard } from '@angular/cdk/clipboard';

import { Component, inject, model, output, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NotificationService } from '@aas/common-services';
import { ButtonModule } from '@openng/optimus-ui/button';
import { MultiSelectModule } from '@openng/optimus-ui/multiselect';
import { TableModule } from '@openng/optimus-ui/table';
import { VecDataService } from './vec-data.service';

@Component({
  selector: 'aas-vec-lookup',

  imports: [FormsModule, TranslateModule, TableModule, ButtonModule, MultiSelectModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './vec-lookup.component.html',
})
export class VecLookupComponent {
  vecService = inject(VecDataService);

  clipboard = inject(Clipboard);
  notificationService = inject(NotificationService);

  selectedColumns = model<string[]>(['comment', 'label', 'typeShort']);

  selectedItem = output<any>();

  copyToClipboard(text: string) {
    this.clipboard.copy(text);
    this.notificationService.showMessageAlways('COPIED', 'SUCCESS', 'success', false);
  }

  selectItem(event: any) {
    this.selectedItem.emit(event);
  }
}
