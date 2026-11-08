import { EncodingService } from '@aas/common-services';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { ViewerStoreService } from '../viewer-store.service';
import { OperationViewerComponent } from './operation-viewer.component';

const SUBMODEL_ID = 'urn:example:sm:operations';
const ENCODED_SUBMODEL_ID = EncodingService.base64urlEncode(SUBMODEL_ID);
const AAS_URL = 'https://repo.example.com/shells/YWFz';
const SM_URL = `https://repo.example.com/submodels/${ENCODED_SUBMODEL_ID}`;

describe('OperationViewerComponent', () => {
  let component: OperationViewerComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [OperationViewerComponent, TranslateModule.forRoot()],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const store = TestBed.inject(ViewerStoreService);
    Object.assign(store, {
      aasUrl: signal(AAS_URL),
      submodels: signal([
        { id: 'urn:example:sm:other', url: 'https://repo.example.com/submodels/b3RoZXI' },
        { id: SUBMODEL_ID, url: SM_URL },
      ]),
    });

    component = TestBed.createComponent(OperationViewerComponent).componentInstance;
    component.submodelId = SUBMODEL_ID;
    component.idShortPath = 'Machine.Start';
  });

  it('invokes via the AAS endpoint by default', () => {
    expect(component.getExecuteUrl()).toBe(
      `${AAS_URL}/submodels/${ENCODED_SUBMODEL_ID}/submodel-elements/Machine.Start/invoke/$value`,
    );
  });

  it('invokes directly on the submodel endpoint in sm-repo mode', () => {
    component.executeType.set('sm-repo');

    expect(component.getExecuteUrl()).toBe(`${SM_URL}/submodel-elements/Machine.Start/invoke/$value`);
  });

  it('returns no URL when the AAS endpoint is unknown', () => {
    Object.assign(TestBed.inject(ViewerStoreService), { aasUrl: signal('') });

    expect(component.getExecuteUrl()).toBe('');
    expect(component.canExecute()).toBe(false);
  });

  it('does not send a request without an endpoint', async () => {
    Object.assign(TestBed.inject(ViewerStoreService), { aasUrl: signal('') });

    await component.execute();
    await component.executeAsync();

    TestBed.inject(HttpTestingController).verify();
  });
});
