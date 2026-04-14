import { NewsItem } from '@aas-designer-model';
import { Component, OnInit } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { cloneDeep } from 'lodash-es';
import { MenuItem, PrimeTemplate } from 'primeng/api';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { NewsService } from '../news.service';

import Quill from 'quill';

// from the index, which exports a lot of useful modules

import { DateProxyPipe } from '@aas/common-pipes';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
import { DatePicker } from 'primeng/datepicker';
import { Dialog } from 'primeng/dialog';
import { Editor } from 'primeng/editor';
import { InputText } from 'primeng/inputtext';
import { Menu } from 'primeng/menu';
import { Ripple } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import BlotFormatter from '@enzedonline/quill-blot-formatter2';

Quill.register('modules/blotFormatter', BlotFormatter);

@Component({
  selector: 'aas-edit-news',
  templateUrl: './edit-news.component.html',
  imports: [
    Button,
    TableModule,
    PrimeTemplate,
    Menu,
    Tag,
    Dialog,
    FormsModule,
    InputText,
    Editor,
    DatePicker,
    Checkbox,
    Ripple,
    TranslateModule,
    DateProxyPipe,
  ],
})
export class EditNewsComponent implements OnInit {
  newsItemList: NewsItem[] = [];
  loading = false;
  menuItems: MenuItem[] = [];
  items: MenuItem[] = [];
  newsModalOption = '';
  newsDialogEntry: NewsItem = this.resetNewsItem();
  displayNewsModal: boolean = false;

  modules: any;

  constructor(
    public dialogService: DialogService,
    public newsService: NewsService,
    public config: DynamicDialogConfig,
    private ref: DynamicDialogRef,
    private translate: TranslateService,
  ) {
    this.modules = {
      blotFormatter: {},
    };
  }

  /**
   * If List not empty, load table.
   */
  async ngOnInit() {
    await this.getNews();
  }

  async getNews() {
    try {
      this.loading = true;
      this.newsItemList = await this.newsService.getAllNews();
    } finally {
      this.loading = false;
    }
  }

  async deleteNews(newsItem: NewsItem) {
    newsItem.visible = false;
    await this.newsService.adminUpdateNewsItem(newsItem);
  }
  async makeNewsVisible(newsItem: NewsItem) {
    newsItem.visible = true;
    await this.newsService.adminUpdateNewsItem(newsItem);
  }

  public addNews() {
    this.newsModalOption = 'new';
    this.newsDialogEntry = this.resetNewsItem();
    this.displayNewsModal = true;
  }

  public editNews(newsItem: NewsItem) {
    this.newsModalOption = 'update';
    this.newsDialogEntry = cloneDeep(newsItem);
    this.displayNewsModal = true;
    // this.editEditor?.quill.register('modules/imageResize', ImageResize);
  }

  public createAddress() {
    this.newsModalOption = 'new';
    this.newsDialogEntry = this.resetNewsItem();
    this.displayNewsModal = true;
  }

  private resetNewsItem(): NewsItem {
    return {
      description: '',
      text: '',
      date: new Date(),
      visible: true,
    } as NewsItem;
  }

  async saveNewsItem() {
    try {
      this.loading = true;
      if (this.newsModalOption === 'new') {
        await this.newsService.createNewsItem(this.newsDialogEntry);
      }
      if (this.newsModalOption === 'update') {
        await this.newsService.adminUpdateNewsItem(this.newsDialogEntry);
      }
    } finally {
      this.reload();
    }
  }

  saveButton() {
    /**
    for (const newsItem of this.newsItemList) {
      newsItem.viewed = true;
    }*/
    this.closeDialog();
  }

  closeDialog() {
    this.ref.close(this.newsService);
  }

  onShowActions(newsItem: NewsItem) {
    this.menuItems = [
      {
        label: this.translate.instant('VISIBLE'),
        icon: 'pi pi-eye',
        command: (_event: any) => {
          this.makeNewsVisible(newsItem);
        },
        visible: newsItem.visible === false,
      },
      {
        label: this.translate.instant('INVISIBLE'),
        icon: 'pi pi-eye-slash',
        command: (_event) => {
          this.deleteNews(newsItem);
        },
        visible: newsItem.visible === true,
      },
      {
        label: this.translate.instant('EDIT'),
        icon: 'pi pi-pencil',
        command: (_event: any) => {
          this.editNews(newsItem);
        },
      },
    ];
  }

  private reload() {
    this.newsItemList = [];
    this.newsDialogEntry = this.resetNewsItem();
    this.displayNewsModal = false;
    this.newsModalOption = '';
    this.getNews();
  }
}
