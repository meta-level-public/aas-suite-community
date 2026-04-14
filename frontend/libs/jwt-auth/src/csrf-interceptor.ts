import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class CsrfInterceptor implements HttpInterceptor {
  private static readonly csrfRequestCookieName = 'vws-csrf-request';
  private static readonly csrfHeaderName = 'X-CSRF-TOKEN';

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const isSameSiteRequest = this.isSameSiteRequest(req.url);
    if (!isSameSiteRequest) {
      return next.handle(req);
    }

    const withCredentialsRequest = req.withCredentials ? req : req.clone({ withCredentials: true });

    if (!this.shouldAttachToken(withCredentialsRequest)) {
      return next.handle(withCredentialsRequest);
    }

    const csrfToken = this.readCookie(CsrfInterceptor.csrfRequestCookieName);
    if (!csrfToken) {
      return next.handle(withCredentialsRequest);
    }

    return next.handle(
      withCredentialsRequest.clone({
        headers: withCredentialsRequest.headers.set(CsrfInterceptor.csrfHeaderName, csrfToken),
      }),
    );
  }

  private shouldAttachToken(req: HttpRequest<any>): boolean {
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method.toUpperCase())) {
      return false;
    }

    return this.isSameSiteRequest(req.url);
  }

  private isSameSiteRequest(url: string): boolean {
    if (url.startsWith('/')) {
      return true;
    }

    try {
      const requestUrl = new URL(url, window.location.origin);
      const currentUrl = new URL(window.location.origin);

      return requestUrl.protocol === currentUrl.protocol && requestUrl.hostname === currentUrl.hostname;
    } catch {
      return false;
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
