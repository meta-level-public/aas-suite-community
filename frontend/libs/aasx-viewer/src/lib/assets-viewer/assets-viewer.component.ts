import { Component, Input } from '@angular/core';
import { TableModule } from 'primeng/table';
import { PrimeTemplate } from 'primeng/api';

import { TranslateModule } from '@ngx-translate/core';
import { ObjectValuePipe } from '../util/object-value.pipe';

@Component({
  selector: 'aas-assets-viewer',
  templateUrl: './assets-viewer.component.html',
  imports: [TableModule, PrimeTemplate, TranslateModule, ObjectValuePipe],
})
export class AssetsViewerComponent {
  @Input() entity: any;
  @Input() aasId: number | undefined;
  @Input() idShort: any;
}
