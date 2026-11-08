import { Reference } from '@aas-core-works/aas-core3.1-typescript/types';
import { Component, Input, OnChanges, ChangeDetectionStrategy } from '@angular/core';
import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { TableModule } from '@openng/optimus-ui/table';
import { PrimeTemplate } from '@openng/optimus-ui/api';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'relationship-element-viewer',
  templateUrl: './relationship-element-viewer.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [TableModule, PrimeTemplate, TranslateModule],
})
export class RelationshipElementViewerComponent implements OnChanges {
  @Input() entity: Reference | undefined;
  @Input() aasId: number | undefined;
  @Input() idShort: any;
  @Input() titel: any;

  ngOnChanges() {}

  getTypeString(type: number) {
    return aas.types.KeyTypes[type];
  }
}
