import { ViewerDescriptor } from '@aas/webapi-client';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from 'primeng/accordion';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ViewerStoreService } from '../viewer-store.service';
import { ExpandedStateDirective } from './expanded-state.directive';

@Component({
  imports: [Accordion, AccordionPanel, AccordionHeader, AccordionContent, ExpandedStateDirective],
  template: `
    <p-accordion [multiple]="true" [value]="initiallyOpen()" aasExpandedState="documents">
      <p-accordion-panel [value]="0"><p-accordion-header>A</p-accordion-header></p-accordion-panel>
      <p-accordion-panel [value]="1"><p-accordion-header>B</p-accordion-header></p-accordion-panel>
    </p-accordion>
  `,
})
class DocumentsComponent {
  initiallyOpen = signal([0]);
}

describe('ExpandedStateDirective', () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideNoopAnimations()],
    });
    const store = TestBed.inject(ViewerStoreService);
    store.viewerDescriptor.set({ aasId: 'urn:test:aas', submodelEndpoints: [] } as unknown as ViewerDescriptor);
    store.currentSubmodelId.set('urn:test:documentation');
  });

  afterEach(() => sessionStorage.clear());

  function render() {
    const fixture = TestBed.createComponent(DocumentsComponent);
    fixture.detectChanges();
    return fixture;
  }

  function openPanels(fixture: ReturnType<typeof render>) {
    return fixture.debugElement
      .queryAll(By.css('p-accordion-header'))
      .map((header) => header.nativeElement.getAttribute('aria-expanded'));
  }

  function toggle(fixture: ReturnType<typeof render>, index: number) {
    fixture.debugElement.queryAll(By.css('p-accordion-header'))[index].nativeElement.click();
    fixture.detectChanges();
  }

  it('uses the accordion binding until the user toggles a panel', () => {
    expect(openPanels(render())).toEqual(['true', 'false']);
  });

  it('keeps the panels the user toggled when the accordion is rendered anew', () => {
    const first = render();
    toggle(first, 0);
    toggle(first, 1);
    first.destroy();

    expect(openPanels(render())).toEqual(['false', 'true']);
  });

  it('keeps the panels after reloading the page in the same browser session', () => {
    const first = render();
    toggle(first, 1);
    first.destroy();

    // A reloaded page starts with a new store
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideNoopAnimations()],
    });
    const store = TestBed.inject(ViewerStoreService);
    store.viewerDescriptor.set({ aasId: 'urn:test:aas', submodelEndpoints: [] } as unknown as ViewerDescriptor);
    store.currentSubmodelId.set('urn:test:documentation');

    expect(openPanels(render())).toEqual(['true', 'true']);
  });

  it('does not apply the panels of another AAS', () => {
    const first = render();
    toggle(first, 1);
    first.destroy();

    TestBed.inject(ViewerStoreService).viewerDescriptor.set({
      aasId: 'urn:test:other-aas',
      submodelEndpoints: [],
    } as unknown as ViewerDescriptor);

    expect(openPanels(render())).toEqual(['true', 'false']);
  });
});
