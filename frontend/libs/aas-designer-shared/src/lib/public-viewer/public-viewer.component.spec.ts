import { AuthenticateResponse } from '@aas-designer-model';
import { AppConfigService, PortalService } from '@aas/common-services';
import { AasViewerClient, SharedLinksClient, ViewerResultCode } from '@aas/webapi-client';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PublicViewerComponent } from './public-viewer.component';
import { PublicViewerService } from './public-viewer.service';

describe('PublicViewerComponent', () => {
  const viewerUser = AuthenticateResponse.fromDto({
    id: -1,
    orgaSettings: [{ orgaId: 4, orgaName: 'Owner of the link' }],
  });
  const portalService = { logIn: vi.fn(), loginStateChanged: { subscribe: vi.fn() } };
  const publicViewerService = { login: vi.fn() };
  const getViewerDescriptor = vi.fn(() => of({ aasId: 'urn:test:aas' }));
  let loginRequired: boolean;

  beforeEach(() => {
    loginRequired = false;
    publicViewerService.login.mockResolvedValue(viewerUser);
    vi.spyOn(window, 'alert').mockImplementation(() => undefined);
    TestBed.configureTestingModule({
      imports: [PublicViewerComponent, TranslateModule.forRoot()],
      providers: [
        { provide: ActivatedRoute, useValue: { queryParams: of({ accesscode: 'code-1' }) } },
        { provide: PortalService, useValue: portalService },
        { provide: PublicViewerService, useValue: publicViewerService },
        { provide: AppConfigService, useValue: { config: {} } },
        {
          provide: SharedLinksClient,
          useValue: {
            sharedLinks_CheckValidity: () =>
              of({ resultCode: ViewerResultCode.OK, aasIdentifier: 'urn:test:aas', loginRequired }),
          },
        },
        { provide: AasViewerClient, useValue: { aasViewer_GetViewerDescriptor: getViewerDescriptor } },
      ],
    }).overrideTemplate(PublicViewerComponent, '');
  });

  afterEach(() => vi.clearAllMocks());

  it('signs in with the organisation of the link and shows the viewer', async () => {
    const component = TestBed.createComponent(PublicViewerComponent).componentInstance;

    await component.ngOnInit();

    expect(portalService.logIn).toHaveBeenCalledWith(viewerUser, viewerUser.orgaSettings[0], false);
    expect(component.isLoaded).toBe(true);
    expect(getViewerDescriptor).toHaveBeenCalledWith('urn:test:aas');
    expect(portalService.loginStateChanged.subscribe).not.toHaveBeenCalled();
    expect(window.alert).not.toHaveBeenCalled();
  });

  it('shows the viewer after the password of a protected link was entered', async () => {
    loginRequired = true;
    const component = TestBed.createComponent(PublicViewerComponent).componentInstance;
    await component.ngOnInit();
    expect(component.isLoaded).toBe(false);

    component.password = 'secret';
    await component.login();

    expect(publicViewerService.login).toHaveBeenCalledWith('code-1', 'secret');
    expect(component.isLoaded).toBe(true);
    expect(component.resultCode).toBe('OK');
  });
});
