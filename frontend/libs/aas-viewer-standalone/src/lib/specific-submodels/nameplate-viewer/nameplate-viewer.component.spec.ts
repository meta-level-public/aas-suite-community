import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from '@openng/optimus-ui/api';
import { AasViewerService } from '../../aas-viewer.service';
import { ViewerStoreService } from '../../viewer-store.service';
import { NameplateViewerComponent } from './nameplate-viewer.component';

function semanticRef(value: string) {
  return new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
    new aas.types.Key(aas.types.KeyTypes.GlobalReference, value),
  ]);
}

function text(idShort: string, semanticId: string, value: string) {
  const element = new aas.types.MultiLanguageProperty(null, null, idShort);
  element.semanticId = semanticRef(semanticId);
  element.value = [new aas.types.LangStringTextType('de', value)];
  return element;
}

describe('NameplateViewerComponent', () => {
  let fixture: ComponentFixture<NameplateViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), NameplateViewerComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        MessageService,
        { provide: AasViewerService, useValue: {} },
        {
          provide: ViewerStoreService,
          useValue: {
            aas: () => ({ assetInformation: { assetKind: aas.types.AssetKind.Type } }),
            currentSubmodelId: () => 'urn:test:nameplate',
            currentlyloadedFiles: signal([]),
            cdUrl: () => '',
            apiKey: () => '',
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NameplateViewerComponent);
  });

  function render(elements: aas.types.ISubmodelElement[]) {
    const nameplate = new aas.types.Submodel('urn:test:nameplate', null, null, 'Nameplate');
    nameplate.submodelElements = elements;
    fixture.componentRef.setInput('nameplate', nameplate);
    fixture.componentRef.setInput('currentLanguage', 'de');
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('shows manufacturer, product designation, family and root in the hero', () => {
    const element = render([
      text('ManufacturerName', '0112/2///61987#ABA565#009', 'Meta-Level Software AG'),
      text('ManufacturerProductDesignation', '0112/2///61987#ABA567#009', 'Smart Sensor S1'),
      text('ManufacturerProductFamily', '0112/2///61987#ABP464#002', 'Sensors'),
      text('ManufacturerProductRoot', '0112/2///61360_7#AAS011#001', 'Components'),
    ]);

    expect(element.querySelector('.viewer-hero-eyebrow')?.textContent).toContain('Meta-Level Software AG');
    expect(element.querySelector('.viewer-hero-title')?.textContent).toContain('Smart Sensor S1');
    const tags = Array.from(element.querySelectorAll('.viewer-hero p-tag')).map((tag) => tag.textContent?.trim());
    expect(tags).toEqual(['Sensors', 'Components']);
    // The product root is only shown in the hero, without a missing logo placeholder
    expect(element.textContent).not.toContain('PRODUCT_ROOT');
    expect(element.querySelector('.viewer-hero-logo')).toBeNull();
  });

  it('falls back to the nameplate title without a product designation', () => {
    const element = render([]);

    expect(element.querySelector('.viewer-hero-title')?.textContent?.trim()).toBe('NAMEPLATE');
    expect(element.querySelector('.viewer-hero-eyebrow')).toBeNull();
    expect(element.querySelector('.viewer-hero .viewer-tags')).toBeNull();
  });
});
