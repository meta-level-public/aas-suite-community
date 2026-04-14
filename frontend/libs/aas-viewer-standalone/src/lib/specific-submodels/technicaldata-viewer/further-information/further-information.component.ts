import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { ISubmodelElement } from '@aas-core-works/aas-core3.1-typescript/types';
import { Component, inject, Input, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SubmodelElementUtil } from '@aas/helpers';
import { Subscription } from 'rxjs';
import { GenericViewerComponent } from '../../../generic-viewer/generic-viewer.component';

@Component({
  selector: 'aas-further-information',
  templateUrl: './further-information.component.html',
  imports: [GenericViewerComponent],
})
export class FurtherInformationComponent implements OnDestroy {
  @Input({ required: true }) furtherInformation: aas.types.SubmodelElementCollection | undefined;
  @Input() currentLang = 'de';
  @Input() aasId = 0;
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
  classifications: aas.types.SubmodelElementCollection[] = [];

  isMlp(el: any) {
    return el instanceof aas.types.MultiLanguageProperty;
  }

  isDate(el: aas.types.ISubmodelElement) {
    if (el.idShort === 'ValidDate') return true;
    return (
      el.semanticId?.keys.find((k) => k.value.trim() === 'https://admin-shell.io/ZVEI/TechnicalData/ValidDate/1/1') !=
      null
    );
  }
  getLabel(element: ISubmodelElement) {
    return SubmodelElementUtil.getLabel(element, this.currentLang);
  }
}
