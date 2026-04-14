import { Component, Input } from '@angular/core';
import { EntityElementViewerComponent } from './entity-element-viewer/entity-element-viewer.component';

import { Panel } from 'primeng/panel';
import { RelationshipViewerComponent } from '../relationship-element/relationship-viewer.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'aas-entity-viewer',
  templateUrl: './entity-viewer.component.html',
  imports: [EntityElementViewerComponent, Panel, RelationshipViewerComponent, TranslateModule],
})
export class EntityViewerComponent {
  @Input() entity: any;
  @Input() aasId: number | undefined;

  @Input() idShort: any;
}
