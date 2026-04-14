import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { ShellResult } from '@aas/model';
import { Component, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { V3TreeItem } from '../../model/v3-tree-item';
import { V3EditorService } from '../../v3-editor.service';
import { V3TreeService } from '../../v3-tree/v3-tree.service';
type File = aas.types.File;

import { HelpLabelComponent } from '@aas/common-components';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Fieldset } from 'primeng/fieldset';
import { InputText } from 'primeng/inputtext';
import { NullIfEmptyDirective } from '../../../general/directives/null-if-empty.directive';
import { EndpointUrlComponent } from '../endpoint-url/endpoint-url.component';
import { V3CategoryComponent } from '../v3-category/v3-category.component';
import { V3ComponentBase } from '../v3-component-base';
import { V3EmbeddedDataSpecificationComponent } from '../v3-embedded-data-specification/v3-embedded-data-specification.component';
import { V3IdShortComponent } from '../v3-id-short/v3-id-short.component';
import { V3LangStringListComponent } from '../v3-lang-string-list/v3-lang-string-list.component';
import { V3QualifiersComponent } from '../v3-qualifiers/v3-qualifiers.component';
import { V3SemanticDescriptionComponent } from '../v3-semantic-description/v3-semantic-description.component';
import { FileContentEditorComponent } from './file-content-editor/file-content-editor.component';

@Component({
  selector: 'aas-v3-file-editor',
  templateUrl: './v3-file-editor.component.html',
  imports: [
    Fieldset,
    HelpLabelComponent,
    V3IdShortComponent,
    V3LangStringListComponent,
    FormsModule,
    InputText,
    NullIfEmptyDirective,
    V3CategoryComponent,
    FileContentEditorComponent,
    NgClass,
    V3SemanticDescriptionComponent,
    V3QualifiersComponent,
    V3EmbeddedDataSpecificationComponent,
    EndpointUrlComponent,
    TranslateModule,
  ],
})
export class V3FileEditorComponent extends V3ComponentBase {
  @Input({ required: true }) file: V3TreeItem<File> | undefined | null;
  @Input({ required: true }) shellResult: ShellResult | undefined | null;
  @Input({ required: true }) repositoryUrl: string = '';
  @Input({ required: true }) idShortPath: string = '';

  loading: boolean = false;

  constructor(
    private treeService: V3TreeService,
    private sanitizer: DomSanitizer,
    private editorService: V3EditorService,
  ) {
    super();
  }

  get hasErrors() {
    const errors = [];
    if (this.file?.content != null) {
      for (const error of aas.verification.verify(this.file?.content)) {
        errors.push(error);
      }
    }
    return errors.length > 0;
  }
  get errors() {
    const errors = [];
    if (this.file?.content != null) {
      for (const error of aas.verification.verify(this.file?.content)) {
        errors.push(error);
      }
    }
    return errors;
  }
  get hasSemanticErrors() {
    const errors = [];
    if (this.file?.content?.semanticId != null) {
      for (const error of aas.verification.verify(this.file.content.semanticId, false)) {
        errors.push(error);
      }
    }
    return errors.length > 0;
  }
}
