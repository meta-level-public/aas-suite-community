import { NewsItem } from '@aas-designer-model';
import { NotificationService } from '@aas/common-services';
import { NewsService } from '@aas/news';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
import { DatePicker } from 'primeng/datepicker';
import { Editor } from 'primeng/editor';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { showSystemManagementError } from '../shared/system-management-error.util';

@Component({
  selector: 'aas-news-management-editor',
  imports: [
    TranslateModule,
    FormsModule,
    Button,
    InputGroupModule,
    InputGroupAddonModule,
    InputTextModule,
    Editor,
    DatePicker,
    Checkbox,
  ],
  templateUrl: './news-management-editor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsManagementEditorComponent implements OnInit {
  private readonly newsService = inject(NewsService);
  private readonly notificationService = inject(NotificationService);
  private readonly messageService = inject(MessageService);
  private readonly translateService = inject(TranslateService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly newsItem = signal<NewsItem | null>(null);
  readonly isCreateMode = signal(false);

  readonly pageTitle = computed(() => (this.isCreateMode() ? 'ADD_NEWS' : 'EDIT_NEWS'));

  ngOnInit(): void {
    void this.loadData();
  }

  async loadData() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam == null) {
      this.isCreateMode.set(true);
      this.newsItem.set(this.createEmptyNewsItem());
      return;
    }

    const navigationStateNewsItem = this.getNavigationStateNewsItem();
    if (navigationStateNewsItem != null && navigationStateNewsItem.id === Number(idParam)) {
      this.isCreateMode.set(false);
      this.newsItem.set(this.cloneNewsItem(navigationStateNewsItem));
      return;
    }

    try {
      this.loading.set(true);
      this.isCreateMode.set(false);
      const id = Number(idParam);
      const item = await this.newsService.getNewsItemById(id);
      this.newsItem.set(this.cloneNewsItem(item));
    } catch (error) {
      await showSystemManagementError(error, this.notificationService, this.messageService, this.translateService);
      await this.navigateBack();
    } finally {
      this.loading.set(false);
    }
  }

  async save() {
    const newsItem = this.newsItem();
    if (newsItem == null) {
      return;
    }

    if ((newsItem.description?.trim() ?? '') === '') {
      this.notificationService.showMessageAlways('NEWS_MANAGEMENT_TITLE_REQUIRED', 'ERROR', 'error', true);
      return;
    }

    try {
      this.saving.set(true);
      if (this.isCreateMode()) {
        await this.newsService.createNewsItem(newsItem);
      } else {
        await this.newsService.adminUpdateNewsItem(newsItem);
      }

      this.notificationService.showMessageAlways('SUCCESS', 'SUCCESS', 'success', false);
      await this.navigateBack();
    } catch (error) {
      await showSystemManagementError(error, this.notificationService, this.messageService, this.translateService);
    } finally {
      this.saving.set(false);
    }
  }

  async cancel() {
    await this.navigateBack();
  }

  private async navigateBack() {
    await this.router.navigate(['../'], { relativeTo: this.route });
  }

  private createEmptyNewsItem(): NewsItem {
    return {
      description: '',
      text: '',
      date: new Date(),
      visible: true,
      isPublic: false,
    } as NewsItem;
  }

  private cloneNewsItem(newsItem: NewsItem): NewsItem {
    return {
      ...newsItem,
      date: newsItem.date != null ? new Date(newsItem.date) : new Date(),
    };
  }

  private getNavigationStateNewsItem(): NewsItem | null {
    const currentNavigationState = this.router.getCurrentNavigation()?.extras.state?.['newsItem'];
    if (this.isNewsItemLike(currentNavigationState)) {
      return currentNavigationState;
    }

    const browserStateNewsItem = history.state?.newsItem;
    if (this.isNewsItemLike(browserStateNewsItem)) {
      return browserStateNewsItem;
    }

    return null;
  }

  private isNewsItemLike(value: unknown): value is NewsItem {
    return value != null && typeof value === 'object' && 'description' in value;
  }
}
