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

    // SHELLS_READER und SHELLS_EDITOR sind virtuelle Server-Rollen, die nie ins sessionStorage
    // geschrieben werden. Sie werden stattdessen aus der gewählten Infrastruktur abgeleitet:
    // isReadonly=false → SHELLS_EDITOR; Infra vorhanden (Backend filtert ohne DarfLesen raus) → SHELLS_READER.
    const currentInfra = PortalService.getCurrentAasInfrastructureSetting();

    let allowed = false;
    requiredAccessRights.forEach((r) => {
      if (this.accessService.isAllowed(r)) {
        allowed = true;
      }
      if (!allowed && r === AuthRoles.SHELLS_READER && currentInfra != null) {
        allowed = true;
      }
      if (!allowed && r === AuthRoles.SHELLS_EDITOR && currentInfra != null && currentInfra.isReadonly === false) {
        allowed = true;
      }
    });
    if (requiredAccessRights.length === 0) {
      // no restriction for any right, only login required
      allowed = true;
    }

    if (!allowed) {
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
