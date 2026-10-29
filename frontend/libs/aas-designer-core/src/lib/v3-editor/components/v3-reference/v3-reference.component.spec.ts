import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { ShellSelectResult } from '@aas/common-components';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { V3TreeService } from '../../v3-tree/v3-tree.service';
import { V3ReferenceComponent } from './v3-reference.component';

function selectedShell() {
  const result = new ShellSelectResult();
  result.aasIdentifier = 'urn:test:aas:schaukel';
  result.globalAssetId = 'urn:test:asset:schaukel';
  return result;
}

describe('V3ReferenceComponent', () => {
  let component: V3ReferenceComponent;
  let fixture: ComponentFixture<V3ReferenceComponent>;
  let dialogService: { open: ReturnType<typeof vi.fn> };
  let treeService: { registerFieldUndoStep: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    dialogService = { open: vi.fn(() => ({ onClose: of(selectedShell()) })) };
    treeService = { registerFieldUndoStep: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, TranslateModule.forRoot(), V3ReferenceComponent],
      providers: [
        MessageService,
        { provide: OAuthService, useValue: { hasValidAccessToken: () => false } },
        { provide: DialogService, useValue: dialogService },
        { provide: V3TreeService, useValue: treeService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(V3ReferenceComponent);
    component = fixture.componentInstance;
  });

  it('points a model reference to the AAS selected from the system', async () => {
    component.reference = new aas.types.Reference(aas.types.ReferenceTypes.ModelReference, [
      new aas.types.Key(aas.types.KeyTypes.Submodel, 'urn:test:submodel'),
      new aas.types.Key(aas.types.KeyTypes.Property, 'Old'),
    ]);

    await component.selectShellForModelReference();

    expect(component.reference.keys.map((key) => [key.type, key.value])).toEqual([
      [aas.types.KeyTypes.AssetAdministrationShell, 'urn:test:aas:schaukel'],
    ]);
    expect(treeService.registerFieldUndoStep).toHaveBeenCalledTimes(1);
  });

  it('uses the id of the selected AAS as value of a global reference key', async () => {
    const key = new aas.types.Key(aas.types.KeyTypes.GlobalReference, '');
    component.reference = new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [key]);

    await component.selectShellForKey(key);

    expect(key.value).toBe('urn:test:aas:schaukel');
    expect(key.type).toBe(aas.types.KeyTypes.GlobalReference);
  });

  it('keeps the reference unchanged when the dialog is closed without selection', async () => {
    dialogService.open.mockReturnValue({ onClose: of(undefined) });
    const key = new aas.types.Key(aas.types.KeyTypes.GlobalReference, 'unchanged');
    component.reference = new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [key]);

    await component.selectShellForKey(key);

    expect(key.value).toBe('unchanged');
    expect(treeService.registerFieldUndoStep).not.toHaveBeenCalled();
  });
});
