import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { vi } from 'vitest';

import { AppRouteUrls } from './app-routes';
import { PortalService } from './portal.service';

describe('PortalService redirect handling', () => {
  let service: PortalService;

  beforeEach(() => {
    sessionStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        PortalService,
        { provide: HttpClient, useValue: {} },
        { provide: Router, useValue: { navigate: vi.fn(), navigateByUrl: vi.fn() } },
      ],
    });

    service = TestBed.inject(PortalService);
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('stores and consumes valid redirect urls once', () => {
    service.savePostLoginRedirectUrl('/mapping/12/aas-1');

    expect(service.consumePostLoginRedirectUrl()).toBe('/mapping/12/aas-1');
    expect(service.consumePostLoginRedirectUrl()).toBeNull();
  });

  it('ignores forbidden redirect urls', () => {
    service.savePostLoginRedirectUrl(AppRouteUrls.ssoLoginSuccess);
    service.savePostLoginRedirectUrl(AppRouteUrls.login);

    expect(service.consumePostLoginRedirectUrl()).toBeNull();
  });

  it('ignores absolute external urls', () => {
    service.savePostLoginRedirectUrl('https://example.com/malicious');

    expect(service.consumePostLoginRedirectUrl()).toBeNull();
  });
});
