import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { JsonPipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Button } from 'primeng/button';

@Component({
  selector: 'aas-v3-extensions',
  templateUrl: './v3-extensions.component.html',
  imports: [Button, JsonPipe, TranslateModule],
})
export class V3ExtensionsComponent {
  @Input() extensions: aas.types.Extension[] | undefined | null;
  @Input() extensionsParent: any;

  addExtension() {
    if (this.extensions == null && this.extensionsParent != null) {
      this.extensionsParent.extensions = [];
      this.extensions = this.extensionsParent.extensions;
    }
    this.extensions?.push(new aas.types.Extension(''));
  }
}
