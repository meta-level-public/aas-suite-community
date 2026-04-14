import * as aas from '@aas-core-works/aas-core3.1-typescript';

import { Component, effect, inject, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { V3TreeItem } from '../../../model/v3-tree-item';
import { PcnReceivingComponent } from '../pcn-receiving/pcn-receiving.component';
import { PcnSendingComponent } from '../pcn-sending/pcn-sending.component';
import { PcnStateStoreService } from '../pcn-state-store.service';

@Component({
  selector: 'aas-pcn-handling',
  imports: [PcnReceivingComponent, PcnSendingComponent, TranslateModule],
  templateUrl: './pcn-handling.component.html',
})
export class PcnHandlingComponent {
  pcnSubmodel = input.required<V3TreeItem<aas.types.Submodel>>();

  pcnStateStore = inject(PcnStateStoreService);

  submodelEffect = effect(() => {
    this.pcnStateStore.pcnSubmodelTreeItem.set(this.pcnSubmodel());
  });
}
