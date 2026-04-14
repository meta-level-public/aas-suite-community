import { Component, Input } from '@angular/core';

import { HelpLabelComponent } from '@aas/common-components';
import { TranslateModule } from '@ngx-translate/core';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputText } from 'primeng/inputtext';

@Component({
  selector: 'aas-capability-element-viewer-v3',
  templateUrl: './capability-element-viewer.component.html',
  imports: [InputGroup, InputGroupAddon, InputText, TranslateModule, HelpLabelComponent],
})
export class CapabilityELementViewerComponent {
  @Input() element: any;
}
