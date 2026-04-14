import { Component, Input } from '@angular/core';
import { TableModule } from 'primeng/table';
import { PrimeTemplate } from 'primeng/api';

import { OperationVariableComponent } from './operation-variable/operation-variable.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'aas-operation-viewer',
  templateUrl: './operation-viewer.component.html',
  imports: [TableModule, PrimeTemplate, OperationVariableComponent, TranslateModule],
})
export class OperationViewerComponent {
  @Input() entity: any;
}
