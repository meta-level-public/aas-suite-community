import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from '@openng/optimus-ui/button';
import { DynamicDialogConfig, DynamicDialogRef } from '@openng/optimus-ui/dynamicdialog';
import { ListboxChangeEvent, ListboxModule } from '@openng/optimus-ui/listbox';
import { OrgaSettings } from '@aas-designer-model';

@Component({
  selector: 'aas-select-organisation',
  imports: [ListboxModule, FormsModule, ButtonModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.Eager,
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
