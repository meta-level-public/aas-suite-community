import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { Component, inject, Input, OnChanges, signal } from '@angular/core';
import { LanguageIsoMap, LanguageService } from '@aas/aas-designer-shared';
import { PortalService } from '@aas/common-services';
@Component({
  selector: 'aas-v3-lang-string-display',
  templateUrl: './v3-lang-string-display.component.html',
})
export class V3LangStringDisplayComponent implements OnChanges {
  @Input({ required: true }) langStrings: aas.types.LangStringTextType[] | null | undefined;
  @Input({ required: true }) langStringParent: any;
  @Input({ required: true }) langStringParentPropertyName: string = '';
  @Input() removeBlockAllowed: boolean = true;

  isoLanguages: LanguageIsoMap[] = [];

  portalService = inject(PortalService);
  entry = signal<aas.types.LangStringTextType | null>(null);

  constructor(private languageService: LanguageService) {}

  ngOnChanges() {
    this.isoLanguages = this.languageService.getLanguageNamesAndIsoAlpha2();
    let currentEntry = this.langStrings?.find((d) => d.language === this.portalService.currentLanguage);
    if (currentEntry == null) {
      currentEntry = this.langStrings?.find((d) => d.language === 'en');
      if (currentEntry == null) {
        currentEntry = this.langStrings?.[0];
      }
    }
    this.entry.set(currentEntry ?? null);
  }
}
