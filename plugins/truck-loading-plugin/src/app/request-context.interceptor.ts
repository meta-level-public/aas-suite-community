import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * Setzt Sprache, Organisation und Infrastruktur wie die AAS Suite.
 * Ein bereits gesetzter X-Infrastructure-ID-Header bleibt erhalten, damit das Plugin
 * gezielt in die Demo-Infrastruktur schreiben kann, unabhängig von der Auswahl in der Suite.
 */
@Injectable()
export class RequestContextInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    let headers = request.headers.set(
      'X-Gui-Language',
      localStorage.getItem('aasportal_currentLanguage') ?? 'de',
    );

    if (!headers.has('X-Infrastructure-ID')) {
      headers = headers.set('X-Infrastructure-ID', this.getInfrastructureId().toString());
    }

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
