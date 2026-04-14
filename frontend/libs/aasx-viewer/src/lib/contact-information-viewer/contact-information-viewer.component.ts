import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { PrimeTemplate } from 'primeng/api';
import { Button } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ContactInformationElementViewerComponent } from './contact-information-element-viewer/contact-information-element-viewer.component';

@Component({
  selector: 'aas-contact-information-viewer',
  templateUrl: './contact-information-viewer.component.html',
  imports: [TableModule, PrimeTemplate, Button, ContactInformationElementViewerComponent, TranslateModule],
})
export class ContactInformationViewerComponent {
  @Input() contactInformation: any;
  @Input() aasId: number | undefined;
  @Input() apiUrl = '/api';

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
