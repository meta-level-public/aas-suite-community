import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { buildTechnicalDataSheet, sectionSize } from './technical-data-sheet';

const names = (de: string, en = de) => [
  { language: 'de', text: de },
  { language: 'en', text: en },
];
const prop = (idShort: string, value: string | null, displayName?: string) => ({
  modelType: 'Property',
  idShort,
  valueType: 'xs:string',
  ...(value != null ? { value } : {}),
  ...(displayName ? { displayName: names(displayName) } : {}),
});
const smc = (idShort: string, value: unknown[], displayName?: string) => ({
  modelType: 'SubmodelElementCollection',
  idShort,
  value,
  ...(displayName ? { displayName: names(displayName) } : {}),
});
// Like the SmartCar pins: the printed board label repeats the row label and is therefore no column of its own
const pin = (idShort: string, gpio: string | null, func: string) =>
  smc(
    idShort,
    [prop('BoardAufdruck', idShort, 'Board'), prop('GpioNummer', gpio, 'GPIO'), prop('Funktion', func, 'Funktion')],
    idShort,
  );

function submodel(elements: unknown[]) {
  const result = aas.jsonization.submodelFromJsonable({
    modelType: 'Submodel',
    id: 'urn:test:technical-data',
    idShort: 'TechnicalData',
    submodelElements: elements,
  } as never);
  if (result.value == null) throw new Error(String(result.error?.message));
  return result.value;
}

// Shaped like the SmartCar (Technical Data 2.0)
const smartCar = submodel([
  smc('GeneralInformation', [
    prop('ManufacturerName', 'Meta-Level Software AG'),
    {
      modelType: 'MultiLanguageProperty',
      idShort: 'ManufacturerProductDesignation',
      value: names('Holzauto', 'Wooden car'),
    },
    prop('ManufacturerArticleNumber', null),
  ]),
  smc('ProductClassifications', [
    smc('Classification', [prop('ClassificationSystem', 'ECLASS'), prop('ProductClassId', '27-24-22-01')]),
  ]),
  {
    modelType: 'SubmodelElementList',
    idShort: 'TechnicalPropertyAreas',
    typeValueListElement: 'SubmodelElementCollection',
    value: [
      {
        modelType: 'SubmodelElementCollection',
        displayName: names('Verbauter Aufbau', 'Installed hardware'),
        value: [
          smc(
            'Steuerung',
            [
              prop('Board', 'D1 mini', 'Controllerboard'),
              smc(
                'Pinbelegung',
                [pin('D0', '16', 'Taster'), pin('D1', '5', 'Display SCL'), pin('G', null, 'Masse')],
                'Pinbelegung',
              ),
            ],
            'Steuerung und Funk',
          ),
          smc('Mechanik', [prop('Material', 'Holz', 'Material'), prop('Laenge', null, 'Länge')], 'Mechanik'),
        ],
      },
    ],
  },
]);

