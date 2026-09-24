import { createMaterialChart } from './material-chart';

export interface DisplayField { label: string; value: string; }
export interface DisplayLink { label: string; url: string; }
export interface DisplayGroup { title: string; fields: DisplayField[]; }
export interface MaterialChart {
  slices: { label: string; percentage: number; color: string }[];
  total: number;
  background: string | null;
}
export interface FormattedPassport {
  title: string;
  description: string;
  groups: DisplayGroup[];
  documents: DisplayLink[];
  claims: DisplayGroup[];
  materials: DisplayGroup[];
  materialChart?: MaterialChart;
}

type DataObject = Record<string, unknown>;

/** UN/CEFACT Rec. 20 unit codes used by UNTP. */
const unitCodes: Record<string, string> = {
  KGM: 'kg', GRM: 'g', P1: '%', CEL: '°C', MMT: 'mm', CMT: 'cm', MTR: 'm', VLT: 'V', WTT: 'W', W: 'W',
  KWT: 'kW', KWH: 'kWh', AMH: 'Ah', ANN: 'Jahre', MON: 'Monate',
};

function object(value: unknown): DataObject {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as DataObject : {};
}

function list(value: unknown): unknown[] { return Array.isArray(value) ? value : []; }

function value(value: unknown): string {
  if (value === null || value === undefined || value === '') return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
  const data = object(value);
  if ('value' in data) {
    const unit = valueOf(data['unit']);
    return [valueOf(data['value']), unitCodes[unit] ?? unit].filter(Boolean).join(' ');
  }
  return valueOf(data['name']) || valueOf(data['countryName']) || valueOf(data['countryCode']);
}

function valueOf(value: unknown): string { return value === undefined || value === null ? '' : String(value); }

function fields(data: DataObject, mapping: [string, string][]): DisplayField[] {
  return mapping.map(([key, label]) => ({ label, value: value(data[key]) })).filter((field) => field.value);
}

function group(title: string, data: DataObject, mapping: [string, string][]): DisplayGroup | null {
  const items = fields(data, mapping);
  return items.length ? { title, fields: items } : null;
}

export function formatPassport(input: unknown): FormattedPassport | null {
  const root = object(input);
  const product = object(root['credentialSubject']);
  if (!product['name'] && !product['id']) return null;

  const characteristics = object(product['characteristics']);
  const issuer = object(root['issuer']);
  const facility = object(product['producedAtFacility']);
  const country = object(product['countryOfProduction']);

  const groups = [
    group('Produktidentität', product, [
      ['name', 'Produkt'], ['modelNumber', 'Modell'], ['itemNumber', 'Seriennummer'],
      ['batchNumber', 'Charge'], ['idGranularity', 'Granularität'], ['id', 'Produkt-ID'],
    ]),
    group('Batteriedaten', characteristics, [
      ['batteryCategory', 'Kategorie'], ['batteryChemistry', 'Chemie'],
      ['certifiedUsableEnergy', 'Nutzbare Energie'], ['ratedCapacity', 'Nennkapazität'],
      ['nominalVoltage', 'Nennspannung'], ['minimumVoltage', 'Minimale Spannung'],
      ['maximumVoltage', 'Maximale Spannung'], ['expectedLifetimeCycles', 'Lebensdauer (Zyklen)'],
      ['expectedLifetimeYears', 'Lebensdauer (Jahre)'],
      ['initialRoundTripEnergyEfficiency', 'Anfänglicher Wirkungsgrad (%)'],
      ['warrantyPeriodMonths', 'Garantie (Monate)'],
    ]),
    group('Herstellung', {
      manufacturer: issuer['name'], facility: facility['name'], country: country['countryName'],
      productionDate: product['productionDate'],
    }, [
      ['manufacturer', 'Hersteller'], ['facility', 'Werk'],
      ['country', 'Land'], ['productionDate', 'Herstellungsdatum'],
    ]),
    group('Pass', root, [
      ['id', 'Pass-ID'], ['validFrom', 'Gültig ab'], ['validUntil', 'Gültig bis'],
    ]),
  ].filter((item): item is DisplayGroup => item !== null);

  const documents = list(product['relatedDocument']).map((item) => {
    const doc = object(item);
    return { label: value(doc['linkName']) || 'Dokument', url: value(doc['linkURL']) };
  }).filter((item) => /^https:\/\//i.test(item.url));

  const claims = list(product['performanceClaim']).map((item) => {
    const claim = object(item);
    const performance = list(claim['claimedPerformance']).flatMap((entry) => {
      const detail = object(entry);
      const metric = object(detail['metric']);
      const score = object(detail['score']);
      const field = value(detail['measure']);
      return [
        ...(field ? [{ label: value(metric['name']) || 'Messwert', value: field }] : []),
        ...(score['code'] ? [{ label: 'Bewertung', value: value(score['code']) }] : []),
      ];
    });
    const base = fields(claim, [['description', 'Beschreibung'], ['claimDate', 'Datum']]);
    return { title: value(claim['name']) || 'Nachweis', fields: [...performance, ...base] };
  }).filter((item): item is DisplayGroup => item !== null);

  const materialEntries = list(product['materialProvenance']);
  const materials = materialEntries.map((item) => {
    const material = object(item);
    const origin = object(material['originCountry']);
    const percent = (fraction: unknown) => typeof fraction === 'number' ? `${Math.round(fraction * 1000) / 10} %` : '';
    return group(value(material['name']) || 'Material', {
      ...material, origin: origin['countryName'] ?? origin['countryCode'],
      massFraction: percent(material['massFraction']),
      recycledMassFraction: percent(material['recycledMassFraction']),
    }, [
      ['origin', 'Herkunft'], ['mass', 'Masse'], ['massFraction', 'Massenanteil'],
      ['recycledMassFraction', 'Rezyklatanteil'],
    ]);
  }).filter((item): item is DisplayGroup => item !== null);

  return {
    title: value(product['name']) || value(root['name']) || 'Produktpass',
    description: value(product['description']), groups, documents, claims, materials,
    materialChart: createMaterialChart(materialEntries.map((entry, index) => {
      const material = object(entry);
      const fraction = material['massFraction'];
      return {
        label: value(material['name']) || `Material ${index + 1}`,
        percentage: typeof fraction === 'number' ? fraction * 100 : NaN,
      };
    })),
  };
}
