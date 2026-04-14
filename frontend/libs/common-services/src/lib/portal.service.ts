import { AuthenticateResponse, OrgaSettings, ResultCode } from '@aas-designer-model';
import { AvailableInfastructure } from '@aas/webapi-client';
import { HttpClient } from '@angular/common/http';
import { EventEmitter, inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  AppRouteSegments,
  buildCdEditRoute,
  buildRepoEditRoute,
  buildShellRegistryCorrectionRoute,
  buildViewerRoute,
  normalizePostLoginRedirectUrl,
} from './app-routes';

const USER_KEY = 'auth-user';
const IRI_PREFIX_KEY = 'organisation-iri-prefix';
const POST_LOGIN_REDIRECT_URL_KEY = 'post-login-redirect-url';
const SKIP_DEACTIVATE_PROMPT_KEY = 'skip-deactivate-prompt-once';
export const CURRENT_LANGUAGE_KEY = 'aasportal_currentLanguage';
export const DEFAULT_LANGUAGE = 'en';

@Injectable({
  providedIn: 'root',
})
export class PortalService {
  static readonly defaultPrefix = 'https://example.com/';
  static readonly defaultLanguage = DEFAULT_LANGUAGE;
  private readonly http = inject(HttpClient);

  get currentLanguage(): string {
    return window.localStorage.getItem(CURRENT_LANGUAGE_KEY) ?? PortalService.defaultLanguage;
  }

  set currentLanguage(language: string) {
    window.localStorage.setItem(CURRENT_LANGUAGE_KEY, language);
  }

  loginStateChanged = new EventEmitter<boolean>();
  currentInfrastructureChanged = new EventEmitter<boolean>();

  logIn(
    res: AuthenticateResponse,
    selectedOrga: OrgaSettings,
    doRoute: boolean = true,
    redirectUrl: string = '/dashboard',
  ) {
    const sanitizedUser = AuthenticateResponse.fromDto({
      ...res,
      jwtToken: '',
      refreshToken: '',
    });
    sanitizedUser.orgaSettings = sanitizedUser.orgaSettings.map((orga) =>
      orga.orgaId === selectedOrga.orgaId ? selectedOrga : orga,
    );

    this.saveUser(sanitizedUser);
    this.saveOrganisationPrefixIri(selectedOrga.iriPrefix);
    this.saveCurrentOrganisation(selectedOrga);

    // Emit login state change BEFORE routing to ensure components on the new route see the updated state
    this.loginStateChanged.emit(true);

    if (doRoute) {
      const targetUrl = this.consumePostLoginRedirectUrl() ?? redirectUrl;
      this.router.navigateByUrl(targetUrl);
    }
  }

  constructor(private router: Router) {}

  getRights() {
    const rights = PortalService.getCurrentOrgaRights() ?? [];
    if (this.user?.rollen && this.user.rollen.length > 0) {
      rights.push(...this.user.rollen);
    }

    return rights;
  }

  logout(doRouting: boolean = false, skipDeactivatePrompt: boolean = false): void {
    if (skipDeactivatePrompt) {
      this.markSkipDeactivatePrompt();
    }
    window.sessionStorage.clear();
    this.loginStateChanged.emit(false);
    void firstValueFrom(this.http.post<{ logoutUrl?: string }>('/bff/logout', {}))
      .then((response) => {
        if (response?.logoutUrl) {
          window.location.assign(response.logoutUrl);
          return;
        }

        if (doRouting) {
          void this.router.navigate([AppRouteSegments.login]);
        }
      })
      .catch(() => {
        if (doRouting) {
          void this.router.navigate([AppRouteSegments.login]);
        }
      });
  }

  markSkipDeactivatePrompt(): void {
    window.localStorage.setItem(SKIP_DEACTIVATE_PROMPT_KEY, '1');
  }

  consumeSkipDeactivatePrompt(): boolean {
    const shouldSkip = window.localStorage.getItem(SKIP_DEACTIVATE_PROMPT_KEY) === '1';
    if (shouldSkip) {
      window.localStorage.removeItem(SKIP_DEACTIVATE_PROMPT_KEY);
    }
    return shouldSkip;
  }

