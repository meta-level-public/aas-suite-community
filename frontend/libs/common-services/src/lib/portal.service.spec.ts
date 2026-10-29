import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthenticateResponse } from '@aas-designer-model';
import { of } from 'rxjs';
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

describe('PortalService public viewer session', () => {
  let service: PortalService;
  const post = vi.fn(() => of({}));

  beforeEach(() => {
    sessionStorage.clear();
    post.mockClear();
    TestBed.configureTestingModule({
      providers: [
        PortalService,
        { provide: HttpClient, useValue: { post } },
        { provide: Router, useValue: { navigate: vi.fn(), navigateByUrl: vi.fn() } },
      ],
    });
    service = TestBed.inject(PortalService);
  });

  afterEach(() => sessionStorage.clear());

  function signIn(id: number, rollen: string[]) {
    service.saveUser(AuthenticateResponse.fromDto({ id, rollen, orgaSettings: [] }));
  }

  it('recognizes the anonymous user of a shared link', () => {
    signIn(-1, ['VIEWER_NUTZER']);
    expect(service.isPublicViewerSession).toBe(true);

    signIn(3, ['VIEWER_NUTZER']);
    expect(service.isPublicViewerSession).toBe(true);
  });

  it('does not treat designer users or missing sessions as public viewer session', () => {
    expect(service.isPublicViewerSession).toBe(false);

    signIn(3, ['BENUTZER']);
    expect(service.isPublicViewerSession).toBe(false);
  });

  it('clears the session for a new login and remembers the requested page', () => {
    signIn(-1, ['VIEWER_NUTZER']);

    service.prepareLogin('/shells-list');

    expect(service.loggedIn).toBe(false);
    expect(post).toHaveBeenCalledWith('/bff/logout', {});
    expect(service.consumePostLoginRedirectUrl()).toBe('/shells-list');
  });
});
