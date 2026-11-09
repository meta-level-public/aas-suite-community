import { AasConfirmationService, AppConfigService } from '@aas/common-services';
import { AasInfrastructureClient, AasViewerClient } from '@aas/webapi-client';
import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { AasResultListComponent } from './aas-result-list.component';
import { AasSearchService } from './aas-search.service';

describe('AasResultListComponent', () => {
  let component: AasResultListComponent;

  const linkedShell = {
    id: 'urn:smartcar:aas:type:lcd1602iic:01',
    submodels: [{ keys: [{ value: 'urn:smartcar:submodel:type:lcd1602iic:nameplate' }] }],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), AasResultListComponent],
      providers: [
        { provide: AppConfigService, useValue: { config: { aasProxyApiPath: '/designer-api/aas-proxy' } } },
        { provide: AasInfrastructureClient, useValue: { aasInfrastructure_GetAvailableInfrastructures: () => of([]) } },
        { provide: AasSearchService, useValue: { findAasByRepo: vi.fn() } },
        { provide: AasConfirmationService, useValue: { confirm: vi.fn() } },
        { provide: AasViewerClient, useValue: {} },
      ],
    }).compileComponents();

    component = TestBed.createComponent(AasResultListComponent).componentInstance;
  });

  it('loads the submodels of a linked AAS from the submodel repository of the infrastructure', () => {
    // Regression: the submodels were requested from the AAS repository, which in BaSyx Go setups does not hold them
    component.selectedSource = { id: 1, label: 'Internal', url: 'http://aas-repo' };

    const { aasRepositoryUrl, submodelRepositoryUrl } = component.getRepositoryUrls();
    const descriptor = component.createViewerDescriptor(linkedShell, aasRepositoryUrl, submodelRepositoryUrl);

    expect(descriptor.aasEndpoint).toBe(
      '/designer-api/aas-proxy/1/aas-repo/shells/dXJuOnNtYXJ0Y2FyOmFhczp0eXBlOmxjZDE2MDJpaWM6MDE',
    );
    expect(descriptor.submodelEndpoints).toEqual([
      '/designer-api/aas-proxy/1/sm-repo/submodels/dXJuOnNtYXJ0Y2FyOnN1Ym1vZGVsOnR5cGU6bGNkMTYwMmlpYzpuYW1lcGxhdGU',
    ]);
  });

  it('uses a custom repository URL for shells and submodels', () => {
    component.selectedSource = { id: -1, label: 'Custom', url: 'custom' };
    component.selectedCustomSource = 'https://example.com/aas-env';

    expect(component.getRepositoryUrls()).toEqual({
      aasRepositoryUrl: 'https://example.com/aas-env',
      submodelRepositoryUrl: 'https://example.com/aas-env',
    });
  });
});
