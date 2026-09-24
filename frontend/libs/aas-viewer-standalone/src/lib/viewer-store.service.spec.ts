import { ViewerDescriptor } from '@aas/webapi-client';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { submodelLabelFromUrl } from './submodel-load-state';
import { ViewerStoreService } from './viewer-store.service';

function encodeId(id: string): string {
  return btoa(id).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function submodelUrl(id: string): string {
  return `https://repo.example.com/submodels/${encodeId(id)}`;
}

function submodelJson(id: string, idShort: string) {
  return { modelType: 'Submodel', id, idShort };
}

const settle = () => new Promise((resolve) => setTimeout(resolve));

describe('submodelLabelFromUrl', () => {
  it('uses the last segment of the base64url encoded submodel id', () => {
    expect(submodelLabelFromUrl(submodelUrl('https://mm-software.com/submodel/900-000004/CarbonFootprint'))).toBe(
      'CarbonFootprint',
    );
  });

  it('supports urn identifiers and trailing slashes', () => {
    expect(submodelLabelFromUrl(`${submodelUrl('urn:example:submodel:Nameplate')}/`)).toBe('Nameplate');
  });

  it('falls back to the raw path segment when it is not base64url encoded', () => {
    expect(submodelLabelFromUrl('https://repo.example.com/submodels/not~encoded')).toBe('not~encoded');
  });
});

describe('ViewerStoreService', () => {
  const nameplateId = 'https://example.com/submodel/1/Nameplate';
  const carbonId = 'https://example.com/submodel/1/CarbonFootprint';
  const technicalId = 'https://example.com/submodel/1/TechnicalData';

  let store: ViewerStoreService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(ViewerStoreService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  function openShell(submodelIds: string[]) {
    store.viewerDescriptor.set({
      aasEndpoint: '',
      submodelEndpoints: submodelIds.map(submodelUrl),
    } as unknown as ViewerDescriptor);
    TestBed.tick();
  }

  it('shows each submodel as soon as its own request has finished', async () => {
    openShell([nameplateId, carbonId, technicalId]);

    expect(store.isLoadingSubmodels()).toBe(true);
    expect(store.submodelLoadStates().map((state) => [state.label, state.status])).toEqual([
      ['Nameplate', 'loading'],
      ['CarbonFootprint', 'loading'],
      ['TechnicalData', 'loading'],
    ]);

    httpTesting.expectOne(submodelUrl(technicalId)).flush(submodelJson(technicalId, 'TechnicalData'));
    await settle();

    expect(store.submodels().map((sm) => sm.idShort)).toEqual(['TechnicalData']);
    expect(store.submodelLoadProgress()).toEqual({ done: 1, total: 3 });

    httpTesting.expectOne(submodelUrl(nameplateId)).flush(submodelJson(nameplateId, 'Nameplate'));
    await settle();

    // Loaded submodels keep the order of the shell, independent of the response order.
    expect(store.submodels().map((sm) => sm.idShort)).toEqual(['Nameplate', 'TechnicalData']);
    expect(store.isLoadingSubmodels()).toBe(true);

    httpTesting.expectOne(submodelUrl(carbonId)).flush('error', { status: 500, statusText: 'Internal Server Error' });
    await settle();

    expect(store.isLoadingSubmodels()).toBe(false);
    expect(store.submodelLoadStates().map((state) => state.status)).toEqual(['loaded', 'failed', 'loaded']);
  });

  it('ignores responses that belong to a previously opened shell', async () => {
    openShell([nameplateId]);
    const staleRequest = httpTesting.expectOne(submodelUrl(nameplateId));

    openShell([technicalId]);
    staleRequest.flush(submodelJson(nameplateId, 'Nameplate'));
    httpTesting.expectOne(submodelUrl(technicalId)).flush(submodelJson(technicalId, 'TechnicalData'));
    await settle();

    expect(store.submodels().map((sm) => sm.idShort)).toEqual(['TechnicalData']);
  });
});
