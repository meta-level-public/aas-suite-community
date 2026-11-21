import { AasConfirmationService, AccessService } from '@aas/common-services';
import { SystemManagementClient } from '@aas/webapi-client';
import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { afterEach, describe, expect, it } from 'vitest';
import { OrganisationStateService } from '../../organisation/organisation-state.service';
import { PaymentService } from '../payment.service';
import { OrgaPaymentModelListComponent } from './orga-payment-model-list.component';

describe('OrgaPaymentModelListComponent actions menu', () => {
  function createComponent(allowedRoles: string[]) {
    TestBed.configureTestingModule({
      providers: [
        { provide: OrganisationStateService, useValue: {} },
        { provide: SystemManagementClient, useValue: {} },
        { provide: AccessService, useValue: { isAllowed: (role: string) => allowedRoles.includes(role) } },
        { provide: AasConfirmationService, useValue: {} },
        { provide: TranslateService, useValue: {} },
        { provide: PaymentService, useValue: {} },
      ],
    });
    return TestBed.runInInjectionContext(
      () =>
        new OrgaPaymentModelListComponent(
          TestBed.inject(AasConfirmationService),
          TestBed.inject(TranslateService),
          TestBed.inject(PaymentService),
        ),
    );
  }

  afterEach(() => TestBed.resetTestingModule());

  it('offers cancelling and changing the end date to the system administration', () => {
    expect(createComponent(['SYSTEM_ADMIN']).canShowMenu).toBe(true);
  });

  it('hides the menu from the organisation administration', () => {
    expect(createComponent(['ORGA_ADMIN']).canShowMenu).toBe(false);
  });

  it('hides the menu if the host switches it off', () => {
    const component = createComponent(['SYSTEM_ADMIN']);
    component.showMenu = false;

    expect(component.canShowMenu).toBe(false);
  });
});
