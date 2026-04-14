import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { ISubmodelElement } from '@aas-core-works/aas-core3.1-typescript/types';
import { SubmodelElementUtil } from '@aas/helpers';
import { Component, inject, Input, OnChanges, OnDestroy } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { GenericViewerComponent } from '../../../generic-viewer/generic-viewer.component';

@Component({
  selector: 'aas-general-information',
  templateUrl: './general-information.component.html',
  imports: [GenericViewerComponent],
})
export class GeneralInformationComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) generalInformation: aas.types.SubmodelElementCollection | undefined;
  @Input() currentLang = 'de';
  @Input({ required: true }) submodelIdentifier = '';

  responsiveOptions: any[] | undefined;
  productImages: aas.types.Property[] = [];

  files: Map<string, SafeUrl> = new Map<string, SafeUrl>();
  fileUrl: string = '';
  values: { label: string; value: string }[] = [];

  translate = inject(TranslateService);
  subscriptions: Subscription[] = [];

  constructor() {
    this.subscriptions.push(
      this.translate.onLangChange.subscribe((event) => {
        this.currentLang = event.lang;
      }),
    );
    this.currentLang = this.translate.currentLang;
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }
  ngOnChanges(): void {
    if (this.generalInformation != null) {
      this.initValues();
    }
  }

  getLabel(element: ISubmodelElement) {
    return SubmodelElementUtil.getLabel(element, this.currentLang);
  }

  initValues() {
    this.values = [];
    this.generalInformation?.value?.forEach((sme: aas.types.ISubmodelElement) => {
      const valueEl: any = {
        label: sme.idShort,
        value: this.getValue(sme),
        smeIdShortPath: 'GeneralInformation.' + sme.idShort,
      };
      if (sme instanceof aas.types.File) {
        valueEl.isFile = true;
        this.loadFile(sme, valueEl);
      }
      this.values.push(valueEl);
    });
  }

  getValue(sme: aas.types.ISubmodelElement) {
    if (sme instanceof aas.types.Property) {
      return sme.value;
    } else if (sme instanceof aas.types.MultiLanguageProperty) {
      const found = sme.value?.find((e: any) => e.language.toLowerCase() === this.currentLang.toLowerCase());
      if (found != null) {
        return found.text ?? '';
      }

      const foundEn = sme.value?.find((e: any) => e.language.toLowerCase() === 'en');
      if (foundEn != null) {
        return foundEn.text ?? '';
      }

      return sme.value?.[0].text ?? '';
    }

    return '';
  }

  async loadFile(_fileElement: aas.types.File, _valueEl: any) {
    try {
      // valueEl.isPreviewable = FilenameHelper.isPreviewable(fileElement.value);
      // if (fileElement.value?.startsWith('http')) {
      //   valueEl.fileData = fileElement.value;
      // } else {
      //   const submodelIdentifier = EncodingService.base64urlEncode(this.submodelIdentifier);
      //   const path = 'GeneralInformation.' + (fileElement.idShort ?? '');
      //   let headers = new HttpHeaders();
      //   if (this.httpHeader != null) {
      //     this.httpHeader.forEach((p: any) => {
      //       headers = headers.set(p.key, p.value);
      //     });
      //   }
      //   const url = `${this.registry}${!this.registry.endsWith('/') ? '/' : ''}submodels/${submodelIdentifier}/submodel-elements/${path}/attachment`;
      //   const response = await lastValueFrom(
      //     this.http.get<any>(url, {
      //       responseType: 'blob' as any,
      //       observe: 'response',
      //     }),
      //   );
      //   valueEl.fileData = URL.createObjectURL(response.body);
      // }
    } catch {
      // ignore
    }
  }

  getLabelTag(idShort: string) {
    switch (idShort) {
      case 'ManufacturerName':
        return 'MANUFACTURER';
      case 'ManufacturerLogo':
        return 'LOGO';
      case 'ManufacturerProductDesignation':
        return 'MANUFACTURER_PRODUCT_DESIGNATION';
      case 'ManufacturerArticleNumber':
        return 'MANUFACTURER_PRODUCT_ARTICLE_NUMBER';
      case 'ManufacturerOrderCode':
        return 'MANUFACTURER_ORDER_CODE';
    }
    if (idShort.startsWith('ProductImage')) {
      return 'PRODUCT_IMAGE';
    }
    return idShort;
  }
}
