import { Component, Input } from '@angular/core';

import { SmcViewerComponent } from '../smc-viewer/smc-viewer.component';
import { SmeViewerComponent } from '../sme-viewer/sme-viewer.component';

@Component({
  selector: 'aas-technicaldata-viewer',
  templateUrl: './technicaldata-viewer.component.html',
  imports: [SmcViewerComponent, SmeViewerComponent],
})
export class TechnicalDataViewerComponent {
  @Input() conceptDescriptions: any;
  @Input() submodelData: any;
  @Input() aasId: number | undefined;
  @Input() apiUrl: string = '/api';
}
