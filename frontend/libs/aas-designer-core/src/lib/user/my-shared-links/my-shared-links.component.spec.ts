import { QrCodeExportComponent } from '@aas/common-components';
import { AasConfirmationService, NotificationService } from '@aas/common-services';
import { MySharedLink, SharedLinksClient } from '@aas/webapi-client';
import { Component, input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { MySharedLinkService } from './my-shared-link.service';
import { MySharedLinksComponent } from './my-shared-links.component';

@Component({ selector: 'lib-qr-code-export', template: '' })
class QrCodeExportStubComponent {
  value = input('');
  fileName = input('');
  caption = input('');
}

describe('MySharedLinksComponent QR code', () => {
  let fixture: ComponentFixture<MySharedLinksComponent>;
  const link = new MySharedLink({
    id: 7,
    aasIdentifier: 'urn:htw-hackathon:aas:rastplatz:01',
    generatedLink: 'https://suite.example.com/public-viewer?accesscode=15c9a4fc',
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MySharedLinksComponent, TranslateModule.forRoot()],
      providers: [
        provideNoopAnimations(),
        { provide: SharedLinksClient, useValue: { sharedLinks_GetMySharedLinks: () => of([link]) } },
        { provide: MySharedLinkService, useValue: {} },
        { provide: NotificationService, useValue: { showMessageAlways: vi.fn() } },
        { provide: AasConfirmationService, useValue: { confirm: vi.fn() } },
      ],
    }).overrideComponent(MySharedLinksComponent, {
      remove: { imports: [QrCodeExportComponent] },
      add: { imports: [QrCodeExportStubComponent] },
    });
    fixture = TestBed.createComponent(MySharedLinksComponent);
  });

  afterEach(() => document.body.querySelectorAll('.p-dialog-mask').forEach((mask) => mask.remove()));

  it('offers the QR code in the actions of a link and shows it in a dialog', async () => {
    const component = fixture.componentInstance;
    component.onShowActions(link);
    const qrCodeItem = component.menuItems.find((item) => item.label === 'QR_CODE');
    expect(qrCodeItem?.icon).toBe('pi pi-qrcode');

    qrCodeItem?.command?.({});
    fixture.detectChanges();
    await fixture.whenStable();

    const qrCode = fixture.debugElement.query((el) => el.componentInstance instanceof QrCodeExportStubComponent);
    expect(qrCode.componentInstance.value()).toBe(link.generatedLink);
    expect(qrCode.componentInstance.fileName()).toBe('shared-link_urn:htw-hackathon:aas:rastplatz:01');
    expect(qrCode.componentInstance.caption()).toBe(link.aasIdentifier);
  });

  it('closes the dialog when it is hidden', () => {
    fixture.componentInstance.qrCodeLink.set(link);
    fixture.detectChanges();

    fixture.componentInstance.qrCodeLink.set(null);
    fixture.detectChanges();

    expect(fixture.debugElement.query((el) => el.componentInstance instanceof QrCodeExportStubComponent)).toBeNull();
  });
});
