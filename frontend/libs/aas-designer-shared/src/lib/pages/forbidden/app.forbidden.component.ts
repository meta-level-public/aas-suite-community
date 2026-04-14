import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-forbidden',
  templateUrl: './app.forbidden.component.html',
  imports: [ButtonModule, RouterLink, TranslateModule],
})
export class AppForbiddenComponent {
  private static readonly forbiddenReasonKey = 'aasForbiddenReason';
  private static readonly forbiddenReturnUrlKey = 'aasForbiddenReturnUrl';

  private readonly translate = inject(TranslateService);
  private readonly router = inject(Router);

  readonly reason =
    sessionStorage.getItem(AppForbiddenComponent.forbiddenReasonKey) ??
    this.translate.instant('FORBIDDEN_REASON_DEFAULT');
  readonly returnUrl = sessionStorage.getItem(AppForbiddenComponent.forbiddenReturnUrlKey) ?? '/';

  constructor() {
    sessionStorage.removeItem(AppForbiddenComponent.forbiddenReasonKey);
  }

  goBack(): void {
    const targetUrl = this.returnUrl && this.returnUrl !== '/forbidden' ? this.returnUrl : '/';
    sessionStorage.removeItem(AppForbiddenComponent.forbiddenReturnUrlKey);
    void this.router.navigateByUrl(targetUrl);
  }
}
