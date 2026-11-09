import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from '@openng/optimus-ui/api';
import { vi } from 'vitest';
import { SoftwareNameplateViewerComponent } from './software-nameplate-viewer.component';

function property(idShort: string, value: string) {
  const element = new aas.types.Property(aas.types.DataTypeDefXsd.String, null, null, idShort);
  element.value = value;
  return element;
}

function multiLanguage(idShort: string, text: string) {
  const element = new aas.types.MultiLanguageProperty(null, null, idShort);
  element.value = [new aas.types.LangStringTextType('de', text)];
  return element;
}

function collection(idShort: string, value: aas.types.ISubmodelElement[]) {
  const element = new aas.types.SubmodelElementCollection(null, null, idShort);
  element.value = value;
  return element;
}

// Shaped like the SmartCar firmware (IDTA 02007-1-0), with an older installed version
function createSoftwareNameplate(installedVersion: string) {
  const submodel = new aas.types.Submodel('urn:test:software-nameplate', null, null, 'SoftwareNameplate');
  submodel.submodelElements = [
    collection('SoftwareNameplateType', [
      multiLanguage('ManufacturerName', 'Meta-Level Software AG'),
      multiLanguage('ManufacturerProductDesignation', 'SmartCar Firmware'),
      property('SoftwareType', 'Firmware'),
      property('Version', '4.5'),
      multiLanguage('VersionInfo', 'Betrieb mit ESP8266-Core 3.1.2'),
    ]),
    collection('SoftwareNameplateInstance', [
      property('InstanceName', 'SmartCar 01'),
      property('InstalledVersion', installedVersion),
      property('InstalledOnArchitecture', 'ESP8266'),
    ]),
  ];
  return submodel;
}

describe('SoftwareNameplateViewerComponent', () => {
  let fixture: ComponentFixture<SoftwareNameplateViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), SoftwareNameplateViewerComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MessageService, useValue: { add: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SoftwareNameplateViewerComponent);
  });

  function render(installedVersion: string) {
    fixture.componentRef.setInput('submodel', createSoftwareNameplate(installedVersion));
    fixture.componentRef.setInput('currentLanguage', 'de');
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('shows product, manufacturer and version in the header', () => {
    const element = render('4.5');

    expect(element.querySelector('.viewer-hero-title')?.textContent).toContain('SmartCar Firmware');
    expect(element.querySelector('.viewer-hero-eyebrow')?.textContent).toContain('Meta-Level Software AG');
    expect(element.querySelector('.software-version-value')?.textContent?.trim()).toBe('4.5');
    expect(element.querySelector('.viewer-hero-icon i')?.className).toContain('fa-microchip');
  });

  it('marks an installed instance that is older than the described version', () => {
    const element = render('4.4.2');

    expect(fixture.componentInstance.installedVersionStatus).toBe('update-available');
    expect(element.textContent).toContain('SOFTWARE_UPDATE_AVAILABLE');
  });

  it('hides sections without data', () => {
    const element = render('4.5');

    expect(element.textContent).toContain('SOFTWARE_VERSION_CURRENT');
    expect(element.textContent).not.toContain('INSTALLATION_PACKAGE');
    expect(element.textContent).not.toContain('INSTALLED_MODULES');
  });

  it('resolves the semantic ID and inline unit of a field for its concept description', () => {
    const submodel = createSoftwareNameplate('4.5');
    const instance = submodel.submodelElements?.[1] as aas.types.SubmodelElementCollection;
    const architecture = instance.value?.find((e) => e.idShort === 'InstalledOnArchitecture') as aas.types.Property;
    architecture.semanticId = new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
      new aas.types.Key(aas.types.KeyTypes.GlobalReference, 'urn:test:architecture'),
    ]);
    architecture.embeddedDataSpecifications = [
      new aas.types.EmbeddedDataSpecification(
        new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
          new aas.types.Key(aas.types.KeyTypes.GlobalReference, 'urn:test:iec61360'),
        ]),
        new aas.types.DataSpecificationIec61360(
          [new aas.types.LangStringPreferredNameTypeIec61360('en', 'Architecture')],
          null,
          'bit',
        ),
      ),
    ];
    fixture.componentRef.setInput('submodel', submodel);
    fixture.componentRef.setInput('currentLanguage', 'de');
    fixture.detectChanges();

    expect(fixture.componentInstance.fieldSemanticId('InstalledOnArchitecture')).toBe('urn:test:architecture');
    expect(fixture.componentInstance.fieldUnit('InstalledOnArchitecture')).toBe('bit');
    expect(fixture.componentInstance.fieldSemanticId('SerialNumber')).toBe('');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('bit');
  });
});
