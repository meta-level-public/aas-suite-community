import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { describe, expect, it } from 'vitest';
import { ViewerStoreService } from '../../viewer-store.service';
import { ProductConditionViewerComponent } from './product-condition-viewer.component';
import { createProductConditionExampleSubmodel } from './product-condition-viewer.fixture';

describe('ProductConditionViewerComponent', () => {
  let component: ProductConditionViewerComponent;
  let fixture: ComponentFixture<ProductConditionViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), ProductConditionViewerComponent],
      providers: [
        {
          provide: ViewerStoreService,
          useValue: {
            highlightedIdShortPath: signal(''),
            highlightedTextQuery: signal(''),
            currentlyloadedFiles: signal([]),
            currentSubmodelId: () => 'urn:test:product-condition',
            currentSmUrl: async () => '',
            cdUrl: () => '',
            apiKey: () => '',
            headers: () => ({}),
            addFileToCurrentlyLoadedFiles: () => undefined,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductConditionViewerComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('submodel', createProductConditionExampleSubmodel());
    fixture.detectChanges();
  });

  it('creates and groups the product condition metrics into specialized sections', () => {
    expect(component).toBeTruthy();
    expect(component.hasContent()).toBe(true);

    expect(component.healthMetrics().map((metric) => metric.label)).toEqual([
      'remaining capacity',
      'remaining energy',
      'remaining round trip energy efficiency',
      'state of certified energy',
      'state of charge',
      'number of full cycles',
    ]);
    expect(component.healthMetrics()[0]?.value).toBe('84.7');
    expect(component.throughputMetrics().map((metric) => metric.value)).toEqual(['1285.5', '2150.8']);
    expect(component.selfDischargeMetrics().map((metric) => metric.value)).toEqual(['1.8', '4.2']);
    expect(component.powerCapabilityEntries()).toEqual([
      {
        label: 'remaining power capability dynamic at',
        atSoC: '80',
        powerCapabilityAt: '125000',
        rpcLastUpdated: '2026-03-18T10:30:00Z',
        idShortPath: 'RemainingPowerCapability.RemainingPowerCapabilityDynamicAt',
      },
    ]);
    expect(component.powerCapabilityLastUpdate()).toBe('2026-03-18T10:31:00Z');
    expect(component.temperatureMetrics().map((metric) => metric.label)).toEqual([
      'time extreme high temp',
      'time extreme low temp',
      'time extreme high temp charging',
      'time extreme low temp charging',
    ]);
    expect(component.temperatureLastUpdate()).toBe('2026-03-18T10:35:00Z');
    expect(component.accidentDocumentIdentifiers()).toEqual(['ACC-2026-001', 'ACC-2026-002']);
    expect(component.negativeEvents()).toEqual([
      {
        value: 'Thermal shutdown during fast charge',
        lastUpdate: '2026-03-18T11:00:00Z',
        idShortPath: 'NegativeEvents.NegativeEvent',
      },
    ]);
    expect(component.additionalDetails().map((detail) => detail.idShort)).toEqual(['ServiceNote']);
  });
});
