import { HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CsrfInterceptor } from './csrf-interceptor';

describe('CsrfInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    document.cookie = 'vws-csrf-request=token-123; path=/';
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: HTTP_INTERCEPTORS, useClass: CsrfInterceptor, multi: true },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    document.cookie = 'vws-csrf-request=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  });

  it('adds the CSRF token and credentials to state-changing same-site requests', () => {
    http.post('/designer-api/api/save', {}).subscribe();

    const request = httpMock.expectOne('/designer-api/api/save');
    expect(request.request.headers.get('X-CSRF-TOKEN')).toBe('token-123');
    expect(request.request.withCredentials).toBe(true);
    request.flush({});
  });

  it('sends credentials but no token for reading requests', () => {
    http.get('/designer-api/api/list').subscribe();

    const request = httpMock.expectOne('/designer-api/api/list');
    expect(request.request.headers.has('X-CSRF-TOKEN')).toBe(false);
    expect(request.request.withCredentials).toBe(true);
    request.flush([]);
  });

  it('leaves requests to other hosts untouched', () => {
    http.post('https://repo.example.com/shells', {}).subscribe();

    const request = httpMock.expectOne('https://repo.example.com/shells');
    expect(request.request.headers.has('X-CSRF-TOKEN')).toBe(false);
    expect(request.request.withCredentials).toBe(false);
    request.flush({});
  });
});
