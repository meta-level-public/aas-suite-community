import { AppConfigService, NotificationService } from '@aas/common-services';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { showSystemManagementError } from '../shared/system-management-error.util';
import { LegalLinksSettingsDto, LegalLinksSettingsService } from './legal-links-settings.service';

@Component({
  selector: 'aas-legal-links-settings',
  imports: [TranslateModule, FormsModule, Button, InputGroupModule, InputGroupAddonModule, InputTextModule],
  templateUrl: './legal-links-settings.component.html',
})
export class LegalLinksSettingsComponent implements OnInit {
  private readonly legalLinksSettingsService = inject(LegalLinksSettingsService);
  private readonly appConfigService = inject(AppConfigService);
  private readonly notificationService = inject(NotificationService);
  private readonly messageService = inject(MessageService);
  private readonly translateService = inject(TranslateService);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly legalLinksSettings = signal<LegalLinksSettingsDto | null>(null);

  ngOnInit(): void {
    void this.loadData();
  }

  async loadData(): Promise<void> {
    try {
      this.loading.set(true);
      const settings = await this.legalLinksSettingsService.getLegalLinksSettings();
      this.legalLinksSettings.set(this.applyRuntimeFallback(settings));
    } finally {
      this.loading.set(false);
    }
  }

  async save(): Promise<void> {
    const settings = this.legalLinksSettings();
    if (settings == null) {
      return;
    }

    try {
      this.saving.set(true);
      const updatedSettings = await this.legalLinksSettingsService.updateLegalLinksSettings(settings);
      this.appConfigService.updateLegalLinksInMemory(updatedSettings);
      this.legalLinksSettings.set(updatedSettings);
      this.notificationService.showMessageAlways('SUCCESS', 'SUCCESS', 'success', false);
    } catch (error) {
      await showSystemManagementError(error, this.notificationService, this.messageService, this.translateService);
    } finally {
      this.saving.set(false);
    }
  }

  private applyRuntimeFallback(settings: LegalLinksSettingsDto): LegalLinksSettingsDto {
    const runtimeConfig = this.appConfigService.config;

    return {
      datenschutzLinkDe: this.chooseVisibleValue(settings.datenschutzLinkDe, runtimeConfig.datenschutzLinkDe),
      datenschutzLinkEn: this.chooseVisibleValue(settings.datenschutzLinkEn, runtimeConfig.datenschutzLinkEn),
      agbLinkDe: this.chooseVisibleValue(settings.agbLinkDe, runtimeConfig.agbLinkDe),
      agbLinkEn: this.chooseVisibleValue(settings.agbLinkEn, runtimeConfig.agbLinkEn),
      avvLinkDe: this.chooseVisibleValue(settings.avvLinkDe, runtimeConfig.avvLinkDe),
      avvLinkEn: this.chooseVisibleValue(settings.avvLinkEn, runtimeConfig.avvLinkEn),
      imprintLink: this.chooseVisibleValue(settings.imprintLink, runtimeConfig.imprintLink),
    };
  }

  private chooseVisibleValue(primaryValue: string | undefined, fallbackValue: string | undefined): string {
    const normalizedPrimaryValue = primaryValue?.trim() ?? '';
    if (normalizedPrimaryValue !== '') {
      return normalizedPrimaryValue;
    }

    return fallbackValue?.trim() ?? '';
  }
}
