import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from '@openng/optimus-ui/api';
import { ViewerStoreService } from '../../viewer-store.service';
import { CircularityViewerComponent } from './circularity-viewer.component';
import { createCircularityExampleSubmodel } from './circularity-viewer.fixture';

const CIRCULARITY = 'urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#';

function field(name: string) {
  return { semanticId: `${CIRCULARITY}${name}`, unit: '' };
}

const recycledContentFields = {
  recycledMaterial: field('recycledMaterial'),
  preConsumerShare: field('preConsumerShare'),
  postConsumerShare: field('postConsumerShare'),
};

const componentFields = { partName: field('partName'), partNumber: field('partNumber') };

describe('CircularityViewerComponent', () => {
  let component: CircularityViewerComponent;
  let fixture: ComponentFixture<CircularityViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), CircularityViewerComponent],
      providers: [
        MessageService,
        {
          provide: ViewerStoreService,
          useValue: {
            highlightedIdShortPath: signal(''),
            highlightedTextQuery: signal(''),
            currentlyloadedFiles: signal([]),
            currentSubmodelId: () => 'urn:test:circularity',
            currentSmUrl: async () => '',
            cdUrl: () => '',
            apiKey: () => '',
            headers: () => ({}),
            addFileToCurrentlyLoadedFiles: () => undefined,
            isElementExpanded: (_submodelId: string, _idShortPath: string, fallback = false) => fallback,
            setElementExpanded: () => undefined,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CircularityViewerComponent);
    component = fixture.componentInstance;
    const submodel = createCircularityExampleSubmodel();

    fixture.componentRef.setInput('submodel', submodel);
    fixture.detectChanges();
  });

  it('creates and extracts core circularity sections', () => {
    expect(component).toBeTruthy();
    expect(component.hasContent()).toBe(true);
    expect(component.dismantlingDocuments().map((item) => item.label)).toEqual([
      'DOC-DISM-001',
      'DismantlingManual',
      'RemovalChecklist',
    ]);
    expect(component.dismantlingDocuments()[1]?.element instanceof aas.types.File).toBe(true);
    expect(component.dismantlingDocuments()[1]?.idShortPath).toBe('DismantlingAndRemovalInformation.DismantlingManual');
    expect(component.dismantlingDocuments()[2]?.element instanceof aas.types.Blob).toBe(true);
    expect(component.dismantlingDocuments()[2]?.idShortPath).toBe('DismantlingAndRemovalInformation.RemovalChecklist');
    expect(component.recycledContentEntries()).toEqual([
      {
        recycledMaterial: 'Nickel',
        preConsumerShare: '14.5',
        postConsumerShare: '31.2',
        fields: recycledContentFields,
      },
      {
        recycledMaterial: 'Aluminium',
        preConsumerShare: '9.0',
        postConsumerShare: '47.5',
        fields: recycledContentFields,
      },
    ]);
    expect(component.renewableContent()).toBe('42.0');
    expect(component.renewableContentField()).toEqual(field('renewableContent'));
    expect(component.endOfLifeSections()[0]?.items.map((item) => item.label)).toEqual([
      'EOL-WASTE-001',
      'RepairStrategy',
    ]);
    expect(component.endOfLifeSections()[2]?.items.map((item) => item.label)).toEqual(['CollectionInstructionSheet']);
    expect(component.endOfLifeSections()[2]?.items[0]?.element instanceof aas.types.Blob).toBe(true);
    expect(component.safetyInstructionDocuments().map((item) => item.label)).toEqual([
      'SAFE-001',
      'ThermalRunawayProtocol',
    ]);
    expect(component.extinguishingAgents()).toEqual(['Class D powder', 'Vermiculite']);
    expect(component.sparePartSuppliers()[0]?.name).toBe('Acme Spares');
    expect(component.sparePartSuppliers()[0]?.fields.email.semanticId).toBe(
      'urn:samm:io.admin-shell.idta.contact_information:1.0.0#emailAddress',
    );
    expect(component.sparePartSuppliers()[0]?.components[0]).toEqual({
      partName: 'Battery module housing',
      partNumber: 'PN-4711',
      fields: componentFields,
    });
    expect(component.sparePartSuppliers()[0]?.components[1]).toEqual({
      partName: 'Pressure relief vent assembly',
      partNumber: 'PN-8150',
      fields: componentFields,
    });
  });

  it('shows the unit stored at the element as its own addon', () => {
    expect(component.fieldUnit({ semanticId: `${CIRCULARITY}renewableContent`, unit: '%' })).toBe('%');
    expect(component.fieldUnit(field('renewableContent'))).toBe('');
  });

  it('shows the renewable content share as key figure in the hero, not again in a card', () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.viewer-hero-success .viewer-hero-value')?.textContent?.trim()).toBe('42.0');
    expect(element.querySelector('.viewer-hero-eyebrow')?.textContent).toContain('CIRCULARITY_RENEWABLE_CONTENT');
    const cardTitles = Array.from(element.querySelectorAll('.viewer-card-title')).map((title) => title.textContent);
    expect(cardTitles.some((title) => title?.includes('CIRCULARITY_RENEWABLE_CONTENT'))).toBe(false);
  });

  it('shows a title hero without a renewable content share', () => {
    const submodel = createCircularityExampleSubmodel();
    submodel.submodelElements = (submodel.submodelElements ?? []).filter(
      (element) => element.idShort !== 'RenewableContent',
    );
    fixture.componentRef.setInput('submodel', submodel);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.viewer-hero-value')).toBeNull();
    expect(element.querySelector('.viewer-hero-title')?.textContent).toContain('CIRCULARITY_OVERVIEW');
  });
});
