import { AccessService, AppConfigService, PortalService, ViewportService } from '@aas/common-services';
import { NewsService } from '@aas/news';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { DialogService } from 'primeng/dynamicdialog';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppTopBarComponent } from './app-topbar.component';

describe('AppTopBarComponent user menu', () => {
  let isMobile: ReturnType<typeof signal<boolean>>;
  let portalService: { loggedIn: boolean; currentLanguage: string; user: unknown };

  beforeEach(() => {
    isMobile = signal(true);
    portalService = { loggedIn: true, currentLanguage: 'en', user: null };
    TestBed.configureTestingModule({
      imports: [AppTopBarComponent, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PortalService, useValue: portalService },
        { provide: AccessService, useValue: { isAllowed: () => false } },
        { provide: AppConfigService, useValue: { config: {} } },
        { provide: NewsService, useValue: { checkForNews: vi.fn() } },
        { provide: DialogService, useValue: { open: vi.fn() } },
        { provide: ViewportService, useValue: { isMobile: () => isMobile() } },
      ],
    });
  });

  function userMenu() {
    const topbar = TestBed.createComponent(AppTopBarComponent).componentInstance;
    topbar.orgaSettings = [
      { orgaId: 1, orgaName: 'Meta Level' },
      { orgaId: 2, orgaName: 'HTW' },
    ] as never;
    topbar.onShowUserActions();
    return { topbar, items: topbar.userMenuItems() };
  }

  it('offers language and organisation in the user menu on phones', () => {
    const { topbar, items } = userMenu();

    expect(items[0].label).toBe('LANGUAGE');
    expect(items[0].items?.map((item) => item.label)).toEqual(['DE', 'EN']);
    expect(items[1].label).toBe('CHOOSE_ORGA');
    expect(items[1].items?.map((item) => item.label)).toEqual(['Meta Level', 'HTW']);

    const setLang = vi.spyOn(topbar, 'setLang').mockImplementation(() => undefined);
    items[0].items?.[0].command?.({});
    expect(setLang).toHaveBeenCalledWith('de');
  });

  it('keeps language and organisation out of the user menu on larger screens', () => {
    isMobile.set(false);

    const labels = userMenu().items.map((item) => item.label);

    expect(labels).not.toContain('LANGUAGE');
    expect(labels).not.toContain('CHOOSE_ORGA');
  });
});
