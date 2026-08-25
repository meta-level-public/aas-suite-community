import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { AppConfigService, EncodingService, NotificationService, PortalService } from '@aas/common-services';
import { ConceptDescriptionClient, SubmodelClient } from '@aas/webapi-client';
import { HttpClient } from '@angular/common/http';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { V3EditorDataStoreService } from '../v3-editor/v3-editor-data-store.service';
import { SubmodelEditorComponent } from './submodel-editor.component';

describe('SubmodelEditorComponent supplemental files', () => {
  function createComponent() {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AppConfigService,
          useValue: {
            config: {
              aasApiPath: '/aas-api',
              aasViewerProxyPath: '/designer-api/aas-viewer-proxy',
            },
          },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => null,
              },
            },
          },
        },
        {
          provide: SubmodelClient,
          useValue: {},
        },
        {
          provide: ConceptDescriptionClient,
          useValue: {},
        },
        {
          provide: NotificationService,
          useValue: {
            showMessageAlways: vi.fn(),
          },
        },
        {
          provide: V3EditorDataStoreService,
          useValue: {
            editorDescriptor: signal(null),
          },
        },
        {
          provide: HttpClient,
          useValue: {
            post: vi.fn(),
          },
        },
      ],
    });

    return TestBed.runInInjectionContext(() => new SubmodelEditorComponent());
  }

  function createFile(idShort: string, value: string, contentType: string) {
    const file = new aas.types.File();
    file.idShort = idShort;
    file.value = value;
    file.contentType = contentType;
    return file;
  }

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.restoreAllMocks();
  });

  it('builds attachment URLs for nested list and collection paths', () => {
    vi.spyOn(PortalService, 'getCurrentAasInfrastructureSetting').mockReturnValue({
      smRepositoryUrl: 'https://repo.example.com/',
    } as never);

    const list = new aas.types.SubmodelElementList(aas.types.AasSubmodelElements.File);
    list.idShort = 'Documents';

    const directFile = createFile('IgnoredInListItem', 'file:///aasx/files/direct.pdf', 'application/pdf');

    const innerCollection = new aas.types.SubmodelElementCollection();
    innerCollection.idShort = 'InnerCollection';
    const nestedFile = createFile('NestedAttachment', '/aasx/files/nested.pdf', 'application/pdf');
    innerCollection.value = [nestedFile];

    list.value = [directFile, innerCollection];

    const rootFile = createFile('TopLevel', '/aasx/files/root.pdf', 'application/pdf');

    const submodel = new aas.types.Submodel('urn:example:submodel');
    submodel.submodelElements = [list, rootFile];

    const component = createComponent();
    const supplementalFiles = (component as any).loadReferencedSupplementalFiles(submodel);

    const submodelId = EncodingService.base64urlEncode(submodel.id);

    const directMatch = supplementalFiles.find((entry: any) => entry.path === '/aasx/files/direct.pdf');
    const nestedMatch = supplementalFiles.find((entry: any) => entry.path === '/aasx/files/nested.pdf');
    const rootMatch = supplementalFiles.find((entry: any) => entry.path === '/aasx/files/root.pdf');

    expect(directMatch?.fileApiUrl).toBe(
      `/designer-api/aas-viewer-proxy/call?target=${encodeURIComponent(`https://repo.example.com/submodels/${submodelId}/submodel-elements/Documents%5B0%5D/attachment`)}`,
    );
    expect(nestedMatch?.fileApiUrl).toBe(
      `/designer-api/aas-viewer-proxy/call?target=${encodeURIComponent(`https://repo.example.com/submodels/${submodelId}/submodel-elements/Documents%5B0%5D.NestedAttachment/attachment`)}`,
    );
    expect(rootMatch?.fileApiUrl).toBe(
      `/designer-api/aas-viewer-proxy/call?target=${encodeURIComponent(`https://repo.example.com/submodels/${submodelId}/submodel-elements/TopLevel/attachment`)}`,
    );
  });

  it('routes absolute HTTP file references through the viewer proxy', () => {
    vi.spyOn(PortalService, 'getCurrentAasInfrastructureSetting').mockReturnValue({
      smRepositoryUrl: 'https://repo.example.com/',
    } as never);

    const externalFile = createFile('ExternRef', 'https://cdn.example.com/path/manual.pdf', 'application/pdf');
    const submodel = new aas.types.Submodel('urn:example:submodel');
    submodel.submodelElements = [externalFile];

    const component = createComponent();
    const supplementalFiles = (component as any).loadReferencedSupplementalFiles(submodel);

    expect(supplementalFiles).toHaveLength(1);
    expect(supplementalFiles[0].fileApiUrl).toBe(
      '/designer-api/aas-viewer-proxy/call?target=https%3A%2F%2Fcdn.example.com%2Fpath%2Fmanual.pdf',
    );
  });

  it('falls back to submodelRepositoryUrl when smRepositoryUrl is empty', () => {
    vi.spyOn(PortalService, 'getCurrentAasInfrastructureSetting').mockReturnValue({
      smRepositoryUrl: '',
      submodelRepositoryUrl: 'https://repo-from-fallback.example.com/',
    } as never);

    const file = createFile('TopLevel', '/aasx/files/root.pdf', 'application/pdf');
    const submodel = new aas.types.Submodel('urn:example:submodel');
    submodel.submodelElements = [file];

    const component = createComponent();
    const supplementalFiles = (component as any).loadReferencedSupplementalFiles(submodel);
    const submodelId = EncodingService.base64urlEncode(submodel.id);

    expect(supplementalFiles).toHaveLength(1);
    expect(supplementalFiles[0].fileApiUrl).toBe(
      `/designer-api/aas-viewer-proxy/call?target=${encodeURIComponent(`https://repo-from-fallback.example.com/submodels/${submodelId}/submodel-elements/TopLevel/attachment`)}`,
    );
  });

  it('uses aas-proxy sm-repo endpoint when infrastructure id is available', () => {
    vi.spyOn(PortalService, 'getCurrentAasInfrastructureSetting').mockReturnValue({
      id: 7,
      smRepositoryUrl: 'https://repo.example.com/',
    } as never);

    const file = createFile('TopLevel', '/aasx/files/root.pdf', 'application/pdf');
    const submodel = new aas.types.Submodel('urn:example:submodel');
    submodel.submodelElements = [file];

    const component = createComponent();
    const supplementalFiles = (component as any).loadReferencedSupplementalFiles(submodel);
    const submodelId = EncodingService.base64urlEncode(submodel.id);

    expect(supplementalFiles).toHaveLength(1);
    expect(supplementalFiles[0].fileApiUrl).toBe(
      `/aas-proxy/7/sm-repo/submodels/${submodelId}/submodel-elements/TopLevel/attachment`,
    );
  });
});
