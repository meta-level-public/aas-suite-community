import { animate, state, style, transition, trigger } from '@angular/animations';
import { NgClass, NgStyle } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { MenuService } from '../../app.menu.service';
import { AppMainComponent } from '@aas/aas-designer-shared';

@Component({
  selector: '[app-menuitem]',
  templateUrl: './app-menuitem.component.html',
  host: {
    '[class.active-menuitem]':
      '(selectedKey && app.isHorizontal()) || (active && !app.isHorizontal()) ' +
      '|| (active && !root && app.isHorizontal())',
    '[class.active-rootmenuitem]': 'active && root && app.isHorizontal()',
  },
  animations: [
    trigger('children', [
      state(
        'void',
        style({
          height: '0px',
        }),
      ),
      state(
        'hiddenAnimated',
        style({
          height: '0px',
        }),
      ),
      state(
        'visibleAnimated',
        style({
          height: '*',
        }),
      ),
      state(
        'visible',
        style({
          height: '*',
          'z-index': 999,
        }),
      ),
      state(
        'hidden',
        style({
          height: '0px',
          'z-index': '*',
        }),
      ),
      transition('visibleAnimated => hiddenAnimated', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)')),
      transition('hiddenAnimated => visibleAnimated', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)')),
      transition('void => visibleAnimated, visibleAnimated => void', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)')),
    ]),
  ],
  imports: [NgClass, RouterLinkActive, RouterLink, NgStyle],
})
export class AppMenuitemComponent implements OnInit, OnDestroy {
  @Input() item: any;

  @Input() index: number | undefined;

  @Input() root: boolean | undefined;

  @Input() parentKey: string | undefined;

  animating: boolean = false;

  active = false;

  menuSourceSubscription: Subscription;

  menuResetSubscription: Subscription;

  key: string = '';

  selectedKey: boolean = false;

  constructor(
    public app: AppMainComponent,
    public router: Router,
    private cd: ChangeDetectorRef,
    private menuService: MenuService,
  ) {
    this.menuSourceSubscription = this.menuService.menuSource$.subscribe((key) => {
      // deactivate current active menu
      if (this.active && this.key !== key && key.indexOf(this.key) !== 0) {
        this.active = false;
      }
    });

    this.menuResetSubscription = this.menuService.resetSource$.subscribe(() => {
      this.active = false;
    });

    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      if (this.app.isHorizontal() && this.item.routerLink) {
        this.active = false;
        this.selectedKey = this.router.isActive(this.item.routerLink[0], !this.item.items && !this.item.preventExact);
        if (this.item.altLink != null && this.selectedKey === false) {
          this.selectedKey = this.router.isActive(this.item.altLink[0], !this.item.items && !this.item.preventExact);
        }
      } else {
        if (this.item.routerLink) {
          this.updateActiveStateFromRoute();
        } else {
          this.active = false;
        }
      }
    });
  }

  ngOnInit() {
    if (!this.app.isHorizontal() && this.item.routerLink) {
      this.updateActiveStateFromRoute();
    }

    if (this.app.isHorizontal() && this.item.routerLink) {
      this.active = false;
      this.selectedKey = this.router.isActive(this.item.routerLink[0], this.item.items ? false : true);
    }

    this.key = this.parentKey ? this.parentKey + '-' + this.index : String(this.index);
  }

  updateActiveStateFromRoute() {
    this.active = this.router.isActive(this.item.routerLink[0], !this.item.items && !this.item.preventExact);
  }

  itemClick(event: Event) {
    // avoid processing disabled items
    if (this.item.disabled) {
      event.preventDefault();
      return;
    }

    // navigate with hover in horizontal mode
    if (this.root) {
      this.app.menuHoverActive = !this.app.menuHoverActive;
    }

    // notify other items
    this.menuService.onMenuStateChange(this.key);

    // execute command
    if (this.item.command) {
      this.item.command({ originalEvent: event, item: this.item });
    }

    // toggle active state
    if (this.item.items) {
      this.active = !this.active;
      this.animating = true;
    } else {
      // activate item
      this.active = true;

      // reset horizontal menu
      if (this.app.isHorizontal()) {
        this.menuService.reset();
      }

      this.app.overlayMenuActive = false;
      this.app.overlayMenuMobileActive = false;
      this.app.menuHoverActive = !this.app.menuHoverActive;
    }
  }

  onMouseEnter() {
    // activate item on hover
    if (this.root && this.app.menuHoverActive && this.app.isHorizontal() && this.app.isDesktop()) {
      this.menuService.onMenuStateChange(this.key);
      this.active = true;
    }
  }

  onAnimationDone() {
    this.animating = false;
  }

  ngOnDestroy() {
    if (this.menuSourceSubscription) {
      this.menuSourceSubscription.unsubscribe();
    }

    if (this.menuResetSubscription) {
      this.menuResetSubscription.unsubscribe();
    }
  }
}
