import { Component, Input } from '@angular/core';
import { Panel } from '@openng/optimus-ui/panel';
import { TableModule } from '@openng/optimus-ui/table';
import { PrimeTemplate } from '@openng/optimus-ui/api';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'aas-operation-variable',
  templateUrl: './operation-variable.component.html',
  imports: [Panel, TableModule, PrimeTemplate, TranslateModule],
})
export class OperationVariableComponent {
  @Input() variables: any;
  @Input() title: string = '';
}
