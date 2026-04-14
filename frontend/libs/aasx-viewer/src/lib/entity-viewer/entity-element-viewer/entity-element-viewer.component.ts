import { Component, Input } from '@angular/core';

import { TableModule } from 'primeng/table';
import { PrimeTemplate } from 'primeng/api';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'aas-entity-element',
  templateUrl: './entity-element-viewer.component.html',
  imports: [TableModule, PrimeTemplate, TranslateModule],
})
export class EntityElementViewerComponent {
  @Input() entity: any;
  @Input() aasId: number | undefined;
  @Input() idShort: any;
}
