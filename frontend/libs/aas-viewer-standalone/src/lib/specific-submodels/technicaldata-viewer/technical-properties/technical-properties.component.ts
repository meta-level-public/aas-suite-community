import { ISubmodelElement, SubmodelElementCollection } from '@aas-core-works/aas-core3.1-typescript/types';
import { SubmodelElementUtil } from '@aas/helpers';
import { Component, inject, Input, OnChanges, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { GenericViewerComponent } from '../../../generic-viewer/generic-viewer.component';

@Component({
  selector: 'aas-technical-properties',
  templateUrl: './technical-properties.component.html',
  imports: [GenericViewerComponent],
})
export class TechnicalPropertiesComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) technicalProperties: SubmodelElementCollection | undefined;
  @Input({ required: true }) submodelId: string = '';
  @Input({ required: true }) idShortPath: string = '';
  @Input() currentLang = 'de';

  responsiveOptions: any[] | undefined;
  elementsWithDefinedSemanticId: ISubmodelElement[] = [];
  elementsWithUndefinedSemanticId: ISubmodelElement[] = [];
  mainSections: ISubmodelElement[] = [];
  subSections: ISubmodelElement[] = [];

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
    this.initDefinedElements();
    this.initUndefinedElements();
    this.initMainSection();
    this.initSubSection();
  }

  getLabel(element: ISubmodelElement) {
    return SubmodelElementUtil.getLabel(element, this.currentLang);
  }

  initUndefinedElements() {
    this.elementsWithUndefinedSemanticId =
      this.technicalProperties?.value?.filter((sme) =>
        sme.semanticId?.keys.find((k) =>
          k.value.trim().startsWith('https://admin-shell.io/SemanticIdNotAvailable/1/1'),
        ),
      ) ?? [];
  }

  initDefinedElements() {
    this.elementsWithDefinedSemanticId =
      this.technicalProperties?.value?.filter(
        (sme) =>
          sme.semanticId?.keys.find(
            (k) =>
              !k.value.trim().startsWith('https://admin-shell.io/SemanticIdNotAvailable/1/1') &&
              !k.value.trim().startsWith('https://admin-shell.io/ZVEI/TechnicalData/MainSection/1/1') &&
              !k.value.trim().startsWith('https://admin-shell.io/ZVEI/TechnicalData/SubSection/1/1'),
          ) ||
          sme.semanticId?.keys.length === 0 ||
          sme.semanticId?.keys == null,
      ) ?? [];
  }

  initMainSection() {
    this.mainSections =
      this.technicalProperties?.value?.filter((sme) =>
        sme.semanticId?.keys.find((k) =>
          k.value.trim().startsWith('https://admin-shell.io/ZVEI/TechnicalData/MainSection/1/1'),
        ),
      ) ?? [];
  }

  initSubSection() {
    this.subSections =
      this.technicalProperties?.value?.filter((sme) =>
        sme.semanticId?.keys.find((k) =>
          k.value.trim().startsWith('https://admin-shell.io/ZVEI/TechnicalData/SubSection/1/1'),
        ),
      ) ?? [];
  }
}
