import { AuthenticateResponse, AuthRoles, ResultCode } from '@aas-designer-model';
import { AppConfigService, PortalService } from '@aas/common-services';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { lastValueFrom } from 'rxjs';
import { PrivacyDialogComponent } from '../privacy-dialog/privacy-dialog.component';

@Component({
  selector: 'aas-sso-login-success',
  imports: [ButtonModule, PrivacyDialogComponent, TranslateModule, CardModule],
  templateUrl: './sso-login-success.component.html',
})
export class SsoLoginSuccessComponent implements OnInit {
  http = inject(HttpClient);
  appConfigService = inject(AppConfigService);
  portalService = inject(PortalService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  loading = signal<boolean>(false);
  hasProblem = signal<boolean>(false);

  loginResult = signal<AuthenticateResponse | null>(null);
  showPrivacy = signal<boolean>(false);

  ResultCode = ResultCode;
  AuthRoles = AuthRoles;

  ngOnInit() {
    void this.initSso();
  }

  async initSso() {
    try {
      this.loading.set(true);
      const resultCode = this.route.snapshot.queryParamMap.get('resultCode');
      const additionalMessage = this.route.snapshot.queryParamMap.get('message') ?? '';
      if (resultCode != null) {
        this.loginResult.set(
          AuthenticateResponse.fromDto({
            resultCode,
            additionalMessage,
          }),
        );
        this.hasProblem.set(true);
        return;
      }

      const loginResult = await this.portalService.fetchServerSession();
      this.loginResult.set(loginResult);
      if (loginResult == null) {
        this.hasProblem.set(true);
        return;
      }

      if (loginResult.resultCode === ResultCode.OK) {
        await this.portalService.restoreServerSession(false);
        await this.router.navigateByUrl(this.portalService.consumePostLoginRedirectUrl() ?? '/');
        return;
      }

      this.hasProblem.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  public get name() {
    return this.loginResult()?.vorname ?? '';
  }

  public logout() {
    this.portalService.logout(true);
  }

  openPrivacy() {
    this.showPrivacy.set(true);
  }

  async privacyAccept(accepted: boolean) {
    this.showPrivacy.set(false);
    if (accepted) {
      try {
        this.loading.set(true);
        await lastValueFrom(this.http.post(`${this.appConfigService.config.apiPath}/Auth/AcceptPrivacy`, {}));
        await this.portalService.refreshServerSession();
        await this.portalService.restoreServerSession(false);
        await this.router.navigateByUrl(this.portalService.consumePostLoginRedirectUrl() ?? '/');
      } finally {
        this.loading.set(false);
      }
    } else {
      this.portalService.logout(true);
    }
  }
}
