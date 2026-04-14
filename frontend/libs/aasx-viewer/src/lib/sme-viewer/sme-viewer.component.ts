import { Component, Input } from '@angular/core';
import { SmcViewerComponent } from '../smc-viewer/smc-viewer.component';

@Component({
  selector: 'aas-sme-viewer',
  templateUrl: './sme-viewer.component.html',
  imports: [SmcViewerComponent],
})
export class SmeViewerComponent {
  @Input() conceptDescriptions: any;
  @Input() sme: any;
  @Input() aasId: number | undefined;
  @Input() apiUrl: string = '/api';
}
