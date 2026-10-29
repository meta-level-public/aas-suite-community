import { SubmodelElementCollection } from '@aas-core-works/aas-core3.1-typescript/types';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { ConceptDescriptionService } from '../concept-description.service';
import { SmcViewerComponent } from './smc-viewer.component';

describe('SmcViewerComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SmcViewerComponent, TranslateModule.forRoot()],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        { provide: ConceptDescriptionService, useValue: { loadCD: async () => null } },
      ],
    });
  });

  function render() {
    // A reload of the submodel creates new element objects, so the viewer is rendered anew
    const smc = new SubmodelElementCollection();
    smc.idShort = 'Markings';
    const fixture = TestBed.createComponent(SmcViewerComponent);
    fixture.componentRef.setInput('smc', smc);
    fixture.componentRef.setInput('idShortPath', 'Markings');
    fixture.componentRef.setInput('submodelId', 'urn:test:sm');
    fixture.detectChanges();
    return fixture;
  }

  function isOpen(fixture: ReturnType<typeof render>) {
    return fixture.debugElement.query(By.css('p-accordion-header')).nativeElement.getAttribute('aria-expanded');
  }

  it('keeps the collection expanded after it was rendered anew', () => {
    const first = render();
    expect(isOpen(first)).toBe('false');

    first.debugElement.query(By.css('p-accordion-header')).nativeElement.click();
    first.detectChanges();
    expect(isOpen(first)).toBe('true');
    first.destroy();

    const reloaded = render();
    expect(isOpen(reloaded)).toBe('true');
  });

  it('keeps the collection collapsed after the user closed it again', () => {
    const first = render();
    const header = first.debugElement.query(By.css('p-accordion-header')).nativeElement;
    header.click();
    first.detectChanges();
    header.click();
    first.detectChanges();
    expect(isOpen(first)).toBe('false');
    first.destroy();

    expect(isOpen(render())).toBe('false');
  });
});
