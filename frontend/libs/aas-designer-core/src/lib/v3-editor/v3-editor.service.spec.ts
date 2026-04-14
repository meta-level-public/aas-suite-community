import { AppConfigService } from '@aas/common-services';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { V3EditorService } from './v3-editor.service';

describe('V3EditorService', () => {
  let service: V3EditorService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        V3EditorService,
        {
          provide: AppConfigService,
          useValue: {
            config: {
              apiPath: '/designer-api/api',
            },
          },
        },
      ],
    });

    service = TestBed.inject(V3EditorService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('posts repo submodel template requests with a deduplicated body payload', async () => {
    const resultPromise = service.getRepoSubmodelTemplate('https://example.test/submodel', [
      'cd-1',
      '',
      'cd-2',
      'cd-1',
    ]);

    const request = httpMock.expectOne('/designer-api/api/SubmodelTemplate/GetRepoSubmodelTemplatePost');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      url: 'https://example.test/submodel',
      knownConceptDescriptionIds: ['cd-1', 'cd-2'],
    });

    request.flush({ v3SubmodelsPlain: [], v3ConceptDescriptionsPlain: [] });

    await expect(resultPromise).resolves.toBeTruthy();
  });
});
