import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from '@openng/optimus-ui/api';
import { beforeEach, describe, expect, it } from 'vitest';
import { MultilanguagePropertyViewerComponent } from '../multilanguage-property-viewer/multilanguage-property-viewer.component';
import { ViewerStoreService } from '../viewer-store.service';
import { PropertyViewerComponent } from './property-viewer.component';

const MALICIOUS_VALUE = 'Serial <img src="x" onerror="window.__xss = true"> abc';

function highlightedElement(fixture: ComponentFixture<unknown>): HTMLElement {
  const element = (fixture.nativeElement as HTMLElement).querySelector('mark')?.parentElement;
  expect(element).not.toBeNull();
  return element as HTMLElement;
}

describe('search highlighting in property viewers', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PropertyViewerComponent, MultilanguagePropertyViewerComponent, TranslateModule.forRoot()],
      providers: [provideHttpClient(), provideHttpClientTesting(), MessageService],
    });
    TestBed.inject(ViewerStoreService).highlightedTextQuery.set('abc');
  });

  it('highlights matches of a property value without rendering markup from the value', () => {
    const property = new aas.types.Property(aas.types.DataTypeDefXsd.String, null, null, 'SerialNumber');
    property.value = MALICIOUS_VALUE;

    const fixture = TestBed.createComponent(PropertyViewerComponent);
    fixture.componentRef.setInput('property', property);
    fixture.detectChanges();

    const element = highlightedElement(fixture);
    expect(element.querySelector('img')).toBeNull();
    expect(element.querySelector('mark')?.textContent).toBe('abc');
    expect(element.textContent).toBe(MALICIOUS_VALUE);
  });

  it('highlights matches of a multi-language value without rendering markup from the value', () => {
    const property = new aas.types.MultiLanguageProperty(null, null, 'Description');
    property.value = [new aas.types.LangStringTextType('en', MALICIOUS_VALUE)];

    const fixture = TestBed.createComponent(MultilanguagePropertyViewerComponent);
    fixture.componentRef.setInput('properties', property);
    fixture.detectChanges();

    const element = highlightedElement(fixture);
    expect(element.querySelector('img')).toBeNull();
    expect(element.querySelector('mark')?.textContent).toBe('abc');
    expect(element.textContent).toBe(MALICIOUS_VALUE);
  });
});
