import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { ConfirmationService, MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { App } from './app';
import { vi } from 'vitest';

describe('App', () => {
  const mockOAuthService = {
    configure: vi.fn(),
    loadDiscoveryDocumentAndTryLogin: vi.fn(() => Promise.resolve()),
    hasValidAccessToken: vi.fn(() => false),
    getIdentityClaims: vi.fn(() => null),
    events: of({}),
    logOut: vi.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([]), TranslateModule.forRoot(), HttpClientTestingModule],
      providers: [
        MessageService,
        ConfirmationService,
        { provide: OAuthService, useValue: mockOAuthService },
        { provide: 'Window', useValue: window },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    const translateService = TestBed.inject(TranslateService);
    translateService.setDefaultLang('en');
    translateService.use('en');
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
