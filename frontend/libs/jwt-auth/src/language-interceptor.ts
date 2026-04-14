import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { PortalService } from '@aas/common-services';
import { Observable } from 'rxjs';

@Injectable()
export class LanguageInterceptor implements HttpInterceptor {
  constructor(private portalService: PortalService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(this.addTokenHeader(req));
  }

  private addTokenHeader(request: HttpRequest<any>) {
    const lang = this.portalService.currentLanguage;
    return request.clone({
      headers: request.headers.set('x-gui-language', lang),
    });
  }
}
