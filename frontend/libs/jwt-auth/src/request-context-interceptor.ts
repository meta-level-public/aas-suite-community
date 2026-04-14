import { PortalService } from '@aas/common-services';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class RequestContextInterceptor implements HttpInterceptor {
  constructor(private portalService: PortalService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const orgaId = sessionStorage.getItem('CURRENT_ORGA_ID');
    let infrastructureSettings = localStorage.getItem('CURRENT_AAS_INFRASTRUCTURE') ?? '{}';
    if (infrastructureSettings === 'undefined') {
      infrastructureSettings = '{}';
    }

    const infrastructureId = JSON.parse(infrastructureSettings)?.id ?? -1;
    const language = this.portalService.currentLanguage;

    let headers = req.headers.set('X-Gui-Language', language).set('X-Infrastructure-ID', infrastructureId.toString());
    if (orgaId != null) {
      headers = headers.set('X-Organisation-ID', orgaId);
    }

    return next.handle(req.clone({ headers }));
  }
}
