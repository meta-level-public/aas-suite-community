import { SemanticIdHelper } from '@aas/helpers';
import { Component, Input } from '@angular/core';

import { ContactInformationViewerComponent } from '../contact-information-viewer/contact-information-viewer.component';
import { DocumentationViewerComponent } from '../documentation-viewer/documentation-viewer.component';
import { GenericNameplateViewerComponent } from '../generic-nameplate-viewer/generic-nameplate-viewer.component';
import { GenericViewerComponent } from '../generic-viewer/generic-viewer.component';
import { HsuNameplateViewerComponent } from '../hsu-nameplate-viewer/hsu-nameplate-viewer.component';
import { NameplateViewerComponent } from '../nameplate-viewer/nameplate-viewer.component';
import { TechnicalDataViewerComponent } from '../technicaldata-viewer/technicaldata-viewer.component';

@Component({
  selector: 'aas-aasx-model-viewer',
  templateUrl: './aasx-model-viewer.component.html',
  imports: [
    NameplateViewerComponent,
    HsuNameplateViewerComponent,
    GenericNameplateViewerComponent,
    TechnicalDataViewerComponent,
    ContactInformationViewerComponent,
    DocumentationViewerComponent,
    GenericViewerComponent,
  ],
})
export class AasxModelViewerComponent {
  @Input() conceptDescriptions: any;
  @Input() selectedModel: any;
  @Input() currentLanguage = 'de';
  @Input() aasId = 0;
  @Input() apiUrl = '/api';

  hasViewer(id: string) {
    if (this.selectedModel != null) {
      const semanticId = SemanticIdHelper.getSemanticDescription(this.selectedModel, 'Submodel')?.value;
      if (
        id === 'Nameplate' &&
        (semanticId === 'https://admin-shell.io/zvei/nameplate/1/0/Nameplate' ||
          semanticId === 'https://admin-shell.io/zvei/nameplate/2/0/Nameplate')
      ) {
        return true;
      }
      if (id === 'HsuNameplate' && semanticId === 'https://www.hsu-hh.de/aut/aas/nameplate') {
        return true;
      }
      if (
        id === 'GenericNameplate' &&
        semanticId !== 'https://www.hsu-hh.de/aut/aas/nameplate' &&
        semanticId !== 'https://admin-shell.io/zvei/nameplate/1/0/Nameplate' &&
        semanticId !== 'https://admin-shell.io/zvei/nameplate/2/0/Nameplate'
      ) {
        return true;
      }
      if (
        id === 'TechnicalData' &&
        (semanticId === 'http://admin-shell.io/ZVEI/TechnicalData/Submodel/1/1' ||
          semanticId === 'http://admin-shell.io/ZVEI/TechnicalData/Submodel/1/2' ||
          semanticId === 'http://admin-shell.io/sandbox/technical-data-flat/sm' ||
          semanticId === 'https://admin-shell.io/ZVEI/TechnicalData/Submodel/1/1' ||
          semanticId === 'https://admin-shell.io/ZVEI/TechnicalData/Submodel/1/2' ||
          semanticId === 'http://admin-shell.io/sandbox/SG2/TechnicalData/Submodel/1/1' ||
          semanticId === 'https://admin-shell.io/sandbox/technical-data-flat/sm')
      ) {
        return true;
      }
      if (
        id === 'ContactInformation' &&
        semanticId === 'https://adminshell.io/zvei/nameplate/1/0/ContactInformations/ContactInformation'
      ) {
        return true;
      }
      if (
        (id === 'Documentation' && semanticId === 'http://admin-shell.io/vdi/2770/1/0/Documentation') ||
        semanticId === 'https://admin-shell.io/vdi/2770/1/0/Documentation' ||
        semanticId === 'https://admin-shell.io/vdi/2770/1/2/HandoverDocumentation' ||
        semanticId === 'https://www.hsu-hh.de/aut/aas/document'
      ) {
        return true;
      }
    }
    return false;
  }
}
