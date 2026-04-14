import { Component, Input } from '@angular/core';

import { TableModule } from 'primeng/table';
import { PrimeTemplate } from 'primeng/api';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'aas-reference-element',
  templateUrl: './reference-element.component.html',
  imports: [TableModule, PrimeTemplate, TranslateModule],
})
export class ReferenceElementComponent {
  @Input() element: any;
}
