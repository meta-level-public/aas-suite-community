import { BenutzerEinstellungen, NewsItem } from '@aas-designer-model';
import { DateProxyPipe } from '@aas/common-pipes';
import { PortalService } from '@aas/common-services';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { NewsService } from '../news.service';

@Component({
  selector: 'aas-show-news',
  templateUrl: './show-news.component.html',
  styleUrls: ['./show-news.component.css'],
  imports: [Button, Checkbox, FormsModule, TranslateModule, DateProxyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowNewsComponent implements OnInit {
  readonly loading = signal(false);
  readonly allNewsItems = signal<NewsItem[]>([]);
  readonly currentIndex = signal(0);
  readonly animateCard = signal(true);
  readonly showReadNews = signal(false);
  readonly readStateVersion = signal(0);

  newsService = inject(NewsService);
  private portalService = inject(PortalService);
  private dialogRef = inject(DynamicDialogRef);

  readonly displayedNewsItems = computed(() => {
    this.readStateVersion();

    if (this.showReadNews()) {
      return this.allNewsItems();
    }

    return this.allNewsItems().filter((newsItem) => !this.hasUserSeenNews(newsItem));
  });
  readonly currentNewsItem = computed(() => this.displayedNewsItems()[this.currentIndex()] ?? null);
  readonly hasVisibleNews = computed(() => this.displayedNewsItems().length > 0);
  readonly isLastVisibleNews = computed(() => this.currentIndex() >= this.displayedNewsItems().length - 1);
  readonly progressLabel = computed(() => `${this.currentIndex() + 1} / ${this.displayedNewsItems().length}`);

  async ngOnInit() {
    await this.getNews();
  }

  async getNews() {
    try {
      this.loading.set(true);
      const visibleNews = await this.newsService.getVisibleNews();
      this.allNewsItems.set(visibleNews);
      this.currentIndex.set(0);
      this.restartCardAnimation();
    } finally {
      this.loading.set(false);
    }
  }

  async showNextNews() {
    const currentNewsItem = this.currentNewsItem();
    if (currentNewsItem == null) {
      this.closeDialog();
      return;
    }

    const previousIndex = this.currentIndex();
    const includeReadNews = this.showReadNews();

    await this.seenNewsItem(currentNewsItem, true);
    this.readStateVersion.update((version) => version + 1);

    const remainingNewsCount = this.displayedNewsItems().length;
    if (remainingNewsCount === 0) {
      this.closeDialog();
      return;
    }

    if (includeReadNews) {
      if (previousIndex >= remainingNewsCount - 1) {
        this.closeDialog();
        return;
      }

      this.currentIndex.set(previousIndex + 1);
    } else if (previousIndex >= remainingNewsCount) {
      this.closeDialog();
      return;
    }

    this.restartCardAnimation();
  }

  toggleShowReadNews(checked: boolean) {
    this.showReadNews.set(checked);
    this.currentIndex.set(0);
    this.restartCardAnimation();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  async seenNewsItem(newsItem: NewsItem, seen?: boolean) {
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
        this.loading.set(true);
        await this.newsService.updateSettings();
      } finally {
        this.loading.set(false);
      }
    }
  }

  public hasUserSeenNews(newsItem: NewsItem) {
    return this.portalService.user?.einstellungen?.viewedNewsIds.indexOf(newsItem.id ?? -1) !== -1;
  }

  private restartCardAnimation() {
    this.animateCard.set(false);
    setTimeout(() => this.animateCard.set(true), 0);
  }
}
