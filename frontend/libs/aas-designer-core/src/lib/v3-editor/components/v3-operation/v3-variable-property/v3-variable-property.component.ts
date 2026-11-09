import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { NgClass } from '@angular/common';
import { Component, ElementRef, Input, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { HelpLabelComponent } from '@aas/common-components';
import { Checkbox } from '@openng/optimus-ui/checkbox';
import { DatePicker } from '@openng/optimus-ui/datepicker';
import { InputText } from '@openng/optimus-ui/inputtext';
import { KeyFilter } from '@openng/optimus-ui/keyfilter';
import { Select } from '@openng/optimus-ui/select';
import { UndoDirective } from '../../../../general/directives/undo.directive';
import { V3UndoDirective } from '../../../../general/directives/v3-undo.directive';
import { Info } from '../../../../general/model/info-item';
import { V3ComponentBase } from '../../v3-component-base';
import { VerificationMessagePipe } from '../../../tools/verification-message';
type OperationVariable = aas.types.OperationVariable;

@Component({
  selector: 'aas-v3-variable-property',
  templateUrl: './v3-variable-property.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    VerificationMessagePipe,
    HelpLabelComponent,
    FormsModule,
    InputText,
    UndoDirective,
    KeyFilter,
    NgClass,
    Checkbox,
    V3UndoDirective,
    DatePicker,
    Select,
    TranslateModule,
  ],
})
export class V3VariablePropertyComponent extends V3ComponentBase {
  @Input() variable: OperationVariable | undefined | null;

  @ViewChild('inputEl') inputEl: ElementRef | undefined;
  info = Info;

  get errors() {
    const errors = [];
    if (this.variable) {
      for (const error of aas.verification.verify(this.variable)) {
        errors.push(error);
      }
    }
    return errors;
  }
  get hasErrors() {
    const errors = [];
    if (this.variable) {
      for (const error of aas.verification.verify(this.variable)) {
        errors.push(error);
      }
    }
    return errors.length > 0;
  }

  get variableValue() {
    return this.variable?.value as any;
  }
}
