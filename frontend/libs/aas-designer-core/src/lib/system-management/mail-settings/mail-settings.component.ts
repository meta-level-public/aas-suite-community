import { NotificationService } from '@aas/common-services';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { showSystemManagementError } from '../shared/system-management-error.util';
import { MailSettingsDto, MailSettingsService } from './mail-settings.service';

@Component({
  selector: 'aas-mail-settings',
  imports: [
    TranslateModule,
    FormsModule,
    Button,
    Checkbox,
    InputGroupModule,
    InputGroupAddonModule,
    InputTextModule,
    PasswordModule,
  ],
  templateUrl: './mail-settings.component.html',
})
export class MailSettingsComponent implements OnInit {
  private readonly mailSettingsService = inject(MailSettingsService);
  private readonly notificationService = inject(NotificationService);
  private readonly messageService = inject(MessageService);
  private readonly translateService = inject(TranslateService);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly applicationTestLoading = signal(false);
  readonly keycloakTestLoading = signal(false);
  readonly mailSettings = signal<MailSettingsDto | null>(null);
  readonly applicationTestEmail = signal('');
  readonly keycloakTestEmail = signal('');

  ngOnInit(): void {
    void this.loadData();
  }

  async loadData(): Promise<void> {
    try {
      this.loading.set(true);
      this.mailSettings.set(await this.mailSettingsService.getMailSettings());
    } finally {
      this.loading.set(false);
    }
  }

  async save(): Promise<void> {
    const settings = this.mailSettings();
    if (settings == null) {
      return;
    }

    try {
      this.saving.set(true);
      this.mailSettings.set(await this.mailSettingsService.updateMailSettings(settings));
      this.notificationService.showMessageAlways('SUCCESS', 'SUCCESS', 'success', false);
    } catch (error) {
      await showSystemManagementError(error, this.notificationService, this.messageService, this.translateService);
    } finally {
      this.saving.set(false);
    }
  }

  async sendApplicationTestMail(): Promise<void> {
    const settings = this.mailSettings();
    if (settings == null) {
      return;
    }

    try {
      this.applicationTestLoading.set(true);
      await this.mailSettingsService.sendApplicationTestMail({
        targetEmail: this.applicationTestEmail(),
        settings: settings.application,
      });
      this.notificationService.showMessageAlways('MAIL_SETTINGS_TEST_APPLICATION_SUCCESS', 'SUCCESS', 'success', false);
    } catch (error) {
      await showSystemManagementError(error, this.notificationService, this.messageService, this.translateService);
    } finally {
      this.applicationTestLoading.set(false);
    }
  }

  async sendKeycloakTestMail(): Promise<void> {
    const settings = this.mailSettings();
    if (settings == null) {
      return;
    }

    try {
      this.keycloakTestLoading.set(true);
      await this.mailSettingsService.sendKeycloakTestMail({
        targetEmail: this.keycloakTestEmail(),
        settings: settings.keycloak,
      });
      this.notificationService.showMessageAlways('MAIL_SETTINGS_TEST_KEYCLOAK_SUCCESS', 'SUCCESS', 'success', false);
    } catch (error) {
      await showSystemManagementError(error, this.notificationService, this.messageService, this.translateService);
    } finally {
      this.keycloakTestLoading.set(false);
    }
  }
}
