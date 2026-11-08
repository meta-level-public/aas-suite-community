import { Component, Input } from '@angular/core';

import { TableModule } from '@openng/optimus-ui/table';
import { PrimeTemplate } from '@openng/optimus-ui/api';
import { Panel } from '@openng/optimus-ui/panel';
import { RelationshipElementViewerComponent } from './relationship-element/relationship-element-viewer.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'aas-relationship-viewer',
  templateUrl: './relationship-viewer.component.html',
  imports: [TableModule, PrimeTemplate, Panel, RelationshipElementViewerComponent, TranslateModule],
})
export class RelationshipViewerComponent {
  @Input() entity: any;
  @Input() aasId: number | undefined;
  @Input() idShort: any;
}
