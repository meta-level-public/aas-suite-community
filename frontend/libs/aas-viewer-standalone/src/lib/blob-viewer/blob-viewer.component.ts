import { Component, Input } from '@angular/core';

import * as aas from '@aas-core-works/aas-core3.1-typescript';

import { HelpLabelComponent } from '@aas/common-components';
import { TranslateModule } from '@ngx-translate/core';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputText } from 'primeng/inputtext';

@Component({
  selector: 'aas-blob-viewer',
  templateUrl: './blob-viewer.component.html',
  imports: [InputGroup, InputGroupAddon, InputText, TranslateModule, HelpLabelComponent],
})
export class BlobViewerComponent {
  @Input({ required: true }) blob: aas.types.Blob | null | undefined;
}
