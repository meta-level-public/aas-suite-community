import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { FilenameHelper } from '@aas/helpers';
import { SupplementalFile } from '@aas/model';
import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { saveAs } from 'file-saver-es';
import { of } from 'rxjs';
import { V3EditorUiStateStoreService } from '../../v3-editor-ui-state-store.service';
import { V3TreeService } from '../../v3-tree/v3-tree.service';
import { V3SupplementalFileComponent } from './v3-supplemental-file.component';

vi.mock('file-saver-es', () => ({
  saveAs: vi.fn(),
}));

describe('V3SupplementalFileComponent', () => {
  const treeService = {
    selectNodeByElement: vi.fn(),
  };

  const sanitizer = {
    bypassSecurityTrustResourceUrl: (value: string) => value,
  };

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.restoreAllMocks();
    vi.mocked(saveAs).mockClear();
    treeService.selectNodeByElement.mockClear();
  });

  function createComponent(http?: Partial<{ get: (url: string, options?: unknown) => unknown }>) {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: HttpClient,
          useValue: {
            get: vi.fn(),
            ...http,
          },
        },
        {
          provide: V3EditorUiStateStoreService,
          useValue: {
            detailsPanelCollapsed: () => false,
            contentPanelCollapsed: () => false,
            setDetailsPanelCollapsed: vi.fn(),
            setContentPanelCollapsed: vi.fn(),
          },
        },
        {
          provide: V3TreeService,
          useValue: treeService,
        },
      ],
    });

    return TestBed.runInInjectionContext(
      () => new V3SupplementalFileComponent(TestBed.inject(HttpClient), sanitizer as never),
    );
  }

  function createSupplementalFile(overrides: Partial<SupplementalFile> = {}): SupplementalFile {
    return {
      path: '/aasx/files/test-file.png',
      filename: '/aasx/files/test-file.png',
      fileApiUrl: '',
      contentType: 'image/png',
      isThumbnail: false,
      file: null as never,
      isLoaded: false,
      isLoading: false,
      isLocal: false,
      fileResourceUrl: undefined,
      fileUrl: null,
      fileData: null,
      id: null,
      ...overrides,
    };
  }

  function createAasFile(idShort: string, value: string): aas.types.File {
    const file = new aas.types.File();
    file.idShort = idShort;
    file.value = value;
    file.contentType = 'application/pdf';
    return file;
  }

  it('creates an image preview URL for local supplemental files', async () => {
    const imageFile = new File(['image'], 'test-file.png', { type: 'image/png' });
    const supplementalFile = createSupplementalFile({
      file: imageFile,
      isLocal: true,
    });
    const objectUrlSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:image-preview');
    const previewBlobSpy = vi.spyOn(FilenameHelper, 'buildPreviewImageBlob').mockResolvedValue(imageFile);
    const component = createComponent();

    component.file = {
      content: {
        path: supplementalFile.path,
        contentType: supplementalFile.contentType,
        fileApiUrl: supplementalFile.fileApiUrl,
      },
    } as never;
    component.shellResult = {
      supplementalFiles: [supplementalFile],
    } as never;

    component.ngOnChanges();
    await component.loadFile();

    expect(previewBlobSpy).toHaveBeenCalledWith(imageFile);
    expect(component.showPreview).toBe(true);
    expect(component.supplementalFile?.fileUrl).toBe('blob:image-preview');
    expect(component.previewAvailable()).toBe(true);

    objectUrlSpy.mockRestore();
  });

  it('stores XML content as preview text', async () => {
    const xmlBlob = {
      text: vi.fn(async () => '<root>preview</root>'),
    } as never;
    const supplementalFile = createSupplementalFile({
      path: '/aasx/files/test-file.xml',
      filename: '/aasx/files/test-file.xml',
      contentType: 'application/xml',
      fileData: xmlBlob,
    });
    const component = createComponent();

    component.file = {
      content: {
        path: supplementalFile.path,
        contentType: supplementalFile.contentType,
        fileApiUrl: supplementalFile.fileApiUrl,
      },
    } as never;
    component.shellResult = {
      supplementalFiles: [supplementalFile],
    } as never;

    component.ngOnChanges();
    await component.loadFile();

    expect(component.getPreviewType()).toBe('xml');
    expect(component.previewText).toContain('<root>preview</root>');
    expect(component.previewAvailable()).toBe(true);
    expect(component.supplementalFile?.fileUrl).toBeNull();
  });

  it('downloads remote supplemental files via the supplemental file endpoint', async () => {
    const downloadedBlob = new Blob(['remote'], { type: 'application/pdf' });
    const httpGet = vi.fn(() => of(downloadedBlob));
    const supplementalFile = createSupplementalFile({
      path: '/aasx/files/test-file.pdf',
      filename: '/aasx/files/test-file.pdf',
      contentType: 'application/pdf',
      isLocal: false,
      fileApiUrl: 'http://localhost:5196/designer-api/api/files/33659',
    });
    const component = createComponent({ get: httpGet });

    component.file = {
      content: {
        path: supplementalFile.path,
        contentType: supplementalFile.contentType,
        fileApiUrl: supplementalFile.fileApiUrl,
      },
    } as never;
    component.shellResult = {
      id: 7,
      supplementalFiles: [supplementalFile],
    } as never;

    component.ngOnChanges();
    await component.downloadFile();

    expect(httpGet).toHaveBeenCalledWith(supplementalFile.fileApiUrl, {
      responseType: 'blob' as 'json',
    });
    expect(saveAs).toHaveBeenCalledWith(downloadedBlob, 'test-file.pdf');
  });

  it('collects all file elements referencing the supplemental file', () => {
    const supplementalFile = createSupplementalFile({
      path: '/aasx/files/test-file.pdf',
      filename: '/aasx/files/test-file.pdf',
      contentType: 'application/pdf',
    });
    const firstFile = createAasFile('Manual', 'file:///aasx/files/test-file.pdf');
    const secondFile = createAasFile('Datasheet', '/aasx/files/test-file.pdf');
    const unrelatedFile = createAasFile('Other', '/aasx/files/other.pdf');
    const collection = new aas.types.SubmodelElementCollection();
    collection.idShort = 'Documents';
    collection.value = [secondFile, unrelatedFile];
    const submodel = new aas.types.Submodel('urn:test:technical-data');
    submodel.idShort = 'TechnicalData';
    submodel.submodelElements = [firstFile, collection];
    const component = createComponent();

    component.file = {
      content: {
        path: supplementalFile.path,
        contentType: supplementalFile.contentType,
        fileApiUrl: supplementalFile.fileApiUrl,
      },
    } as never;
    component.shellResult = {
      supplementalFiles: [supplementalFile],
      v3Shell: {
        submodels: [submodel],
      },
    } as never;

    component.ngOnChanges();

    expect(component.referencingElements).toHaveLength(2);
    expect(component.referencingElements[0]).toMatchObject({
      submodelLabel: 'TechnicalData',
      fileLabel: 'Manual',
      nestedPath: null,
    });
    expect(component.referencingElements[1]).toMatchObject({
      submodelLabel: 'TechnicalData',
      fileLabel: 'Datasheet',
      nestedPath: 'Documents',
    });
    expect(component.referencingElements.map((entry) => entry.locationLabel)).toEqual([
      'TechnicalData / Manual -> Manual',
      'TechnicalData / Documents / Datasheet -> Datasheet',
    ]);
  });

  it('jumps to the selected referencing file element', () => {
    const fileElement = createAasFile('Manual', '/aasx/files/test-file.pdf');
    const component = createComponent();

    component.jumpToReferencingElement({
      fileElement,
      submodelLabel: 'TechnicalData',
      fileLabel: 'Manual',
      nestedPath: null,
      locationLabel: 'TechnicalData / Manual -> Manual',
    });

    expect(treeService.selectNodeByElement).toHaveBeenCalledWith(fileElement);
  });
});
