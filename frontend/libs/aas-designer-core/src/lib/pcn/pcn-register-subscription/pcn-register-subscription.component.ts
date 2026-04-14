import { Component, inject, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { HelpLabelComponent } from '@aas/common-components';
import { NotificationService } from '@aas/common-services';
import { PcnClient, PcnRegistrationRequest } from '@aas/webapi-client';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'aas-pcn-register-subscription',
  imports: [
    TranslateModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    PasswordModule,
    HelpLabelComponent,
  ],
  templateUrl: './pcn-register-subscription.component.html',
})
export class PcnRegisterSubscriptionComponent {
  brokerUrls = model<string[]>([]);
  pcnBrokerUrl = model('');
  pcnBrokerTopic = model('');

  pcnBrokerUsername = model('');
  pcnBrokerPassword = model('');

  loading = signal(false);

  aasIdentifier = model('');

  pcnClient = inject(PcnClient);
  notificationService = inject(NotificationService);

  config = inject(DynamicDialogConfig);
  ref = inject(DynamicDialogRef);

  constructor() {
    this.aasIdentifier.set(this.config.data.aasIdentifier);
    this.brokerUrls.set(this.config.data.brokerUrls);
    this.pcnBrokerTopic.set(this.config.data.topic);
  }

  async registerPcn() {
    try {
      this.loading.set(true);
      const request = new PcnRegistrationRequest();
      request.aasIdentifier = this.aasIdentifier();
      request.brokerUrl = this.pcnBrokerUrl();
      request.topic = this.pcnBrokerTopic() ?? '';
      request.username = this.pcnBrokerUsername();
      request.password = this.pcnBrokerPassword();
      const res = await lastValueFrom(this.pcnClient.pcn_RegisterForPcnNotification(request));
      if (res) {
        this.notificationService.showMessageAlways(
          'PCN_NOTIFICATION_REGISTRATION_SUCCESS',
          'SUCCESS',
          'success',
          false,
        );
        this.ref.close();
      }
    } finally {
      this.loading.set(false);
    }
  }
}
