import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { IdGenerationUtil } from '@aas/helpers';
import { Component, Input } from '@angular/core';
import { PortalService } from '@aas/common-services';
import { V3TreeService } from '../../v3-tree/v3-tree.service';

import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputText } from 'primeng/inputtext';
import { V3UndoDirective } from '../../../general/directives/v3-undo.directive';
@Component({
  selector: 'aas-v3-value-list',
  templateUrl: './v3-value-list.component.html',
  imports: [Button, InputGroup, FormsModule, InputText, V3UndoDirective, InputGroupAddon, Button, TranslateModule],
})
export class V3ValueListComponent {
  @Input() valueList: aas.types.ValueList | undefined | null;
  @Input() valueListParent: any;

  constructor(
    private treeService: V3TreeService,
    private portalService: PortalService,
  ) {}

  addValueListEntry() {
    if (this.valueList == null) {
      this.valueListParent.valueList = new aas.types.ValueList([]);
      this.valueList = this.valueListParent.valueList;
    }
    this.valueList?.valueReferencePairs.push(
      new aas.types.ValueReferencePair(
        '',
        new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
          new aas.types.Key(
            aas.types.KeyTypes.GlobalReference,
            IdGenerationUtil.generateIri('kvp', this.portalService.iriPrefix),
          ),
        ]),
      ),
    );
  }

  addNewValueOption() {
    if (!this.valueList) {
      const langStringArr: aas.types.ValueList = new aas.types.ValueList([]);
      this.valueListParent.valueList = langStringArr;
      this.valueList = langStringArr;
    }
    this.valueList?.valueReferencePairs.push(
      new aas.types.ValueReferencePair(
        '',
        new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
          new aas.types.Key(
            aas.types.KeyTypes.GlobalReference,
            IdGenerationUtil.generateIri('kvp', this.portalService.iriPrefix),
          ),
        ]),
      ),
    );
    this.treeService.registerFieldUndoStep();
  }

  removeValueOption(index: number) {
    if (this.valueList) {
      this.valueList.valueReferencePairs.splice(index, 1);
      this.treeService.registerFieldUndoStep();
    }
  }

  hasContentErrors(pair: aas.types.ValueReferencePair) {
    const errors = [];
    if (this.valueList) {
      for (const error of aas.verification.verify(pair)) {
        errors.push(error);
      }
    }
    // return (
    //   errors.filter((e) => (e.path.segments[0] as any)?.name === 'value').length > 0 ||
    //   errors.filter((e) => e.message === 'Value must be either not set or have at least one item.').length > 0
    // );

    return errors.length > 0;
  }

  getContentError(pair: aas.types.ValueReferencePair) {
    const errors = [];
    if (this.valueList) {
      for (const error of aas.verification.verify(pair)) {
        errors.push(error);
      }
    }
    return errors;
  }
}
