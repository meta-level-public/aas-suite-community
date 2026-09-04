import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class RequestContextInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const infrastructureId = this.getInfrastructureId();
    let headers = request.headers
      .set('X-Gui-Language', localStorage.getItem('aasportal_currentLanguage') ?? 'en')
      .set('X-Infrastructure-ID', infrastructureId.toString());

    const organisationId = sessionStorage.getItem('CURRENT_ORGA_ID');
    if (organisationId) {
      headers = headers.set('X-Organisation-ID', organisationId);
    }

    return next.handle(request.clone({ headers }));
  }

  private getInfrastructureId(): number {
    const storedInfrastructure = localStorage.getItem('CURRENT_AAS_INFRASTRUCTURE');
    if (!storedInfrastructure || storedInfrastructure === 'undefined') {
      return -1;
    }

    try {
      const value = JSON.parse(storedInfrastructure) as { id?: number };
      return value.id ?? -1;
    } catch {
      return -1;
    }
  }
}
