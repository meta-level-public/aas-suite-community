import { ISubmodelElement, Property, SubmodelElementCollection } from '@aas-core-works/aas-core3.1-typescript/types';
import { SubmodelElementUtil } from '@aas/helpers';
import { Component, inject, Input, OnChanges, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { GenericViewerComponent } from '../../../generic-viewer/generic-viewer.component';

@Component({
  selector: 'aas-product-classification',
  templateUrl: './product-classification.component.html',
  imports: [GenericViewerComponent],
})
export class ProductClassificationComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) productClassification: SubmodelElementCollection | undefined;
  @Input() currentLang = 'de';

  classifications: SubmodelElementCollection[] = [];
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
    if (this.productClassification != null) {
      this.classifications =
        (this.productClassification?.value?.filter((sme: ISubmodelElement) =>
          sme.semanticId?.keys.find(
            (k) => k.value.trim() === 'https://admin-shell.io/ZVEI/TechnicalData/ProductClassificationItem/1/1',
          ),
        ) as SubmodelElementCollection[]) ?? [];
    }
  }

  getLabel(element: ISubmodelElement) {
    return SubmodelElementUtil.getLabel(element, this.currentLang);
  }

  getClassificationSystem(classification: SubmodelElementCollection) {
    let val = classification?.value?.find((sme: any) => sme.idShort === 'ProductClassificationSystem');
    if (val == null) {
      val = classification?.value?.find((sme: ISubmodelElement) =>
        sme.semanticId?.keys.find(
          (k) => k.value.trim() === 'https://admin-shell.io/ZVEI/TechnicalData/ProductClassificationSystem/1/1',
        ),
      );
    }
    return (val as Property)?.value ?? '';
  }

  getClassId(classification: SubmodelElementCollection) {
    let val = classification?.value?.find((sme: any) => sme.idShort === 'ProductClassId');
    if (val == null) {
      val = classification?.value?.find((sme: ISubmodelElement) =>
        sme.semanticId?.keys.find(
          (k) => k.value.trim() === 'https://admin-shell.io/ZVEI/TechnicalData/ProductClassId/1/1',
        ),
      );
    }
    return (val as Property)?.value ?? '';
  }

  getClassificationSystemVersion(classification: SubmodelElementCollection) {
    let val = classification?.value?.find((sme: any) => sme.idShort === 'ClassificationSystemVersion');
    if (val == null) {
      val = classification?.value?.find((sme: ISubmodelElement) =>
        sme.semanticId?.keys.find(
          (k) => k.value.trim() === 'https://admin- shell.io/ZVEI/TechnicalData/ClassificationSystemVersion/1/ 1',
        ),
      );
    }
    return (val as Property)?.value ?? '';
  }
}
