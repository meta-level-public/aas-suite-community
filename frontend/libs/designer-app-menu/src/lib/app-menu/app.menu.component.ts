import { HelpService } from '@aas/common-components';
import { AppConfigService } from '@aas/common-services';

import { ADDITIONAL_MENU_ITEMS, AuthRoles } from '@aas-designer-model';
import { AccessService, PortalService } from '@aas/common-services';
import { Component, inject, OnInit, output, signal } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-menu',
  templateUrl: './app.menu.component.html',
  styleUrls: ['./app.menu.component.scss'],
  imports: [ButtonModule, RouterModule, TooltipModule, TranslateModule],
})
export class AppMenuComponent implements OnInit {
  tabs: any[] = [];
  activeTabValue = signal<string>('');
  sidebarExpanded = signal<boolean>(false);
  sidebarExpandedChange = output<boolean>();
  portalService = inject(PortalService);
  helpService = inject(HelpService);
  additionalMenuItems = inject(ADDITIONAL_MENU_ITEMS);
  private router = inject(Router);

  constructor(
    private translate: TranslateService,
    private accessService: AccessService,
    private appConfigService: AppConfigService,
  ) {
    this.translate.onLangChange.subscribe(() => this.createMenu());

    // Create menu immediately when login state changes
    this.portalService.loginStateChanged.subscribe(() => {
      // Use setTimeout to ensure the user data is fully saved before creating menu
      setTimeout(() => {
        this.createMenu();
        this.updateActiveTab(this.router.url);
      }, 0);
    });
  }

