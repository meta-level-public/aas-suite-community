import {
    HTTP_INTERCEPTORS,
    HttpClient,
    provideHttpClient,
    withInterceptorsFromDi,
} from '@angular/common/http';
import {
    ApplicationConfig,
    inject,
    provideAppInitializer,
    provideBrowserGlobalErrorListeners,
    provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { lastValueFrom } from 'rxjs';

import { CsrfInterceptor } from './csrf.interceptor';
import { RequestContextInterceptor } from './request-context.interceptor';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAppInitializer(() =>
      lastValueFrom(inject(HttpClient).get('/bff/csrf', { responseType: 'text' })),
    ),
    { provide: HTTP_INTERCEPTORS, useClass: RequestContextInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: CsrfInterceptor, multi: true },
    provideHttpClient(withInterceptorsFromDi()),
  ],
};
