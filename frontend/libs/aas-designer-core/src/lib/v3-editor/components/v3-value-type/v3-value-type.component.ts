import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { V3ComponentBase } from '../v3-component-base';
import { Select } from '@openng/optimus-ui/select';
import { V3UndoDirective } from '../../../general/directives/v3-undo.directive';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'aas-v3-value-type',
  templateUrl: './v3-value-type.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [Select, V3UndoDirective, FormsModule, TranslateModule],
})
export class V3ValueTypeComponent extends V3ComponentBase {
  @Input({ required: true }) valueType: any;
}
