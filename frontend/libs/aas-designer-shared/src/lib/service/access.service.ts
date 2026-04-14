import { AppRouteSegments, PortalService } from '@aas/common-services';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AccessService {
  private allowedPathMap: string[] = [];

  constructor(private portalService: PortalService) {
    this.allowedPathMap.push('home');
    this.allowedPathMap.push(AppRouteSegments.login);
    this.allowedPathMap.push('logout');
    this.allowedPathMap.push(AppRouteSegments.forbidden);
  }

  addStaticAllowedPath(path: string) {
    if (this.allowedPathMap.indexOf(path.toLowerCase()) === -1) {
      this.allowedPathMap.push(path.toLowerCase());
    }
  }

  isAllowed(rightPath?: string): boolean {
    if (this.portalService.loggedIn) {
      const rights = this.portalService.getRights();
      if (rightPath == null) {
        return true;
      } else {
        return rights.includes(rightPath);
      }
    }
    return false;
  }
}
