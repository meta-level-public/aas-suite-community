import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from '@openng/optimus-ui/api';
import { vi } from 'vitest';

import { V3TreeService } from '../../v3-tree/v3-tree.service';
import { V3IdShortComponent } from './v3-id-short.component';

describe('V3IdShortComponent', () => {
  let component: V3IdShortComponent;
  let fixture: ComponentFixture<V3IdShortComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), V3IdShortComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MessageService, useValue: { add: vi.fn() } },
        { provide: V3TreeService, useValue: { updateLabel: vi.fn() } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(V3IdShortComponent);
    component = fixture.componentInstance;
  });

  function createSubmodel(idShort: string, childIdShort: string) {
    const child = new aas.types.Property(aas.types.DataTypeDefXsd.String);
    child.idShort = childIdShort;
    const submodel = new aas.types.Submodel('urn:test:submodel');
    submodel.idShort = idShort;
    submodel.submodelElements = [child];
    return submodel;
  }

  it('reports an invalid idShort of the element itself', () => {
    const errors = component.getError(createSubmodel('1-invalid', 'Valid'));

    expect(errors.length).toBeGreaterThan(0);
    expect(errors.every((error) => error.path.toString().startsWith('.idShort'))).toBe(true);
  });

  it('ignores invalid idShorts of child elements', () => {
    expect(component.getError(createSubmodel('Valid', '1-invalid'))).toEqual([]);
  });

  it('shows the first idShort error below the input', () => {
    component.element = { id: 'node-1', content: createSubmodel('1-invalid', 'Valid') } as never;
    component.shellResult = null;
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.text-error')).not.toBeNull();
  });
});
