import { HttpInterceptorFn } from '@angular/common/http';

export const requestContextInterceptor: HttpInterceptorFn = (request, next) => {
  let headers = request.headers.set(
    'X-Gui-Language',
    localStorage.getItem('aasportal_currentLanguage') ?? 'de',
  );

  const organisationId = sessionStorage.getItem('CURRENT_ORGA_ID');
  if (organisationId) headers = headers.set('X-Organisation-ID', organisationId);

  const storedInfrastructure = localStorage.getItem('CURRENT_AAS_INFRASTRUCTURE');
  let infrastructureId = -1;
  if (storedInfrastructure && storedInfrastructure !== 'undefined') {
    try {
      infrastructureId = (JSON.parse(storedInfrastructure) as { id?: number }).id ?? -1;
    } catch {
      infrastructureId = -1;
    }
  }
  headers = headers.set('X-Infrastructure-ID', String(infrastructureId));
  return next(request.clone({ headers, withCredentials: true }));
};
