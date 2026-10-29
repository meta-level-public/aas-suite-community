import { LanguageService, SseNotificationService } from '@aas/aas-designer-shared';
import { NotificationService, PortalService } from '@aas/common-services';
import { AasInfrastructureClient, AasViewerClient, ShellsClient } from '@aas/webapi-client';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { DialogService } from 'primeng/dynamicdialog';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { AasSharedDataService } from '../../asset-administration-shell-tree/services/aas-shared-data.service';
import { V3EditorService } from '../../v3-editor/v3-editor.service';
import { V3ViewerComponent } from './v3-viewer.component';

describe('V3ViewerComponent shell navigation', () => {
  let component: V3ViewerComponent;
  let router: { navigate: ReturnType<typeof vi.fn> };
  let shellsClient: { shells_GetAllShells: ReturnType<typeof vi.fn> };
  let notificationService: { showMessage: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    router = { navigate: vi.fn() };
    shellsClient = { shells_GetAllShells: vi.fn() };
    notificationService = { showMessage: vi.fn() };
    vi.spyOn(PortalService, 'buildViewerRoute').mockImplementation((id: string) => ['/viewer', id]);

    TestBed.configureTestingModule({
      imports: [V3ViewerComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: { snapshot: { params: {} }, paramMap: of() } },
        { provide: ShellsClient, useValue: shellsClient },
        { provide: NotificationService, useValue: notificationService },
        { provide: AasViewerClient, useValue: {} },
        { provide: AasInfrastructureClient, useValue: {} },
        { provide: SseNotificationService, useValue: {} },
        { provide: DialogService, useValue: {} },
        { provide: AasSharedDataService, useValue: {} },
        { provide: V3EditorService, useValue: {} },
        { provide: PortalService, useValue: {} },
        { provide: LanguageService, useValue: {} },
      ],
    }).overrideTemplate(V3ViewerComponent, '');

    component = TestBed.createComponent(V3ViewerComponent).componentInstance;
  });

  afterEach(() => vi.restoreAllMocks());

  it('opens a referenced AAS by its id', async () => {
    await component.shellNavigator({ aasId: 'urn:test:aas:schaukel' });

    expect(shellsClient.shells_GetAllShells).not.toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/viewer', 'urn:test:aas:schaukel']);
  });

  it('opens the AAS of an entity by its global asset id', async () => {
    shellsClient.shells_GetAllShells.mockReturnValue(
      of({
        shells: [
          { id: 'urn:test:aas:other', globalAssetId: 'urn:test:asset:schaukel:02' },
          { id: 'urn:test:aas:schaukel', globalAssetId: 'urn:test:asset:schaukel' },
        ],
      }),
    );

    await component.shellNavigator({ globalAssetId: 'urn:test:asset:schaukel' });

    expect(shellsClient.shells_GetAllShells).toHaveBeenCalledWith(
      10,
      undefined,
      undefined,
      'urn:test:asset:schaukel',
      undefined,
    );
    expect(router.navigate).toHaveBeenCalledWith(['/viewer', 'urn:test:aas:schaukel']);
  });

  it('informs the user when no AAS exists for the global asset id', async () => {
    shellsClient.shells_GetAllShells.mockReturnValue(of({ shells: [] }));

    await component.shellNavigator({ globalAssetId: 'urn:test:asset:unknown' });

    expect(router.navigate).not.toHaveBeenCalled();
    expect(notificationService.showMessage).toHaveBeenCalledWith(
      'REFERENCED_AAS_NOT_FOUND',
      'OPEN_ASSOCIATED_AAS',
      'warn',
      false,
      5000,
    );
  });
});
