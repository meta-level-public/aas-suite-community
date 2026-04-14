import * as aas from '@aas-core-works/aas-core3.1-typescript';

import { HelpLabelComponent } from '@aas/common-components';
import { IdGenerationUtil } from '@aas/helpers';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { v4 as uuid } from 'uuid';
import { NullIfEmptyDirective } from '../../../general/directives/null-if-empty.directive';
import { Info } from '../../../general/model/info-item';
import { PortalService } from '@aas/common-services';
import { V3TreeService } from '../../v3-tree/v3-tree.service';
type SpecificAssetId = aas.types.SpecificAssetId;

@Component({
  selector: 'aas-v3-specific-asset-ids',
  templateUrl: './v3-specific-asset-ids.component.html',
  imports: [Button, Message, Button, HelpLabelComponent, FormsModule, InputText, NullIfEmptyDirective, TranslateModule],
})
export class V3SpecificAssetIdsComponent {
  @Input({ required: true }) specificAssetIds: SpecificAssetId[] | undefined | null;
  @Input({ required: true }) parent: any;
  info = Info;

  constructor(
    private portalService: PortalService,
    private treeService: V3TreeService,
  ) {}

  removeSpecificAssetIdBlock() {
    if (this.specificAssetIds != null && this.parent != null) {
      this.parent.specificAssetIds = null;
      this.specificAssetIds = null;
    }
  }

  addSpecificAssetId() {
    if (this.specificAssetIds == null && this.parent != null) {
      this.parent.specificAssetIds = [];
      this.specificAssetIds = this.parent.specificAssetIds;
    }
    this.specificAssetIds?.push(
      new aas.types.SpecificAssetId(
        '',
        '',
        new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
          new aas.types.Key(aas.types.KeyTypes.GlobalReference, 'xyz'),
        ]),
      ),
    );
    this.treeService.registerFieldUndoStep();
  }

  removeSpecificAssetId(index: number) {
    if (this.specificAssetIds != null) {
      this.specificAssetIds.splice(index, 1);
      this.treeService.registerFieldUndoStep();
    }
    if (this.specificAssetIds?.length === 0) {
      this.removeSpecificAssetIdBlock();
    }
  }

  generateIri(specificAssetId: SpecificAssetId) {
    specificAssetId.value = IdGenerationUtil.generateIri('specificAssetId', this.portalService.iriPrefix);
    this.treeService.registerFieldUndoStep();
  }

  generateGuid(specificAssetId: SpecificAssetId) {
    specificAssetId.value = uuid();
    this.treeService.registerFieldUndoStep();
  }

  getNameError(entry: any) {
    const errors = [];
    for (const error of aas.verification.verify(entry)) {
      errors.push(error);
    }
    return errors.filter((e) => (e.path.segments[0] as any)?.name === 'name');
  }

  hasNameErrors(entry: any) {
    const errors = [];
    for (const error of aas.verification.verify(entry)) {
      errors.push(error);
    }
    return errors.filter((e) => (e.path.segments[0] as any)?.name === 'name').length > 0;
  }

  getValueError(entry: any) {
    const errors = [];
    for (const error of aas.verification.verify(entry)) {
      errors.push(error);
    }
    return errors.filter((e) => (e.path.segments[0] as any)?.name === 'value');
  }

  hasValueErrors(entry: any) {
    const errors = [];
    for (const error of aas.verification.verify(entry)) {
      errors.push(error);
    }
    return errors.filter((e) => (e.path.segments[0] as any)?.name === 'value').length > 0;
  }
}
