import { Component, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { AasxViewerService } from '../aasx-viewer.service';
import { TableModule } from 'primeng/table';
import { PrimeTemplate } from 'primeng/api';

import { MarkingsViewerComponent } from '../markings-viewer/markings-viewer.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'aas-hsu-nameplate-viewer',
  templateUrl: './hsu-nameplate-viewer.component.html',
  imports: [TableModule, PrimeTemplate, MarkingsViewerComponent, TranslateModule],
})
export class HsuNameplateViewerComponent {
  @Input() nameplate: any;
  @Input() currentLang: string = 'de';
  @Input() aasId: number = 0;
  @Input() apiUrl: string = '/api';

  markings: any[] = [];

  constructor(
    private sanitizer: DomSanitizer,
    private aasxViewerService: AasxViewerService,
  ) {}

  init() {
    this.nameplate.submodelElements
      ?.find((sme: any) => sme.idShort === 'Markings')
      ?.value?.forEach((el: any) => {
        this.loadFile(el);
        this.markings.push(el);
      });
  }

  get manufacturer() {
    return this.findElementText('ManufacturerName');
  }

  get productFamily() {
    return this.findElementText('ManufacturerProductFamily');
  }
  get productDesignation() {
    return this.findElementText('ManufacturerProductDesignation');
  }
  get street() {
    return this.findAddressElement('Street');
  }
  get zip() {
    return this.findAddressElement('Zip') ?? this.findAddressElement('PostalCode');
  }
  get city() {
    return this.findAddressElement('CityTown') ?? this.findAddressElement('City');
  }
  get countryCode() {
    return this.findAddressElement('CountryCode')?.toUpperCase();
  }

  findElementText(type: string) {
    const el = this.nameplate.submodelElements?.find((sme: any) => sme.idShort === type)?.value;

    return el;
  }

  findAddressElement(type: string) {
    const addr = this.nameplate.submodelElements?.find((sme: any) => sme.idShort === 'PhysicalAddress')?.value;
    const el = addr?.find((sme: any) => sme.idShort === type)?.value;

    return el ?? '';
  }

  getMarkingText(marking: any, type: string) {
    return marking.value?.find((sme: any) => sme.idShort === type)?.value ?? '';
  }

  async loadFile(marking: any) {
    marking.fileData = await this.aasxViewerService.getFile(
      this.aasId,
      this.getMarkingText(marking, 'MarkingFile'),
      this.apiUrl,
    );
    marking.fileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(marking.fileData));
  }
}
