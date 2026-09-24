import type { DisplayField, DisplayGroup, FormattedPassport } from './passport-view-model';
import { createMaterialChart } from './material-chart';

type RecordValue = Record<string, unknown>;

function object(value: unknown): RecordValue {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as RecordValue : {};
}

function text(value: unknown): string {
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
    ? String(value) : '';
}

function field(label: string, value: unknown, unit = ''): DisplayField | null {
  const content = text(value);
  return content ? { label, value: unit ? `${content} ${unit}` : content } : null;
}

function group(title: string, fields: (DisplayField | null)[]): DisplayGroup | null {
  const present = fields.filter((item): item is DisplayField => item !== null);
  return present.length ? { title, fields: present } : null;
}

function isOpenDpp(root: RecordValue): boolean {
  const contexts = Array.isArray(root['@context']) ? root['@context'] : [root['@context']];
  const hasContext = contexts.some((entry) =>
    (typeof entry === 'string' && entry.includes('opendpp-node.eu/contexts/dpp/'))
    || (Object.keys(object(entry)).some((key) => key === 'DigitalProductPassport')
      && text(object(entry)['DigitalProductPassport']).includes('opendpp-node.eu/ns/dpp#')),
  );
  const type = root['@type'];
  const types = Array.isArray(type) ? type : [type];
  return hasContext && types.includes('DigitalProductPassport');
}

export function formatOpenDppPassport(input: unknown): FormattedPassport | null {
  const root = object(input);
  if (!isOpenDpp(root)) return null;

  const operator = object(root['economicOperator']);
  const facility = object(root['manufacturingFacility']);
  const capacity = object(root['electrochemicalCapacity']);
  const durability = object(root['durability']);
  const footprint = object(root['carbonFootprint']);
  const recycled = object(root['recycledContentShare']);
  const compliance = object(root['regulatoryCompliance']);
  const groups = [
    group('Produktidentität', [
      field('Produkt', root['productName']), field('Produkt-ID', root['productId']),
      field('Pass-ID', root['digitalProductPassportId'] ?? root['id']),
      field('Kennzeichnungssystem', root['productIdScheme']),
      field('Granularität', root['granularity']),
    ]),
    group('Batteriedaten', [
      field('Kategorie', root['batteryCategory'] ?? root['category']),
      field('Chemie', root['chemistry']),
      field('Kapazität', capacity['value'], text(capacity['unit'])),
      field('Ladezustand', root['stateOfCharge'], '%'),
      field('Zyklenlebensdauer', durability['cycleLife'], 'Zyklen'),
      field('Kalenderlebensdauer', durability['calendarLifeYears'], 'Jahre'),
    ]),
    group('Herstellung', [
      field('Hersteller', operator['name']), field('Rolle', operator['role']),
      field('Register-ID', operator['regId']), field('Werk', facility['name']),
      field('Standort-ID', facility['gln'] ?? facility['id']),
      field('Land', facility['country'] ?? root['originCountry']),
      field('Tätigkeit', facility['activity']),
    ]),
    group('CO₂-Fußabdruck', [
      field('Gesamt', footprint['co2eKg'], text(footprint['unit'])),
      field('Scope 1', footprint['scope1'], text(footprint['unit'])),
      field('Scope 2', footprint['scope2'], text(footprint['unit'])),
      field('Scope 3', footprint['scope3'], text(footprint['unit'])),
    ]),
    group('Rezyklatanteile', Object.entries(recycled).map(([key, amount]) =>
      field(key.charAt(0).toUpperCase() + key.slice(1), amount, '%'))),
    group('Konformität', [field('CE-Kennzeichnung', compliance['ceMarking'] === true ? 'Ja' : compliance['ceMarking'] === false ? 'Nein' : '')]),
    group('Pass', [
      field('Status', root['dppStatus'] ?? root['status']),
      field('Schemaversion', root['dppSchemaVersion']),
      field('Erstellt', root['createdAt']), field('Aktualisiert', root['lastUpdated'] ?? root['updatedAt']),
    ]),
  ].filter((item): item is DisplayGroup => item !== null);

  const documents = [
    { label: 'GS1 Digital Link', url: text(root['digitalLinkUri']) },
    { label: 'Konformitätserklärung (externer Verweis)', url: text(compliance['declarationOfConformityUrl']) },
  ].filter((item) => /^https:\/\//i.test(item.url));

  const claims = (Array.isArray(compliance['certificates']) ? compliance['certificates'] : [])
    .map((entry) => {
      const certificate = object(entry);
      return group(text(certificate['name']) || 'Zertifikat', [
        field('Aussteller', certificate['issuer']), field('Referenz', certificate['referenceNumber']),
        field('Gültig bis', certificate['validUntil']),
      ]);
    }).filter((item): item is DisplayGroup => item !== null);

  const materialEntries = Array.isArray(root['materialComposition']) ? root['materialComposition'] : [];
  const materials = materialEntries
    .map((entry) => {
      const material = object(entry);
      return group(text(material['material']) || 'Material', [field('Anteil', material['percentage'], '%')]);
    }).filter((item): item is DisplayGroup => item !== null);

  return {
    title: text(root['productName']) || text(root['productId']) || 'Produktpass',
    description: text(root['disambiguatingDescription']),
    groups, documents, claims, materials,
    materialChart: createMaterialChart(materialEntries.map((entry, index) => {
      const material = object(entry);
      const raw = material['percentage'];
      return {
        label: text(material['material']) || `Material ${index + 1}`,
        percentage: typeof raw === 'number' ? raw : typeof raw === 'string' && raw.trim() ? Number(raw) : NaN,
      };
    })),
  };
}
