import { HelpLabelComponent } from '@aas/common-components';
import { AasConfirmationService, NotificationService } from '@aas/common-services';
import { PcnClient, PcnRegistrationRequest } from '@aas/webapi-client';
import { CommonModule } from '@angular/common';
import { Component, computed, inject, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { ToolbarModule } from 'primeng/toolbar';
import { lastValueFrom } from 'rxjs';
import { V3EditorDataStoreService } from '../../../v3-editor-data-store.service';
import { PcnStateStoreService } from '../pcn-state-store.service';

@Component({
  selector: 'aas-pcn-receiving',
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    MessageModule,
    ButtonModule,
    HelpLabelComponent,
    PasswordModule,
    InputTextModule,
    SelectModule,
    ToolbarModule,
  ],
  templateUrl: './pcn-receiving.component.html',
})
export class PcnReceivingComponent {
  pcnStateStore = inject(PcnStateStoreService);
  pcnClient = inject(PcnClient);
  editorDataStore = inject(V3EditorDataStoreService);
  notificationService = inject(NotificationService);
  confirmService = inject(AasConfirmationService);
  translate = inject(TranslateService);

  pcnBrokerUrl = model('');
  pcnBrokerTopic = model(this.pcnStateStore.pcnBrokerTopic());

  pcnBrokerUsername = model('');
  pcnBrokerPassword = model('');

  loading = signal(false);
  reloadTrigger = signal(0);

  aasIdentifier = computed(() => {
    return this.editorDataStore.editorDescriptor()?.aasDescriptorEntry?.newId ?? '';
  });

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
        this.reloadTrigger.set(this.reloadTrigger() + 1);
        this.pcnStateStore.reloadPcnInfoTrigger.set(this.pcnStateStore.reloadPcnInfoTrigger() + 1);
      }
    } finally {
      this.loading.set(false);
    }
  }

  async deletePcn() {
    if (await this.confirmService.confirm({ message: this.translate.instant('DELETE_PCN_Q') })) {
      const id = this.pcnStateStore.pcnInfos()?.id;
      if (id != null) {
        try {
          this.loading.set(true);
          const _res = await lastValueFrom(this.pcnClient.pcn_DeletePcnNotification(id));
          this.reloadTrigger.set(this.reloadTrigger() + 1);
          this.pcnStateStore.reloadPcnInfoTrigger.set(this.pcnStateStore.reloadPcnInfoTrigger() + 1);
          this.notificationService.showMessageAlways('PCN_NOTIFICATION_DELETION_SUCCESS', 'SUCCESS', 'success', false);
        } finally {
          this.loading.set(false);
        }
      }
    }
  }

  async deactivatePcn() {
    if (await this.confirmService.confirm({ message: this.translate.instant('DEACTIVATE_PCN_RECEIVING') })) {
      const id = this.pcnStateStore.pcnInfos()?.id;
      if (id != null) {
        try {
          this.loading.set(true);
          const _res = await lastValueFrom(this.pcnClient.pcn_DeactivatePcnNotification(id));
          this.reloadTrigger.set(this.reloadTrigger() + 1);
          this.pcnStateStore.reloadPcnInfoTrigger.set(this.pcnStateStore.reloadPcnInfoTrigger() + 1);
          this.notificationService.showMessageAlways(
            'PCN_NOTIFICATION_DEACTIVATION_SUCCESS',
            'SUCCESS',
            'success',
            false,
          );
        } finally {
          this.loading.set(false);
        }
      }
    }
  }

  async activatePcn() {
    if (await this.confirmService.confirm({ message: this.translate.instant('ACTIVATE_PCN_RECEIVING') })) {
      const id = this.pcnStateStore.pcnInfos()?.id;
      if (id != null) {
        try {
          this.loading.set(true);
          const _res = await lastValueFrom(this.pcnClient.pcn_ActivatePcnNotification(id));
          this.reloadTrigger.set(this.reloadTrigger() + 1);
          this.pcnStateStore.reloadPcnInfoTrigger.set(this.pcnStateStore.reloadPcnInfoTrigger() + 1);
          this.notificationService.showMessageAlways(
            'PCN_NOTIFICATION_ACTIVATION_SUCCESS',
            'SUCCESS',
            'success',
            false,
          );
        } finally {
          this.loading.set(false);
        }
      }
    }
  }
}
