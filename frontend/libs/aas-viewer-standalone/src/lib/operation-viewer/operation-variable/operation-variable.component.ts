import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { PrimeTemplate } from 'primeng/api';
import { Panel } from 'primeng/panel';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'aas-operation-variable',
  templateUrl: './operation-variable.component.html',
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