describe('buildTechnicalDataSheet', () => {
  it('reads the general information in the current language', () => {
    const sheet = buildTechnicalDataSheet(smartCar, 'en');

    expect(sheet.manufacturerName).toBe('Meta-Level Software AG');
    expect(sheet.productDesignation).toBe('Wooden car');
    expect(sheet.articleNumber).toBe('');
    expect(sheet.classifications).toEqual([{ system: 'ECLASS', version: '', classId: '27-24-22-01', className: '' }]);
  });

  it('turns the property areas into sections with labelled rows and leaves empty values out', () => {
    const [area] = buildTechnicalDataSheet(smartCar, 'de').areas;

    expect(area.title).toBe('Verbauter Aufbau');
    const [control, mechanics] = area.sections;
    expect(control.title).toBe('Steuerung und Funk');
    expect(control.rows.map((row) => [row.label, row.value])).toEqual([['Controllerboard', 'D1 mini']]);
    expect(mechanics.rows.map((row) => row.label)).toEqual(['Material']);
  });

  it('shows collections with the same fields as one table', () => {
    const [table] = buildTechnicalDataSheet(smartCar, 'de').areas[0].sections[0].tables;

    expect(table.title).toBe('Pinbelegung');
    expect(table.columns.map((column) => column.label)).toEqual(['GPIO', 'Funktion']);
    expect(table.rows.map((row) => [row.label, row.cells['GpioNummer'], row.cells['Funktion']])).toEqual([
      ['D0', '16', 'Taster'],
      ['D1', '5', 'Display SCL'],
      ['G', '', 'Masse'],
    ]);
  });

  it('collects further general information that the header does not show', () => {
    // Like the battery passport: category, mass and a warranty collection next to the manufacturer
    const battery = submodel([
      smc('GeneralInformation', [
        prop('ManufacturerName', 'Example Company'),
        prop('BatteryCategory', 'ev', 'Batteriekategorie'),
        smc('WarrantyInformation', [prop('WarrantyPeriod', 'P96M', 'Garantiezeit')], 'Garantie'),
      ]),
    ]);

    const { general } = buildTechnicalDataSheet(battery, 'de');

    expect(general.rows.map((row) => [row.label, row.value])).toEqual([['Batteriekategorie', 'ev']]);
    expect(general.sections[0].rows.map((row) => row.value)).toEqual(['P96M']);
  });

  it('groups areas that only hold values under the container, like the battery passport', () => {
    const battery = submodel([
      smc(
        'TechnicalPropertyAreas',
        [
          smc('CapacityEnergyVoltage', [prop('NominalVoltage', '4.3')]),
          smc('Resistance', [prop('InitialInternalResistanceOnBatteryCellLevel', '67')]),
          // a nested group (like OriginalPowerCapability) still fits into a card
          smc('PowerCapability', [smc('OriginalPowerCapability', [prop('AtSoc', '80')])]),
        ],
        'Merkmalsbereiche',
      ),
    ]);

    const [area] = buildTechnicalDataSheet(battery, 'de').areas;

    expect(area.title).toBe('Merkmalsbereiche');
    expect(area.sections.map((section) => section.title)).toEqual([
      'Capacity energy voltage',
      'Resistance',
      'Power capability',
    ]);
    expect(area.sections[0].rows[0].label).toBe('Nominal voltage');
  });

  it('leaves the heading of grouped areas to the viewer when the container has no display name', () => {
    const battery = submodel([
      smc('TechnicalPropertyAreas', [
        smc('CapacityEnergyVoltage', [prop('NominalVoltage', '4.3')]),
        smc('Resistance', [prop('InitialInternalResistanceOnBatteryCellLevel', '67')]),
      ]),
    ]);

    expect(buildTechnicalDataSheet(battery, 'de').areas[0].title).toBe('');
  });

  it('supports the TechnicalProperties collection of Technical Data 1.x', () => {
    const legacy = submodel([
      smc('TechnicalProperties', [
        prop('Weight', '1.2', 'Gewicht'),
        smc('MainSection', [prop('Color', 'Blau', 'Farbe')], 'Hauptteil'),
      ]),
    ]);

    const [area] = buildTechnicalDataSheet(legacy, 'de').areas;

    expect(area.rows.map((row) => row.label)).toEqual(['Gewicht']);
    expect(area.sections[0].title).toBe('Hauptteil');
  });

  it('keeps nesting of any depth and the idShort paths of list items', () => {
    const deep = submodel([
      smc('TechnicalPropertyAreas', [
        smc(
          'Drive',
          [
            smc(
              'Motor',
              [smc('Winding', [smc('Insulation', [prop('Class', 'F', 'Klasse')], 'Isolation')], 'Wicklung')],
              'Motor',
            ),
          ],
          'Antrieb',
        ),
      ]),
      smc('SpecificDescriptions', [
        {
          modelType: 'SubmodelElementList',
          idShort: 'Ports',
          typeValueListElement: 'SubmodelElementCollection',
          value: [smc('', [{ modelType: 'ReferenceElement', idShort: 'Datasheet' }])],
        },
      ]),
    ]);

    const [drive, ports] = buildTechnicalDataSheet(deep, 'de').areas;
    const insulation = drive.sections[0].sections[0].sections[0];

    expect(insulation.title).toBe('Isolation');
    expect(insulation.rows[0].value).toBe('F');
    expect(sectionSize(drive)).toBe(4);
    expect(ports.sections[0].elements[0].idShortPath).toBe('SpecificDescriptions.Ports[0].Datasheet');
  });

  it('keeps element types without a text value for the generic viewer', () => {
    const withReferences = submodel([
      smc('TechnicalPropertyAreas', [
        smc('Interfaces', [
          prop('Bus', 'CAN', 'Bus'),
          {
            modelType: 'ReferenceElement',
            idShort: 'Manual',
            displayName: names('Handbuch'),
            value: { type: 'ExternalReference', keys: [{ type: 'GlobalReference', value: 'https://example.com' }] },
          },
          { modelType: 'Entity', idShort: 'Controller', entityType: 'CoManagedEntity' },
        ]),
      ]),
    ]);

    const [area] = buildTechnicalDataSheet(withReferences, 'de').areas;

    expect(area.rows.map((row) => row.label)).toEqual(['Bus']);
    expect(area.elements.map((element) => [element.label, element.idShortPath])).toEqual([
      ['Handbuch', 'TechnicalPropertyAreas.Interfaces.Manual'],
      ['Controller', 'TechnicalPropertyAreas.Interfaces.Controller'],
    ]);
  });
});
