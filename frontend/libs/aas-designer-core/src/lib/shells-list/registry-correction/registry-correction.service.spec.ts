import { AppConfigService, EncodingService } from '@aas/common-services';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RegistryCorrectionService } from './registry-correction.service';

describe('RegistryCorrectionService', () => {
  let service: RegistryCorrectionService;
  let httpMock: HttpTestingController;
  let config: { aasProxyApiPath?: string };

  const enc = (value: string) => EncodingService.base64urlEncode(value);
  const tick = () => new Promise((resolve) => setTimeout(resolve));

  beforeEach(() => {
    config = { aasProxyApiPath: '/aas-proxy' };
    localStorage.setItem('CURRENT_AAS_INFRASTRUCTURE', JSON.stringify({ id: 5 }));
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), { provide: AppConfigService, useValue: { config } }],
    });
    service = TestBed.inject(RegistryCorrectionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.removeItem('CURRENT_AAS_INFRASTRUCTURE');
  });

  it('loads descriptors through the proxy of the active infrastructure with encoded ids', async () => {
    const aasPromise = service.getAasDescriptor('urn:aas:1');
    httpMock.expectOne(`/aas-proxy/5/aas-reg/shell-descriptors/${enc('urn:aas:1')}`).flush({ id: 'urn:aas:1' });
    expect(await aasPromise).toEqual({ id: 'urn:aas:1' });

    const smPromise = service.getSubmodelDescriptor('urn:sm:1');
    httpMock.expectOne(`/aas-proxy/5/sm-reg/submodel-descriptors/${enc('urn:sm:1')}`).flush({ id: 'urn:sm:1' });
    expect(await smPromise).toEqual({ id: 'urn:sm:1' });
  });

  it('fails without configured proxy path', async () => {
    config.aasProxyApiPath = '';

    await expect(service.getAasDescriptor('x')).rejects.toThrow('AAS proxy API path is not configured');
  });

  it('fails without an active infrastructure', async () => {
    localStorage.removeItem('CURRENT_AAS_INFRASTRUCTURE');

    await expect(service.getSubmodelDescriptor('x')).rejects.toThrow('No active AAS infrastructure selected');
  });

  it('replaces a shell descriptor by deleting the original and posting the new one', async () => {
    const promise = service.saveAasDescriptor('urn:aas:old', { id: 'urn:aas:new' });
    const url = `/aas-proxy/5/aas-reg/shell-descriptors/${enc('urn:aas:old')}`;

    httpMock.expectOne({ method: 'GET', url }).flush({ id: 'urn:aas:old' });
    await tick();
    httpMock.expectOne({ method: 'DELETE', url }).flush(null);
    await tick();

    const post = httpMock.expectOne('/aas-proxy/5/aas-reg/shell-descriptors');
    expect(post.request.method).toBe('POST');
    expect(post.request.body).toEqual({ id: 'urn:aas:new' });
    post.flush(null);
    await promise;
  });

  it('still posts when the original submodel descriptor does not exist', async () => {
    const promise = service.saveSubmodelDescriptor('urn:sm:1', { id: 'urn:sm:1' });
    const url = `/aas-proxy/5/sm-reg/submodel-descriptors/${enc('urn:sm:1')}`;

    httpMock.expectOne({ method: 'GET', url }).flush(null, { status: 404, statusText: 'Not Found' });
    await tick();
    httpMock.expectOne({ method: 'DELETE', url }).flush(null, { status: 404, statusText: 'Not Found' });
    await tick();

    httpMock.expectOne('/aas-proxy/5/sm-reg/submodel-descriptors').flush(null);
    await promise;
  });

  it('does not post when deleting the original descriptor fails otherwise', async () => {
    const promise = service.saveSubmodelDescriptor('urn:sm:1', { id: 'urn:sm:1' });
    const url = `/aas-proxy/5/sm-reg/submodel-descriptors/${enc('urn:sm:1')}`;

    httpMock.expectOne({ method: 'GET', url }).flush({ id: 'urn:sm:1' });
    await tick();
    httpMock.expectOne({ method: 'DELETE', url }).flush(null, { status: 403, statusText: 'Forbidden' });

    await expect(promise).rejects.toMatchObject({ status: 403 });
    httpMock.expectNone('/aas-proxy/5/sm-reg/submodel-descriptors');
  });

  it('does not delete anything when the original descriptor cannot be loaded', async () => {
    const promise = service.saveSubmodelDescriptor('urn:sm:1', { id: 'urn:sm:2' });
    const url = `/aas-proxy/5/sm-reg/submodel-descriptors/${enc('urn:sm:1')}`;

    httpMock.expectOne({ method: 'GET', url }).flush(null, { status: 401, statusText: 'Unauthorized' });

    await expect(promise).rejects.toMatchObject({ status: 401 });
    httpMock.expectNone({ method: 'DELETE', url });
  });

  it('restores the original descriptor and rethrows when posting the new one fails', async () => {
    const original = { id: 'urn:sm:1', idShort: 'Nameplate' };
    const promise = service.saveSubmodelDescriptor('urn:sm:1', { id: 'urn:sm:2' });
    const url = `/aas-proxy/5/sm-reg/submodel-descriptors/${enc('urn:sm:1')}`;

    httpMock.expectOne({ method: 'GET', url }).flush(original);
    await tick();
    httpMock.expectOne({ method: 'DELETE', url }).flush(null);
    await tick();
    httpMock
      .expectOne({ method: 'POST', url: '/aas-proxy/5/sm-reg/submodel-descriptors' })
      .flush(null, { status: 400, statusText: 'Bad Request' });
    await tick();

    const restore = httpMock.expectOne({ method: 'POST', url: '/aas-proxy/5/sm-reg/submodel-descriptors' });
    expect(restore.request.body).toEqual(original);
    restore.flush(null);

    await expect(promise).rejects.toMatchObject({ status: 400 });
  });

  it('rethrows the original error when restoring the descriptor fails too', async () => {
    const promise = service.saveAasDescriptor('urn:aas:1', { id: 'urn:aas:2' });
    const url = `/aas-proxy/5/aas-reg/shell-descriptors/${enc('urn:aas:1')}`;

    httpMock.expectOne({ method: 'GET', url }).flush({ id: 'urn:aas:1' });
    await tick();
    httpMock.expectOne({ method: 'DELETE', url }).flush(null);
    await tick();
    httpMock
      .expectOne({ method: 'POST', url: '/aas-proxy/5/aas-reg/shell-descriptors' })
      .flush(null, { status: 409, statusText: 'Conflict' });
    await tick();
    httpMock
      .expectOne({ method: 'POST', url: '/aas-proxy/5/aas-reg/shell-descriptors' })
      .flush(null, { status: 500, statusText: 'Server Error' });

    await expect(promise).rejects.toMatchObject({ status: 409 });
  });
});
