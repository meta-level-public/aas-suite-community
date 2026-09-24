import assert from 'node:assert/strict';
import test from 'node:test';
import { formatBaSyxPassport, present } from './basyx-passport';

const nameplate = 'https://admin-shell.io/idta/digitalbatterypassport/nameplate/1/0/Nameplate';
const technical = 'https://admin-shell.io/idta/digitalbatterypassport/TechnicalData/1/0';
const material = 'urn:samm:io.admin-shell.idta.batterypass.material_composition:1.0.0#MaterialComposition';
const condition = 'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#ProductCondition';
const circularity = 'urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#Circularity';
const zveiNameplate = 'https://admin-shell.io/zvei/nameplate/2/0/Nameplate';

const battery = {
  digitalProductPassportId: 'https://example.com/ids/aas/batterie1',
  uniqueProductIdentifier: 'https://example.com/ids/asset/batterie1',
  dppStatus: 'Draft', granularity: 'Item', dppSchemaVersion: '1',
  contentSpecificationIds: [nameplate, technical, material, condition, circularity],
  [nameplate]: {
    ManufacturerName: [{ language: 'de', value: 'Example Company' }],
    ManufacturerProductDesignation: [{ language: 'de', value: 'Batterie Demo' }],
    ManufacturerProductType: [{ language: 'en', value: 'CELL-200' }],
    SerialNumber: '12345678', DateOfManufacture: '2026-03-14',
    CompanyLogo: { contentType: 'image/svg+xml', url: 'https://example.com/logo.svg' },
    AddressInformation: {
      ContactInformation: {
        Street: [{ language: 'de', value: 'Musterstraße 1' }],
        Zipcode: [{ language: 'de', value: '12345' }],
        CityTown: [{ language: 'de', value: 'Musterstadt' }],
        Email: { EmailAddress: 'info@example.com' },
      },
    },
    EUDeclarationOfConformity: ['https://example.com/doc.pdf'],
  },
  [technical]: {
    GeneralInformation: { BatteryCategory: 'ev', BatteryMass: '1007', WarrantyInformation: { WarrantyPeriod: 'P96M' } },
    TechnicalPropertyAreas: {
      CapacityEnergyVoltage: { RatedCapacity: '210', NominalVoltage: '4.3', MinVoltage: '2.04', MaxVoltage: '6' },
    },
  },
  [material]: {
    BatteryChemistry: { ClearName: 'Lithium nickel manganese cobalt oxides', ShortName: 'NMC' },
    BatteryMaterials: [{
      BatteryMaterialIdentifier: '7439-93-2', BatteryMaterialLocation: { ComponentId: '', ComponentName: 'Anode' },
      BatteryMaterialMass: '', BatteryMaterialName: 'Lithium', IsCriticalRawMaterial: 'true',
    }],
    HazardousSubstances: [{ HazardousSubstanceName: '', HazardousSubstanceLocation: { ComponentName: 'Anode' } }],
  },
  [condition]: {
    StateOfCharge: { LastUpdate: '2026-01-01T14:23:00+00:00', StateOfChargeValue: '70' },
    NegativeEvents: [{ LastUpdate: '2026-01-01T14:23:00+00:00', NegativeEventValue: 'overcharged' }],
  },
  [circularity]: { DismantlingAndRemovalInformation: [''], RenewableContent: '' },
};

