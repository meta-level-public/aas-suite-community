import { Component, Input } from '@angular/core';

import { TableModule } from 'primeng/table';
import { PrimeTemplate } from 'primeng/api';
import { MultilanguagePropertyComponent } from '../../multilanguage-property/multilanguage-property.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'aas-contact-information-element-viewer',
  templateUrl: './contact-information-element-viewer.component.html',
  imports: [TableModule, PrimeTemplate, MultilanguagePropertyComponent, TranslateModule],
})
export class ContactInformationElementViewerComponent {
  @Input() contactInformation: any;
  @Input() aasId: number | undefined;

  disabledByEmptyValue(obj: any) {
    if (Array.isArray(obj) && obj.length !== 0) {
      return true;
    }

    if (typeof obj === 'string' && obj !== '') {
      return true;
    }

    return false;
  }
}
