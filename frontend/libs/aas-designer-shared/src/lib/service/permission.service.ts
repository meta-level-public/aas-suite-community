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
    // A public viewer session (shared link) is no designer login: sign in again
    if (!this.portalService.loggedIn || this.portalService.isPublicViewerSession) {
      this.portalService.prepareLogin(this.requestedUrl());
      this.router.navigate(buildAbsoluteRoute(AppRouteSegments.login), { skipLocationChange: true });
      return false;
    }

    // Virtual roles of the selected infrastructure (SHELLS_READER, SHELLS_EDITOR, MARKT_PUBLISHER) are part of
    // PortalService.getRights()
    const allowed = requiredAccessRights.some((r) => this.accessService.isAllowed(r));
    // no restriction for any right, only login required
    if (requiredAccessRights.length > 0 && !allowed) {
      this.router.navigate(buildForbiddenRoute());
      return false;
    }

    return true;
  }

  private requestedUrl() {
    const navigation = this.router.getCurrentNavigation();
    return navigation?.finalUrl?.toString() ?? navigation?.extractedUrl?.toString() ?? null;
  }
}
