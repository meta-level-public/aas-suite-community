import { Component, Input } from '@angular/core';
import { Panel } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { PrimeTemplate } from 'primeng/api';
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
