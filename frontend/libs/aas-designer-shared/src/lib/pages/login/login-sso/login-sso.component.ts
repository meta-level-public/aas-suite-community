import { NotificationService } from '@aas/common-services';
import { SystemConfigurationDto } from '@aas/webapi-client';
import { Component, inject, input, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';

export function resolveSsoConfigName(systemConfiguration: SystemConfigurationDto | null): string {
  const configuredName = systemConfiguration?.ssoConfigName?.trim();
  return configuredName !== '' && configuredName != null ? configuredName : 'keycloak';
}

@Component({
  selector: 'aas-login-sso',
  imports: [TranslateModule, ButtonModule],
  templateUrl: './login-sso.component.html',
  styleUrl: './login-sso.component.scss',
})
export class LoginSsoComponent {
  loading = signal<boolean>(false);
  notificationService = inject(NotificationService);

  systemConfiguration = input.required<SystemConfigurationDto | null>();

  async startSsoLogin() {
    const ssoConfigName = resolveSsoConfigName(this.systemConfiguration());
    if (!ssoConfigName) {
      this.notificationService.showMessageAlways('SSO_CONFIG_NOT_FOUND', 'ERROR', 'error', true);
      return;
    }

    const returnUrl = sessionStorage.getItem('post-login-redirect-url') ?? '/';
    const url = `/bff/auth/sso/start?ssoSource=${encodeURIComponent(ssoConfigName)}&returnUrl=${encodeURIComponent(returnUrl)}`;
    window.location.assign(url);
  }
}
