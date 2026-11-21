import { AccessService, AppConfigService, PortalService, UserDocsService, ViewportService } from '@aas/common-services';
import { NewsService } from '@aas/news';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { DialogService } from '@openng/optimus-ui/dynamicdialog';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppTopBarComponent } from './app-topbar.component';
import { VersionInfo } from './version-info';

describe('AppTopBarComponent user menu', () => {
  let isMobile: ReturnType<typeof signal<boolean>>;
  let portalService: { loggedIn: boolean; currentLanguage: string; user: unknown };
  let userDocsService: { isAvailable: ReturnType<typeof vi.fn>; open: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    isMobile = signal(true);
    portalService = { loggedIn: true, currentLanguage: 'en', user: null };
    userDocsService = { isAvailable: vi.fn().mockReturnValue(true), open: vi.fn() };
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
        { provide: UserDocsService, useValue: userDocsService },
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

  it('opens the start page of the user documentation from the user menu', () => {
    const docsItem = userMenu().items.find((item) => item.label === 'USER_DOCUMENTATION');

    docsItem?.command?.({});

    expect(userDocsService.open).toHaveBeenCalledWith('designer');
  });

  it('offers no user documentation if none is configured', () => {
    userDocsService.isAvailable.mockReturnValue(false);

    expect(userMenu().items.map((item) => item.label)).not.toContain('USER_DOCUMENTATION');
  });

  it('shows no date entry if the build date is unknown', () => {
    const topbar = TestBed.createComponent(AppTopBarComponent).componentInstance;
    topbar.versionInfo = VersionInfo.fromDto({ version: 'dev', date: 'unknown' });

    topbar.onShowUserActions();
    const labels = topbar.userMenuItems().map((item) => item.label);

    expect(labels).toContain('VERSION: dev');
    expect(labels).not.toContain('null');
    expect(labels).not.toContain('');
  });

  it('shows the build date below the version', () => {
    const topbar = TestBed.createComponent(AppTopBarComponent).componentInstance;
    topbar.versionInfo = VersionInfo.fromDto({ version: '1.2.3', date: '2026-11-08 14:05' });

    topbar.onShowUserActions();
    const items = topbar.userMenuItems();
    const versionIndex = items.findIndex((item) => item.label === 'VERSION: 1.2.3');

    expect(items[versionIndex + 1].label).toMatch(/2026|26/);
    expect(items[versionIndex + 1].disabled).toBe(true);
  });
});
