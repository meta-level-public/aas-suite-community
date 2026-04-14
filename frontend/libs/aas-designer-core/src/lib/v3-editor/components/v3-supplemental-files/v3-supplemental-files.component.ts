import { Component, Input } from '@angular/core';
import { V3TreeItem } from '../../model/v3-tree-item';
import { TableModule } from 'primeng/table';
import { PrimeTemplate } from 'primeng/api';

import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'aas-v3-supplemental-files',
  templateUrl: './v3-supplemental-files.component.html',
  imports: [TableModule, PrimeTemplate, TranslateModule],
})
export class V3FilesComponent {
  @Input({ required: true }) files: V3TreeItem<any> | undefined;
}
