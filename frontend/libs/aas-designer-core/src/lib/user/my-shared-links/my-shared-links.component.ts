import { Clipboard } from '@angular/cdk/clipboard';

import { DateProxyPipe } from '@aas/common-pipes';
import { AasConfirmationService, NotificationService } from '@aas/common-services';
import { MySharedLink, SharedLinksClient } from '@aas/webapi-client';
import { Component, inject, OnInit, signal } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { lastValueFrom } from 'rxjs';
import { SharedLink } from '@aas-designer-model';
import { MySharedLinkService } from './my-shared-link.service';

@Component({
  selector: 'aas-my-shared-links',
  templateUrl: './my-shared-links.component.html',
  styleUrls: ['../../../host.scss'],
  imports: [TranslateModule, ToolbarModule, TableModule, ButtonModule, MenuModule, TagModule, DateProxyPipe],
})
export class MySharedLinksComponent implements OnInit {
  mySharedLinks = signal<MySharedLink[]>([]);
  loading = signal(false);
  menuItems: MenuItem[] = [];

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

  onShowActions(linkItem: SharedLink) {
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

  copyLinkToClipboard(item: SharedLink) {
    this.clipboard.copy(item.generatedLink);
    this.notificationService.showMessageAlways('LINK_COPIED', 'SUCCESS', 'success', false);
  }
}
