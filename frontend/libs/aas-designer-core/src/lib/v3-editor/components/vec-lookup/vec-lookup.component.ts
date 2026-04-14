import { Clipboard } from '@angular/cdk/clipboard';

import { Component, inject, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NotificationService } from '@aas/common-services';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { VecDataService } from './vec-data.service';

@Component({
  selector: 'aas-vec-lookup',

  imports: [FormsModule, TranslateModule, TableModule, ButtonModule, MultiSelectModule],
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