  ngOnInit() {
    this.createMenu();
    this.updateActiveTab(this.router.url);

    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      this.updateActiveTab(event.urlAfterRedirects);
    });

    this.portalService.loginStateChanged.subscribe(() => {
      this.helpService.initHelp();
    });

    this.portalService.currentInfrastructureChanged.subscribe(() => {
      this.createMenu();
      this.updateActiveTab(this.router.url);
    });
  }

  createMenu() {
    if (this.portalService.loggedIn) {
      this.tabs = [
        {
          label: this.translate.instant('SHELLS_LIST'),
          icon: 'pi pi-fw pi-box',
          routerLink: ['/shells-list'],
          preventExact: true,
        },
        {
          label: this.translate.instant('CD_LIST'),
          icon: 'pi pi-fw pi-database',
          routerLink: ['/cds-list'],
          preventExact: true,
        },
      ];

      if (this.isCurrentRepoWritable) {
        this.tabs.push({
          label: this.translate.instant('GENERATOR'),
          icon: 'pi pi-fw pi-plus-circle',
          routerLink: ['/aas'],
          preventExact: true,
          altLink: ['/viewer'],
        });
      }
      this.tabs.push({
        label: this.translate.instant('IDTA_TEMPLATES'),
        icon: 'pi pi-fw pi-file-edit',
        routerLink: ['/submodels'],
        preventExact: true,
      });
      // this.tabs.push({
      //   label: this.translate.instant('INSTANCE_VIEWER'),
      //   icon: 'fa-solid fa-magnifying-glass-arrow-right',
      //   routerLink: ['/instance-viewer'],
      //   preventExact: true,
      // });
      this.tabs.push({
        label: this.translate.instant('MY_AREA'),
        icon: 'pi pi-fw pi-user',
        routerLink: ['/my-space'],
        preventExact: true,
      });
      if (this.accessService.isAllowed(AuthRoles.ORGA_ADMIN)) {
        this.tabs.push({
          label: this.translate.instant('MY_ORGANIZATION'),
          icon: 'pi pi-fw pi-building',
          routerLink: ['/my-organization'],
          preventExact: true,
        });
      }

      // Insert additional menu items (e.g., feed-mapping for enterprise)
      this.insertAdditionalMenuItems();

      if (this.accessService.isAllowed(AuthRoles.SYSTEM_ADMIN)) {
        this.tabs.push({
          label: this.translate.instant('SYSTEM_MANAGEMENT'),
          icon: 'fa-solid fa-gears',
          routerLink: ['/system-management'],
          preventExact: true,
        });
      }
    } else {
      this.tabs = [
        {
          label: this.translate.instant('LOGIN'),
          icon: 'pi pi-fw pi-sign-in',
          routerLink: ['/'],
        },
        {
          label: this.translate.instant('CONTACT'),
          icon: 'pi pi-fw pi-envelope',
          routerLink: ['/contact'],
          preventExact: true,
          visible: this.appConfigService.config.useContactForm !== 'false',
        },
      ];
    }
  }

  get isCurrentRepoWritable() {
    const currentInfrastructure = PortalService.getCurrentAasInfrastructureSetting();
    return !currentInfrastructure?.isReadonly;
  }

  private insertAdditionalMenuItems() {
    for (const item of this.additionalMenuItems) {
      // Check if role is required and user has it
      if (item.requiredRole && !this.accessService.isAllowed(item.requiredRole as AuthRoles)) {
        continue;
      }

      // Check if writable repo is required
      if (item.requiresWritableRepo && !this.isCurrentRepoWritable) {
        continue;
      }

      // Check visible flag
      if (item.visible === false) {
        continue;
      }

      const menuItem = {
        label: this.translate.instant(item.label),
        icon: item.icon,
        routerLink: item.routerLink,
        preventExact: item.preventExact,
        altLink: item.altLink,
      };

      // Insert at start if specified
      if (item.insertAtStart) {
        this.tabs.unshift(menuItem);
      }
      // Insert after specific item or at the end
      else if (item.insertAfter) {
        const insertAfter = item.insertAfter;
        const index = this.tabs.findIndex(
          (tab) => tab.routerLink?.[0] === insertAfter || tab.label === this.translate.instant(insertAfter),
        );
        if (index !== -1) {
          this.tabs.splice(index + 1, 0, menuItem);
        } else {
          this.tabs.push(menuItem);
        }
      } else {
        this.tabs.push(menuItem);
      }
    }
  }

  toggleSidebar() {
    this.sidebarExpanded.update((value) => !value);
    this.sidebarExpandedChange.emit(this.sidebarExpanded());
  }

  isActive(tab: any): boolean {
    const currentUrl = this.router.url;
    const routerLink = Array.isArray(tab.routerLink) ? tab.routerLink[0] : tab.routerLink;

    // Check main routerLink - exact match or starts with
    if (currentUrl === routerLink || currentUrl.startsWith(routerLink + '/')) {
      return true;
    }

    // Check altLink (e.g., /viewer for generator tab)
    if (tab.altLink) {
      const altLink = Array.isArray(tab.altLink) ? tab.altLink[0] : tab.altLink;
      if (currentUrl === altLink || currentUrl.startsWith(altLink + '/')) {
        return true;
      }
    }

    // Check for /generator routes which should match /aas tab
    if (routerLink === '/aas' && currentUrl.startsWith('/generator')) {
      return true;
    }

    return false;
  }

  private updateActiveTab(url: string) {
    const matchingTab = this.tabs.find((tab) => {
      const routerLink = Array.isArray(tab.routerLink) ? tab.routerLink[0] : tab.routerLink;

      // Check main routerLink
      if (url.startsWith(routerLink)) {
        return true;
      }

      // Check altLink (e.g., /viewer for generator tab)
      if (tab.altLink) {
        const altLink = Array.isArray(tab.altLink) ? tab.altLink[0] : tab.altLink;
        if (url.startsWith(altLink)) {
          return true;
        }
      }

      // Check for /generator routes which should match /aas tab
      if (routerLink === '/aas' && url.startsWith('/generator')) {
        return true;
      }

      return false;
    });

    if (matchingTab) {
      const value = Array.isArray(matchingTab.routerLink) ? matchingTab.routerLink[0] : matchingTab.routerLink;
      this.activeTabValue.set(value);
    }
  }
}
