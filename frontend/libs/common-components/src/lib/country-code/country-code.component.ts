import { PortalService } from '@aas/common-services';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SelectModule } from 'primeng/select';
import { CountryIsoMap, CountryService } from './country.service';

@Component({
  selector: 'aas-country-code',
  templateUrl: './country-code.component.html',
  imports: [FormsModule, TranslateModule, SelectModule],
})
export class CountryCodeComponent implements OnInit {
  @Output() selectedCountry = new EventEmitter<string>();
  @Input() preSelectedCountry: string = '';
  @Input() inputId: string = '';
  @Input() isRequired: boolean = false;
  userLang: string;
  countries: CountryIsoMap[] = [];
  countryService: CountryService = inject(CountryService);
  portalService: PortalService = inject(PortalService);

  constructor() {
    this.userLang = this.portalService.getLanguage();

    if (this.preSelectedCountry === '') {
      this.preSelectedCountry = this.userLang;
    }
  }

  ngOnInit(): void {
    this.countries = this.countryService.getCountryNamesAndIsoAlpha2(this.userLang);
  }

  setElectedCountry(event: string) {
    this.selectedCountry.emit(event);
  }
}
