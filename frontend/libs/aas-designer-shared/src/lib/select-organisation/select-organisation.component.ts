import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ListboxChangeEvent, ListboxModule } from 'primeng/listbox';
import { OrgaSettings } from '@aas-designer-model';

@Component({
  selector: 'aas-select-organisation',
  imports: [ListboxModule, FormsModule, ButtonModule, TranslateModule],
  templateUrl: './select-organisation.component.html',
})
export class SelectOrganisationComponent {
  orgaSettings: OrgaSettings[] = [];
  selectedOrga: OrgaSettings | undefined;

  constructor(
    private ref: DynamicDialogRef,
    config: DynamicDialogConfig,
  ) {
    this.orgaSettings = config.data.orgaSettings;
  }

  selectOrga(event: ListboxChangeEvent) {
    this.ref.close(event.value);
  }
}
