import { buildAbsoluteRoute, buildMySpaceProfileRoute, PortalService } from '@aas/common-services';
import { AppMenuComponent, MenuService } from '@aas/designer-app-menu';
import { AppTopBarComponent } from '@aas/designer-app-topbar';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, NgZone, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PrimeNG } from 'primeng/config';

@Component({
  selector: 'app-root',
  templateUrl: './app-main.component.html',
  styleUrls: ['../host.scss'],
  imports: [CommonModule, RouterModule, AppMenuComponent, AppTopBarComponent],
})
export class AppMainComponent implements OnInit {
  configDialogActive = false;

  topbarItemClick: boolean = false;

  activeTopbarItem: any;

  menuHoverActive: boolean = false;

  topbarMenuActive: boolean = false;

  overlayMenuActive: boolean = false;

  menuClick: boolean = false;

  configClick: boolean = false;

  overlayMenuMobileActive: boolean = false;

  ripple = true;
  layoutMode = 'horizontal';
  wrapperMode = true;
  inputStyle = 'outlined';
  layout = 'layout-blue';

  sidebarExpanded = signal<boolean>(false);

  primeng = inject(PrimeNG);
  portalService = inject(PortalService);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);

  // Use signal for reactive login state
  isLoggedIn = signal(false);

  constructor(
    private menuService: MenuService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {}

  onSidebarExpandedChange(expanded: boolean) {
    this.sidebarExpanded.set(expanded);
  }

  ngOnInit() {
    // Initialize login state
    this.isLoggedIn.set(this.portalService.loggedIn);

    // Update login state when it changes
    this.portalService.loginStateChanged.subscribe((state) => {
      this.isLoggedIn.set(state && this.portalService.loggedIn);

      // Reset sidebar after logout
      if (!state) {
        this.sidebarExpanded.set(false);
      }
    });
  }

  onRippleChange(event: any) {
    this.ripple = event.checked;
    this.primeng.ripple.set(event.checked);
  }

  get type() {
    return this.activatedRoute.snapshot.data['type'] ?? 'app';
  }

  onLayoutClick() {
    if (!this.topbarItemClick) {
      this.activeTopbarItem = null;
      this.topbarMenuActive = false;
    }

    if (!this.configClick) {
      this.configDialogActive = false;
    }

    if (!this.menuClick) {
      if (this.isHorizontal()) {
        this.menuService.reset();
      }

      if (this.overlayMenuActive || this.overlayMenuMobileActive) {
        this.hideOverlayMenu();
      }

      this.menuHoverActive = false;
    }

    this.topbarItemClick = false;
    this.menuClick = false;
    this.configClick = false;
  }

  onTopbarItemClick(event: any, item: any) {
    this.topbarItemClick = true;

    if (this.activeTopbarItem === item) {
      this.activeTopbarItem = null;
    } else {
      this.activeTopbarItem = item;
    }

    event.preventDefault();
  }

  onTopbarSubItemClick(event: any, action?: string) {
    event.preventDefault();
    switch (action) {
      case 'register':
        this.router.navigate(['/register']);
        break;
      case 'login':
        this.router.navigate(buildAbsoluteRoute());
        break;
      case 'profile':
        this.router.navigate(buildMySpaceProfileRoute());
        break;
    }
  }

  onMenuButtonClick(event: any) {
    this.menuClick = true;
    this.topbarMenuActive = false;

    if (this.layoutMode === 'overlay' && !this.isMobile()) {
      this.overlayMenuActive = !this.overlayMenuActive;
    } else {
      if (!this.isDesktop()) {
        this.overlayMenuMobileActive = !this.overlayMenuMobileActive;
      }
    }

    event.preventDefault();
  }

  onMenuClick() {
    this.menuClick = true;
  }

  onConfigClick() {
    this.configClick = true;
  }

  hideOverlayMenu() {
    this.overlayMenuActive = false;
    this.overlayMenuMobileActive = false;
  }

  isDesktop() {
    return window.innerWidth > 990;
  }

  isMobile() {
    return window.innerWidth <= 990;
  }

  isOverlay() {
    return this.layoutMode === 'overlay';
  }

  isHorizontal() {
    return this.layoutMode === 'horizontal';
  }
}
