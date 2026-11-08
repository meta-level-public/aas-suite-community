import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { PrimeTemplate } from '@openng/optimus-ui/api';
import { Button } from '@openng/optimus-ui/button';
import { TableModule } from '@openng/optimus-ui/table';
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
