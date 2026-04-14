import { PortalService } from '@aas/common-services';
import { Injectable } from '@angular/core';
import { getAlpha2Codes, getName, registerLocale } from '@cospired/i18n-iso-languages';
import de from '@cospired/i18n-iso-languages/langs/de.json';
import en from '@cospired/i18n-iso-languages/langs/en.json';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  userLanguage: string;
  constructor(
    private portalService: PortalService,
    private translate: TranslateService,
  ) {
    registerLocale(de);
    registerLocale(en);
    this.userLanguage = this.portalService.getLanguage();
    this.translate.onLangChange.subscribe((lang) => (this.userLanguage = lang.lang));
  }

  getAllLanguagesAsIsoAlpha2() {
    return Object.keys(getAlpha2Codes())
      .map((l) => l.toLowerCase())
      .sort((a, b) => a.localeCompare(b, this.userLanguage));
  }

  getLanguageName(iso2Code: string, lang: string = this.userLanguage) {
    return getName(iso2Code, lang);
  }

  getLanguageNamesAndIsoAlpha2(lang: string = this.userLanguage): LanguageIsoMap[] {
    return this.getAllLanguagesAsIsoAlpha2()
      .map((i) => {
        return {
          iso2Code: i,
          languageName: this.getLanguageName(i, lang),
        } as LanguageIsoMap;
      })
      .sort((a, b) => a.languageName.localeCompare(b.languageName, this.portalService.getLanguage()));
  }
}

export type LanguageIsoMap = { iso2Code: string; languageName: string; disabled?: boolean };
