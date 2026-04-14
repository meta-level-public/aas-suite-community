import { AuthRoles } from '@aas-designer-model';
import {
  AccessService,
  AppRouteSegments,
  PortalService,
  buildAbsoluteRoute,
  buildForbiddenRoute,
} from '@aas/common-services';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  constructor(
    private accessService: AccessService,
    private portalService: PortalService,
    private router: Router,
  ) {}

  isAllowed(requiredAccessRights: AuthRoles[]) {
    if (!this.portalService.loggedIn) {
      this.portalService.logout();
      const requestedUrl =
        this.router.getCurrentNavigation()?.finalUrl?.toString() ??
        this.router.getCurrentNavigation()?.extractedUrl?.toString() ??
        null;
      this.portalService.savePostLoginRedirectUrl(requestedUrl);
      this.router.navigate(buildAbsoluteRoute(AppRouteSegments.login), { skipLocationChange: true });
      return false;
    }

    let allowed = false;
    requiredAccessRights.forEach((r) => {
      if (this.accessService.isAllowed(r)) {
        allowed = true;
      }
    });
    if (requiredAccessRights.length === 0) {
      // no restriction for any right, only login required
      allowed = true;
    }

    if (!allowed && this.portalService.user != null && this.portalService.user.id < 0) {
      this.portalService.logout(true);
      return false;
    }
    if (!allowed) {
      this.router.navigate(buildForbiddenRoute());
      return false;
    }

    return true;
  }
}
