import * as aas from '@aas-core-works/aas-core3.1-typescript';

import { DateProxyPipe } from '@aas/common-pipes';
import { Component, input, linkedSignal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { TableModule } from 'primeng/table';

import { ISubmodelElement } from '@aas-core-works/aas-core3.1-typescript/types';
import { ChangelogEntry } from './changelog-entry';

@Component({
  selector: 'aas-aas-designer-changelog',

  imports: [TranslateModule, TableModule, DateProxyPipe],
  templateUrl: './aas-designer-changelog.component.html',
})
export class AasDesignerChangelogComponent {
  changelogCollection = input.required<aas.types.SubmodelElementCollection>();

  changelogValues = linkedSignal<ChangelogEntry[]>(() => {
    return this.getChangelogValues();
  });

  getChangelogValues() {
    const changelogValues: ChangelogEntry[] = [];

    this.changelogCollection().value?.forEach((changeEntry: ISubmodelElement) => {
      const entry = {} as ChangelogEntry;
      if (changeEntry != null && changeEntry instanceof aas.types.SubmodelElementCollection) {
        changeEntry.value?.forEach((sme: any) => {
          if (sme.idShort === 'Date' && sme instanceof aas.types.Property && sme.value != null) {
            entry.date = new Date(sme.value);
          }
          if (sme.idShort === 'User' && sme instanceof aas.types.Property && sme.value != null) {
            entry.author = sme.value;
          }
          if (sme.idShort === 'Action' && sme instanceof aas.types.Property && sme.value != null) {
            entry.action = sme.value;
          }
          if (sme.idShort === 'Comment' && sme instanceof aas.types.Property && sme.value != null) {
            entry.comment = sme.value;
          }
        });
        changelogValues.push(entry);
      }
    });

    return changelogValues;
  }
}
