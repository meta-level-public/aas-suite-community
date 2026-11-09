import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from '@openng/optimus-ui/api';
import { DialogService } from '@openng/optimus-ui/dynamicdialog';
import { vi } from 'vitest';

import { V3TreeService } from '../../v3-tree/v3-tree.service';
import { V3SemanticDescriptionComponent } from './v3-semantic-description.component';

describe('V3SemanticDescriptionComponent', () => {
  let fixture: ComponentFixture<V3SemanticDescriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), V3SemanticDescriptionComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MessageService, useValue: { add: vi.fn() } },
        { provide: DialogService, useValue: { open: vi.fn() } },
        { provide: V3TreeService, useValue: { registerFieldUndoStep: vi.fn() } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(V3SemanticDescriptionComponent);
  });

  function render(conceptDescriptions: aas.types.ConceptDescription[]) {
    const semanticId = new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
      new aas.types.Key(aas.types.KeyTypes.GlobalReference, 'urn:test:semantic:swing'),
    ]);
    const element = new aas.types.Entity(null, null, 'Swing');
    element.semanticId = semanticId;

    fixture.componentRef.setInput('semanticId', semanticId);
    fixture.componentRef.setInput('supplemantalSemanticIds', null);
    fixture.componentRef.setInput('referenceParent', element);
    fixture.componentRef.setInput('referenceParentPropertyName', 'semanticId');
    fixture.componentRef.setInput('shellResult', {
      v3Shell: new aas.types.Environment([], [], conceptDescriptions),
    });
    fixture.detectChanges();
  }

  it('renders a semantic ID that has no concept description in the repository', () => {
    // Regression: the definition binding threw on a missing concept description and stopped change detection
    // for the whole section, which then stayed empty.
    expect(() => render([])).not.toThrow();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('SEMANTIC_ID');
    expect(text).toContain('ADD_ADDITIONAL');
  });

  it('shows the definition of the matching concept description', () => {
    const conceptDescription = new aas.types.ConceptDescription('urn:test:semantic:swing');
    const content = new aas.types.DataSpecificationIec61360([
      new aas.types.LangStringPreferredNameTypeIec61360('en', 'Swing'),
    ]);
    content.definition = [new aas.types.LangStringDefinitionTypeIec61360('en', 'A seat hanging from ropes')];
    conceptDescription.embeddedDataSpecifications = [
      new aas.types.EmbeddedDataSpecification(
        new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
          new aas.types.Key(
            aas.types.KeyTypes.GlobalReference,
            'https://admin-shell.io/DataSpecificationTemplates/DataSpecificationIec61360/3',
          ),
        ]),
        content,
      ),
    ];

    expect(() => render([conceptDescription])).not.toThrow();
    expect(fixture.componentInstance.cd()).toBe(conceptDescription);
  });
});
