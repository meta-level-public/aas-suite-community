import { HelpLabelComponent } from '@aas/common-components';
import { SettingsClient } from '@aas/webapi-client';
import { CommonModule } from '@angular/common';
import { Component, computed, inject, model, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { QRCodeComponent } from 'angularx-qrcode';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { SkeletonModule } from 'primeng/skeleton';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'aas-viewer-setup-code',
  imports: [
    CommonModule,
    TranslateModule,
    CardModule,
    SkeletonModule,
    QRCodeComponent,
    HelpLabelComponent,
    ButtonModule,
  ],
  templateUrl: './viewer-setup-code.component.html',
})
export class ViewerSetupCodeComponent {
  @ViewChild('qrcode', { static: false }) qrCodeComponent!: QRCodeComponent;

  infrastructureId = model<number>();
  settingsClient = inject(SettingsClient);
  config = inject(DynamicDialogConfig, { optional: true });

  constructor() {
    if (this.config?.data?.infrastructureId) {
      this.infrastructureId.set(this.config.data.infrastructureId);
    }
  }

  viewerSettings = computed(async () => {
    return await lastValueFrom(this.settingsClient.settings_GetViewerSettings(this.infrastructureId()));
  });

  viewerAppConfig = computed(async () => {
    // const configString = 'AASSuiteViewerAppConfig:ViewerUrl,SmRepoUrl,AasRepoUrl,AasRegistryUrl,CdRepoUrl,DiscoveryUrl';

    const settings = await this.viewerSettings();
    const configString = `AASSuiteViewerAppConfig:${settings.viewerAppUrl},,${settings.smRepoUrl},${settings.aasRepoUrl},${settings.aasRegistryUrl},${settings.cdRepoUrl},${settings.discoveryUrl},${settings.smRegistryUrl},${settings.personalAccessToken}`;

    return configString;
  });

  downloadQrCode(): void {
    const qrCanvas = this.qrCodeComponent.qrcElement?.nativeElement?.querySelector('canvas');
    if (!qrCanvas) return;

    qrCanvas.toBlob((blob: Blob | null) => {
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `viewer-setup-qr-code-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 'image/png');
  }
}
