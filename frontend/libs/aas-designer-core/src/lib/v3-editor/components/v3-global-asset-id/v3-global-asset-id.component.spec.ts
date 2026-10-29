import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { ShellSelectResult } from '@aas/common-components';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { DialogService } from 'primeng/dynamicdialog';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { V3TreeService } from '../../v3-tree/v3-tree.service';
import { V3GlobalAssetIdComponent } from './v3-global-asset-id.component';

describe('V3GlobalAssetIdComponent', () => {
  let component: V3GlobalAssetIdComponent;
  let fixture: ComponentFixture<V3GlobalAssetIdComponent>;
  let treeService: { registerFieldUndoStep: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    const result = new ShellSelectResult();
    result.aasIdentifier = 'urn:test:aas:schaukel';
    result.globalAssetId = 'urn:test:asset:schaukel';
    treeService = { registerFieldUndoStep: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, TranslateModule.forRoot(), V3GlobalAssetIdComponent],
      providers: [
        { provide: OAuthService, useValue: { hasValidAccessToken: () => false } },
        { provide: DialogService, useValue: { open: vi.fn(() => ({ onClose: of(result) })) } },
        { provide: V3TreeService, useValue: treeService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(V3GlobalAssetIdComponent);
    component = fixture.componentInstance;
  });

  it('takes over the global asset id of the AAS selected from the system', async () => {
    const entity = new aas.types.Entity(null, null, 'Schaukel');
    entity.entityType = aas.types.EntityType.SelfManagedEntity;
    component.content = entity;

    await component.selectShell();

    expect(entity.globalAssetId).toBe('urn:test:asset:schaukel');
    expect(treeService.registerFieldUndoStep).toHaveBeenCalledTimes(1);
  });

  it('shows the AAS selection only when enabled', () => {
    component.content = new aas.types.Entity();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('p-button').length).toBe(1);

    fixture.componentRef.setInput('shellSelectable', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('p-button').length).toBe(2);
  });
});
