import { Component, Input } from '@angular/core';
import { TableModule } from '@openng/optimus-ui/table';
import { PrimeTemplate } from '@openng/optimus-ui/api';

import { TranslateModule } from '@ngx-translate/core';
import { ObjectValuePipe } from '../../util/object-value.pipe';

@Component({
  selector: 'relationship-element-viewer',
  templateUrl: './relationship-element-viewer.component.html',
  imports: [TableModule, PrimeTemplate, TranslateModule, ObjectValuePipe],
})
export class RelationshipElementViewerComponent {
  @Input() entity: any;
  @Input() aasId: number | undefined;
  @Input() idShort: any;
  @Input() titel: any;
}
