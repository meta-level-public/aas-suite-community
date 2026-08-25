import { AuthRoles } from '@aas-designer-model';
import { canActivate, ErrorHandlerService } from '@aas/aas-designer-shared';
import { AasSuitePreset } from '@aas/common-components';
import {
  AppConfigService,
  NotificationService,
  PluginMenuItem,
  PluginRegistryService,
  PortalService,
} from '@aas/common-services';
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
import { provideRouter, Route, Router, Routes } from '@angular/router';
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

async function initializeAppConfiguration(appRoutes: Routes) {
  const appConfigService = inject(AppConfigService);
  const pluginRegistry = inject(PluginRegistryService);
  const router = inject(Router);

  await appConfigService.loadConfig();
  await pluginRegistry.load();
  registerPluginRoutes(router, appRoutes, pluginRegistry.plugins());
}

function registerPluginRoutes(router: Router, routes: Routes, plugins: PluginMenuItem[]) {
  if (plugins.length === 0) {
    return;
  }

  const pluginRoutes = createPluginRoutes(plugins);
  const nextRoutes = routes.map((route, index) => {
    if (index !== 0 || route.children == null) {
      return route;
    }

    const existingPaths = new Set(route.children.map((childRoute) => childRoute.path).filter(Boolean));
    const missingPluginRoutes = pluginRoutes.filter((pluginRoute) => !existingPaths.has(pluginRoute.path));
    return { ...route, children: [...route.children, ...missingPluginRoutes] };
  });

  router.resetConfig(nextRoutes);
}

function createPluginRoutes(plugins: PluginMenuItem[]): Route[] {
  return plugins.map((plugin) => ({
    path: plugin.route.replace(/^\/+/, ''),
    loadComponent: () => import('@aas/aas-designer-core').then((m) => m.PluginHostComponent),
    canActivate: [() => canActivate([AuthRoles.BENUTZER, AuthRoles.ORGA_ADMIN, AuthRoles.SYSTEM_ADMIN])],
    data: { pluginId: plugin.id, pluginRoute: plugin.route },
  }));
}

export function getAppConfig(): ApplicationConfig {
  return {
    providers: [
      provideZoneChangeDetection({ eventCoalescing: true }),
      provideRouter(appRoutes),
      provideAnimationsAsync(),
      provideAppInitializer(() => initializeAppConfiguration(appRoutes)),
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
