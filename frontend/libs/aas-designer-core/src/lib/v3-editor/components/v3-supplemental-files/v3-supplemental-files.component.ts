import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { V3TreeItem } from '../../model/v3-tree-item';
import { TableModule } from '@openng/optimus-ui/table';
import { PrimeTemplate } from '@openng/optimus-ui/api';

import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'aas-v3-supplemental-files',
  templateUrl: './v3-supplemental-files.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [TableModule, PrimeTemplate, TranslateModule],
})
export class V3FilesComponent {
  @Input({ required: true }) files: V3TreeItem<any> | undefined;
}
