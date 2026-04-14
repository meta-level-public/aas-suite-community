import { PaymentModel } from '@aas-designer-model';
import { AppConfigService, PortalService } from '@aas/common-services';
import { emailRegEx } from '@aas/model';
import { Component, Input, model, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ContactService } from '../contact.service';

import { AasEmailValidator, CountryCodeComponent } from '@aas/common-components';
import { AutocompleteOffDirective } from '@aas/helpers';
import { TranslateModule } from '@ngx-translate/core';
import { PrimeTemplate } from 'primeng/api';
import { Checkbox } from 'primeng/checkbox';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';
import { RequestData } from '../model/request-data';

@Component({
  selector: 'aas-contact-request-offer',
  templateUrl: './contact-request-offer.component.html',
  imports: [
    FormsModule,
    AutocompleteOffDirective,
    InputText,
    CountryCodeComponent,
    Select,
    PrimeTemplate,
    Textarea,
    Checkbox,
    TranslateModule,
  ],
})
export class ContactRequestOfferComponent implements OnInit {
  @Input() request: RequestData | null = null;
  @ViewChild('offerForm') offerForm: NgForm | null = null;
  emailRegEx = emailRegEx;

  privacy: boolean = false;
  agb: boolean = false;
  contact: boolean = false;
  paymentModelOptions: PaymentModel[] = [];
  selectedPaymentModel: PaymentModel | null = null;
  paymentPeriodOptions: { value: string; label: string }[] = [];
  numberOfLicencesOptions: { value: string; label: string; price: number }[] = [];
  selectedNumberOfLicences: { value: string; label: string; price: number } | undefined;
  selectedPaymentPeriod: { value: 'MONTHLY' | 'YEARLY'; label: string } | undefined;
  invisibleFieldValue = model<string | null>(null);
  formLoadTime = Date.now();
  formStatus: string | null = null;

  constructor(
    private contactService: ContactService,
    public portalService: PortalService,
    public appConfigService: AppConfigService,
  ) {}

  ngOnInit() {
    this.loadData();
    this.paymentPeriodOptions = [
      { value: 'MONTHLY', label: 'MONTHLY' },
      { value: 'YEARLY', label: 'YEARLY_DISCOUNT' },
    ];
    this.numberOfLicencesOptions = [
      { value: '1', label: '1', price: 50 },
      { value: '1-5', label: '1-5', price: 199 },
      { value: '1-10', label: '1-10', price: 348 },
      { value: '1-15', label: '1-15', price: 497 },
      { value: '', label: 'INDIVIDUAL', price: 0 },
    ];
  }

  async loadData() {
    this.paymentModelOptions = await this.contactService.getAlPaymentModels();
  }

  setCountryCode(countryCode: string) {
    if (this.request?.requestForOffer?.organisation)
      this.request.requestForOffer.organisation.laenderCode = countryCode;
  }

  get valid() {
    return (
      (this.agb === true &&
        this.contact &&
        this.privacy === true &&
        this.offerForm?.valid &&
        this.isValidEmail(this.request?.requestForOffer?.organisation?.email ?? '') &&
        this.isValidEmail(this.request?.requestForOffer?.email ?? '')) ??
      false
    );
  }

  lizenzChanged() {
    if (this.request) this.request.lizenz = this.selectedPaymentModel?.name ?? '';
  }

  numberOfLicencesChanged() {
    if (this.request?.requestForOffer && this.selectedNumberOfLicences) {
      this.request.requestForOffer.numberOfLicences = this.selectedNumberOfLicences.value;
      this.request.requestForOffer.price = this.selectedNumberOfLicences.price;
    }
  }
  paymentPeriodChanged() {
    if (this.request?.requestForOffer && this.selectedPaymentPeriod) {
      this.request.requestForOffer.paymentPeriod = this.selectedPaymentPeriod.value;
    }
  }

  isValidEmail(email: string) {
    return AasEmailValidator.isValidEmail(email);
  }

  botCheck() {
    const elapsed = Date.now() - this.formLoadTime;
    if (elapsed < 2000) {
      this.formStatus = 'botCheckFailed_timing';
      return;
    }
    if (this.invisibleFieldValue()) {
      this.formStatus = 'botCheckFailed_honeypot';
      return;
    }

    this.formStatus = null;
  }
}
