import { NewsItem } from '@aas-designer-model';
import { DateProxyPipe } from '@aas/common-pipes';
import { NotificationService } from '@aas/common-services';
import { NewsService } from '@aas/news';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { showSystemManagementError } from '../shared/system-management-error.util';

@Component({
  selector: 'aas-news-management',
  imports: [TranslateModule, Button, TableModule, Tag, DateProxyPipe],
  templateUrl: './news-management.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsManagementComponent implements OnInit {
  private readonly newsService = inject(NewsService);
  private readonly notificationService = inject(NotificationService);
  private readonly messageService = inject(MessageService);
  private readonly translateService = inject(TranslateService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly loading = signal(false);
  readonly newsItems = signal<NewsItem[]>([]);

  ngOnInit(): void {
    void this.loadData();
  }

  async loadData() {
    try {
      this.loading.set(true);
      this.newsItems.set(await this.newsService.getAllNews());
    } finally {
      this.loading.set(false);
    }
  }

  async startCreate() {
    await this.router.navigate(['new'], { relativeTo: this.route });
  }

  async startEdit(newsItem: NewsItem) {
    if (newsItem.id == null) {
      return;
    }
    await this.router.navigate([newsItem.id], {
      relativeTo: this.route,
      state: { newsItem },
    });
  }

  async setVisibility(newsItem: NewsItem, visible: boolean) {
    try {
      this.loading.set(true);
      await this.newsService.adminUpdateNewsItem({ ...newsItem, visible });
      this.notificationService.showMessageAlways('SUCCESS', 'SUCCESS', 'success', false);
      await this.loadData();
    } catch (error) {
      await showSystemManagementError(error, this.notificationService, this.messageService, this.translateService);
    } finally {
      this.loading.set(false);
    }
  }
}