  public saveUser(user: AuthenticateResponse): void {
    window.sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  public getLanguage() {
    return this.currentLanguage;
  }

  get user() {
    const user = window.sessionStorage.getItem(USER_KEY);
    if (user) {
      return AuthenticateResponse.fromDto(JSON.parse(user));
    }
    return null;
  }

  get loggedIn() {
    return this.user != null;
  }

  async fetchServerSession(): Promise<AuthenticateResponse | null> {
    try {
      const session = await firstValueFrom(this.http.get<AuthenticateResponse>('/bff/session'));
      return AuthenticateResponse.fromDto(session);
    } catch {
      return null;
    }
  }

  async restoreServerSession(
    doRoute: boolean = false,
    redirectUrl: string = '/dashboard',
  ): Promise<AuthenticateResponse | null> {
    const sessionUser = await this.fetchServerSession();
    if (sessionUser == null || sessionUser.resultCode !== ResultCode.OK) {
      window.sessionStorage.removeItem(USER_KEY);
      return sessionUser;
    }

    const selectedOrga = this.resolveSelectedOrga(sessionUser);
    if (selectedOrga == null) {
      return sessionUser;
    }

    this.logIn(sessionUser, selectedOrga, doRoute, redirectUrl);
    return sessionUser;
  }

  async refreshServerSession(): Promise<AuthenticateResponse | null> {
    try {
      const session = await firstValueFrom(this.http.post<AuthenticateResponse>('/bff/session/refresh', {}));
      return AuthenticateResponse.fromDto(session);
    } catch {
      return null;
    }
  }

  get iriPrefix() {
    const prefix = window.sessionStorage.getItem(IRI_PREFIX_KEY);
    if (prefix) {
      return prefix;
    }
    return PortalService.defaultPrefix;
  }

  public saveOrganisationPrefixIri(prefix: string) {
    window.sessionStorage.removeItem(IRI_PREFIX_KEY);
    window.sessionStorage.setItem(IRI_PREFIX_KEY, prefix?.trim());
  }

  public saveCurrentOrganisation(orgaSettings: OrgaSettings) {
    window.sessionStorage.removeItem('CURRENT_ORGA_ID');
    window.sessionStorage.setItem('CURRENT_ORGA_ID', orgaSettings.orgaId.toString());
    window.sessionStorage.removeItem('CURRENT_ORGA_SETTINGS');
    window.sessionStorage.setItem('CURRENT_ORGA_SETTINGS', JSON.stringify(orgaSettings));
  }

  public saveCurrentInfrastructureSetting(infrastructureSetting: AvailableInfastructure) {
    window.localStorage.removeItem('CURRENT_AAS_INFRASTRUCTURE');
    window.localStorage.setItem('CURRENT_AAS_INFRASTRUCTURE', JSON.stringify(infrastructureSetting));
    this.currentInfrastructureChanged.emit(true);
  }

  public static removeCurrentInfrastructureSetting() {
    window.localStorage.removeItem('CURRENT_AAS_INFRASTRUCTURE');
  }

  saveOrganisationLogo(logoBase64: string) {
    const orgaSettings = PortalService.getCurrentOrgaSettings();
    orgaSettings.logoBase64 = logoBase64;
    window.sessionStorage.removeItem('CURRENT_ORGA_SETTINGS');
    window.sessionStorage.setItem('CURRENT_ORGA_SETTINGS', JSON.stringify(orgaSettings));
  }

  public static getCurrentOrgaId() {
    const orgaIdString = window.sessionStorage.getItem('CURRENT_ORGA_ID');
    if (orgaIdString) {
      return parseInt(orgaIdString, 10);
    } else {
      return null;
    }
  }

  public static getCurrentAasInfrastructureSetting() {
    const aasInfrastructureString = window.localStorage.getItem('CURRENT_AAS_INFRASTRUCTURE');
    if (aasInfrastructureString && aasInfrastructureString !== 'undefined') {
      return JSON.parse(aasInfrastructureString) as AvailableInfastructure;
    } else {
      return null;
    }
  }

  public static getCurrentAasInfrastructureId(defaultValue: number = -1): number {
    return this.getCurrentAasInfrastructureSetting()?.id ?? defaultValue;
  }

  public static buildRepoEditRoute(aasId: string): (string | number)[] {
    return buildRepoEditRoute(this.getCurrentAasInfrastructureId(), aasId);
  }

  public static buildCdEditRoute(cdId: string): (string | number)[] {
    return buildCdEditRoute(this.getCurrentAasInfrastructureId(), cdId);
  }

  public static buildViewerRoute(aasId: string): (string | number)[] {
    return buildViewerRoute(this.getCurrentAasInfrastructureId(), aasId);
  }

  public static buildShellRegistryCorrectionRoute(aasId: string): (string | number)[] {
    return buildShellRegistryCorrectionRoute(aasId);
  }

  public static getRepositoryUrl() {
    const aasInfrastructureString = window.localStorage.getItem('CURRENT_AAS_INFRASTRUCTURE');
    if (aasInfrastructureString && aasInfrastructureString !== 'undefined') {
      return (JSON.parse(aasInfrastructureString) as AvailableInfastructure).aasRepositoryUrl ?? '';
    } else {
      return '';
    }
  }

  public static getCurrentOrgaTheme() {
    const settings = window.sessionStorage.getItem('CURRENT_ORGA_SETTINGS');
    if (settings) {
      return JSON.parse(settings).themeUrl;
    }
    return 'default';
  }

  public static getCurrentOrgaRights() {
    const settings = window.sessionStorage.getItem('CURRENT_ORGA_SETTINGS');
    if (settings) {
      return JSON.parse(settings).rollen;
    }
    return [];
  }

  public static getCurrentOrgaSettings() {
    const settings = window.sessionStorage.getItem('CURRENT_ORGA_SETTINGS');
    if (settings) {
      return JSON.parse(settings);
    }
    return null;
  }

  public static getOrganisationIriPrefix() {
    return window.sessionStorage.getItem(IRI_PREFIX_KEY) ?? this.defaultPrefix;
  }

  savePostLoginRedirectUrl(url: string | null | undefined): void {
    if (!url) {
      return;
    }
    const normalizedUrl = this.normalizeRedirectUrl(url);
    if (!normalizedUrl) {
      return;
    }
    window.sessionStorage.setItem(POST_LOGIN_REDIRECT_URL_KEY, normalizedUrl);
  }

  consumePostLoginRedirectUrl(): string | null {
    const redirectUrl = window.sessionStorage.getItem(POST_LOGIN_REDIRECT_URL_KEY);
    window.sessionStorage.removeItem(POST_LOGIN_REDIRECT_URL_KEY);
    const normalizedUrl = this.normalizeRedirectUrl(redirectUrl);
    return normalizedUrl;
  }

  private normalizeRedirectUrl(url: string | null | undefined): string | null {
    return normalizePostLoginRedirectUrl(url);
  }

  private resolveSelectedOrga(user: AuthenticateResponse): OrgaSettings | null {
    const currentOrgaId = PortalService.getCurrentOrgaId();
    if (currentOrgaId != null) {
      const currentOrga = user.orgaSettings.find((orga) => orga.orgaId === currentOrgaId);
      if (currentOrga != null) {
        return this.mergePersistedCurrentOrganisation(currentOrga);
      }
    }

    if (user.preferredOrgaId != null) {
      const preferredOrga = user.orgaSettings.find((orga) => orga.orgaId === user.preferredOrgaId);
      if (preferredOrga != null) {
        return preferredOrga;
      }
    }

    return user.orgaSettings[0] ?? null;
  }

  private mergePersistedCurrentOrganisation(orgaSettings: OrgaSettings): OrgaSettings {
    const persistedSettings = PortalService.getCurrentOrgaSettings();
    if (persistedSettings == null || persistedSettings.orgaId !== orgaSettings.orgaId) {
      return orgaSettings;
    }

    return {
      ...orgaSettings,
      themeUrl: persistedSettings.themeUrl ?? orgaSettings.themeUrl,
    };
  }
}
