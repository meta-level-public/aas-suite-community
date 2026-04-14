import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AppConfigService } from './app-config.service';

describe('AppConfigService', () => {
  let service: AppConfigService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AppConfigService],
    });

    service = TestBed.inject(AppConfigService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('overrides public legal links from system configuration', async () => {
    const loadPromise = service.loadConfig();

    httpMock.expectOne('/config/app-config.json').flush({
      aasSystemManagementApiPath: '/system-management-api',
      datenschutzLinkDe: 'https://static.example/privacy-de',
      datenschutzLinkEn: 'https://static.example/privacy-en',
      avvLinkDe: '',
      avvLinkEn: '',
      agbLinkDe: '',
      agbLinkEn: '',
      imprintLink: 'https://static.example/imprint',
      compareUrls: '',
    });

    await Promise.resolve();

    httpMock.expectOne('/system-management-api/SystemManagement/GetConfiguration').flush({
      singleTenantMode: false,
      datenschutzLinkDe: 'https://runtime.example/privacy-de',
      datenschutzLinkEn: 'https://runtime.example/privacy-en',
      agbLinkDe: 'https://runtime.example/agb-de',
      agbLinkEn: 'https://runtime.example/agb-en',
      avvLinkDe: 'https://runtime.example/avv-de',
      avvLinkEn: 'https://runtime.example/avv-en',
      imprintLink: 'https://runtime.example/imprint',
    });

    await loadPromise;

    expect(service.config.datenschutzLinkDe).toBe('https://runtime.example/privacy-de');
    expect(service.config.datenschutzLinkEn).toBe('https://runtime.example/privacy-en');
    expect(service.config.agbLinkDe).toBe('https://runtime.example/agb-de');
    expect(service.config.agbLinkEn).toBe('https://runtime.example/agb-en');
    expect(service.config.avvLinkDe).toBe('https://runtime.example/avv-de');
    expect(service.config.avvLinkEn).toBe('https://runtime.example/avv-en');
    expect(service.config.imprintLink).toBe('https://runtime.example/imprint');
  });

  it('keeps static values when public configuration request fails', async () => {
    const loadPromise = service.loadConfig();

    httpMock.expectOne('/config/app-config.json').flush({
      aasSystemManagementApiPath: '/system-management-api',
      datenschutzLinkDe: 'https://static.example/privacy-de',
      datenschutzLinkEn: 'https://static.example/privacy-en',
      avvLinkDe: 'https://static.example/avv-de',
      avvLinkEn: 'https://static.example/avv-en',
      agbLinkDe: 'https://static.example/agb-de',
      agbLinkEn: 'https://static.example/agb-en',
      imprintLink: 'https://static.example/imprint',
      compareUrls: '',
    });

    await Promise.resolve();

    httpMock.expectOne('/system-management-api/SystemManagement/GetConfiguration').flush('failed', {
      status: 500,
      statusText: 'Server Error',
    });

    await loadPromise;

    expect(service.config.datenschutzLinkDe).toBe('https://static.example/privacy-de');
    expect(service.config.avvLinkEn).toBe('https://static.example/avv-en');
    expect(service.config.imprintLink).toBe('https://static.example/imprint');
  });
});
