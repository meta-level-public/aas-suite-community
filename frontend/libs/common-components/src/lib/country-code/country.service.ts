import { PortalService } from '@aas/common-services';
import { Injectable } from '@angular/core';
import { getAlpha2Codes, getName, registerLocale } from 'i18n-iso-countries';
import de from 'i18n-iso-countries/langs/de.json';
import en from 'i18n-iso-countries/langs/en.json';

@Injectable({
  providedIn: 'root',
})
export class CountryService {
  userLanguage: string;
  constructor(private portalService: PortalService) {
    registerLocale(de);
    registerLocale(en);
    this.userLanguage = this.portalService.getLanguage();
  }

  getAllCountriesAsIsoAlpha2() {
    return Object.keys(getAlpha2Codes())
      .map((l) => l.toLowerCase())
      .sort((a, b) => a.localeCompare(b, this.userLanguage));
  }

  getCountryName(iso2Code: string, lang: string = this.userLanguage) {
    return getName(iso2Code, lang);
  }

  getCountryNamesAndIsoAlpha2(lang: string = this.userLanguage): CountryIsoMap[] {
    return this.getAllCountriesAsIsoAlpha2()
      .map((i) => {
        return { iso2Code: i, countryName: this.getCountryName(i, lang) } as CountryIsoMap;
      })
      .sort((a, b) => a.countryName.localeCompare(b.countryName, this.portalService.getLanguage()));
  }
}

export type CountryIsoMap = { iso2Code: string; countryName: string };
