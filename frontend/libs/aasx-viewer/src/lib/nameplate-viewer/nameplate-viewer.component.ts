import { Component, Input, OnChanges } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { PrimeTemplate } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { AasxViewerService } from '../aasx-viewer.service';

import { TranslateModule } from '@ngx-translate/core';
import { MarkingsViewerComponent } from '../markings-viewer/markings-viewer.component';

@Component({
  selector: 'aas-aasx-nameplate-viewer',
  templateUrl: './nameplate-viewer.component.html',
  imports: [TableModule, PrimeTemplate, MarkingsViewerComponent, TranslateModule],
})
export class NameplateViewerComponent implements OnChanges {
  @Input() nameplate: any;
  @Input() currentLang = 'de';
  @Input() aasId = 0;
  @Input() apiUrl = '/api';

  markings: any[] = [];
  files: Map<string, SafeUrl> = new Map<string, SafeUrl>();

  constructor(
    private sanitizer: DomSanitizer,
    private aasxViewerService: AasxViewerService,
  ) {}

  ngOnChanges(): void {
    this.init();
  }

  init() {
    this.markings = [];
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
    return this.findAddressElement('CityTown');
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
    }
    return '';
  }

  findAddressElement(type: string) {
    let addr = this.nameplate.submodelElements?.find((sme: any) =>
      (sme.idShort as string).toLowerCase().startsWith('address'),
    )?.value;
    if (addr == null) {
      addr = this.nameplate.submodelElements?.find((sme: any) =>
        (sme.idShort as string).toLowerCase().startsWith('contactinformation'),
      )?.value;
    }
    const userLang = this.currentLang;
    const el = addr.find((sme: any) => (sme.idShort as string).toLowerCase() === type.toLowerCase())?.value;

    if (el != null) {
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
    }
    return '';
  }

  getMarkingText(marking: any, type: string) {
    return marking.value?.find((sme: any) => sme.idShort === type)?.value ?? '';
  }

  async loadFile(marking: any) {
    const filename = this.getMarkingText(marking, 'MarkingFile');
    if (filename != null && filename !== '' && this.aasId !== 0) {
      const fileData = await this.aasxViewerService.getFile(this.aasId, filename, this.apiUrl);
      if (fileData != null)
        this.files.set(filename, this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(fileData)));
    }
  }
}
