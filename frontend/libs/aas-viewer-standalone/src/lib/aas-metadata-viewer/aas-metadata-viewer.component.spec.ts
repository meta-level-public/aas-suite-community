import { HelpService } from '@aas/common-components';
import { NotificationService } from '@aas/common-services';
import { Clipboard } from '@angular/cdk/clipboard';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ViewerStoreService } from '../viewer-store.service';
import { AasMetadataViewerComponent } from './aas-metadata-viewer.component';

describe('AasMetadataViewerComponent', () => {
  let fixture: ComponentFixture<AasMetadataViewerComponent>;
  let component: AasMetadataViewerComponent;

  const notificationServiceMock = {
    showMessageAlways: vi.fn(),
  };

  const clipboardMock = {
    copy: vi.fn(),
  };

  const httpClientMock = {
    get: vi.fn(() => of(new Blob(['thumbnail'], { type: 'image/png' }))),
  };

  const helpServiceMock = {
    helpTexts: signal([]),
    initHelp: vi.fn(),
    helpClient: {
      helpInternal_UpdateHelpEntry: vi.fn(),
    },
  };

  const viewerStoreMock = {
    aas: signal({
      assetInformation: {
        defaultThumbnail: {
          path: '/aasx/files/thumb.png',
        },
      },
    }),
    aasUrl: vi.fn(() => '/aas-proxy/1/aas-repo/shells/test-shell'),
    headers: vi.fn(() => new HttpHeaders({ Apikey: 'test-api-key' })),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [AasMetadataViewerComponent, TranslateModule.forRoot()],
      providers: [
        { provide: ViewerStoreService, useValue: viewerStoreMock },
        { provide: NotificationService, useValue: notificationServiceMock },
        { provide: Clipboard, useValue: clipboardMock },
        { provide: HttpClient, useValue: httpClientMock },
        { provide: HelpService, useValue: helpServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AasMetadataViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads metadata thumbnails with viewer headers', async () => {
    const thumbnailPromise = component.thumbnail() as Promise<unknown>;

    await expect(thumbnailPromise).resolves.toBeTruthy();

    expect(httpClientMock.get).toHaveBeenCalledTimes(1);

    const [url, options] = httpClientMock.get.mock.calls[0];
    expect(url).toBe('/aas-proxy/1/aas-repo/shells/test-shell/asset-information/thumbnail');
    expect(options.responseType).toBe('blob');
    expect(options.headers.get('Apikey')).toBe('test-api-key');
  });
});
