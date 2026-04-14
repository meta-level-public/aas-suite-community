import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { HelpLabelComponent } from '@aas/common-components';
import { ShellResult } from '@aas/model';
import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Fieldset } from 'primeng/fieldset';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { NullIfEmptyDirective } from '../../../general/directives/null-if-empty.directive';
import { V3TreeItem } from '../../model/v3-tree-item';
import { V3CategoryComponent } from '../v3-category/v3-category.component';
import { V3ComponentBase } from '../v3-component-base';
import { V3EmbeddedDataSpecificationComponent } from '../v3-embedded-data-specification/v3-embedded-data-specification.component';
import { V3IdShortComponent } from '../v3-id-short/v3-id-short.component';
import { V3LangStringListComponent } from '../v3-lang-string-list/v3-lang-string-list.component';
import { V3QualifiersComponent } from '../v3-qualifiers/v3-qualifiers.component';
import { V3ReferenceComponent } from '../v3-reference/v3-reference.component';
import { V3SemanticDescriptionComponent } from '../v3-semantic-description/v3-semantic-description.component';

@Component({
  selector: 'aas-v3-basic-event-element',
  templateUrl: './v3-basic-event-element.component.html',
  imports: [
    Fieldset,
    HelpLabelComponent,
    V3IdShortComponent,
    V3LangStringListComponent,
    V3CategoryComponent,
    V3ReferenceComponent,
    FormsModule,
    InputText,
    NullIfEmptyDirective,
    Select,
    NgClass,
    V3SemanticDescriptionComponent,
    V3QualifiersComponent,
    V3EmbeddedDataSpecificationComponent,
    TranslateModule,
  ],
})
export class V3BasicEventElementComponent extends V3ComponentBase {
  @Input({ required: true }) element: V3TreeItem<aas.types.BasicEventElement> | undefined | null;
  @Input({ required: true }) shellResult: ShellResult | undefined;

  get hasSemanticErrors() {
    const errors = [];
    if (this.element?.content?.semanticId != null) {
      for (const error of aas.verification.verify(this.element.content.semanticId, false)) {
        errors.push(error);
      }
    }
    return errors.length > 0;
  }
}
