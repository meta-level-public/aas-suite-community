import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { ViewerStoreService } from '../../viewer-store.service';
import { CircularityViewerComponent } from './circularity-viewer.component';
import { createCircularityExampleSubmodel } from './circularity-viewer.fixture';

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
      },
      {
        recycledMaterial: 'Aluminium',
        preConsumerShare: '9.0',
        postConsumerShare: '47.5',
      },
    ]);
    expect(component.renewableContent()).toBe('42.0');
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
    expect(component.sparePartSuppliers()[0]?.components[0]).toEqual({
      partName: 'Battery module housing',
      partNumber: 'PN-4711',
    });
    expect(component.sparePartSuppliers()[0]?.components[1]).toEqual({
      partName: 'Pressure relief vent assembly',
      partNumber: 'PN-8150',
    });
  });
});
