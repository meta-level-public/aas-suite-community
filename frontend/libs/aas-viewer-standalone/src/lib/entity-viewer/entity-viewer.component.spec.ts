import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EntityViewerComponent } from './entity-viewer.component';

function inputValues(fixture: ComponentFixture<EntityViewerComponent>) {
  return Array.from(fixture.nativeElement.querySelectorAll('input') as NodeListOf<HTMLInputElement>).map(
    (input) => input.value,
  );
}

function selfManagedEntity(withStatements = false) {
  const aasReference = new aas.types.ReferenceElement(null, null, 'AAS');
  aasReference.value = new aas.types.Reference(aas.types.ReferenceTypes.ModelReference, [
    new aas.types.Key(aas.types.KeyTypes.AssetAdministrationShell, 'urn:test:aas:schaukel'),
  ]);

  const entity = new aas.types.Entity(null, null, 'Schaukel');
  entity.entityType = aas.types.EntityType.SelfManagedEntity;
  entity.globalAssetId = 'urn:test:asset:schaukel';
  entity.statements = withStatements ? [aasReference] : null;
  return entity;
}

describe('EntityViewerComponent', () => {
  let fixture: ComponentFixture<EntityViewerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EntityViewerComponent, TranslateModule.forRoot()],
      providers: [provideHttpClient(), provideHttpClientTesting(), MessageService],
    });
    fixture = TestBed.createComponent(EntityViewerComponent);
  });

  it('shows the entity type by name and the global asset id', () => {
    fixture.componentRef.setInput('entity', selfManagedEntity());
    fixture.detectChanges();

    const values = inputValues(fixture);
    expect(values).toContain('SelfManagedEntity');
    expect(values).toContain('urn:test:asset:schaukel');
  });

  it('shows specific asset ids with their name', () => {
    const entity = selfManagedEntity();
    entity.globalAssetId = null;
    entity.specificAssetIds = [new aas.types.SpecificAssetId('serialNumber', '4711')];
    fixture.componentRef.setInput('entity', entity);
    fixture.detectChanges();

    expect(inputValues(fixture)).toContain('4711');
    expect(fixture.nativeElement.textContent).toContain('serialNumber');
  });

  it('renders reference elements contained in the statements', async () => {
    fixture.componentRef.setInput('entity', selfManagedEntity(true));
    fixture.detectChanges();

    // statements are rendered by the lazily imported generic viewer
    await vi.waitFor(() => {
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('aas-reference-element-v3')).not.toBeNull();
    });
    expect(inputValues(fixture)).toContain('urn:test:aas:schaukel');
  });
});
