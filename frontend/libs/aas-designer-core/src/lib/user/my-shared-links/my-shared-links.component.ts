import { Clipboard } from '@angular/cdk/clipboard';

import { QrCodeExportComponent } from '@aas/common-components';
import { DateProxyPipe } from '@aas/common-pipes';
import { AasConfirmationService, NotificationService } from '@aas/common-services';
import { MySharedLink, SharedLinksClient } from '@aas/webapi-client';
import { Component, inject, OnInit, signal } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { lastValueFrom } from 'rxjs';
import { MySharedLinkService } from './my-shared-link.service';

@Component({
  selector: 'aas-my-shared-links',
  templateUrl: './my-shared-links.component.html',
  styleUrls: ['../../../host.scss'],
  imports: [
    TranslateModule,
    ToolbarModule,
    TableModule,
    ButtonModule,
    MenuModule,
    TagModule,
    DateProxyPipe,
    DialogModule,
    QrCodeExportComponent,
  ],
})
export class MySharedLinksComponent implements OnInit {
  mySharedLinks = signal<MySharedLink[]>([]);
  loading = signal(false);
  menuItems: MenuItem[] = [];
  /** Link whose QR code is shown, null while the QR code dialog is closed */
  qrCodeLink = signal<MySharedLink | null>(null);

  sharedLinksClient = inject(SharedLinksClient);

  constructor(
    private sharedLinkService: MySharedLinkService,
    private translate: TranslateService,
    private notificationService: NotificationService,
    private clipboard: Clipboard,
    private confirmationService: AasConfirmationService,
  ) {}

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    try {
      this.loading.set(true);
      this.mySharedLinks.set(await lastValueFrom(this.sharedLinksClient.sharedLinks_GetMySharedLinks()));
    } finally {
      this.loading.set(false);
    }
  }

  onShowActions(linkItem: MySharedLink) {
    this.menuItems = [
      {
        label: this.translate.instant('COPY'),
        icon: 'pi pi-copy',
        command: () => {
          if (linkItem.id != null) {
            this.copyLinkToClipboard(linkItem);
          }
        },
      },
      {
        label: this.translate.instant('QR_CODE'),
        icon: 'pi pi-qrcode',
        command: () => this.qrCodeLink.set(linkItem),
      },
      {
        label: this.translate.instant('DELETE'),
        icon: 'pi pi-trash',
        command: () => {
          if (linkItem.id != null) {
            this.deleteLink(linkItem.id);
          }
        },
      },
    ];
  }

  async deleteLink(id: number) {
    if (
      await this.confirmationService.confirm({
        message: this.translate.instant('DELETE_LINK_Q'),
        header: this.translate.instant('CONFIRMATION'),
      })
    ) {
      const res = await lastValueFrom(this.sharedLinksClient.sharedLinks_DeleteSharedLink(id));
      if (res) {
        this.notificationService.showMessageAlways('SUCCESS_DELETE_SHARED_LINK', 'SUCCESS', 'success', false);
        this.mySharedLinks.set(this.mySharedLinks().filter((i) => i.id !== id));
      }
    }
  }

  qrCodeFileName(link: MySharedLink) {
    return `shared-link_${link.aasIdentifier ?? link.id}`;
  }

  copyLinkToClipboard(item: MySharedLink) {
    this.clipboard.copy(item.generatedLink ?? '');
    this.notificationService.showMessageAlways('LINK_COPIED', 'SUCCESS', 'success', false);
  }
}
