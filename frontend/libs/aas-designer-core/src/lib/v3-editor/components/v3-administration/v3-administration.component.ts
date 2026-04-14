import * as aas from '@aas-core-works/aas-core3.1-typescript';

import { HelpLabelComponent } from '@aas/common-components';
import { Component, inject, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputText } from 'primeng/inputtext';
import { NullIfEmptyDirective } from '../../../general/directives/null-if-empty.directive';
import { V3TreeService } from '../../v3-tree/v3-tree.service';
import { ErrorPanelComponent } from '../error-panel/error-panel.component';
import { ErrorHandlingAction, V3ComponentBase } from '../v3-component-base';
type VerificationError = aas.verification.VerificationError;
@Component({
  selector: 'aas-v3-administration',
  templateUrl: './v3-administration.component.html',
  imports: [
    Button,
    HelpLabelComponent,
    InputGroup,
    FormsModule,
    InputText,
    NullIfEmptyDirective,
    InputGroupAddon,
    ErrorPanelComponent,
    TranslateModule,
  ],
})
export class V3AdministrationComponent extends V3ComponentBase implements OnInit {
  @Input() administration: aas.types.AdministrativeInformation | undefined | null;
  @Input() administrationParent: any;

  creator: string = '';

  treeService = inject(V3TreeService);

  ngOnInit(): void {
    this.creator = this.administration?.creator?.keys[0].value ?? '';
  }

  addAdministrativeInformation() {
    const adminInfo = new aas.types.AdministrativeInformation();
    this.administrationParent.administration = adminInfo;
    this.administration = adminInfo;

    this.treeService.registerFieldUndoStep();
  }

  addKey() {
    if (this.administration == null) {
      const adminInfo = new aas.types.AdministrativeInformation();
      this.administrationParent.administration = adminInfo;
      this.administration = adminInfo;

      adminInfo.creator = new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
        new aas.types.Key(aas.types.KeyTypes.GlobalReference, ''),
      ]);
    } else {
      if (this.administration.creator == null) {
        this.administration.creator = new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
          new aas.types.Key(aas.types.KeyTypes.GlobalReference, ''),
        ]);
      } else {
        this.administration.creator?.keys.push(new aas.types.Key(aas.types.KeyTypes.GlobalReference, ''));
      }
    }
    this.treeService.registerFieldUndoStep();
  }

  deleteKey(key: aas.types.Key) {
    this.administration?.creator?.keys.splice(this.administration.creator.keys.indexOf(key), 1);
    if (this.administration?.creator?.keys.length === 0) {
      this.administration.creator = null;
    }
    this.treeService.registerFieldUndoStep();
  }

  removeAdministrativeInformationBlock() {
    this.administrationParent.administration = null;
    this.administration = null;

    this.treeService.registerFieldUndoStep();
  }

  errorArr: { error: VerificationError; action: ErrorHandlingAction }[] = [];
  get errors() {
    const errors: { error: VerificationError; action: ErrorHandlingAction }[] = [];
    if (this.administration != null) {
      for (const error of aas.verification.verify(this.administration, true)) {
        errors.push({ error: error, action: this.getAction(error) });
      }
    }

    const diff = JSON.stringify(errors) !== JSON.stringify(this.errorArr);
    if (diff === true) {
      this.errorArr = [...errors];
    }

    return this.errorArr;
  }

  get hasErrors() {
    return this.errorArr.length > 0;
  }

  getTemplateIdErrors() {
    if (this.administration == null) return [];
    const errors: VerificationError[] = [];
    for (const error of aas.verification.verify(this.administration)) {
      errors.push(error);
    }
    return errors.filter((e) => (e.path.segments[0] as any)?.name === 'templateId');
  }
  hasTemplateIdErrors() {
    const errors = [];
    if (this.administration == null) return false;
    for (const error of aas.verification.verify(this.administration)) {
      errors.push(error);
    }
    return errors.filter((e) => (e.path.segments[0] as any)?.name === 'templateId').length > 0;
  }
}
