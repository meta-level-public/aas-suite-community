import { AasSuitePreset } from '@aas/common-components';
import { AppConfigService } from '@aas/common-services';
import { CsrfInterceptor, HttpErrorInterceptor, LanguageInterceptor, RequestContextInterceptor } from '@aas/jwt-auth';
import { NewsService } from '@aas/news';
import { CustomTranslateLoader } from '@aas/translations';
import { HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ErrorHandler, inject, provideAppInitializer } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import { DialogService } from 'primeng/dynamicdialog';
import { lastValueFrom } from 'rxjs';
import { APP_ROUTES } from './app.routes';
import { ErrorHandlerService } from './service/error-handler.service';
import { PortalService } from './service/portal.service';

export function initializeAppTranslate(translate: TranslateService, portalService: PortalService) {
  const currentLanguage = portalService.currentLanguage;

  portalService.currentLanguage = currentLanguage;

  return (): Promise<unknown> => lastValueFrom(translate.use(currentLanguage));
}

export function initConfig(appConfig: AppConfigService) {
  return () => appConfig.loadConfig();
}

export function initializeCsrf(http: HttpClient) {
  return () => lastValueFrom(http.get('/bff/csrf', { responseType: 'text' }));
}

export const AAS_DESIGNER_CORE_PROVIDERS = [
  provideRouter(APP_ROUTES, withComponentInputBinding()),
  ConfirmationService,
  MessageService,
  { provide: HTTP_INTERCEPTORS, useClass: CsrfInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: RequestContextInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: LanguageInterceptor, multi: true },
  { provide: ErrorHandler, useClass: ErrorHandlerService },
  provideAppInitializer(() => {
    const initializerFn = initializeAppTranslate(inject(TranslateService), inject(PortalService));
    return initializerFn();
  }),
  provideAppInitializer(() => {
    const initializerFn = initializeCsrf(inject(HttpClient));
    return initializerFn();
  }),
  provideAppInitializer(() => {
    const initializerFn = initConfig(inject(AppConfigService));
    return initializerFn();
  }),
  DialogService,
  NewsService,
  provideHttpClient(withInterceptorsFromDi()),
  providePrimeNG({
    theme: {
      preset: AasSuitePreset,
      options: {
        darkModeSelector: '.my-app-dark',
      },
    },
  }),
];

export const AAS_DESIGNER_CORE_IMPORTS = [
  TranslateModule.forRoot({
    loader: {
      provide: TranslateLoader,
      useClass: CustomTranslateLoader,
    },
  }),
];
