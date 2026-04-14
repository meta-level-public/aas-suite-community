import { Component, Input } from '@angular/core';
import { TableModule } from 'primeng/table';
import { PrimeTemplate } from 'primeng/api';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'aas-multilanguage-property',
  templateUrl: './multilanguage-property.component.html',
  imports: [TableModule, PrimeTemplate, TranslateModule],
})
export class MultilanguagePropertyComponent {
  @Input() properties: any;
  @Input() aasId: number | undefined;
}
