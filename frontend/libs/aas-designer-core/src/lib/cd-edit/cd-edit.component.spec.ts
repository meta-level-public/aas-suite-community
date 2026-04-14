import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { CdEditComponent } from './cd-edit.component';
import { vi } from 'vitest';

describe('CdEditComponent', () => {
  let component: CdEditComponent;
  let fixture: ComponentFixture<CdEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, TranslateModule.forRoot(), CdEditComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { paramMap: of(new Map()) } },
        { provide: MessageService, useValue: { add: vi.fn() } },
        {
          provide: OAuthService,
          useValue: { hasValidAccessToken: () => false, getAccessToken: () => '', getRefreshToken: () => '' },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CdEditComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
