import { Benutzer, Organisation } from '@aas-designer-model';
import { NotificationService } from '@aas/common-services';
import { AutocompleteOffDirective } from '@aas/helpers';
import { Component, effect, input, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PrimeTemplate } from 'primeng/api';
import { Button } from 'primeng/button';
import { Select } from 'primeng/select';
import { DragCaptchaComponent } from '../captcha/drag-captcha.component';
import { ContactMessageComponent } from '../contact-message/contact-message.component';
import { ContactRegisterFormComponent } from '../contact-register-form/contact-register-form.component';
import { ContactRequestOfferComponent } from '../contact-request-offer/contact-request-offer.component';
import { ContactService } from '../contact.service';
import { RequestData } from '../model/request-data';
import { RequestForOffer } from '../model/request-for-offer';

@Component({
  selector: 'aas-contact-form',
  templateUrl: './contact-form.component.html',
  styleUrls: ['../../host.scss'],
  imports: [
    FormsModule,
    AutocompleteOffDirective,
    Select,
    PrimeTemplate,
    ContactMessageComponent,
    ContactRegisterFormComponent,
    ContactRequestOfferComponent,
    DragCaptchaComponent,
    Button,
    TranslateModule,
  ],
})
export class ContactFormComponent {
  @ViewChild('registerform') registerform: ContactRegisterFormComponent | null = null;
  @ViewChild('messageform') messageform: ContactMessageComponent | null = null;
  @ViewChild('offerform') offerform: ContactRequestOfferComponent | null = null;
  @ViewChild('captcha') captcha: DragCaptchaComponent | null = null;
  topicOptions: { key: string; label: string }[] = [];
  selectedTopic: { key: string; label: string } | null = null;
  request: RequestData = new RequestData();
  loading: boolean = false;
  topic = input.required<'other' | 'register'>();

  constructor(
    private translate: TranslateService,
    private contactService: ContactService,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
  ) {
    this.topicOptions = [
      { key: 'Registrierung', label: 'REGISTER' },
      { key: 'Angebotsanfrage', label: 'REQUEST_OFFER' },
      { key: 'other', label: 'OTHER' },
    ];
  }

  topicEffect = effect(() => {
    if (this.topic() === 'register') {
      queueMicrotask(() => {
        this.selectedTopic = this.topicOptions[0];
        this.topicChanged();
      });
    } else {
      this.selectedTopic = this.topicOptions[2];
      this.topicChanged();
    }
  });

  topicChanged() {
    if (this.selectedTopic) {
      this.request.topic = this.selectedTopic.key;
      if (this.selectedTopic.key === 'Registrierung') {
        this.request.organisation = new Organisation();
        this.request.admin = {} as Benutzer;
        this.request.lizenz = '';
        this.request.requestForOffer = null;
      } else if (this.selectedTopic.key === 'Angebotsanfrage') {
        this.request.organisation = null;
        this.request.admin = null;
        this.request.requestForOffer = new RequestForOffer();
        this.request.requestForOffer.organisation = new Organisation();
      } else {
        this.request.organisation = null;
        this.request.admin = null;
        this.request.requestForOffer = null;
      }
    } else {
      this.request.topic = '';
    }
  }

  get registerformValid() {
    return this.registerform == null || this.registerform?.valid;
  }

  get messageformValid() {
    return this.messageform == null || this.messageform?.valid;
  }
  get offerFormValid() {
    return this.offerform == null || this.offerform?.valid;
  }

  async send() {
    if (this.request != null) {
      if (this.captcha != null && !this.captcha.verified()) {
        this.notificationService.showMessageAlways('BOT_CHECK_FAILED', 'ERROR', 'error', false);
        return;
      }
      if (this.registerform != null && this.registerform.botCheck() != null) {
        this.notificationService.showMessageAlways('BOT_CHECK_FAILED', 'ERROR', 'error', false);
        return;
      }
      if (this.offerform != null && this.offerform.botCheck() != null) {
        this.notificationService.showMessageAlways('BOT_CHECK_FAILED', 'ERROR', 'error', false);
        return;
      }
      if (this.messageform != null && this.messageform.botCheck() != null) {
        this.notificationService.showMessageAlways('BOT_CHECK_FAILED', 'ERROR', 'error', false);
        return;
      }
      try {
        // this.loading = true;
        this.request.selectedLanguage = this.translate.currentLang;
        const result = await this.contactService.sendMessage(this.request);
        if (result.isSuccess) {
          this.request = new RequestData();
          this.notificationService.showMessageAlways('MESSAGE_HAS_BEEN_SENT', 'SUCCESS', 'success', false);
          this.selectedTopic = null;
        } else {
          if (result.contactResultStatus === 'OrganisationDomainAlreadyExists') {
            const domain = this.request.organisation?.email.split('@')[1];
            const translatedMessage = this.translate.instant('ORGANISATION_DOMAIN_ALREADY_EXISTS', { domain });
            this.notificationService.showMessageAlways(translatedMessage, 'ERROR', 'error', true);
          } else {
            this.notificationService.showMessageAlways('MESSAGE_HAS_NOT_BEEN_SENT', 'ERROR', 'error', false);
          }
        }
      } catch (_error) {
        this.notificationService.showMessageAlways('MESSAGE_HAS_NOT_BEEN_SENT', 'ERROR', 'error', false, 10000);
      } finally {
        this.captcha?.reset();
        this.loading = false;
      }
    }
  }
}
