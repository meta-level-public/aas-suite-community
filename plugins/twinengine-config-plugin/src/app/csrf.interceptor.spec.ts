import {
    HTTP_INTERCEPTORS,
    HttpClient,
    provideHttpClient,
    withInterceptorsFromDi,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CsrfInterceptor } from './csrf.interceptor';

describe('CsrfInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: HTTP_INTERCEPTORS, useClass: CsrfInterceptor, multi: true },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
    document.cookie = 'vws-csrf-request=test-token;path=/';
  });

  afterEach(() => {
    document.cookie = 'vws-csrf-request=;path=/;max-age=0';
    httpTesting.verify();
  });

  it('adds the gateway CSRF token to write requests', () => {
    http.post('/designer-api/plugin-api/twinengine-config/api/config/validate', {}).subscribe();

    const request = httpTesting.expectOne(
      '/designer-api/plugin-api/twinengine-config/api/config/validate',
    );
    expect(request.request.withCredentials).toBeTrue();
    expect(request.request.headers.get('X-CSRF-TOKEN')).toBe('test-token');
    request.flush({ valid: true, errors: [] });
  });
});
