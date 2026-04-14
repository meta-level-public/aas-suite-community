import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { HandoverdocumentationDocumentAddonComponent } from './handoverdocumentation-document-addon.component';
import { vi } from 'vitest';

describe('HandoverdocumentationDocumentAddonComponent', () => {
  let component: HandoverdocumentationDocumentAddonComponent;
  let fixture: ComponentFixture<HandoverdocumentationDocumentAddonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, TranslateModule.forRoot(), HandoverdocumentationDocumentAddonComponent],
      providers: [
        { provide: OAuthService, useValue: { hasValidAccessToken: () => false } },
        { provide: DialogService, useValue: { open: vi.fn(), getInstance: vi.fn(() => ({ data: {} })) } },
        { provide: DynamicDialogRef, useValue: { close: vi.fn() } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(HandoverdocumentationDocumentAddonComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
