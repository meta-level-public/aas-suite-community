import {
  HTTP_INTERCEPTORS,
  HttpClient,
  HttpHeaders,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { RequestContextInterceptor } from './request-context.interceptor';

describe('RequestContextInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: HTTP_INTERCEPTORS, useClass: RequestContextInterceptor, multi: true },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
    localStorage.setItem('CURRENT_AAS_INFRASTRUCTURE', JSON.stringify({ id: 1 }));
    sessionStorage.setItem('CURRENT_ORGA_ID', '5');
  });

  afterEach(() => {
    localStorage.removeItem('CURRENT_AAS_INFRASTRUCTURE');
    sessionStorage.removeItem('CURRENT_ORGA_ID');
    httpTesting.verify();
  });

  it('übernimmt Infrastruktur und Organisation aus der AAS Suite', () => {
    http.get('/designer-api/test').subscribe();

    const request = httpTesting.expectOne('/designer-api/test');
    expect(request.request.headers.get('X-Infrastructure-ID')).toBe('1');
    expect(request.request.headers.get('X-Organisation-ID')).toBe('5');
    request.flush({});
  });

  it('behält eine explizit gesetzte Infrastruktur bei', () => {
    http
      .get('/designer-api/test', { headers: new HttpHeaders({ 'X-Infrastructure-ID': '42' }) })
      .subscribe();

    const request = httpTesting.expectOne('/designer-api/test');
    expect(request.request.headers.get('X-Infrastructure-ID')).toBe('42');
    request.flush({});
  });
});
