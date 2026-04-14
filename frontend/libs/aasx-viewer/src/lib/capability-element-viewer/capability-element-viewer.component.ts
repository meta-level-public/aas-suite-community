import { Component, Input } from '@angular/core';

import { TableModule } from 'primeng/table';
import { PrimeTemplate } from 'primeng/api';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'aas-capability-element-viewer',
  templateUrl: './capability-element-viewer.component.html',
  imports: [TableModule, PrimeTemplate, TranslateModule],
})
export class CapabilityELementViewerComponent {
  @Input() element: any;
}
