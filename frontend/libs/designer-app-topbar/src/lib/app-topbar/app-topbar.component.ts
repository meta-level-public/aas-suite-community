import { OrgaSettings } from '@aas-designer-model';
import { DateProxyPipe } from '@aas/common-pipes';
import { AccessService, AppConfigService, buildMySpaceRoute, PortalService } from '@aas/common-services';
import { NewsService, ShowNewsComponent } from '@aas/news';
import { NgComponentOutlet } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { MenuModule } from 'primeng/menu';
import { PopoverModule } from 'primeng/popover';
import { TooltipModule } from 'primeng/tooltip';
import { firstValueFrom, lastValueFrom, Subscription } from 'rxjs';
import {
  ADDITIONAL_TOPBAR_AFTER_COMPONENTS,
  ADDITIONAL_TOPBAR_CENTER_COMPONENTS,
  ADDITIONAL_TOPBAR_MENU_ITEMS,
} from '../topbar-addon-config';
import { VersionInfo } from './version-info';

@Component({
  selector: 'lib-app-topbar',
  templateUrl: './app-topbar.component.html',
  imports: [NgComponentOutlet, TranslateModule, ButtonModule, PopoverModule, TooltipModule, AvatarModule, MenuModule],
  providers: [DateProxyPipe],
})
export class AppTopBarComponent implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];

  versionInfo: VersionInfo = new VersionInfo();
  orgaSettings: OrgaSettings[] = [];

  userMenuItems = signal<MenuItem[]>([]);
  router = inject(Router);
  datePipe = inject(DateProxyPipe);
  private readonly cdr = inject(ChangeDetectorRef);

  fontSize: string = 'small';

  accessService = inject(AccessService);
  portalService = inject(PortalService);
  private translate = inject(TranslateService);
  private dialogService = inject(DialogService);
  private newsService = inject(NewsService);
  private http = inject(HttpClient);
  appConfigService = inject(AppConfigService);
  additionalTopbarMenuItems = inject(ADDITIONAL_TOPBAR_MENU_ITEMS);
  topbarCenterComponents = inject(ADDITIONAL_TOPBAR_CENTER_COMPONENTS);
  topbarAfterComponents = inject(ADDITIONAL_TOPBAR_AFTER_COMPONENTS);

  async ngOnInit() {
    const savedFontSize = window.localStorage.getItem('designer-fontSize');
    if (savedFontSize === 'small' || savedFontSize === 'large') {
      this.fontSize = savedFontSize;
    }

    this.subscriptions.push(
      this.portalService.loginStateChanged.subscribe((state) => {
        if (state === true) {
          this.checkForNews();
        }
        this.orgaSettings = this.portalService.user?.orgaSettings ?? [];
      }),
    );
    this.versionInfo = VersionInfo.fromDto(await firstValueFrom(this.http.get<any>('version.json')));
    this.orgaSettings = this.portalService.user?.orgaSettings ?? [];
    window.addEventListener('aas:theme-changed', this.onThemeChanged);
    window.addEventListener('aas:theme-catalog-changed', this.onThemeChanged);
    window.addEventListener('aas:theme-mode-changed', this.onThemeChanged);
  }

  async checkForNews() {
    if ((await this.newsService.checkForNews()) === true) {
      this.news();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
    window.removeEventListener('aas:theme-changed', this.onThemeChanged);
    window.removeEventListener('aas:theme-catalog-changed', this.onThemeChanged);
    window.removeEventListener('aas:theme-mode-changed', this.onThemeChanged);
  }

  setLang(lang: string) {
    this.translate.use(lang);
    this.portalService.currentLanguage = lang;
  }

  logout() {
    this.portalService.logout(true);
  }

  get logoPath() {
    return this.appConfigService.config.logoPath !== '' && this.appConfigService.config.logoPath != null
      ? this.appConfigService.config.logoPath
      : 'logos/logo_aas-designer.svg';
  }

  get hasCustomerLogo() {
    const logoValue = getComputedStyle(document.documentElement).getPropertyValue('--p-customer-logo').trim();
    return logoValue !== '' && logoValue !== "''" && logoValue !== 'none';
  }

  news() {
    this.dialogService.open(ShowNewsComponent, {
      header: this.translate.instant('NEWS'),
      width: '78rem',
      height: '48rem',
      breakpoints: {
        '1200px': '92vw',
        '768px': '96vw',
      },
      maximizable: true,
      closable: true,
    });
  }

  selectOrga(orgaSetting: OrgaSettings) {
    const user = this.portalService.user;
    if (user != null) {
      this.portalService.logIn(user, orgaSetting);
      this.registerOrgaswitch(orgaSetting.orgaId);
    }
  }

  async registerOrgaswitch(orgaId: number) {
    const params = new HttpParams().set('orgaId', orgaId.toString());
    await lastValueFrom(
      this.http.post(this.appConfigService.config.apiPath + '/Auth/RegisterOrgaSwitch', {}, { params }),
    );
  }

  get orgaInitials() {
    return PortalService.getCurrentOrgaSettings()?.orgaName?.substring(0, 2).toUpperCase();
  }
  get orgaLogo() {
    return PortalService.getCurrentOrgaSettings()?.logoBase64;
  }
  get orgaFullName() {
    return PortalService.getCurrentOrgaSettings()?.orgaName;
  }
  get currentOrgaId() {
    return PortalService.getCurrentOrgaSettings()?.orgaId;
  }

  onShowUserActions() {
    const menuItems: MenuItem[] = [];
    if (this.portalService.loggedIn) {
      menuItems.push({
        label: this.translate.instant('LOGOUT'),
        icon: 'pi pi-fw pi-sign-out',
        command: () => this.logout(),
      });

      menuItems.push({
        label: this.translate.instant('PROFILE'),
        icon: 'pi pi-fw pi-user',
        command: () => this.router.navigate(buildMySpaceRoute()),
      });
      menuItems.push({
        label: this.translate.instant('NEWS'),
        icon: 'pi pi-fw pi-bell',
        command: () => this.news(),
      });
      menuItems.push({
        separator: true,
      });
    }

    menuItems.push({
      label: this.translate.instant('PRIVACY'),
      icon: 'pi pi-fw pi-cog',
      command: () => {
        if (this.portalService.currentLanguage === 'de') {
          window.open(this.appConfigService.config.datenschutzLinkDe, '_blank');
        } else {
          window.open(this.appConfigService.config.datenschutzLinkEn, '_blank');
        }
      },
    });
    menuItems.push({
      label: this.translate.instant('AGB'),
      icon: 'pi pi-fw pi-cog',
      command: () => {
        if (this.portalService.currentLanguage === 'de') {
          window.open(this.appConfigService.config.agbLinkDe, '_blank');
        } else {
          window.open(this.appConfigService.config.agbLinkEn, '_blank');
        }
      },
    });
    menuItems.push({
      label: this.translate.instant('AVV_SHORT'),
      icon: 'pi pi-fw pi-cog',
      command: () => {
        if (this.portalService.currentLanguage === 'de') {
          window.open(this.appConfigService.config.avvLinkDe, '_blank');
        } else {
          window.open(this.appConfigService.config.avvLinkEn, '_blank');
        }
      },
    });

    menuItems.push({
      separator: true,
    });

    menuItems.push({
      label: this.translate.instant('VERSION') + ': ' + this.versionInfo.version,
      disabled: true,
    });
    menuItems.push({
      label: '' + this.datePipe.transform(this.versionInfo.date, 'L LTS'),
      disabled: true,
    });

    for (const menuFactory of this.additionalTopbarMenuItems) {
      menuItems.push(...menuFactory({ translate: this.translate }));
    }

    menuItems.push({
      separator: true,
    });
    menuItems.push({
      label: this.translate.instant('TOGGLE_DARK_MODE'),
      icon: 'pi pi-sun',
      command: () => this.toggleDarkMode(),
    });
    if (this.accessService.isAllowed('SYSTEM_HELP_EDITOR') || this.accessService.isAllowed('ORGA_HELP_EDITOR')) {
      menuItems.push({
        label: this.isEditmode()
          ? this.translate.instant('DEACTIVATE_HELP_EDIT')
          : this.translate.instant('ACTIVATE_HELP_EDIT'),
        icon: 'pi pi-info-circle',
        command: () => this.toggleHelpMode(),
      });
    }
    menuItems.push({
      label: this.translate.instant(this.fontSize === 'small' ? 'FONT_SIZE_LARGER' : 'FONT_SIZE_SMALLER'),
      icon: 'fa-solid fa-text-height',
      command: () => {
        this.fontSize = this.fontSize === 'small' ? 'large' : 'small';
        this.applyFontSize();
      },
    });

    this.userMenuItems.set(menuItems);
  }

  applyFontSize() {
    document.documentElement.style.fontSize = this.fontSize === 'small' ? '12px' : '14px';
    window.localStorage.setItem('designer-fontSize', this.fontSize);
  }

  toggleDarkMode() {
    const element = document.querySelector('html');
    element?.classList.toggle('my-app-dark');
    window.localStorage.setItem('designer-darkMode', element?.classList.contains('my-app-dark') ? 'true' : 'false');
    window.dispatchEvent(new CustomEvent('aas:theme-mode-changed'));
  }

  isEditmode() {
    return window.sessionStorage.getItem('HELP_EDITMODE_ACTIVE') === 'true';
  }

  toggleHelpMode() {
    window.sessionStorage.setItem('HELP_EDITMODE_ACTIVE', this.isEditmode() ? 'false' : 'true');
  }

  private onThemeChanged = () => {
    this.cdr.markForCheck();
  };
}
