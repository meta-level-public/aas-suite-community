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

function conceptDescription(id: string, unit: string | null, symbol: string | null = null) {
  const cd = new aas.types.ConceptDescription(id);
  cd.embeddedDataSpecifications = [
    new aas.types.EmbeddedDataSpecification(
      new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
        new aas.types.Key(
          aas.types.KeyTypes.GlobalReference,
          'https://admin-shell.io/DataSpecificationTemplates/DataSpecificationIEC61360/3/0',
        ),
      ]),
      new aas.types.DataSpecificationIec61360(
        [new aas.types.LangStringPreferredNameTypeIec61360('en', id)],
        null,
        unit,
        null,
        null,
        symbol,
      ),
    ),
  ];
  return cd;
}

const MC = 'urn:samm:io.admin-shell.idta.batterypass.material_composition:1.0.0#';

function field(name: string) {
  return { semanticId: `${MC}${name}`, unit: '' };
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
                return conceptDescription(id, null, 'kg');
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
      fields: { shortName: field('shortName'), clearName: field('clearName') },
    });
    expect(component.materials()).toEqual([
      {
        locationName: 'Cathode',
        locationId: 'CAT-01',
        materialName: 'Lithium nickel manganese cobalt oxide',
        materialIdentifier: '182442-95-1',
        mass: '2.45',
        isCriticalRawMaterial: true,
        fields: {
          materialName: field('batteryMaterialName'),
          materialIdentifier: field('batteryMaterialIdentifier'),
          mass: field('batteryMaterialMass'),
          isCriticalRawMaterial: field('isCriticalRawMaterial'),
        },
      },
      {
        locationName: 'Electrolyte',
        locationId: '',
        materialName: 'Dimethyl carbonate',
        materialIdentifier: '616-38-6',
        mass: '0.62',
        isCriticalRawMaterial: false,
        fields: {
          materialName: field('batteryMaterialName'),
          materialIdentifier: field('batteryMaterialIdentifier'),
          mass: field('batteryMaterialMass'),
          isCriticalRawMaterial: field('isCriticalRawMaterial'),
        },
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
        fields: {
          hazardousSubstanceClass: field('hazardousSubstanceClass'),
          hazardousSubstanceName: field('hazardousSubstanceName'),
          hazardousSubstanceConcentration: field('hazardousSubstanceConcentration'),
          hazardousSubstanceIdentifier: field('hazardousSubstanceIdentifier'),
        },
      },
    ]);
  });

  it('shows the unit from the concept description and falls back to percent for concentrations', async () => {
    const material = component.materials()[0];
    // The unit of the concept description arrives asynchronously
    component.fieldUnit(material.fields.mass);
    await new Promise((resolve) => setTimeout(resolve));

    expect(component.formatMass(material)).toBe('2.45');
    expect(component.fieldUnit(material.fields.mass)).toBe('kg');
    expect(component.concentrationUnit(component.hazardousSubstances()[0])).toBe('%');
  });

  it('shows the battery chemistry as hero and no separate chemistry card', () => {
    const element = fixture.nativeElement as HTMLElement;
    const hero = element.querySelector('.viewer-hero');

    expect(hero?.classList.length).toBe(1);
    expect(hero?.querySelector('.viewer-hero-eyebrow')?.textContent).toContain('MATERIAL_COMPOSITION_CHEMISTRY');
    expect(hero?.querySelector('.viewer-hero-eyebrow aas-semantic-description-popup')).not.toBeNull();
    expect(hero?.querySelector('.viewer-hero-title')?.textContent?.trim()).toBe('NMC811/Graphite');
    expect(hero?.querySelector('.viewer-hero-text')?.textContent).toContain(
      'Nickel manganese cobalt cathode with graphite anode',
    );
    expect(hero?.querySelector('.viewer-hero-aside p-tag')?.textContent).toContain(
      'MATERIAL_COMPOSITION_HAZARDOUS_SUBSTANCE_COUNT_ONE',
    );
    const cardTitles = Array.from(element.querySelectorAll('.viewer-card-title')).map((title) => title.textContent);
    expect(cardTitles.some((title) => title?.includes('MATERIAL_COMPOSITION_CHEMISTRY'))).toBe(false);
  });

  it('uses the submodel title as hero title without battery chemistry', async () => {
    const submodel = createMaterialCompositionSubmodel();
    submodel.submodelElements = (submodel.submodelElements ?? []).filter((el) => el.idShort !== 'BatteryChemistry');
    fixture.componentRef.setInput('submodel', submodel);
    fixture.detectChanges();

    const hero = (fixture.nativeElement as HTMLElement).querySelector('.viewer-hero');
    expect(hero?.querySelector('.viewer-hero-eyebrow')).toBeNull();
    expect(hero?.querySelector('.viewer-hero-title')?.textContent?.trim()).toBe(
      'BATTERY_PASSPORT_MATERIAL_COMPOSITION',
    );
  });
});
