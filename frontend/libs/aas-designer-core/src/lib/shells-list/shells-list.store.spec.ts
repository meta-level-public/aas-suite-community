import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { of, Subject } from 'rxjs';
import { vi } from 'vitest';

import { ShellsClient } from '@aas/webapi-client';

import { ShellsListStore } from './shells-list.store';

describe('ShellsListStore', () => {
  let store: ShellsListStore;

  const shellsClient = {
    shells_GetThumbnail: vi.fn(),
    shells_GetContainedSubmdels: vi.fn(),
    shells_GetNameplateInfos: vi.fn(),
  };

  const sanitizer = {
    bypassSecurityTrustResourceUrl: vi.fn((value: string) => value),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        ShellsListStore,
        { provide: ShellsClient, useValue: shellsClient },
        { provide: DomSanitizer, useValue: sanitizer },
      ],
    });

    store = TestBed.inject(ShellsListStore);
  });

  it('loads a thumbnail once and reuses the cached result on reapply', async () => {
    const thumbBlob = new Blob(['thumb'], { type: 'image/png' });
    shellsClient.shells_GetThumbnail.mockReturnValue(of({ data: thumbBlob }));

    await store.applyShellsResult([{ id: 'shell-1' }] as any[], ['thumbnail']);

    await store.ensureThumbLoaded('shell-1');

    expect(shellsClient.shells_GetThumbnail).toHaveBeenCalledTimes(1);
    expect(store.getThumb('shell-1')?.thumbLoaded).toBe(true);

    await store.applyShellsResult([{ id: 'shell-1' }] as any[], ['thumbnail']);

    expect(shellsClient.shells_GetThumbnail).toHaveBeenCalledTimes(1);
    expect(store.getThumb('shell-1')?.fileUrl).toBeDefined();
  });

  it('deduplicates in-flight thumbnail requests for the same shell', async () => {
    const thumbnailResponse = new Subject<{ data: Blob }>();
    shellsClient.shells_GetThumbnail.mockReturnValue(thumbnailResponse.asObservable());

    await store.applyShellsResult([{ id: 'shell-1' }] as any[], ['thumbnail']);

    const firstLoad = store.ensureThumbLoaded('shell-1');
    const secondLoad = store.ensureThumbLoaded('shell-1');

    expect(shellsClient.shells_GetThumbnail).toHaveBeenCalledTimes(1);

    thumbnailResponse.next({ data: new Blob(['thumb']) });
    thumbnailResponse.complete();
    await Promise.all([firstLoad, secondLoad]);

    expect(store.getThumb('shell-1')?.thumbLoaded).toBe(true);
  });

  it('loads nameplates and submodels lazily for visible columns and exposes them by shell id', async () => {
    shellsClient.shells_GetNameplateInfos.mockReturnValue(of({ productDesignation: 'Pump A' }));
    shellsClient.shells_GetContainedSubmdels.mockReturnValue(
      of({ containedSubmodels: [{ id: 'sm-1', idShort: 'Nameplate' }] }),
    );

    await store.applyShellsResult([{ id: 'shell-1' }] as any[], ['productDesignation', 'containedSubmodels']);

    expect(shellsClient.shells_GetNameplateInfos).not.toHaveBeenCalled();
    expect(shellsClient.shells_GetContainedSubmdels).not.toHaveBeenCalled();

    store.ensureNameplateLoaded('shell-1');
    store.ensureSubmodelsLoaded('shell-1');
    await Promise.resolve();
    await Promise.resolve();

    expect(shellsClient.shells_GetNameplateInfos).toHaveBeenCalledWith('shell-1');
    expect(shellsClient.shells_GetContainedSubmdels).toHaveBeenCalledWith('shell-1');
    expect(store.getNameplateData('shell-1')?.nameplateData?.productDesignation).toBe('Pump A');
    expect(store.getSubmodels('shell-1')?.submodelMetadata?.[0].idShort).toBe('Nameplate');
  });
});
