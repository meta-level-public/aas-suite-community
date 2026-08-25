import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppConfigService } from '../app-config.service';
import { PluginRegistryService } from './plugin-registry.service';

describe('PluginRegistryService', () => {
  let service: PluginRegistryService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AppConfigService, PluginRegistryService],
    });

    service = TestBed.inject(PluginRegistryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('loads plugin menu items and maps backend paths through the configured API base path', async () => {
    const appConfigService = TestBed.inject(AppConfigService) as unknown as { _config: unknown };
    appConfigService._config = { aasSystemManagementApiPath: '/designer-api/system-management-api' };

    const loadPromise = service.load();
    httpMock.expectOne('/designer-api/system-management-api/Plugins/menu-items').flush([
      {
        id: 'my-plugin',
        route: '/my-plugin',
        name: 'MyPlugin',
        icon: 'pi pi-question-circle',
        assetPath: '/system-management-api/Plugins/my-plugin/assets/',
        entryPointPath: '/system-management-api/Plugins/my-plugin/assets/index.html',
      },
    ]);

    await loadPromise;

    expect(service.plugins()).toHaveLength(1);
    expect(service.plugins()[0].entryPointUrl).toBe(
      '/designer-api/system-management-api/Plugins/my-plugin/assets/index.html',
    );
    expect(service.findByRoute('my-plugin')?.id).toBe('my-plugin');
  });

  it('keeps an empty plugin list when loading fails', async () => {
    const appConfigService = TestBed.inject(AppConfigService) as unknown as { _config: unknown };
    appConfigService._config = { aasSystemManagementApiPath: '/system-management-api' };

    const loadPromise = service.load();
    httpMock.expectOne('/system-management-api/Plugins/menu-items').flush('failed', {
      status: 500,
      statusText: 'Server Error',
    });

    await loadPromise;

    expect(service.plugins()).toEqual([]);
  });
});
