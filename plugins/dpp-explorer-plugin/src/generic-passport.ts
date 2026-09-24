export interface GenericNode {
  label: string;
  value?: string;
  href?: string;
  children?: GenericNode[];
}

export interface GenericPassport {
  title: string;
  description: string;
  nodes: GenericNode[];
}

type DataObject = Record<string, unknown>;

const labels: Record<string, string> = {
  '@context': 'Kontext', '@id': 'Kennung', '@type': 'Typ',
  id: 'Kennung', name: 'Name', productName: 'Produkt', productId: 'Produkt-ID',
  digitalProductPassportId: 'Pass-ID', uniqueProductIdentifier: 'Eindeutige Produktkennung',
  economicOperator: 'Wirtschaftsakteur', manufacturingFacility: 'Herstellungsort',
  materialComposition: 'Materialzusammensetzung', carbonFootprint: 'CO₂-Fußabdruck',
  batteryCategory: 'Batteriekategorie', stateOfCharge: 'Ladezustand',
  relatedDocument: 'Dokumente', credentialSubject: 'Produktdaten',
  issuer: 'Aussteller', proof: 'Signatur/Nachweis',
};

function record(input: unknown): DataObject | null {
  return input !== null && typeof input === 'object' && !Array.isArray(input)
    ? input as DataObject : null;
}

function name(input: unknown): string {
  return typeof input === 'string' || typeof input === 'number' ? String(input) : '';
}

function label(key: string): string {
  return labels[key] ?? key.replace(/([a-z\d])([A-Z])/g, '$1 $2').replace(/[_-]/g, ' ').replace(/^./, (letter) => letter.toUpperCase());
}

function scalar(input: unknown): string {
  if (input === null) return '–';
  if (typeof input === 'boolean') return input ? 'Ja' : 'Nein';
  return String(input);
}

function measure(input: DataObject): string | null {
  const keys = Object.keys(input);
  if (!('value' in input) || !keys.every((key) => ['value', 'unit', '@type', 'type'].includes(key))) return null;
  const unit = name(input['unit']);
  return `${scalar(input['value'])}${unit ? ` ${unit === 'KGM' ? 'kg' : unit}` : ''}`;
}

function titleFor(item: unknown, index: number): string {
  const object = record(item);
  if (!object) return `Eintrag ${index + 1}`;
  return name(object['name']) || name(object['productName']) || name(object['title']) || `Eintrag ${index + 1}`;
}

function node(key: string, input: unknown): GenericNode {
  const title = label(key);
  const object = record(input);
  if (object) {
    const reading = measure(object);
    if (reading) return { label: title, value: reading };
    return { label: title, children: Object.entries(object).map(([childKey, child]) => node(childKey, child)) };
  }
  if (Array.isArray(input)) {
    if (input.length === 0) return { label: title, value: 'Keine Einträge' };
    return { label: `${title} (${input.length})`, children: input.map((item, index) => node(titleFor(item, index), item)) };
  }
  const value = scalar(input);
  return { label: title, value, href: typeof input === 'string' && /^https:\/\//i.test(input) ? input : undefined };
}

export function formatGenericPassport(input: unknown): GenericPassport {
  const object = record(input);
  if (!object) return { title: 'Digital Product Passport', description: '', nodes: [node('Daten', input)] };
  const subject = record(object['credentialSubject']);
  const title = name(object['productName']) || name(subject?.['name']) || name(object['name']) || 'Digital Product Passport';
  const description = name(object['disambiguatingDescription']) || name(subject?.['description']) || name(object['description']);
  const entries = Object.entries(object).sort(([a], [b]) => {
    const priority = (key: string) => ['@context', 'proof', 'digitalSeal', 'signingPublicKey'].includes(key) ? 1 : 0;
    return priority(a) - priority(b);
  });
  return { title, description, nodes: entries.map(([key, value]) => node(key, value)) };
}
