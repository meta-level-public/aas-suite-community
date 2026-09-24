import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class CsrfInterceptor implements HttpInterceptor {
  private static readonly csrfRequestCookieName = 'vws-csrf-request';
  private static readonly csrfHeaderName = 'X-CSRF-TOKEN';

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!this.isSameOriginRequest(request.url)) {
      return next.handle(request);
    }

    const credentialedRequest = request.withCredentials
      ? request
      : request.clone({ withCredentials: true });

    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(credentialedRequest.method.toUpperCase())) {
      return next.handle(credentialedRequest);
    }

    const token = this.readCookie(CsrfInterceptor.csrfRequestCookieName);
    return token
      ? next.handle(
          credentialedRequest.clone({
            headers: credentialedRequest.headers.set(CsrfInterceptor.csrfHeaderName, token),
          }),
        )
      : next.handle(credentialedRequest);
  }

  private isSameOriginRequest(url: string): boolean {
    if (url.startsWith('/')) {
      return true;
    }

    try {
      return new URL(url, window.location.origin).origin === window.location.origin;
    } catch {
      return false;
    }
  }

  private readCookie(name: string): string | null {
    const prefix = `${encodeURIComponent(name)}=`;
    const cookie = document.cookie
      .split(';')
      .map((value) => value.trim())
      .find((value) => value.startsWith(prefix));

    return cookie ? decodeURIComponent(cookie.substring(prefix.length)) : null;
  }
}
