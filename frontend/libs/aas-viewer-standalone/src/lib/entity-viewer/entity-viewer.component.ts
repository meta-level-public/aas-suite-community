import * as aas from '@aas-core-works/aas-core3.1-typescript';

import { HelpLabelComponent } from '@aas/common-components';
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { InputGroup } from '@openng/optimus-ui/inputgroup';
import { InputGroupAddon } from '@openng/optimus-ui/inputgroupaddon';
import { InputText } from '@openng/optimus-ui/inputtext';
import { Panel } from '@openng/optimus-ui/panel';
import { OpenShellButtonComponent } from '../open-shell-button/open-shell-button.component';
import { SubmodelElementsListComponent } from '../submodel-elements-list/submodel-elements-list.component';

@Component({
  selector: 'aas-entity-viewer',
  templateUrl: './entity-viewer.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    InputGroup,
    InputGroupAddon,
    InputText,
    Panel,
    SubmodelElementsListComponent,
    OpenShellButtonComponent,
    TranslateModule,
    HelpLabelComponent,
  ],
})
export class EntityViewerComponent {
  @Input() entity: aas.types.Entity | null | undefined;
  @Input() idShortPath: string = '';
  @Input() submodelId: string = '';

  get entityTypeString() {
    if (this.entity?.entityType != null) {
      return aas.stringification.entityTypeToString(this.entity.entityType) ?? String(this.entity.entityType);
    }
    return '';
  }

  get isSelfManaged() {
    return this.entity?.entityType === aas.types.EntityType.SelfManagedEntity;
  }
}
