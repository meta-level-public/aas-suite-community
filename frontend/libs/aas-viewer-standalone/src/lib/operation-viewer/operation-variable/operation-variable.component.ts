import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { PrimeTemplate } from '@openng/optimus-ui/api';
import { Panel } from '@openng/optimus-ui/panel';
import { TableModule } from '@openng/optimus-ui/table';

@Component({
  selector: 'aas-operation-variable',
  templateUrl: './operation-variable.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [Panel, TableModule, PrimeTemplate, TranslateModule],
})
export class OperationVariableComponent {
  @Input() variables: aas.types.OperationVariable[] | null | undefined;
  @Input() title: string = '';

  getDatatypeString(variable: aas.types.OperationVariable) {
    if (variable instanceof aas.types.Property)
      if (variable.valueType != null) return aas.types.DataTypeDefXsd[variable.valueType];
    return '';
  }
}