test('formats a BaSyX battery passport into hero, metrics and sections', () => {
  const view = formatBaSyxPassport(battery);

  assert.equal(view?.kind, 'battery');
  assert.equal(view?.title, 'Batterie Demo');
  assert.deepEqual(view?.status, { label: 'Entwurf', tone: 'warn' });
  assert.deepEqual(view?.metrics.map((metric) => [metric.label, metric.value, metric.unit]).slice(0, 6), [
    ['Kategorie', 'Elektrofahrzeug (EV)', ''],
    ['Zellchemie', 'NMC', ''],
    ['Nennkapazität', '210', 'Ah'],
    ['Nennspannung', '4,3', 'V'],
    ['Masse', '1.007', 'kg'],
    ['Garantie', '8 Jahre', ''],
  ]);
  assert.equal(view?.metrics.find((metric) => metric.key === 'NominalVoltage')?.hint, 'Bereich 2,04–6 V');
  assert.deepEqual(view?.gauges.map((gauge) => [gauge.label, gauge.percent]), [['Ladezustand', 70]]);
  assert.deepEqual(view?.sections.map((section) => section.title),
    ['Technische Daten', 'Materialzusammensetzung', 'Zustand und Nutzung']);
  assert.deepEqual(view?.emptySections, ['Kreislaufwirtschaft']);

  assert.equal(view?.nameplate?.logoUrl, 'https://example.com/logo.svg');
  assert.equal(view?.nameplate?.contact.find((field) => field.label === 'Adresse')?.value, 'Musterstraße 1, 12345 Musterstadt');
  assert.equal(view?.nameplate?.contact.find((field) => field.label === 'E-Mail')?.href, 'mailto:info@example.com');
  assert.deepEqual(view?.nameplate?.compliance.map((link) => link.label), ['EU-Konformitätserklärung']);

  const technicalGroups = view?.sections[0].content.groups.map((group) => group.title);
  assert.deepEqual(technicalGroups, ['Allgemeine Angaben', 'Kapazität, Energie und Spannung']);

  const materials = view?.sections[1].content.tables;
  assert.deepEqual(materials?.map((table) => table.title), ['Batteriematerialien']);
  assert.deepEqual(materials?.[0].columns, ['Material', 'Kritischer Rohstoff', 'Kennung (CAS)', 'Komponente']);
  assert.deepEqual(materials?.[0].rows[0].map((cell) => cell.value), ['Lithium', 'Ja', '7439-93-2', 'Anode']);

  const state = view?.sections[2];
  assert.equal(state?.layout, 'tiles');
  assert.deepEqual(state?.content.fields.map((field) => [field.label, field.value, field.unit, field.percent]),
    [['Ladezustand (SoC)', '70', '%', 70]]);
  assert.ok(state?.content.fields[0].asOf?.startsWith('01.01.2026'));
  assert.equal(state?.content.tables[0].rows[0][0].value, 'Überladung');
});

test('formats a nameplate-only passport as product passport', () => {
  const view = formatBaSyxPassport({
    digitalProductPassportId: 'https://meta-level.de/ids/aas/1', dppStatus: 'Active',
    contentSpecificationIds: [zveiNameplate],
    [zveiNameplate]: {
      ManufacturerName: [{ language: 'de', value: 'Meta Level Software AG' }],
      ManufacturerProductDesignation: [{ language: 'de', value: 'Tasse zur Demonstration' }, { language: 'en', value: 'Cup' }],
      CountryOfOrigin: 'DE', DateOfManufacture: '2022-01-01',
      Markings: { Marking00: { MarkingName: '0173-1#07-DAA603#004', MarkingFile: { contentType: 'text/xml', url: 'https://example.com/ce' } } },
    },
  });

  assert.equal(view?.kind, 'product');
  assert.equal(view?.title, 'Tasse zur Demonstration');
  assert.equal(view?.subtitle, 'Meta Level Software AG');
  assert.deepEqual(view?.status, { label: 'Aktiv', tone: 'ok' });
  assert.deepEqual(view?.metrics.map((metric) => [metric.label, metric.value]), [
    ['Hersteller', 'Meta Level Software AG'], ['Herstellungsdatum', '01.01.2022'], ['Herkunftsland', 'Deutschland'],
  ]);
  assert.deepEqual(view?.nameplate?.compliance.map((link) => link.label), ['CE-Kennzeichnung']);
  assert.deepEqual(view?.sections, []);
});

test('lists an empty nameplate as section without data', () => {
  const view = formatBaSyxPassport({ ...battery, [nameplate]: { ManufacturerName: [], SerialNumber: '', Markings: [] } });
  assert.equal(view?.nameplate, null);
  assert.deepEqual(view?.emptySections, ['Typenschild', 'Kreislaufwirtschaft']);
});

test('presents AAS values with German formatting', () => {
  assert.deepEqual(present('RatedCapacity', '1234.5'), { value: '1.234,5', unit: 'Ah', percent: undefined });
  assert.deepEqual(present('IsCriticalRawMaterial', 'false'), { value: 'Nein', flag: 'no' });
  assert.equal(present('WarrantyPeriod', 'P18M').value, '18 Monate');
  assert.equal(present('SerialNumber', '0012').value, '0012');
  assert.equal(present('URIOfTheProduct', 'https://example.com').href, 'https://example.com');
});

test('does not claim arbitrary passports as BaSyX', () => {
  assert.equal(formatBaSyxPassport({ productName: 'Other' }), null);
  assert.equal(formatBaSyxPassport({ digitalProductPassportId: 'id' }), null);
  assert.equal(formatBaSyxPassport({ digitalProductPassportId: 'id', contentSpecificationIds: [technical] }), null);
});
