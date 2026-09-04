import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ConfigApiService } from './config-api.service';

describe('ConfigApiService', () => {
  let service: ConfigApiService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ConfigApiService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('returns a mapping warning when a template is missing from the template repository', () => {
    let result: { mappingWarnings: Record<number, string[]>; generalWarning?: string } | undefined;
    service
      .validateTemplateMappings(
        [
          {
            templateId: 'https://example.com/submodel-template',
            pattern: 'Example',
          },
        ],
        {
          templateId: 'https://example.com/shell-template',
          pattern: '.+',
        },
      )
      .subscribe((value) => (result = value));

    httpTesting
      .expectOne('/designer-api/aas-api/AasInfrastructure/GetAvailableInfrastructures')
      .flush([
        { id: 17, name: 'Submodel Template Repository', description: '', smRepositoryUrl: '' },
      ]);

    const templateRequest = httpTesting.expectOne((request) =>
      request.url.startsWith('/designer-api/aas-proxy/17/sm-reg/submodel-descriptors/'),
    );
    templateRequest.flush('Not found', { status: 404, statusText: 'Not Found' });

    const shellRequest = httpTesting.expectOne((request) =>
      request.url.startsWith('/designer-api/aas-proxy/17/aas-repo/shells/'),
    );
    shellRequest.flush({});

    expect(result?.mappingWarnings[0]).toEqual([
      'Submodel-Template ist im Template Repository nicht vorhanden.',
    ]);
    expect(result?.generalWarning).toBeUndefined();
  });

  it('returns a shell mapping warning when the shell is missing from the template repository', () => {
    let result: { shellTemplateWarning?: string } | undefined;
    service
      .validateTemplateMappings([], {
        templateId: 'https://example.com/shell-template',
        pattern: '.+',
      })
      .subscribe((value) => (result = value));

    httpTesting
      .expectOne('/designer-api/aas-api/AasInfrastructure/GetAvailableInfrastructures')
      .flush([
        { id: 17, name: 'Submodel Template Repository', description: '', smRepositoryUrl: '' },
      ]);

    const shellRequest = httpTesting.expectOne((request) =>
      request.url.startsWith('/designer-api/aas-proxy/17/aas-repo/shells/'),
    );
    shellRequest.flush('Not found', { status: 404, statusText: 'Not Found' });

    expect(result?.shellTemplateWarning).toBe(
      'Shell-Template ist im Template Repository nicht vorhanden.',
    );
  });

  it('returns successful validation messages for found submodel and shell templates', () => {
    let result:
      | {
          mappingSuccesses: Record<number, string>;
          shellTemplateSuccess?: string;
        }
      | undefined;
    service
      .validateTemplateMappings(
        [{ templateId: 'https://example.com/submodel-template', pattern: 'Example' }],
        { templateId: 'https://example.com/shell-template', pattern: '.+' },
      )
      .subscribe((value) => (result = value));

    httpTesting
      .expectOne('/designer-api/aas-api/AasInfrastructure/GetAvailableInfrastructures')
      .flush([
        { id: 17, name: 'Submodel Template Repository', description: '', smRepositoryUrl: '' },
      ]);
    httpTesting
      .expectOne((request) =>
        request.url.startsWith('/designer-api/aas-proxy/17/sm-reg/submodel-descriptors/'),
      )
      .flush({});
    httpTesting
      .expectOne((request) => request.url.startsWith('/designer-api/aas-proxy/17/aas-repo/shells/'))
      .flush({});

    expect(result?.mappingSuccesses[0]).toBe('Submodel-Template im Template Repository gefunden.');
    expect(result?.shellTemplateSuccess).toBe('Shell-Template im Template Repository gefunden.');
  });

  it('refreshes the BFF session and retries an unauthorized infrastructure lookup', () => {
    let result: { generalWarning?: string } | undefined;
    service
      .validateTemplateMappings([], {
        templateId: 'https://example.com/shell-template',
        pattern: '.+',
      })
      .subscribe((value) => (result = value));

    httpTesting
      .expectOne('/designer-api/aas-api/AasInfrastructure/GetAvailableInfrastructures')
      .flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    const refreshRequest = httpTesting.expectOne('/bff/session/refresh');
    expect(refreshRequest.request.method).toBe('POST');
    refreshRequest.flush({});

    httpTesting
      .expectOne('/designer-api/aas-api/AasInfrastructure/GetAvailableInfrastructures')
      .flush([
        { id: 17, name: 'Submodel Template Repository', description: '', smRepositoryUrl: '' },
      ]);

    const shellRequest = httpTesting.expectOne((request) =>
      request.url.startsWith('/designer-api/aas-proxy/17/aas-repo/shells/'),
    );
    shellRequest.flush({});

    expect(result?.generalWarning).toBeUndefined();
  });
});
