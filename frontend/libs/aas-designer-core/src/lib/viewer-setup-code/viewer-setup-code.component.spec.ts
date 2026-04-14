import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { ViewerSetupCodeComponent } from './viewer-setup-code.component';
import { vi } from 'vitest';

describe('ViewerSetupCodeComponent', () => {
  let component: ViewerSetupCodeComponent;
  let fixture: ComponentFixture<ViewerSetupCodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, TranslateModule.forRoot(), ViewerSetupCodeComponent],
      providers: [{ provide: MessageService, useValue: { add: vi.fn() } }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewerSetupCodeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
