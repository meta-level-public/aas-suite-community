import { Component, Input } from '@angular/core';

import { TableModule } from '@openng/optimus-ui/table';
import { PrimeTemplate } from '@openng/optimus-ui/api';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'aas-reference-element',
  templateUrl: './reference-element.component.html',
  imports: [TableModule, PrimeTemplate, TranslateModule],
})
export class ReferenceElementComponent {
  @Input() element: any;
}
