import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { PcnStateStoreService } from './pcn-state-store.service';

describe('PcnStateStoreService', () => {
  let service: PcnStateStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, TranslateModule.forRoot()],
      providers: [PcnStateStoreService],
    });
    service = TestBed.inject(PcnStateStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
