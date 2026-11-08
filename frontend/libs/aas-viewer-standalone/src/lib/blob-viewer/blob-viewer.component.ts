import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

import * as aas from '@aas-core-works/aas-core3.1-typescript';

import { HelpLabelComponent } from '@aas/common-components';
import { TranslateModule } from '@ngx-translate/core';
import { InputGroup } from '@openng/optimus-ui/inputgroup';
import { InputGroupAddon } from '@openng/optimus-ui/inputgroupaddon';
import { InputText } from '@openng/optimus-ui/inputtext';

@Component({
  selector: 'aas-blob-viewer',
  templateUrl: './blob-viewer.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [InputGroup, InputGroupAddon, InputText, TranslateModule, HelpLabelComponent],
})
export class BlobViewerComponent {
  @Input({ required: true }) blob: aas.types.Blob | null | undefined;
}
