import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { VerificationError } from '@aas-core-works/aas-core3.1-typescript/verification';
import { HelpLabelComponent } from '@aas/common-components';
import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { Info } from '../../../general/model/info-item';
import { V3TreeItem } from '../../model/v3-tree-item';
import { ErrorLineComponent } from '../error-line/error-line.component';
import { ErrorHandlingAction, V3ComponentBase } from '../v3-component-base';

@Component({
  selector: 'aas-v3-category',
  templateUrl: './v3-category.component.html',
  imports: [HelpLabelComponent, Select, FormsModule, NgClass, ErrorLineComponent],
})
export class V3CategoryComponent extends V3ComponentBase {
  @Input({ required: true }) element:
    | V3TreeItem<aas.types.MultiLanguageProperty>
    | V3TreeItem<aas.types.Property>
    | V3TreeItem<aas.types.Submodel>
    | V3TreeItem<aas.types.Range>
    | V3TreeItem<aas.types.AssetAdministrationShell>
    | V3TreeItem<aas.types.Operation>
    | V3TreeItem<aas.types.Blob>
    | V3TreeItem<aas.types.File>
    | V3TreeItem<aas.types.Entity>
    | V3TreeItem<aas.types.SubmodelElementCollection>
    | V3TreeItem<aas.types.BasicEventElement>
    | V3TreeItem<aas.types.Capability>
    | undefined;
  info = Info;

  categoryErrorArr: { error: VerificationError; action: ErrorHandlingAction }[] = [];
  get categoryErrors() {
    const errors: { error: VerificationError; action: ErrorHandlingAction }[] = [];
    const details = this.element?.content;
    if (details != null) {
      for (const error of aas.verification.verify(details, false)) {
        if (error.path.toString() === '.category') {
          errors.push({ error: error, action: this.getAction(error) });
        }
      }
    }

    const diff = JSON.stringify(errors) !== JSON.stringify(this.categoryErrorArr);
    if (diff === true) {
      this.categoryErrorArr = [...errors];
    }

    return this.categoryErrorArr;
  }

  get hasCategoryErrors() {
    return this.categoryErrorArr.length > 0;
  }
}
