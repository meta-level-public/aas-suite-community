import { Component, Input } from '@angular/core';
import { PrimeTemplate, SortEvent } from 'primeng/api';
import { TableModule } from 'primeng/table';

import { GenericViewerComponent } from '../generic-viewer/generic-viewer.component';

@Component({
  selector: 'aas-smc-viewer',
  templateUrl: './smc-viewer.component.html',
  imports: [TableModule, PrimeTemplate, GenericViewerComponent],
})
export class SmcViewerComponent {
  @Input() conceptDescriptions: any;
  @Input() smc: any;
  @Input() idShort: any;
  @Input() aasId: number | undefined;
  @Input() apiUrl: string = '/api';

  customSort(event: SortEvent) {
    if (event.data != null)
      event.data.sort((data1: any, data2: any) => {
        if (event.field != null) {
          const value1 = data1[event.field];
          const value2 = data2[event.field];

          return (event.order ?? 1) * value1.localeCompare(value2, undefined, { numeric: true, sensitivity: 'base' });
        }
        return 0;
      });
  }
}
