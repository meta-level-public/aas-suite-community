import { Component, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { PrimeTemplate } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { AasxViewerService } from '../aasx-viewer.service';

import { TranslateModule } from '@ngx-translate/core';
import { MarkingsViewerComponent } from '../markings-viewer/markings-viewer.component';

@Component({
  selector: 'aas-generic-nameplate-viewer',
  templateUrl: './generic-nameplate-viewer.component.html',
  imports: [TableModule, PrimeTemplate, MarkingsViewerComponent, TranslateModule],
})
export class GenericNameplateViewerComponent {
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
    return this.findAddressElement('ZipCode');
  }
  get city() {
    return this.findAddressElement('CityTown') ?? this.findAddressElement('City');
  }
  get countryCode() {
    return this.findAddressElement('NationalCode')?.toUpperCase();
  }
  findElementText(type: string) {
    const el = this.nameplate.submodelElements?.find(
      (sme: any) => (sme.idShort as string).toLowerCase() === type.toLowerCase(),
    )?.value;
    const userLang = this.currentLang;

    if (el != null) {
      try {
        let found = el.find((e: any) => e.language.toLowerCase() === userLang.toLowerCase());
        if (found != null) {
          return found.text;
        }
        found = el.find((e: any) => e.language.toLowerCase() === 'en');
        if (found != null) {
          return found.text;
        }
        found = el[0];
        if (found != null) {
          return found.text;
        }
      } catch {
        return el;
      }
    }
    return '';
  }

  findAddressElement(type: string) {
    let addr = this.nameplate.submodelElements?.find(
      (sme: any) => (sme.idShort as string) === 'Address'.toLowerCase(),
    )?.value;
    const userLang = this.currentLang;

    if (addr == null) {
      addr = this.nameplate.submodelElements?.find((sme: any) =>
        (sme.idShort as string).toLowerCase().startsWith('PhysicalAddress'.toLowerCase()),
      )?.value;
    }

    const el = addr?.find((sme: any) => (sme.idShort as string).toLowerCase() === type.toLowerCase())?.value;

    if (el != null) {
      try {
        let found = el.find((e: any) => e.language.toLowerCase() === userLang.toLowerCase());
        if (found != null) {
          return found.text;
        }

        found = el.find((e: any) => e.language.toLowerCase() === 'en');
        if (found != null) {
          return found.text;
        }

        found = el[0];
        if (found != null) {
          return found.text;
        }
      } catch {
        return el;
      }
    }
    return '';
  }

  getMarkingText(marking: any, type: string) {
    return marking.value?.find((sme: any) => (sme.idShort as string).toLowerCase() === type.toLowerCase())?.value ?? '';
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
