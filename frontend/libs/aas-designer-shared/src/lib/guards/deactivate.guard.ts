import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { DirtyCheckable } from '@aas-designer-model';
import { AasConfirmationService, PortalService } from '@aas/common-services';

@Injectable({
  providedIn: 'root',
})
export class DeactivateGuard {
  constructor(
    private confirmService: AasConfirmationService,
    private translate: TranslateService,
    private portalService: PortalService,
  ) {}
  canDeactivate(
    component: unknown,
    _currentRoute: ActivatedRouteSnapshot,
    _currentState: RouterStateSnapshot,
    _nextState?: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.portalService.consumeSkipDeactivatePrompt()) {
      return true;
    }

    if (component instanceof DirtyCheckable) {
      if (component.isDirty()) {
        return this.confirmService.confirm({
          message: this.translate.instant('WOULD_YOU_LIKE_TO_CONTINUE_WITHOUT_SAVING'),
        });
      } else return true;
    } else return true;
  }
}
