import {
  AccessService,
  AppRouteSegments,
  buildAbsoluteRoute,
  buildForbiddenRoute,
  PortalService,
} from '@aas/common-services';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let portal: { loggedIn: boolean; isPublicViewerSession: boolean; prepareLogin: ReturnType<typeof vi.fn> };
  let allowedRights: string[];
  let router: { navigate: ReturnType<typeof vi.fn> };
  let guard: AuthGuard;

  const state = { url: '/shells-list' } as RouterStateSnapshot;
  const route = (rights?: string[]) => ({ data: rights ? { rights } : {}, routeConfig: {} }) as ActivatedRouteSnapshot;

  beforeEach(() => {
    portal = { loggedIn: true, isPublicViewerSession: false, prepareLogin: vi.fn() };
    allowedRights = [];
    router = { navigate: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        { provide: PortalService, useValue: portal },
        { provide: AccessService, useValue: { isAllowed: (right: string) => allowedRights.includes(right) } },
        { provide: Router, useValue: router },
      ],
    });
    guard = TestBed.inject(AuthGuard);
  });

  it('sends users who are not logged in to the login and remembers the target', () => {
    portal.loggedIn = false;

    expect(guard.canActivate(route(), state)).toBe(false);
    expect(portal.prepareLogin).toHaveBeenCalledWith('/shells-list');
    expect(router.navigate).toHaveBeenCalledWith(buildAbsoluteRoute(AppRouteSegments.login));
  });

  it('treats a public viewer session as not logged in', () => {
    portal.isPublicViewerSession = true;

    expect(guard.canActivate(route(), state)).toBe(false);
    expect(portal.prepareLogin).toHaveBeenCalled();
  });

  it('allows logged in users on routes without required rights', () => {
    expect(guard.canActivate(route(), state)).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('allows the route when one of the required rights is granted', () => {
    allowedRights = ['ORGA_ADMIN'];

    expect(guard.canActivate(route(['SYSTEM_ADMIN', 'ORGA_ADMIN']), state)).toBe(true);
  });

  it('sends users without any required right to the forbidden page', () => {
    allowedRights = ['USER'];

    expect(guard.canActivate(route(['SYSTEM_ADMIN']), state)).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(buildForbiddenRoute());
  });
});
