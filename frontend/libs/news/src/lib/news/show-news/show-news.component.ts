import { AuthRoles, BenutzerEinstellungen, NewsItem } from '@aas-designer-model';
import { DialogFooter } from '@aas/common-components';
import { DateProxyPipe } from '@aas/common-pipes';
import { AccessService, PortalService } from '@aas/common-services';
import { NgStyle } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PrimeTemplate } from 'primeng/api';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Editor } from 'primeng/editor';
import { Ripple } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { EditNewsComponent } from '../edit-news/edit-news.component';
import { NewsService } from '../news.service';

@Component({
  selector: 'aas-show-news',
  templateUrl: './show-news.component.html',
  imports: [
    TableModule,
    PrimeTemplate,
    NgStyle,
    Ripple,
    Button,
    Tag,
    Dialog,
    Editor,
    FormsModule,
    TranslateModule,
    DateProxyPipe,
  ],
})
export class ShowNewsComponent implements OnInit {
  newsItemList: NewsItem[] = [];
  loading = false;
  displayNewsDetail = false;
  selectedNewsItem: NewsItem | null = null;

  dialogService = inject(DialogService);
  newsService = inject(NewsService);
  config = inject(DynamicDialogConfig);
  private ref = inject(DynamicDialogRef);
  private accessService = inject(AccessService);
  private translate = inject(TranslateService);
  private portalService = inject(PortalService);

  /**
   * If List not empty, load table.
   */
  async ngOnInit() {
    await this.getNews();
  }

  async getNews() {
    try {
      this.loading = true;
      this.newsItemList = await this.newsService.getVisibleNews();
    } finally {
      this.loading = false;
    }
  }

  closeDialog() {
    this.ref.close(this.newsService);
  }

  editNews() {
    this.ref.close(this);
    this.dialogService.open(EditNewsComponent, {
      header: this.translate.instant('EDIT_NEWS'),
      width: '50%',
      height: '50%',
      maximizable: true,
      templates: {
        footer: DialogFooter,
      },
      closable: true,
    });
  }

  seenNewsItem(newsItem: NewsItem, seen?: boolean) {
    const user = this.portalService.user;
    if (user != null && newsItem.id != null) {
      if (user.einstellungen == null) {
        user.einstellungen = new BenutzerEinstellungen();
      }
      if (this.hasUserSeenNews(newsItem) && seen !== true) {
        user.einstellungen.viewedNewsIds.splice(user.einstellungen.viewedNewsIds.indexOf(newsItem.id), 1);
      } else {
        if (user.einstellungen.viewedNewsIds.indexOf(newsItem.id) === -1) {
          user.einstellungen.viewedNewsIds.push(newsItem.id);
        }
      }

      this.portalService.saveUser(user);

      try {
        this.loading = true;
        this.newsService.updateSettings();
      } finally {
        this.loading = false;
      }
    }
  }

  getIcon(newsItem: NewsItem): string {
    if (this.hasUserSeenNews(newsItem) === true) {
      return 'pi pi-circle';
    } else {
      return 'pi pi-circle-on';
    }
  }

  /**
   * If User is Admin, "Edit News"-Button is shown.
   * @returns
   */
  isUserAdmin() {
    if (this.accessService.isAllowed(AuthRoles.SYSTEM_ADMIN)) {
      return true;
    } else {
      return false;
    }
  }

  public hasUserSeenNews(newsItem: NewsItem) {
    return this.portalService.user?.einstellungen?.viewedNewsIds.indexOf(newsItem.id ?? -1) !== -1;
  }
}
