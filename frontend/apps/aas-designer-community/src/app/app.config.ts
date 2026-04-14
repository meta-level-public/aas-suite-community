import { ErrorHandlerService } from '@aas/aas-designer-shared';
import { AasSuitePreset } from '@aas/common-components';
import { AppConfigService, NotificationService, PortalService } from '@aas/common-services';
import { CsrfInterceptor, HttpErrorInterceptor, LanguageInterceptor, RequestContextInterceptor } from '@aas/jwt-auth';
import { CustomTranslateLoader } from '@aas/translations';
import { API_BASE_URL } from '@aas/webapi-client';
import { HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import {
  ApplicationConfig,
  ErrorHandler,
  importProvidersFrom,
  inject,
  provideAppInitializer,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import { DialogService } from 'primeng/dynamicdialog';
import { lastValueFrom } from 'rxjs';
import { appRoutes } from './app.routes';

function getRuntimeVar(key: string, fallback: string): string {
  const runtimeWindow = window as unknown as Record<string, unknown>;
  const value = runtimeWindow[key];
  if (typeof value === 'string' && value.trim() !== '') {
    return value.trim();
  }
  return fallback;
}

function normalizeBaseUrl(url: string): string {
  return url.trim().replace(/\/+$/, '');
}

function ensureDesignerApiBaseUrl(url: string): string {
  const normalizedUrl = normalizeBaseUrl(url);

  if (normalizedUrl.endsWith('/designer-api')) {
    return normalizedUrl;
  }

  if (normalizedUrl.endsWith('/designer')) {
    return `${normalizedUrl.slice(0, -'/designer'.length)}/designer-api`;
  }

  return `${normalizedUrl}/designer-api`;
}

function getDefaultApiBaseUrl(): string {
  const locationOrigin = window?.location?.origin;
  if (typeof locationOrigin === 'string' && locationOrigin.trim() !== '') {
    return ensureDesignerApiBaseUrl(locationOrigin);
  }

  return 'http://localhost:8081/designer-api';
}

function getDesignerBaseUrlFallback(): string {
  return ensureDesignerApiBaseUrl(getRuntimeVar('__AAS_FRONTEND_API_BASE_URL', getDefaultApiBaseUrl()));
}

export function initializeAppTranslate(translate: TranslateService) {
  const portalService = inject(PortalService);
  const currentLanguage = portalService.currentLanguage;

  portalService.currentLanguage = currentLanguage;

  return (): Promise<unknown> => lastValueFrom(translate.use(currentLanguage));
}

export function getAppConfig(): ApplicationConfig {
  return {
    providers: [
      provideZoneChangeDetection({ eventCoalescing: true }),
      provideRouter(appRoutes),
      provideAnimationsAsync(),
      provideAppInitializer(() => {
        const appConfigService = inject(AppConfigService);
        return appConfigService.loadConfig();
      }),
      provideAppInitializer(() => {
        const initializerFn = initializeAppTranslate(inject(TranslateService));
        return initializerFn();
      }),
      provideAppInitializer(() => lastValueFrom(inject(HttpClient).get('/bff/csrf', { responseType: 'text' }))),
      provideAppInitializer(() => inject(PortalService).restoreServerSession()),
      MessageService,
      ConfirmationService,
      DialogService,
      NotificationService,
      { provide: HTTP_INTERCEPTORS, useClass: CsrfInterceptor, multi: true },
      { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true },
      { provide: HTTP_INTERCEPTORS, useClass: RequestContextInterceptor, multi: true },
      { provide: HTTP_INTERCEPTORS, useClass: LanguageInterceptor, multi: true },
      { provide: ErrorHandler, useClass: ErrorHandlerService },
      {
        provide: API_BASE_URL,
        useValue: getRuntimeVar('__AAS_FRONTEND_DESIGNER_BASE_URL', getDesignerBaseUrlFallback()),
      },
      provideHttpClient(withInterceptorsFromDi()),
      providePrimeNG({
        theme: {
          preset: AasSuitePreset,
          options: {
            darkModeSelector: '.my-app-dark',
          },
        },
      }),
      importProvidersFrom(
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: CustomTranslateLoader,
          },
        }),
      ),
    ],
  };
}
