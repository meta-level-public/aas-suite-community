import { PaymentModel } from '@aas-designer-model';
import { AppConfigService, PortalService } from '@aas/common-services';
import { emailRegEx } from '@aas/model';
import { Component, Input, model, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ContactService } from '../contact.service';

import { AasEmailValidator, CountryCodeComponent } from '@aas/common-components';
import { AutocompleteOffDirective } from '@aas/helpers';
import { TranslateModule } from '@ngx-translate/core';
import { Checkbox } from 'primeng/checkbox';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { RequestData } from '../model/request-data';

@Component({
  selector: 'aas-contact-register-form',
  templateUrl: './contact-register-form.component.html',
  imports: [
    FormsModule,
    AutocompleteOffDirective,
    InputText,
    CountryCodeComponent,
    Textarea,
    Checkbox,
    TranslateModule,
  ],
})
export class ContactRegisterFormComponent implements OnInit {
  @Input() request: RequestData | null = null;
  @ViewChild('registerForm') registerForm: NgForm | null = null;
  emailRegEx = emailRegEx;

  privacy: boolean = false;
  agb: boolean = false;
  contact: boolean = false;
  paymentModelOptions: PaymentModel[] = [];
  selectedPaymentModel: PaymentModel | null = null;
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
  }

  async loadData() {
    this.paymentModelOptions = await this.contactService.getAlPaymentModels();
  }

  setCountryCode(countryCode: string) {
    if (this.request?.organisation) this.request.organisation.laenderCode = countryCode;
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

  get valid() {
    return (
      (this.agb === true &&
        this.contact === true &&
        this.privacy === true &&
        this.registerForm?.valid &&
        this.isValidEmail(this.request?.organisation?.email ?? '') &&
        this.invisibleFieldValue != null &&
        this.isValidEmail(this.request?.admin?.email ?? '')) ??
      false
    );
  }

  lizenzChanged() {
    if (this.request) this.request.lizenz = this.selectedPaymentModel?.name ?? '';
  }

  isValidEmail(email: string) {
    return AasEmailValidator.isValidEmail(email);
  }
}
