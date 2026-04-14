import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ConceptDescriptionService } from '../../concept-description.service';
import { ViewerStoreService } from '../../viewer-store.service';
import { MaterialCompositionViewerComponent } from './material-composition-viewer.component';

function semanticRef(value: string) {
  return new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
    new aas.types.Key(aas.types.KeyTypes.GlobalReference, value),
  ]);
}

function property(idShort: string, semanticId: string, value: string, valueType = aas.types.DataTypeDefXsd.String) {
  const element = new aas.types.Property(valueType, null, null, idShort);
  element.semanticId = semanticRef(semanticId);
  element.value = value;
  return element;
}

function conceptDescription(id: string, unit: string, symbol = '') {
  const cd = new aas.types.ConceptDescription(id);
  cd.embeddedDataSpecifications = [
    {
      dataSpecificationContent: {
        unit,
        symbol,
      },
    } as never,
  ];
  return cd;
}

function collection(idShort: string, semanticId: string, value: aas.types.ISubmodelElement[]) {
  const element = new aas.types.SubmodelElementCollection(null, null, idShort);
  element.semanticId = semanticRef(semanticId);
  element.value = value;
  return element;
}

function collectionList(idShort: string, semanticId: string, value: aas.types.ISubmodelElement[]) {
  const element = new aas.types.SubmodelElementList(
    aas.types.AasSubmodelElements.SubmodelElementCollection,
    null,
    null,
    idShort,
  );
  element.semanticId = semanticRef(semanticId);
  element.value = value;
  return element;
}

function propertyList(idShort: string, semanticId: string, value: aas.types.ISubmodelElement[]) {
  const element = new aas.types.SubmodelElementList(aas.types.AasSubmodelElements.Property, null, null, idShort);
  element.semanticId = semanticRef(semanticId);
  element.value = value;
  return element;
}

function createMaterialCompositionSubmodel() {
  const submodel = new aas.types.Submodel('urn:test:material-composition', null, null, 'MaterialComposition');
  submodel.semanticId = semanticRef(
    'urn:samm:io.admin-shell.idta.batterypass.material_composition:1.0.0#MaterialComposition',
  );

  const batteryChemistry = collection(
    'BatteryChemistry',
    'urn:samm:io.admin-shell.idta.batterypass.material_composition:1.0.0#batteryChemistry',
    [
      property(
        'ShortName',
        'urn:samm:io.admin-shell.idta.batterypass.material_composition:1.0.0#shortName',
        'NMC811/Graphite',
      ),
      property(
        'ClearName',
        'urn:samm:io.admin-shell.idta.batterypass.material_composition:1.0.0#clearName',
        'Nickel manganese cobalt cathode with graphite anode',
      ),
    ],
  );

  const cathodeMaterial = collection(
    'CathodeMaterial',
    'urn:samm:io.admin-shell.idta.batterypass.material_composition:1.0.0#BatteryMaterial',
    [
      collection(
        'BatteryMaterialLocation',
        'urn:samm:io.admin-shell.idta.batterypass.material_composition:1.0.0#batteryMaterialLocation',
        [
          property(
            'ComponentName',
            'urn:samm:io.admin-shell.idta.batterypass.material_composition:1.0.0#componentName',
            'Cathode',
          ),
          property(
            'ComponentId',
            'urn:samm:io.admin-shell.idta.batterypass.material_composition:1.0.0#componentId',
            'CAT-01',
          ),
        ],
      ),
      property(
        'BatteryMaterialIdentifier',
        'urn:samm:io.admin-shell.idta.batterypass.material_composition:1.0.0#batteryMaterialIdentifier',
        '182442-95-1',
      ),
      property(
        'BatteryMaterialName',
        'urn:samm:io.admin-shell.idta.batterypass.material_composition:1.0.0#batteryMaterialName',
        'Lithium nickel manganese cobalt oxide',
      ),
      property(
        'BatteryMaterialMass',
        'urn:samm:io.admin-shell.idta.batterypass.material_composition:1.0.0#batteryMaterialMass',
        '2.45',
        aas.types.DataTypeDefXsd.Float,
      ),
      property(
        'IsCriticalRawMaterial',
        'urn:samm:io.admin-shell.idta.batterypass.material_composition:1.0.0#isCriticalRawMaterial',
        'true',
        aas.types.DataTypeDefXsd.Boolean,
      ),
    ],
  );

  const electrolyteMaterial = collection(
    'ElectrolyteMaterial',
    'urn:samm:io.admin-shell.idta.batterypass.material_composition:1.0.0#BatteryMaterial',
    [
      collection(
        'BatteryMaterialLocation',
        'urn:samm:io.admin-shell.idta.batterypass.material_composition:1.0.0#batteryMaterialLocation',
        [
          property(
            'ComponentName',
            'urn:samm:io.admin-shell.idta.batterypass.material_composition:1.0.0#componentName',
            'Electrolyte',
          ),
        ],
      ),
      property(
        'BatteryMaterialIdentifier',
        'urn:samm:io.admin-shell.idta.batterypass.material_composition:1.0.0#batteryMaterialIdentifier',
        '616-38-6',
      ),
      property(
        'BatteryMaterialName',
        'urn:samm:io.admin-shell.idta.batterypass.material_composition:1.0.0#batteryMaterialName',
        'Dimethyl carbonate',
      ),
      property(
        'BatteryMaterialMass',
        'urn:samm:io.admin-shell.idta.batterypass.material_composition:1.0.0#batteryMaterialMass',
        '0.62',
        aas.types.DataTypeDefXsd.Float,
      ),
      property(
        'IsCriticalRawMaterial',
        'urn:samm:io.admin-shell.idta.batterypass.material_composition:1.0.0#isCriticalRawMaterial',
        'false',
        aas.types.DataTypeDefXsd.Boolean,
      ),
    ],
  );

  const batteryMaterials = collectionList(
    'BatteryMaterials',
    'urn:samm:io.admin-shell.idta.batterypass.material_composition:1.0.0#batteryMaterials',
    [cathodeMaterial, electrolyteMaterial],
  );

  const hazardousSubstance = collection(
    'HazardousSubstance',
    'urn:samm:io.admin-shell.idta.batterypass.material_composition:1.0.0#HazardousSubstance',
    [
      property(
        'HazardousSubstanceClass',
        'urn:samm:io.admin-shell.idta.batterypass.material_composition:1.0.0#hazardousSubstanceClass',
        'Acute toxicity',
      ),
      property(
        'HazardousSubstanceName',
        'urn:samm:io.admin-shell.idta.batterypass.material_composition:1.0.0#hazardousSubstanceName',
        'Lithium hexafluorophosphate',
      ),
      property(
        'HazardousSubstanceConcentration',
        'urn:samm:io.admin-shell.idta.batterypass.material_composition:1.0.0#hazardousSubstanceConcentration',
        '0.14',
        aas.types.DataTypeDefXsd.Double,
      ),
      propertyList(
        'HazardousSubstanceImpact',
        'urn:samm:io.admin-shell.idta.batterypass.material_composition:1.0.0#hazardousSubstanceImpact',
        [
          property(
            'Impact',
            'urn:samm:io.admin-shell.idta.batterypass.material_composition:1.0.0#Impact',
            'Harmful if swallowed',
          ),
          property(
            'ImpactSecondary',
            'urn:samm:io.admin-shell.idta.batterypass.material_composition:1.0.0#Impact',
            'Causes serious eye irritation',
          ),
        ],
      ),
      collection(
        'HazardousSubstanceLocation',
        'urn:samm:io.admin-shell.idta.batterypass.material_composition:1.0.0#hazardousSubstanceLocation',
        [
          property(
            'ComponentName',
            'urn:samm:io.admin-shell.idta.batterypass.material_composition:1.0.0#componentName',
            'Electrolyte',
          ),
          property(
            'ComponentId',
            'urn:samm:io.admin-shell.idta.batterypass.material_composition:1.0.0#componentId',
            'ELY-77',
          ),
        ],
      ),
      property(
        'HazardousSubstanceIdentifier',
        'urn:samm:io.admin-shell.idta.batterypass.material_composition:1.0.0#hazardousSubstanceIdentifier',
        '21324-40-3',
      ),
    ],
  );

  const hazardousSubstances = collectionList(
    'HazardousSubstances',
    'urn:samm:io.admin-shell.idta.batterypass.material_composition:1.0.0#hazardousSubstances',
    [hazardousSubstance],
  );

  submodel.submodelElements = [batteryChemistry, batteryMaterials, hazardousSubstances];
  return submodel;
}

