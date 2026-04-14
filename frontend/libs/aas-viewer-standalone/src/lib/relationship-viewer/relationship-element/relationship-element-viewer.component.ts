import { Reference } from '@aas-core-works/aas-core3.1-typescript/types';
import { Component, Input, OnChanges } from '@angular/core';
import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { TableModule } from 'primeng/table';
import { PrimeTemplate } from 'primeng/api';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'relationship-element-viewer',
  templateUrl: './relationship-element-viewer.component.html',
  imports: [TableModule, PrimeTemplate, TranslateModule],
})
export class RelationshipElementViewerComponent implements OnChanges {
  @Input() entity: Reference | undefined;
  @Input() aasId: number | undefined;
  @Input() idShort: any;
  @Input() titel: any;

  ngOnChanges() {
    // eslint-disable-next-line no-console
    console.log(this.entity);
  }

  getTypeString(type: number) {
    return aas.types.KeyTypes[type];
  }
}
