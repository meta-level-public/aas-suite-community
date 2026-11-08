import { Component, Input } from '@angular/core';

import { TableModule } from '@openng/optimus-ui/table';
import { PrimeTemplate } from '@openng/optimus-ui/api';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'aas-capability-element-viewer',
  templateUrl: './capability-element-viewer.component.html',
  imports: [TableModule, PrimeTemplate, TranslateModule],
})
export class CapabilityELementViewerComponent {
  @Input() element: any;
}
