import * as aas from '@aas-core-works/aas-core3.1-typescript';

import { Component, inject, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { HelpLabelComponent } from '@aas/common-components';
import { InstanceHelper } from '@aas/helpers';
import { ShellResult } from '@aas/model';
import { Button } from 'primeng/button';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputText } from 'primeng/inputtext';
import { NullIfEmptyDirective } from '../../../general/directives/null-if-empty.directive';
import { Info } from '../../../general/model/info-item';
import { V3TreeItem } from '../../model/v3-tree-item';
import { V3TreeService } from '../../v3-tree/v3-tree.service';
import { V3ComponentBase } from '../v3-component-base';
@Component({
  selector: 'aas-v3-id-short',
  templateUrl: './v3-id-short.component.html',
  imports: [
    HelpLabelComponent,
    InputGroup,
    FormsModule,
    InputText,
    NullIfEmptyDirective,
    InputGroupAddon,
    Button,
    TranslateModule,
  ],
})
export class V3IdShortComponent extends V3ComponentBase {
  treeService = inject(V3TreeService);
  @Input({ required: true }) element: V3TreeItem<any> | undefined;
  @Input({ required: true }) shellResult: ShellResult | undefined | null;

  info = Info;

  get isRequired() {
    let required = false;
    switch (InstanceHelper.getInstanceName(this.element?.content)) {
      case 'ConceptDescription':
      case 'SubmodelElementCollection':
      case 'Submodel':
      case 'AssetAdministrationShell':
        required = true;
        break;
    }
    return required;
  }

  getError(entry: any) {
    const errors = [];
    for (const error of aas.verification.verify(entry)) {
      errors.push(error);
    }
    return errors.filter((e) => (e.path.segments[0] as any)?.name === 'idShort');
  }
  hasErrors(entry: any) {
    const errors = [];
    for (const error of aas.verification.verify(entry)) {
      errors.push(error);
    }
    return errors.filter((e) => (e.path.segments[0] as any)?.name === 'idShort')?.length > 0;
  }

  onIdShortChange() {
    const nodeId = this.element?.id;
    if (nodeId) {
      this.treeService.updateLabel(nodeId);
    }
  }
}
