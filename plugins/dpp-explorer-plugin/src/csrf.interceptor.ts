import { HttpInterceptorFn } from '@angular/common/http';

export const csrfInterceptor: HttpInterceptorFn = (request, next) => {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method.toUpperCase())) {
    return next(request);
  }
  const token = document.cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith('vws-csrf-request='))
    ?.split('=').slice(1).join('=');
  return next(token ? request.clone({ setHeaders: { 'X-CSRF-TOKEN': decodeURIComponent(token) } }) : request);
};
