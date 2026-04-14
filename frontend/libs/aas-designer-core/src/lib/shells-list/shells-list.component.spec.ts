import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of, Subject } from 'rxjs';
import { Clipboard } from '@angular/cdk/clipboard';
import { Router } from '@angular/router';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { vi } from 'vitest';

import { HelpService } from '@aas/common-components';
import { NotificationService, PortalService } from '@aas/common-services';
import { ADDITIONAL_SHELL_MENU_ITEMS } from '@aas-designer-model';
import { AccessService } from '@aas/common-services';
import { AasInfrastructureClient, ShellsClient } from '@aas/webapi-client';

import { SHELLS_LIST_DEFAULT_COLUMNS } from './shells-list.config';
import { ShellsListActions } from './shells-list.actions';
import { ShellsListComponent } from './shells-list.component';
import { ShellsListStore } from './shells-list.store';

describe('ShellsListComponent', () => {
  let component: ShellsListComponent;
  let fixture: ComponentFixture<ShellsListComponent>;
  let searchClose$: Subject<any>;
  let dialogRef: DynamicDialogRef;

  const storeMock = {
    shells: signal([]),
    refreshVisibleColumnData: vi.fn().mockResolvedValue(undefined),
    applyShellsResult: vi.fn().mockResolvedValue(undefined),
    getThumb: vi.fn(),
    ensureThumbLoaded: vi.fn(),
    onThumbnailError: vi.fn().mockResolvedValue(undefined),
    getSubmodels: vi.fn(),
    getNameplateData: vi.fn(),
    destroy: vi.fn(),
  };

  const actionsMock = {
    createNewAas: vi.fn(),
    deleteShell: vi.fn(),
    duplicateShell: vi.fn(),
    confirmRegisterPcn: vi.fn(),
    transferShell: vi.fn(),
    getShellJsonBlob: vi.fn(),
    deleteBulk: vi.fn(),
    downloadBulk: vi.fn(),
    createSharedLink: vi.fn(),
    findAsset: vi.fn(),
    createInstance: vi.fn(),
  };

  const routerMock = {
    navigate: vi.fn(),
  };

  const portalServiceMock = {
    saveCurrentInfrastructureSetting: vi.fn(),
  };

  const dialogServiceMock = {
    open: vi.fn(() => dialogRef),
  };

  const infrastructureClientMock = {
    aasInfrastructure_GetAvailableInfrastructures: vi.fn(() => of([])),
  };

  const shellsClientMock = {
    shells_GetAllShells: vi.fn(() => of({ shells: [], cursor: undefined })),
  };

  const helpServiceMock = {
    helpTexts: signal([]),
    initHelp: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    searchClose$ = new Subject<any>();
    dialogRef = {
      onClose: searchClose$.asObservable(),
      close: vi.fn(),
    } as unknown as DynamicDialogRef;

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: false,
        media: '',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    vi.spyOn(PortalService, 'getCurrentAasInfrastructureSetting').mockReturnValue({ isReadonly: false } as any);
    vi.spyOn(PortalService, 'buildRepoEditRoute').mockImplementation((id: string) => ['/edit', id]);
    vi.spyOn(PortalService, 'buildViewerRoute').mockImplementation((id: string) => ['/view', id]);

    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), ShellsListComponent],
      providers: [
        {
          provide: TranslateService,
          useValue: {
            instant: vi.fn((key: string) => key),
            onLangChange: new Subject(),
          },
        },
        { provide: HelpService, useValue: helpServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: NotificationService, useValue: { showMessageAlways: vi.fn() } },
        { provide: AccessService, useValue: {} },
        { provide: ADDITIONAL_SHELL_MENU_ITEMS, useValue: [] },
        { provide: AasInfrastructureClient, useValue: infrastructureClientMock },
        { provide: PortalService, useValue: portalServiceMock },
        { provide: DialogService, useValue: dialogServiceMock },
        { provide: Clipboard, useValue: { copy: vi.fn() } },
        { provide: ShellsClient, useValue: shellsClientMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(ShellsListComponent, {
        set: {
          providers: [
            { provide: ShellsListStore, useValue: storeMock },
            { provide: ShellsListActions, useValue: actionsMock },
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ShellsListComponent);
    component = fixture.componentInstance;
    component.selectedColumns.set(SHELLS_LIST_DEFAULT_COLUMNS);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('delegates visible column refresh to the store', () => {
    component.fetchDataIfRequired();

    expect(storeMock.refreshVisibleColumnData).toHaveBeenCalledWith(
      SHELLS_LIST_DEFAULT_COLUMNS.map((column) => column.field),
    );
  });

  it('opens the editor route when the search dialog returns an edit action', () => {
    component.openSearch();
    searchClose$.next({ type: 'open', action: 'edit', shellId: 'shell-42' });

    expect(routerMock.navigate).toHaveBeenCalledWith(['/edit', 'shell-42']);
  });

  it('applies returned search shells through the store', () => {
    component.openSearch();
    searchClose$.next({ shells: [{ id: 'shell-1' }] });

    expect(storeMock.applyShellsResult).toHaveBeenCalledWith(
      [{ id: 'shell-1' }],
      SHELLS_LIST_DEFAULT_COLUMNS.map((column) => column.field),
    );
    expect(component.searchResultActive()).toBe(true);
  });

  it('delegates thumbnail visibility to the store', () => {
    component.ensureThumbLoaded('shell-77');

    expect(storeMock.ensureThumbLoaded).toHaveBeenCalledWith('shell-77');
  });
});
