import { Component, Input } from '@angular/core';

import { PropertyViewerComponent } from '../property-viewer/property-viewer.component';
import { MultilanguagePropertyComponent } from '../multilanguage-property/multilanguage-property.component';
import { SmcViewerComponent } from '../smc-viewer/smc-viewer.component';
import { FileViewerComponent } from '../file-viewer/file-viewer.component';
import { EntityViewerComponent } from '../entity-viewer/entity-viewer.component';
import { OperationViewerComponent } from '../operation-viewer/operation-viewer.component';
import { RelationshipViewerComponent } from '../relationship-element/relationship-viewer.component';
import { ReferenceElementComponent } from '../reference-element/reference-element.component';
import { CapabilityELementViewerComponent } from '../capability-element-viewer/capability-element-viewer.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'aas-generic-viewer',
  templateUrl: './generic-viewer.component.html',
  imports: [
    PropertyViewerComponent,
    MultilanguagePropertyComponent,
    SmcViewerComponent,
    FileViewerComponent,
    EntityViewerComponent,
    OperationViewerComponent,
    RelationshipViewerComponent,
    ReferenceElementComponent,
    CapabilityELementViewerComponent,
    TranslateModule,
  ],
})
export class GenericViewerComponent {
  @Input() conceptDescriptions: any;
  @Input() rowData: any;
  @Input() aasId: number | undefined;
  @Input() apiUrl: string = '/api';
}
