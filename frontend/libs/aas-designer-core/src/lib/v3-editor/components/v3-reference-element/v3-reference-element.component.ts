import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { HelpLabelComponent } from '@aas/common-components';
import { ShellResult } from '@aas/model';
import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Fieldset } from 'primeng/fieldset';
import { Info } from '../../../general/model/info-item';
import { V3TreeItem } from '../../model/v3-tree-item';
import { EndpointUrlComponent } from '../endpoint-url/endpoint-url.component';
import { V3ComponentBase } from '../v3-component-base';
import { V3IdShortComponent } from '../v3-id-short/v3-id-short.component';
import { V3LangStringListComponent } from '../v3-lang-string-list/v3-lang-string-list.component';
import { V3QualifiersComponent } from '../v3-qualifiers/v3-qualifiers.component';
import { V3ReferenceComponent } from '../v3-reference/v3-reference.component';
import { V3SemanticDescriptionComponent } from '../v3-semantic-description/v3-semantic-description.component';

@Component({
  selector: 'aas-v3-reference-element',
  templateUrl: './v3-reference-element.component.html',
  imports: [
    Fieldset,
    HelpLabelComponent,
    V3IdShortComponent,
    V3LangStringListComponent,
    V3ReferenceComponent,
    NgClass,
    V3SemanticDescriptionComponent,
    V3QualifiersComponent,
    EndpointUrlComponent,
    TranslateModule,
  ],
})
export class V3ReferenceElementComponent extends V3ComponentBase {
  @Input() reference: V3TreeItem<aas.types.ReferenceElement> | undefined;
  @Input() referenceParent: any;
  @Input() shellResult: ShellResult | undefined;
  @Input({ required: true }) idShortPath: string = '';

  info = Info;

  get hasSemanticErrors() {
    const errors = [];
    if (this.reference?.content?.semanticId != null) {
      for (const error of aas.verification.verify(this.reference.content.semanticId, false)) {
        errors.push(error);
      }
    }
    return errors.length > 0;
  }
}
