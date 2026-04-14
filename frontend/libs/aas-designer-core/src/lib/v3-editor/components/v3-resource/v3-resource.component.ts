import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { HelpLabelComponent } from '@aas/common-components';
import { ShellResult } from '@aas/model';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { FileContentEditorComponent } from '../v3-file-editor/file-content-editor/file-content-editor.component';

@Component({
  selector: 'aas-v3-resource',
  templateUrl: './v3-resource.component.html',
  imports: [HelpLabelComponent, FormsModule, InputText, FileContentEditorComponent, Button, TranslateModule],
})
export class V3ResourceComponent {
  @Input() resource: aas.types.Resource | undefined | null;
  @Input() resourceParent: any;
  @Input() resourceParentPropertyName: string = '';
  @Input() shellResult: ShellResult | undefined;
  @Input({ required: true }) isThumbnail: boolean = false;

  addResource() {
    if (this.resource == null && this.resourceParent != null && this.resourceParentPropertyName !== '') {
      const res = new aas.types.Resource('', '');
      this.resourceParent[this.resourceParentPropertyName] = res;
      this.resource = res;
    }
    // setTimeout(() => {
    //   this.chooseFile();
    // });
  }
}
