import { Clipboard } from '@angular/cdk/clipboard';

import { Component, inject, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NotificationService } from '@aas/common-services';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { QudtDatatypeDataService } from './qudt-datatype-lookup-data.service';

@Component({
  selector: 'aas-qudt-datatype-lookup',

  imports: [FormsModule, TranslateModule, TableModule, ButtonModule, MultiSelectModule],
  templateUrl: './qudt-datatype-lookup.component.html',
})
export class QudtDatatypeLookupComponent {
  qudtService = inject(QudtDatatypeDataService);

  clipboard = inject(Clipboard);
  notificationService = inject(NotificationService);

  selectedColumns = model<string[]>(['label', 'iec61360Code', 'symbol']);

  selectedItem = output<any>();

  copyToClipboard(text: string) {
    this.clipboard.copy(text);
    this.notificationService.showMessageAlways('COPIED', 'SUCCESS', 'success', false);
  }

  selectItem(event: any) {
    this.selectedItem.emit(event);
  }
}
