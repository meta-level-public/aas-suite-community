import {
    HTTP_INTERCEPTORS,
    HttpClient,
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
    localStorage.setItem('aasportal_currentLanguage', 'en');
    localStorage.setItem('CURRENT_AAS_INFRASTRUCTURE', JSON.stringify({ id: 1 }));
    sessionStorage.setItem('CURRENT_ORGA_ID', '1');
  });

  afterEach(() => {
    localStorage.removeItem('aasportal_currentLanguage');
    localStorage.removeItem('CURRENT_AAS_INFRASTRUCTURE');
    sessionStorage.removeItem('CURRENT_ORGA_ID');
    httpTesting.verify();
  });

  it('adds the Designer language, infrastructure, and organisation headers', () => {
    http.get('/designer-api/aas-api/AasInfrastructure/GetAvailableInfrastructures').subscribe();

    const request = httpTesting.expectOne(
      '/designer-api/aas-api/AasInfrastructure/GetAvailableInfrastructures',
    );
    expect(request.request.headers.get('X-Gui-Language')).toBe('en');
    expect(request.request.headers.get('X-Infrastructure-ID')).toBe('1');
    expect(request.request.headers.get('X-Organisation-ID')).toBe('1');
    request.flush([]);
  });
});
