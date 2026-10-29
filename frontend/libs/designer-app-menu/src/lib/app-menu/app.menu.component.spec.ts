import { ADDITIONAL_MENU_ITEMS } from '@aas-designer-model';
import { HelpService } from '@aas/common-components';
import {
  AccessService,
  AppConfigService,
  PluginRegistryService,
  PortalService,
  ViewportService,
} from '@aas/common-services';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppMenuComponent } from './app.menu.component';

describe('AppMenuComponent', () => {
  let fixture: ComponentFixture<AppMenuComponent>;
  let isMobile: ReturnType<typeof signal<boolean>>;

  async function createMenu(mobile: boolean) {
    isMobile.set(mobile);
    fixture = TestBed.createComponent(AppMenuComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  beforeEach(() => {
    isMobile = signal(true);
    TestBed.configureTestingModule({
      imports: [AppMenuComponent, TranslateModule.forRoot()],
      providers: [
        provideRouter([{ path: '**', children: [] }]),
        {
          provide: PortalService,
          useValue: { loggedIn: true, loginStateChanged: new Subject(), currentInfrastructureChanged: new Subject() },
        },
        { provide: HelpService, useValue: { initHelp: vi.fn() } },
        { provide: ADDITIONAL_MENU_ITEMS, useValue: [] },
        { provide: PluginRegistryService, useValue: { plugins: signal([]) } },
        { provide: AccessService, useValue: { isAllowed: () => true } },
        { provide: AppConfigService, useValue: { config: {} } },
        { provide: ViewportService, useValue: { isMobile: () => isMobile() } },
      ],
    });
  });

  const sidebar = () => fixture.nativeElement.querySelector('aside.app-sidebar') as HTMLElement;
  const backdrop = () => fixture.nativeElement.querySelector('.sidebar-backdrop') as HTMLElement | null;

  it('hides the menu on phones until it is opened', async () => {
    await createMenu(true);

    expect(sidebar().classList).toContain('mobile');
    expect(sidebar().classList).not.toContain('expanded');
    expect(backdrop()).toBeNull();
  });

  it('opens the menu as overlay and closes it via the backdrop', async () => {
    await createMenu(true);
    fixture.componentInstance.toggleSidebar();
    fixture.detectChanges();
    expect(sidebar().classList).toContain('expanded');

    backdrop()?.click();
    fixture.detectChanges();

    expect(sidebar().classList).not.toContain('expanded');
    expect(backdrop()).toBeNull();
  });

  it('closes the menu on phones after navigating', async () => {
    await createMenu(true);
    fixture.componentInstance.toggleSidebar();
    fixture.detectChanges();

    await TestBed.inject(Router).navigateByUrl('/aas');
    fixture.detectChanges();

    expect(fixture.componentInstance.sidebarExpanded()).toBe(false);
  });

  it('keeps the expanded menu open after navigating on larger screens', async () => {
    await createMenu(false);
    fixture.componentInstance.toggleSidebar();
    fixture.detectChanges();

    await TestBed.inject(Router).navigateByUrl('/aas');
    await fixture.whenStable();

    expect(fixture.componentInstance.sidebarExpanded()).toBe(true);
    expect(sidebar().classList).not.toContain('mobile');
  });
});
