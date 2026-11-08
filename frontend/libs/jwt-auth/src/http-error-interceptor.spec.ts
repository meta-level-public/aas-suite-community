import { HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiException } from './api-exception';
import { HttpErrorInterceptor } from './http-error-interceptor';

describe('HttpErrorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let router: { url: string; navigateByUrl: ReturnType<typeof vi.fn> };
  let logoutEvents: number;
  const onLogout = () => logoutEvents++;

  beforeEach(() => {
    logoutEvents = 0;
    window.addEventListener('logoutUser', onLogout);
    router = { url: '/shells-list', navigateByUrl: vi.fn().mockResolvedValue(true) };
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true },
        { provide: Router, useValue: router },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    window.removeEventListener('logoutUser', onLogout);
    sessionStorage.clear();
  });

  function capture(url: string) {
    const result: { value?: unknown; error?: unknown } = {};
    http.get(url).subscribe({ next: (value) => (result.value = value), error: (error) => (result.error = error) });
    return result;
  }

  it('reports an unreachable server as SERVER_UNAVAILABLE', () => {
    const result = capture('/designer-api/api/list');

    httpMock.expectOne('/designer-api/api/list').error(new ProgressEvent('error'), { status: 0 });

    expect(result.error).toBeInstanceOf(ApiException);
    expect((result.error as ApiException).title).toBe('SERVER_UNAVAILABLE');
  });

  it('reports server errors of the own backend as SERVER_ERROR without details', () => {
    const result = capture('/designer-api/api/list');

    httpMock
      .expectOne('/designer-api/api/list')
      .flush({ Message: 'NullReferenceException', Stacktrace: 'at Foo()' }, { status: 500, statusText: 'Error' });

    expect(result.error).toBeInstanceOf(ApiException);
    expect((result.error as ApiException).title).toBe('SERVER_ERROR');
    expect((result.error as ApiException).message).toBe('SERVER_ERROR_DETAIL');
  });

  it('passes server errors of external repositories through unchanged', () => {
    const result = capture('/aas-proxy/1/aas-repo/shells');

    httpMock.expectOne('/aas-proxy/1/aas-repo/shells').flush(null, { status: 502, statusText: 'Bad Gateway' });

    expect((result.error as { status: number }).status).toBe(502);
  });

  it('refreshes the session once on 401 and repeats the request', () => {
    const result = capture('/designer-api/api/list');

    httpMock.expectOne('/designer-api/api/list').flush(null, { status: 401, statusText: 'Unauthorized' });
    httpMock.expectOne('/bff/session/refresh').flush({});
    const retry = httpMock.expectOne('/designer-api/api/list');
    expect(retry.request.headers.get('x-bff-refresh-attempted')).toBe('1');
    retry.flush(['shell']);

    expect(result.value).toEqual(['shell']);
    expect(logoutEvents).toBe(0);
  });

  it('shares one refresh call between concurrent 401 responses', () => {
    const first = capture('/designer-api/api/a');
    const second = capture('/designer-api/api/b');

    httpMock.expectOne('/designer-api/api/a').flush(null, { status: 401, statusText: 'Unauthorized' });
    httpMock.expectOne('/designer-api/api/b').flush(null, { status: 401, statusText: 'Unauthorized' });
    httpMock.expectOne('/bff/session/refresh').flush({});
    httpMock.expectOne('/designer-api/api/a').flush('a');
    httpMock.expectOne('/designer-api/api/b').flush('b');

    expect(first.value).toBe('a');
    expect(second.value).toBe('b');
  });

  it('logs out when the request still fails with 401 after the refresh', () => {
    const result = capture('/designer-api/api/list');

    httpMock.expectOne('/designer-api/api/list').flush(null, { status: 401, statusText: 'Unauthorized' });
    httpMock.expectOne('/bff/session/refresh').flush({});
    httpMock.expectOne('/designer-api/api/list').flush(null, { status: 401, statusText: 'Unauthorized' });

    expect((result.error as ApiException).title).toBe('SESSION_TIMEOUT');
    expect(logoutEvents).toBe(1);
  });

  it('passes 401 responses of external repositories through without a refresh', () => {
    const result = capture('/aas-proxy/1/aas-repo/shells');

    httpMock.expectOne('/aas-proxy/1/aas-repo/shells').flush(null, { status: 401, statusText: 'Unauthorized' });

    expect((result.error as { status: number }).status).toBe(401);
    expect(logoutEvents).toBe(0);
  });

  it('navigates to the forbidden page on 403 and keeps the server reason', () => {
    const result = capture('/designer-api/api/feed-mapping');

    httpMock
      .expectOne('/designer-api/api/feed-mapping')
      .flush({ error: 'Nicht lizenziert' }, { status: 403, statusText: 'Forbidden' });

    expect((result.error as ApiException).title).toBe('FORBIDDEN');
    expect(router.navigateByUrl).toHaveBeenCalledWith('/forbidden');
    expect(sessionStorage.getItem('aasForbiddenReason')).toBe('Nicht lizenziert');
    expect(sessionStorage.getItem('aasForbiddenReturnUrl')).toBe('/shells-list');
  });
});