describe('MaterialCompositionViewerComponent', () => {
  let component: MaterialCompositionViewerComponent;
  let fixture: ComponentFixture<MaterialCompositionViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), MaterialCompositionViewerComponent],
      providers: [
        {
          provide: ViewerStoreService,
          useValue: {
            cdUrl: () => 'https://example.test/cds',
            apiKey: () => '',
          },
        },
        {
          provide: ConceptDescriptionService,
          useValue: {
            loadCD: async (id: string) => {
              if (id.endsWith('#batteryMaterialMass')) {
                return conceptDescription(id, '', 'kg');
              }

              if (id.endsWith('#hazardousSubstanceConcentration')) {
                return conceptDescription(id, '%');
              }

              return undefined;
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MaterialCompositionViewerComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('currentLanguage', 'en');
    fixture.componentRef.setInput('submodel', createMaterialCompositionSubmodel());
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('creates and extracts chemistry, materials and hazardous substances', async () => {
    expect(component).toBeTruthy();
    expect(component.hasContent()).toBe(true);
    expect(component.chemistry()).toEqual({
      shortName: 'NMC811/Graphite',
      clearName: 'Nickel manganese cobalt cathode with graphite anode',
    });
    expect(component.materials()).toEqual([
      {
        locationName: 'Cathode',
        locationId: 'CAT-01',
        materialName: 'Lithium nickel manganese cobalt oxide',
        materialIdentifier: '182442-95-1',
        mass: '2.45',
        isCriticalRawMaterial: true,
      },
      {
        locationName: 'Electrolyte',
        locationId: '',
        materialName: 'Dimethyl carbonate',
        materialIdentifier: '616-38-6',
        mass: '0.62',
        isCriticalRawMaterial: false,
      },
    ]);
    expect(component.criticalRawMaterialCount()).toBe(1);
    expect(component.groupedMaterials().map((group) => group.locationName)).toEqual(['Cathode', 'Electrolyte']);
    expect(component.hazardousSubstances()).toEqual([
      {
        locationName: 'Electrolyte',
        locationId: 'ELY-77',
        hazardousSubstanceClass: 'Acute toxicity',
        hazardousSubstanceName: 'Lithium hexafluorophosphate',
        hazardousSubstanceConcentration: '0.14',
        hazardousSubstanceIdentifier: '21324-40-3',
        impacts: ['Harmful if swallowed', 'Causes serious eye irritation'],
      },
    ]);
    expect(component.massUnit()).toBe('');
    expect(component.massSymbol()).toBe('kg');
    expect(component.concentrationUnit()).toBe('%');
    expect(component.concentrationSymbol()).toBe('');
    expect(component.formatMass('2.45')).toBe('2.45 kg');
    expect(component.formatConcentration('0.14')).toBe('0.14 %');
  });
});
