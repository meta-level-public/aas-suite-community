import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { ISubmodelElement } from '@aas-core-works/aas-core3.1-typescript/types';
import { HelpLabelComponent } from '@aas/common-components';
import { Component, Input } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputText } from 'primeng/inputtext';

@Component({
  selector: 'aas-article-information-viewer',
  templateUrl: './article-information-viewer.component.html',
  styleUrls: ['./article-information-viewer.component.css'],
  imports: [InputGroup, InputGroupAddon, InputText, TranslateModule, HelpLabelComponent],
})
export class ArticleInformationViewerComponent {
  @Input({ required: true }) submodel: aas.types.Submodel | undefined;
  @Input({ required: true }) currentLang = 'de';

  constructor(private translate: TranslateService) {
    translate.onLangChange.subscribe((lang: any) => {
      this.currentLang = lang.lang;
    });
  }

  get identifyingOrderNumber() {
    return this.findElementText('IdentifyingOrderNumber', '0173-1#02-AAO689#001');
  }

  get productDescription() {
    return this.findElementText('ProductDescription', '0173-1#02-AAO240#002');
  }

  get productGroup() {
    return this.findElementText('ManufacturerProductFamily', '0173-1#02-AAV283#001');
  }

  get unitOfContent() {
    return this.findElementText('UnitOfContent', '0173-1#02-AAO250#002');
  }

  get weight() {
    return this.findElementText('Weight', '0173-1#02-AAB713#006');
  }

  get grossWeight() {
    return this.findElementText('GrossWeight', '0173-1#02-BAF368#004');
  }

  findElementText(type: string, semanticId: string) {
    const el = this.submodel?.submodelElements?.find(
      (sme: any) => (sme.idShort as string).toLowerCase() === type.toLowerCase() || this.hasSemanticId(sme, semanticId),
    ) as any;
    const userLang = this.currentLang;

    if (typeof el.value === 'string') {
      const unit = this.getUnit(el);
      return el.value + ' ' + unit;
    }

    if (el != null) {
      let found = el.value?.find((e: any) => e.language.toLowerCase() === userLang.toLowerCase());
      if (found != null) {
        const unit = this.getUnit(found);
        return found.text + ' ' + unit;
      }
      found = el.value?.find((e: any) => e.language.toLowerCase() === 'en');
      if (found != null) {
        const unit = this.getUnit(found);
        return found.text + ' ' + unit;
      }
      found = el[0];
      if (found != null) {
        const unit = this.getUnit(found);
        return found.text + ' ' + unit;
      }
    }
    return '';
  }
  hasSemanticId(sme: aas.types.ISubmodelElement, semanticId: string) {
    return sme.semanticId?.keys.find((k) => k.value.trim() === semanticId) != null;
  }

  getUnit(property: ISubmodelElement) {
    const found = property.embeddedDataSpecifications?.find(
      (eds) => (eds.dataSpecificationContent as any).unit != null,
    );
    return (found?.dataSpecificationContent as any)?.unit ?? '';
  }
}
