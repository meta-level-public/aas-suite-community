import { Component, Input, model, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AasEmailValidator } from '@aas/common-components';
import { AutocompleteOffDirective } from '@aas/helpers';
import { emailRegEx } from '@aas/model';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { RequestData } from '../model/request-data';

@Component({
  selector: 'aas-contact-message',
  templateUrl: './contact-message.component.html',
  imports: [FormsModule, AutocompleteOffDirective, InputText, Textarea, TranslateModule],
})
export class ContactMessageComponent {
  @Input() request: RequestData | null = null;
  @ViewChild('registerForm') registerForm: NgForm | null = null;
  emailRegEx = emailRegEx;

  invisibleFieldValue = model<string | null>(null);
  formLoadTime = Date.now();
  formStatus: string | null = null;

  get valid() {
    return (this.registerForm?.valid && this.isValidEmail(this.request?.email ?? '')) ?? false;
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
