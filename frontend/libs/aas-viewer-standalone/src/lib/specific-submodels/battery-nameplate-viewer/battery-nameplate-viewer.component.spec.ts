import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ViewerStoreService } from '../../viewer-store.service';
import { BatteryNameplateViewerComponent } from './battery-nameplate-viewer.component';

function semanticRef(value: string) {
  return new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
    new aas.types.Key(aas.types.KeyTypes.GlobalReference, value),
  ]);
}

describe('BatteryNameplateViewerComponent', () => {
  let component: BatteryNameplateViewerComponent;
  let fixture: ComponentFixture<BatteryNameplateViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), BatteryNameplateViewerComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ViewerStoreService,
          useValue: {
            aas: () => ({ assetInformation: { assetKind: aas.types.AssetKind.Instance } }),
            cdUrl: () => '',
            apiKey: () => '',
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BatteryNameplateViewerComponent);
    component = fixture.componentInstance;

    const nameplate = new aas.types.Submodel('urn:test:battery-nameplate', null, null, 'BatteryNameplate');
    nameplate.semanticId = semanticRef('https://admin-shell.io/idta/digitalbatterypassport/nameplate/1/0/Nameplate');

    const manufacturer = new aas.types.MultiLanguageProperty(null, null, 'ManufacturerName');
    manufacturer.semanticId = semanticRef('0112/2///61987#ABA565#009');
    manufacturer.value = [new aas.types.LangStringTextType('en', 'Meta-Level Software AG')];

    const serialNumber = new aas.types.Property(aas.types.DataTypeDefXsd.String, null, null, 'SerialNumber');
    serialNumber.semanticId = semanticRef('0112/2///61987#ABA951#009');
    serialNumber.value = '001-2026';

    const dateOfManufacture = new aas.types.Property(aas.types.DataTypeDefXsd.Date, null, null, 'DateOfManufacture');
    dateOfManufacture.semanticId = semanticRef('0112/2///61987#ABB757#007');
    dateOfManufacture.value = '2026-03-21';

    const dateOfPuttingIntoService = new aas.types.Property(
      aas.types.DataTypeDefXsd.Date,
      null,
      null,
      'DateOfPuttingIntoService',
    );
    dateOfPuttingIntoService.semanticId = semanticRef(
      'urn:samm:io.admin-shell.idta.batterypass.digital_nameplate:1.0.0#dateOfPuttingIntoService',
    );
    dateOfPuttingIntoService.value = '2026-03-24';

    nameplate.submodelElements = [manufacturer, serialNumber, dateOfManufacture, dateOfPuttingIntoService];
    component.nameplate = nameplate;

    fixture.detectChanges();
  });

  it('creates and resolves basic battery nameplate fields', () => {
    expect(component).toBeTruthy();
    expect(component.manufacturerName()).toBe('Meta-Level Software AG');
    expect(component.serialNumber()).toBe('001-2026');
    expect(component.dateOfManufacture()?.toISOString().startsWith('2026-03-21')).toBe(true);
    expect(component.dateOfPuttingIntoService()?.toISOString().startsWith('2026-03-24')).toBe(true);
  });

  it('shows the manufacturer in the hero and not again in the identification card', () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.viewer-hero-eyebrow')?.textContent).toContain('Meta-Level Software AG');
    expect(element.querySelector('.viewer-hero-title')?.textContent).toContain('BATTERY_NAMEPLATE');
    const identificationValues = Array.from(element.querySelectorAll('.viewer-card input')).map(
      (input) => (input as HTMLInputElement).value,
    );
    expect(identificationValues).toContain('001-2026');
    expect(identificationValues).not.toContain('Meta-Level Software AG');
  });

  it('exposes semantic ID and inline unit of single-value fields', () => {
    const serialNumber = component.fieldElements().serialNumber;
    expect(component.semanticIdOf(serialNumber)).toBe('0112/2///61987#ABA951#009');
    expect(component.unitOf(serialNumber)).toBe('');

    const withUnit = new aas.types.Property(aas.types.DataTypeDefXsd.Double, null, null, 'Weight');
    withUnit.embeddedDataSpecifications = [
      new aas.types.EmbeddedDataSpecification(
        semanticRef('https://admin-shell.io/DataSpecificationTemplates/DataSpecificationIEC61360/3/0'),
        new aas.types.DataSpecificationIec61360(
          [new aas.types.LangStringPreferredNameTypeIec61360('en', 'Weight')],
          null,
          'kg',
        ),
      ),
    ];
    expect(component.unitOf(withUnit)).toBe('kg');
  });
});
