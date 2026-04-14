import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { PcnSendingComponent } from './pcn-sending.component';
import { vi } from 'vitest';

describe('PcnSendingComponent', () => {
  let component: PcnSendingComponent;
  let fixture: ComponentFixture<PcnSendingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, TranslateModule.forRoot(), PcnSendingComponent],
      providers: [{ provide: MessageService, useValue: { add: vi.fn() } }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PcnSendingComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
