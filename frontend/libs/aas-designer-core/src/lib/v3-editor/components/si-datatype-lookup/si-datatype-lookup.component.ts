import { Clipboard } from '@angular/cdk/clipboard';

import { Component, inject, model, output, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NotificationService } from '@aas/common-services';
import { ButtonModule } from '@openng/optimus-ui/button';
import { MultiSelectModule } from '@openng/optimus-ui/multiselect';
import { TableModule } from '@openng/optimus-ui/table';
import { SiDatatypeDataService } from './si-datatype-lookup-data.service';

@Component({
  selector: 'aas-si-datatype-lookup',

  imports: [FormsModule, TranslateModule, TableModule, ButtonModule, MultiSelectModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './si-datatype-lookup.component.html',
})
export class SiDatatypeLookupComponent {
  qudtService = inject(SiDatatypeDataService);

  clipboard = inject(Clipboard);
  notificationService = inject(NotificationService);

  selectedColumns = model<string[]>(['shortGroupName', 'label', 'prefLabel', 'hasSymbol']);

  selectedItem = output<any>();

  copyToClipboard(text: string) {
    this.clipboard.copy(text);
    this.notificationService.showMessageAlways('COPIED', 'SUCCESS', 'success', false);
  }

  selectItem(event: any) {
    this.selectedItem.emit(event);
  }
}
