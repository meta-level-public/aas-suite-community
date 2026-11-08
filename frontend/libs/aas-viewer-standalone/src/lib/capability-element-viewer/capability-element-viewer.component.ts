import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

import { HelpLabelComponent } from '@aas/common-components';
import { TranslateModule } from '@ngx-translate/core';
import { InputGroup } from '@openng/optimus-ui/inputgroup';
import { InputGroupAddon } from '@openng/optimus-ui/inputgroupaddon';
import { InputText } from '@openng/optimus-ui/inputtext';

@Component({
  selector: 'aas-capability-element-viewer-v3',
  templateUrl: './capability-element-viewer.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [InputGroup, InputGroupAddon, InputText, TranslateModule, HelpLabelComponent],
})
export class CapabilityELementViewerComponent {
  @Input() element: any;
}
