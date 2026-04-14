import {
  HttpBackend,
  HttpClient,
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, switchMap, tap } from 'rxjs/operators';
import { ApiException } from './api-exception';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  private static readonly csrfRequestCookieName = 'vws-csrf-request';
  private static readonly csrfHeaderName = 'X-CSRF-TOKEN';
  private readonly bffHttpClient: HttpClient;

  constructor(
    httpBackend: HttpBackend,
    private readonly router: Router,
  ) {
    // Use a raw HttpClient to avoid interceptor recursion during refresh requests.
    this.bffHttpClient = new HttpClient(httpBackend);
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      retry(0), // nochmal versuchen
      tap(() => {
        // this.notificationService.removeHeaderMessage(this.message);
      }),
      catchError((error: HttpErrorResponse) => {
        switch (error.status) {
          case 0:
          case 504: {
            if (request.url.includes('/ServerSentEvents/')) {
              const ex = new ApiException('SSE_FAILED', 'SSE_FAILED');
              ex.displayError = false;
              return throwError(() => ex);
            } else {
              const ex = new ApiException('SERVER_UNAVAILABLE_DETAIL', 'SERVER_UNAVAILABLE');
              return throwError(() => ex);
            }
          }
          case 400: {
            const ex = new ApiException(error.error?.Message ?? error.message, error.error?.ExceptionType);
            ex.stacktrace = error.error?.Stacktrace ?? error.error;
            return throwError(() => ex);
          }
          case 404: {
            const ex = new ApiException('SERVER_REQUEST_NOT_FOUND_MESSAGE', 'SERVER_REQUEST_NOT_FOUND');
            ex.stacktrace = error.error?.stacktrace;
            ex.displayError = false;
            return throwError(() => ex);
          }
          case 403: {
            if (this.isApplicationUrl(request.url)) {
              this.storeForbiddenReturnUrl();
              this.storeForbiddenReason(error);
              void this.router.navigateByUrl('/forbidden');
              const ex = new ApiException('FORBIDDEN_DETAIL', 'FORBIDDEN');
              ex.displayError = false;
              return throwError(() => ex);
            }

            return throwError(() => error);
          }
          case 401: {
            if (!this.shouldHandleUnauthorizedAsSessionTimeout(request.url, error)) {
              return throwError(() => error);
            }

            if (!this.canAttemptBffRefresh(request)) {
              this.dispatchLogout();
              return throwError(() => new ApiException('SESSION_TIMEOUT_DETAIL', 'SESSION_TIMEOUT'));
            }

            const csrfToken = this.readCookie(HttpErrorInterceptor.csrfRequestCookieName);
            const refreshOptions = csrfToken
              ? {
                  withCredentials: true,
                  headers: { [HttpErrorInterceptor.csrfHeaderName]: csrfToken },
                }
              : { withCredentials: true };

            return this.bffHttpClient.post('/bff/session/refresh', {}, refreshOptions).pipe(
              switchMap(() =>
                next.handle(
                  request.clone({
                    setHeaders: { 'x-bff-refresh-attempted': '1' },
                  }),
                ),
              ),
              catchError(() => {
                this.dispatchLogout();
                return throwError(() => new ApiException('SESSION_TIMEOUT_DETAIL', 'SESSION_TIMEOUT'));
              }),
            );
          }
          case 410: {
            this.dispatchLogout();
            return throwError(() => new ApiException('SESSION_TIMEOUT_DETAIL', 'SESSION_TIMEOUT'));
          }
        }
        return throwError(() => error);
      }),
    );
  }

  private canAttemptBffRefresh(request: HttpRequest<any>): boolean {
    if (request.headers.has('x-bff-refresh-attempted')) {
      return false;
    }

    // Do not try refreshing while already talking to BFF auth endpoints.
    return !request.url.startsWith('/bff/');
  }

  private isApplicationUrl(url: string): boolean {
    if (!url) {
      return false;
    }

    if (this.isExternalProxyPath(url)) {
      return false;
    }

    if (url.startsWith('/')) {
      return true;
    }

    try {
      const resolvedUrl = new URL(url, window.location.origin);
      return resolvedUrl.origin === window.location.origin && !this.isExternalProxyPath(resolvedUrl.pathname);
    } catch {
      return false;
    }
  }

  private shouldHandleUnauthorizedAsSessionTimeout(url: string, error: HttpErrorResponse): boolean {
    if (error.headers.get('X-Vws-Proxy-Upstream') === '1') {
      return false;
    }

    return this.isApplicationUrl(url);
  }

  private isExternalProxyPath(urlOrPath: string): boolean {
    try {
      const resolvedUrl = urlOrPath.startsWith('/')
        ? new URL(urlOrPath, window.location.origin)
        : new URL(urlOrPath, window.location.origin);
      return resolvedUrl.pathname.startsWith('/aas-proxy/') || resolvedUrl.pathname.startsWith('/aas-viewer-proxy/');
    } catch {
      return urlOrPath.startsWith('/aas-proxy/') || urlOrPath.startsWith('/aas-viewer-proxy/');
    }
  }

  private dispatchLogout(): void {
    const event = new CustomEvent('logoutUser');
    window.dispatchEvent(event);
  }

  private storeForbiddenReason(error: HttpErrorResponse): void {
    const serverError = error.error;
    const feature = serverError?.requiredFeature;
    const reason =
      typeof serverError?.error === 'string' && serverError.error.trim() !== ''
        ? serverError.error
        : feature === 'FeedMapping'
          ? 'Feed Mapping ist in der aktuellen Enterprise-Lizenz nicht enthalten.'
          : feature === 'ConfigurableDashboard'
            ? 'Das konfigurierbare Dashboard ist in der aktuellen Enterprise-Lizenz nicht enthalten.'
            : 'Sie haben keine Berechtigung, diese Funktion zu verwenden.';

    sessionStorage.setItem('aasForbiddenReason', reason);
  }

  private storeForbiddenReturnUrl(): void {
    const currentUrl =
      sessionStorage.getItem('aasPreviousAllowedRoute') ??
      sessionStorage.getItem('aasLastAllowedRoute') ??
      this.router.url;
    if (currentUrl && currentUrl !== '/forbidden') {
      sessionStorage.setItem('aasForbiddenReturnUrl', currentUrl);
    }
  }

  private readCookie(name: string): string | null {
    const encodedName = `${encodeURIComponent(name)}=`;
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const trimmedCookie = cookie.trim();
      if (trimmedCookie.startsWith(encodedName)) {
        return decodeURIComponent(trimmedCookie.substring(encodedName.length));
      }
    }

    return null;
  }
}
