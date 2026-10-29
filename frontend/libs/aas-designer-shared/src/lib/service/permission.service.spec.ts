import { AuthRoles } from '@aas-designer-model';
import { AccessService, PortalService } from '@aas/common-services';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PermissionService } from './permission.service';

describe('PermissionService', () => {
  let service: PermissionService;
  let router: { navigate: ReturnType<typeof vi.fn>; getCurrentNavigation: () => unknown };
  const portalService = { loggedIn: true, isPublicViewerSession: false, prepareLogin: vi.fn(), user: { id: 3 } };

  beforeEach(() => {
    portalService.loggedIn = true;
    portalService.isPublicViewerSession = false;
    portalService.prepareLogin.mockClear();
    router = {
      navigate: vi.fn(),
      getCurrentNavigation: () => ({ finalUrl: { toString: () => '/shells-list' } }),
    };
    TestBed.configureTestingModule({
      providers: [
        PermissionService,
        { provide: PortalService, useValue: portalService },
        { provide: AccessService, useValue: { isAllowed: () => false } },
        { provide: Router, useValue: router },
      ],
    });
    service = TestBed.inject(PermissionService);
  });

  it('sends a public viewer session to the login and remembers the requested page', () => {
    portalService.isPublicViewerSession = true;

    expect(service.isAllowed([AuthRoles.BENUTZER])).toBe(false);

    expect(portalService.prepareLogin).toHaveBeenCalledWith('/shells-list');
    expect(router.navigate).toHaveBeenCalledWith(['/', 'login'], { skipLocationChange: true });
  });

  it('shows the forbidden page to designer users without the required rights', () => {
    expect(service.isAllowed([AuthRoles.SYSTEM_ADMIN])).toBe(false);

    expect(portalService.prepareLogin).not.toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/', 'forbidden']);
  });
});
