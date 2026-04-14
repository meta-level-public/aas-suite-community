import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { Component, Input } from '@angular/core';
import { SortEvent } from 'primeng/api';
import { SubmodelElementsListComponent } from '../submodel-elements-list/submodel-elements-list.component';

@Component({
  selector: 'aas-sm-viewer-v3',
  templateUrl: './sm-viewer.component.html',
  imports: [SubmodelElementsListComponent],
})
export class SmViewerComponent {
  @Input() submodel: any;
  @Input({ required: true }) idShortPath: string = '';
  @Input({ required: true }) submodelId: string = '';
  @Input() idShort: any;
  @Input() compact: boolean = false;
  @Input() withIdShort: boolean = true;

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

  isArray(el: any) {
    return el?.value instanceof Array;
  }

  isProperty(el: any) {
    return el instanceof aas.types.Property || el instanceof aas.types.MultiLanguageProperty;
  }
}
