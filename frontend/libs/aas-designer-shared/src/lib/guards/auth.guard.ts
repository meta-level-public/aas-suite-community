import {
  AccessService,
  AppRouteSegments,
  PortalService,
  buildAbsoluteRoute,
  buildForbiddenRoute,
} from '@aas/common-services';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  constructor(
    private accessService: AccessService,
    private portalService: PortalService,
    private router: Router,
  ) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // sonderfall public-viewer
    if (route.routeConfig?.path === AppRouteSegments.publicViewer && !this.portalService.loggedIn) {
      // nutzer besorgen
    }

    if (!this.portalService.loggedIn) {
      this.portalService.logout();
      this.portalService.savePostLoginRedirectUrl(state.url);
      this.router.navigate(buildAbsoluteRoute(AppRouteSegments.login));
      return false;
    }

    const requiredAccessRights: string[] = route.data['rights'] ?? [];
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

    if (!allowed) {
      this.router.navigate(buildForbiddenRoute());
      return false;
    }

    return true;
  }
}
