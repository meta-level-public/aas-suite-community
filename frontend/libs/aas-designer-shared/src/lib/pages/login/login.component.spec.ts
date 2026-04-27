import { NewsItem } from '@aas-designer-model';
import { AppConfigService, PortalService } from '@aas/common-services';
import { SystemManagementClient } from '@aas/webapi-client';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { SharedLoginPageComponent } from './login.component';
import { LoginService } from './login.service';

describe('SharedLoginPageComponent', () => {
  let fixture: ComponentFixture<SharedLoginPageComponent>;
  let component: SharedLoginPageComponent;
  const getNews = vi.fn();

  beforeEach(async () => {
    getNews.mockResolvedValue([]);

    await TestBed.configureTestingModule({
      imports: [SharedLoginPageComponent],
      providers: [
        {
          provide: LoginService,
          useValue: {
            getNews,
          },
        },
        {
          provide: SystemManagementClient,
          useValue: {
            systemManagement_GetConfiguration: () => of(null),
          },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: {},
            },
          },
        },
        {
          provide: PortalService,
          useValue: {
            user: null,
          },
        },
        {
          provide: AppConfigService,
          useValue: {
            config: {
              useContactForm: 'true',
            },
          },
        },
        {
          provide: Router,
          useValue: {
            navigate: vi.fn(),
          },
        },
      ],
    })
      .overrideComponent(SharedLoginPageComponent, {
        set: {
          template: '',
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(SharedLoginPageComponent);
    fixture.componentRef.setInput('navigateAuthenticated', vi.fn().mockResolvedValue(undefined));
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('shows the newest public news first after loading', async () => {
    const oldestNews = createNewsItem(1, 'Oldest', '2026-01-05T09:00:00.000Z');
    const newestNews = createNewsItem(2, 'Newest', '2026-04-17T09:00:00.000Z');
    const middleNews = createNewsItem(3, 'Middle', '2026-03-01T09:00:00.000Z');

    getNews.mockResolvedValue([newestNews, middleNews, oldestNews]);

    await component.loadNews();

    expect(component.newsItems().map((newsItem) => newsItem.id)).toEqual([2, 3, 1]);
    expect(component.currentNews()?.id).toBe(2);
    expect(component.currentNews()?.description).toBe('Newest');
  });
});

function createNewsItem(id: number, description: string, isoDate: string) {
  const newsItem = new NewsItem();
  newsItem.id = id;
  newsItem.description = description;
  newsItem.text = description;
  newsItem.date = new Date(isoDate);
  newsItem.isPublic = true;
  return newsItem;
}
