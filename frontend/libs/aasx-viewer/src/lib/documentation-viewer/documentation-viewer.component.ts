import { Component, Input } from '@angular/core';
import { SemanticIdHelper } from '@aas/helpers';

import { Panel } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { PrimeTemplate } from 'primeng/api';
import { FileViewerComponent } from '../file-viewer/file-viewer.component';
import { GenericViewerComponent } from '../generic-viewer/generic-viewer.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'aas-documentation-viewer',
  templateUrl: './documentation-viewer.component.html',
  imports: [Panel, TableModule, PrimeTemplate, FileViewerComponent, GenericViewerComponent, TranslateModule],
})
export class DocumentationViewerComponent {
  @Input() documentation: any;
  @Input() aasId: number | undefined;
  @Input() currentLanguage = 'de';
  @Input() apiUrl = '/api';

  getPropValue(submodelElement: any, field: string) {
    if (submodelElement?.modelType?.name === 'SubmodelElementCollection') {
      if (field.endsWith('*')) {
        field = field.replace('*', '');
        return submodelElement.value.find((e: any) => e.idShort.startsWith(field))?.value;
      }
      return submodelElement.value.find((e: any) => e.idShort === field)?.value;
    }
    if (Array.isArray(submodelElement)) {
      if (field.endsWith('*')) {
        field = field.replace('*', '');
        return submodelElement.find((e: any) => e.idShort.startsWith(field))?.value;
      }
      return submodelElement.find((e: any) => e.idShort === field)?.value;
    }
    return null;
  }

  getMlpValue(submodelElement: any, field: string) {
    if (submodelElement?.modelType?.name === 'SubmodelElementCollection') {
      return submodelElement.value
        .find((e: any) => e.idShort === field)
        ?.value.find((e: any) => e.language.toLowerCase() === this.currentLanguage.toLowerCase())?.text;
    }
    if (Array.isArray(submodelElement)) {
      const x = submodelElement.find((e: any) => e.idShort === field)?.value;
      return x?.find((e: any) => e.language.toLowerCase() === this.currentLanguage.toLowerCase())?.text;
    }

    return null;
  }

  getLanguages(submodelElement: any) {
    return submodelElement
      .filter((e: any) => e.idShort.startsWith('Language'))
      .map((e: any) => {
        return e.value;
      });
  }

  get isIdtaV2() {
    const semanticId = SemanticIdHelper.getSemanticDescription(this.documentation, 'Submodel')?.value;

    return semanticId === 'https://admin-shell.io/vdi/2770/1/2/HandoverDocumentation';
  }
  get isIdtaV1() {
    const semanticId = SemanticIdHelper.getSemanticDescription(this.documentation, 'Submodel')?.value;

    return (
      semanticId === 'http://admin-shell.io/vdi/2770/1/0/Documentation' ||
      semanticId === 'https://admin-shell.io/vdi/2770/1/0/Documentation'
    );
  }
  get isHsu() {
    const semanticId = SemanticIdHelper.getSemanticDescription(this.documentation, 'Submodel')?.value;
    return semanticId === 'https://www.hsu-hh.de/aut/aas/document';
  }

  get isOther() {
    return !this.isIdtaV1 && !this.isIdtaV2 && !this.isHsu;
  }
}
