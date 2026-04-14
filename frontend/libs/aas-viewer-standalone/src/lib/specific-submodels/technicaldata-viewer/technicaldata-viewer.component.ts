import {
  ISubmodelElement,
  Property,
  Submodel,
  SubmodelElementCollection,
} from '@aas-core-works/aas-core3.1-typescript/types';
import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Card } from 'primeng/card';
import { AasViewerService } from '../../aas-viewer.service';
import { GenericViewerComponent } from '../../generic-viewer/generic-viewer.component';

@Component({
  selector: 'aas-technicaldata-viewer',
  templateUrl: './technicaldata-viewer.component.html',
  imports: [Card, GenericViewerComponent],
})
export class TechnicaldataViewerComponent {
  @Input() technicalData: Submodel | undefined;
  @Input() currentLang = 'de';

  responsiveOptions: any[] | undefined;
  productImages: Property[] = [];

  files: Map<string, SafeUrl> = new Map<string, SafeUrl>();

  constructor(
    private sanitizer: DomSanitizer,
    private aasxViewerService: AasViewerService,
  ) {}

  get generalInformation() {
    let val = this.technicalData?.submodelElements?.find((sme: any) => sme.idShort === 'GeneralInformation');
    if (val == null) {
      val = this.technicalData?.submodelElements?.find((sme: ISubmodelElement) =>
        sme.semanticId?.keys.find((k) =>
          k.value.trim().startsWith('https://admin-shell.io/ZVEI/TechnicalData/GeneralInformation/1/1'),
        ),
      );
    }
    return val as SubmodelElementCollection;
  }
  get productClassification() {
    let val = this.technicalData?.submodelElements?.find((sme: any) => sme.idShort === 'ProductClassifications');
    if (val == null) {
      val = this.technicalData?.submodelElements?.find((sme: ISubmodelElement) =>
        sme.semanticId?.keys.find((k) =>
          k.value.trim().startsWith('https://admin-shell.io/ZVEI/TechnicalData/ProductClassifications/1/1'),
        ),
      );
    }
    return val as SubmodelElementCollection;
  }

  get technicalProperties() {
    let val = this.technicalData?.submodelElements?.find((sme: any) => sme.idShort === 'TechnicalProperties');
    if (val == null) {
      val = this.technicalData?.submodelElements?.find((sme: ISubmodelElement) =>
        sme.semanticId?.keys.find((k) =>
          k.value.trim().startsWith('https://admin-shell.io/ZVEI/TechnicalData/TechnicalProperties/1/1'),
        ),
      );
    }
    return val as SubmodelElementCollection;
  }

  get furtherInformation() {
    let val = this.technicalData?.submodelElements?.find((sme: any) => sme.idShort === 'FurtherInformation');
    if (val == null) {
      val = this.technicalData?.submodelElements?.find((sme: ISubmodelElement) =>
        sme.semanticId?.keys.find((k) =>
          k.value.trim().startsWith('https://admin-shell.io/ZVEI/TechnicalData/FurtherInformation/1/1'),
        ),
      );
    }
    return val as SubmodelElementCollection;
  }
}
