import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { HelpLabelComponent } from '@aas/common-components';
import { ShellResult } from '@aas/model';
import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Fieldset } from 'primeng/fieldset';
import { V3TreeItem } from '../../model/v3-tree-item';
import { V3ComponentBase } from '../v3-component-base';
import { V3IdShortComponent } from '../v3-id-short/v3-id-short.component';
import { V3LangStringListComponent } from '../v3-lang-string-list/v3-lang-string-list.component';
import { V3QualifiersComponent } from '../v3-qualifiers/v3-qualifiers.component';
import { V3SemanticDescriptionComponent } from '../v3-semantic-description/v3-semantic-description.component';
import { BlobContentViewerComponent } from './blob-content-viewer.component';

@Component({
  selector: 'aas-v3-blob-editor',
  templateUrl: './v3-blob-editor.component.html',
  imports: [
    Fieldset,
    HelpLabelComponent,
    V3IdShortComponent,
    V3LangStringListComponent,
    BlobContentViewerComponent,
    NgClass,
    V3SemanticDescriptionComponent,
    V3QualifiersComponent,
    TranslateModule,
  ],
})
export class V3BlobEditorComponent extends V3ComponentBase {
  @Input({ required: true }) blob: V3TreeItem<aas.types.Blob> | undefined | null;
  @Input({ required: true }) shellResult: ShellResult | undefined | null;

  get hasSemanticErrors() {
    const errors = [];
    if (this.blob?.content?.semanticId != null) {
      for (const error of aas.verification.verify(this.blob.content.semanticId, false)) {
        errors.push(error);
      }
    }
    return errors.length > 0;
  }
}
