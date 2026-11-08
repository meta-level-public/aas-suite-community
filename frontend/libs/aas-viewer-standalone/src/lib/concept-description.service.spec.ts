import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ConceptDescriptionService } from './concept-description.service';

describe('ConceptDescriptionService', () => {
  let service: ConceptDescriptionService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ConceptDescriptionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('does not send a request when no CD repository is configured', async () => {
    await expect(service.loadCD('urn:example:cd:1', '', '')).resolves.toBeUndefined();
    await expect(service.loadCD('urn:example:cd:1', '   ', '')).resolves.toBeUndefined();

    httpMock.expectNone(() => true);
  });

  it('loads the concept description from the configured repository', async () => {
    const id = 'urn:example:cd:1';
    const result = service.loadCD(id, 'https://repo.example.com', 'key');

    const request = httpMock.expectOne((req) => req.url.startsWith('https://repo.example.com/concept-descriptions/'));
    expect(request.request.headers.get('Apikey')).toBe('key');
    request.flush(JSON.stringify({ modelType: 'ConceptDescription', id, idShort: 'Cd1' }));

    expect((await result)?.id).toBe(id);
  });
});
