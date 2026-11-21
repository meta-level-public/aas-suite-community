import { AasConfirmationService, AccessService, NotificationService } from '@aas/common-services';
import {
  AasInfrastructureClient,
  AasInfrastructureSettingsDto,
  OrganisationClient,
  SystemConfigurationDto,
  SystemManagementClient,
} from '@aas/webapi-client';
import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { afterEach, describe, expect, it } from 'vitest';
import { OrganisationStateService } from '../organisation-state.service';
import { InfrastructureComponent } from './infrastructure.component';

describe('InfrastructureComponent BaSyx Go upgrade', () => {
  function createComponent(isOrgaAdmin = true) {
    TestBed.configureTestingModule({
      providers: [
        { provide: OrganisationClient, useValue: {} },
        { provide: AasConfirmationService, useValue: {} },
        { provide: TranslateService, useValue: {} },
        { provide: AccessService, useValue: { isAllowed: () => isOrgaAdmin } },
        { provide: NotificationService, useValue: {} },
        { provide: AasInfrastructureClient, useValue: {} },
        { provide: HttpClient, useValue: {} },
        { provide: SystemManagementClient, useValue: {} },
        { provide: OrganisationStateService, useValue: {} },
        { provide: ActivatedRoute, useValue: {} },
        { provide: Router, useValue: {} },
      ],
    });
    return TestBed.runInInjectionContext(() => new InfrastructureComponent());
  }

  function setUp(component: InfrastructureComponent, singleTenantMode: boolean, settings: object) {
    component.systemConfiguration.set({ singleTenantMode } as SystemConfigurationDto);
    component.settings.set(settings as AasInfrastructureSettingsDto);
  }

  afterEach(() => TestBed.resetTestingModule());

  it('offers the upgrade for an internal infrastructure in multi-tenant operation', () => {
    const component = createComponent();
    setUp(component, false, { isInternal: true, isGoInfrastructure: false });

    expect(component.showGoUpgrade()).toBe(true);
  });

  it('does not offer the upgrade in single tenant mode', () => {
    const component = createComponent();
    setUp(component, true, { isInternal: true, isGoInfrastructure: false });

    expect(component.showGoUpgrade()).toBe(false);
  });

  it('does not offer the upgrade before the system configuration is known', () => {
    const component = createComponent();
    component.settings.set({ isInternal: true, isGoInfrastructure: false } as AasInfrastructureSettingsDto);

    expect(component.showGoUpgrade()).toBe(false);
  });

  it('does not offer the upgrade for Go, external infrastructures or without ORGA_ADMIN', () => {
    const goInfra = createComponent();
    setUp(goInfra, false, { isInternal: true, isGoInfrastructure: true });
    expect(goInfra.showGoUpgrade()).toBe(false);
    TestBed.resetTestingModule();

    const external = createComponent();
    setUp(external, false, { isInternal: false, isGoInfrastructure: false });
    expect(external.showGoUpgrade()).toBe(false);
    TestBed.resetTestingModule();

    const noAdmin = createComponent(false);
    setUp(noAdmin, false, { isInternal: true, isGoInfrastructure: false });
    expect(noAdmin.showGoUpgrade()).toBe(false);
  });
});
