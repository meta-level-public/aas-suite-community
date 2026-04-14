import { ActiveComponentsService } from '@aas/aas-designer-shared';
import { NotificationService, PortalService } from '@aas/common-services';
import { Component, HostListener, inject, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { filter } from 'rxjs/operators';

import { ConfirmDialogComponent, SseNotificationService } from '@aas/aas-designer-shared';
import { registerLocaleData } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { PrimeNG } from 'primeng/config';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'aas-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  standalone: true,
  imports: [RouterOutlet, ToastModule, ButtonModule, ConfirmDialogComponent],
})
export class App implements OnInit {
  private static readonly lastAllowedRouteStorageKey = 'aasLastAllowedRoute';
  private static readonly previousAllowedRouteStorageKey = 'aasPreviousAllowedRoute';
  primeng = inject(PrimeNG);
  sseNotificationService = inject(SseNotificationService);

  constructor(
    public translate: TranslateService,
    private messageService: MessageService,
    private router: Router,
    private activeComponents: ActiveComponentsService,
    private notificationService: NotificationService,
    private portalService: PortalService,
  ) {
    this.loadLocaleData();

    this.setLang();
    this.translate.onLangChange.subscribe(() => {
      this.loadLocaleData();
      this.setLang();
    });

    // TODO: entfernen, sobald angular gefixed, fixt das problem mit abgebrochenem history back bei DeactivationGuards
    // @ts-ignore: private option not yet exposed for public use
    router.canceledNavigationResolution = 'computed';

    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event) => {
      const url = (event as NavigationEnd).urlAfterRedirects;
      if (this.isAllowedReturnRoute(url)) {
        const currentLastRoute = sessionStorage.getItem(App.lastAllowedRouteStorageKey);
        if (currentLastRoute && currentLastRoute !== url) {
          sessionStorage.setItem(App.previousAllowedRouteStorageKey, currentLastRoute);
        }
        sessionStorage.setItem(App.lastAllowedRouteStorageKey, url);
      }
    });
  }

  @HostListener('window:beforeunload', ['$event'])
  onWindowClose(event: BeforeUnloadEvent) {
    if (this.activeComponents.components.filter((c) => c.isDirty()).length > 0) {
      event.preventDefault();
      event.returnValue = '';
    }
  }

  @HostListener('window:logoutUser', ['$event'])
  onUserLogout(_event: Event) {
    this.portalService.logout(true, true);
  }

  ngOnInit() {
    this.primeng.ripple.set(true);

    const fontSize = localStorage.getItem('fontSize') || 'small';
    document.documentElement.style.fontSize = fontSize === 'small' ? '12px' : '14px';

    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
      const element = document.querySelector('html');
      element?.classList.add('my-app-dark');
    } else {
      const element = document.querySelector('html');
      element?.classList.remove('my-app-dark');
    }

    this.sseNotificationService.initialize();
  }

  private async loadLocaleData(): Promise<void> {
    const currentLang = this.translate.currentLang || this.portalService.currentLanguage;

    if (currentLang === 'de') {
      const [locale, localeExtra] = await Promise.all([
        import('@angular/common/locales/de'),
        import('@angular/common/locales/extra/de'),
      ]);
      registerLocaleData(locale.default, 'de-DE', localeExtra.default);
    } else {
      const [locale, localeExtra] = await Promise.all([
        import('@angular/common/locales/en'),
        import('@angular/common/locales/extra/en'),
      ]);
      registerLocaleData(locale.default, 'en-US', localeExtra.default);
    }
  }

  setLang(): void {
    this.translate.get('primeng').subscribe((res: any) => this.primeng.setTranslation(res));
    this.translate
      .get('TITLE_PORTAL_GENERATOR')
      .subscribe(() => (document.title = this.translate.instant('TITLE_PORTAL_GENERATOR')));
  }
  onConfirm(): void {
    this.messageService.clear('errorDlg');
    this.notificationService.removeMessages();
  }

  private isAllowedReturnRoute(url: string): boolean {
    return (
      !!url &&
      url !== '/' &&
      !['/forbidden', '/login', '/error', '/access', '/notfound'].some(
        (prefix) => url === prefix || url.startsWith(prefix + '/'),
      )
    );
  }
}
