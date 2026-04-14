import * as aas from '@aas-core-works/aas-core3.1-typescript';

import { HelpLabelComponent } from '@aas/common-components';
import { InstanceHelper } from '@aas/helpers';
import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputText } from 'primeng/inputtext';
import { Panel } from 'primeng/panel';
import { RelationshipViewerComponent } from '../relationship-viewer/relationship-viewer.component';
type ISubmodelElement = aas.types.ISubmodelElement;

@Component({
  selector: 'aas-entity-viewer',
  templateUrl: './entity-viewer.component.html',
  imports: [
    InputGroup,
    InputGroupAddon,
    InputText,
    Panel,
    RelationshipViewerComponent,
    TranslateModule,
    HelpLabelComponent,
  ],
})
export class EntityViewerComponent {
  @Input() entity: aas.types.Entity | null | undefined;
  @Input() aasId: number | undefined;

  @Input() idShort: any;

  getModelType(item: any) {
    return InstanceHelper.getInstanceName(item);
  }

  get entityTypeString() {
    if (this.entity?.entityType != null) {
      return String(this.entity.entityType);
    }
    return '';
  }

  getItemAsEntity(item: ISubmodelElement) {
    return item as aas.types.Entity;
  }
}
