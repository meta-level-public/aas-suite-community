import * as aas from '@aas-core-works/aas-core3.1-typescript';

// Reads an Asset Interfaces Description (IDTA 02017, versions 1.0 and 1.2) into a
// user oriented structure. Elements are matched by semanticId and, as fallback, by idShort.

export type AidInteractionKind = 'property' | 'action' | 'event';

export interface AidDetail {
  label: string;
  value: string;
}

export interface AidForm {
  href: string;
  /** href resolved against the base URL of the interface */
  url: string;
  method: string;
  contentType: string;
  /** Further protocol specific settings, e.g. MQTT QoS, Modbus function or HTTP headers */
  details: AidDetail[];
}

export interface AidDataPoint {
  /** Unique path within the interface, e.g. "properties.Status.wifi.rssi_dbm" */
  id: string;
  idShort: string;
  name: string;
  kind: AidInteractionKind;
  dataType: string;
  /** Unit as readable symbol, e.g. "°C" */
  unit: string;
  /** Unit as given in the description, e.g. the UN/ECE code "Cel" */
  unitCode: string;
  range: string;
  observable: boolean;
  form: AidForm | null;
  children: AidDataPoint[];
}

export interface AidSecurityScheme {
  idShort: string;
  scheme: string;
  in: string;
  name: string;
  description: string;
}

export interface AidInterface {
  idShort: string;
  title: string;
  baseUrl: string;
  contentType: string;
  protocol: string;
  securitySchemes: AidSecurityScheme[];
  dataPoints: AidDataPoint[];
}

type Element = aas.types.ISubmodelElement;
type Collection = aas.types.SubmodelElementCollection;

const SEM = {
  interface: '/assetinterfacesdescription/1/0/interface',
  endpointMetadata: '/assetinterfacesdescription/1/0/endpointmetadata',
  interactionMetadata: '/assetinterfacesdescription/1/0/interactionmetadata',
  title: 'wot/td#title',
  baseUri: 'wot/td#baseuri',
  contentType: 'hypermedia#forcontenttype',
  securityDefinitions: 'wot/td#definessecurityscheme',
  scheme: 'security#securityscheme',
  propertyAffordance: 'wot/td#propertyaffordance',
  actionAffordance: 'wot/td#actionaffordance',
  eventAffordance: 'wot/td#eventaffordance',
  key: '/assetinterfacesdescription/1/0/key',
  type: '22-rdf-syntax-ns#type',
  unit: 'schema.org/unitcode',
  observable: 'wot/td#isobservable',
  properties: 'json-schema#properties',
  items: 'json-schema#items',
  minimum: 'json-schema#minimum',
  maximum: 'json-schema#maximum',
  forms: 'wot/td#hasform',
  href: 'hypermedia#hastarget',
  method: 'http#methodname',
  headers: 'http#headers',
};

export function parseAssetInterfaces(submodel: aas.types.Submodel | null | undefined): AidInterface[] {
  return collections(submodel?.submodelElements)
    .filter((el) => hasSemanticId(el, SEM.interface) || (el.idShort ?? '').toLowerCase().startsWith('interface'))
    .map((entry) => parseInterface(entry));
}

/** Number of data points including nested ones */
export function countDataPoints(dataPoints: AidDataPoint[]): number {
  return dataPoints.reduce((sum, point) => sum + 1 + countDataPoints(point.children), 0);
}

/** Number of data points that define their own form (endpoint) */
export function countForms(dataPoints: AidDataPoint[]): number {
  return dataPoints.reduce((sum, point) => sum + (point.form != null ? 1 : 0) + countForms(point.children), 0);
}

function parseInterface(entry: Collection): AidInterface {
  const endpointMetadata = findCollection(entry.value, SEM.endpointMetadata, 'EndpointMetadata');
  const interactionMetadata = findCollection(entry.value, SEM.interactionMetadata, 'InteractionMetadata');
  const baseUrl = findValue(endpointMetadata?.value, SEM.baseUri, 'base', 'baseURI');

  return {
    idShort: entry.idShort ?? '',
    title: findValue(entry.value, SEM.title, 'title'),
    baseUrl,
    contentType: findValue(endpointMetadata?.value, SEM.contentType, 'contentType'),
    protocol: detectProtocol(baseUrl, entry),
    securitySchemes: parseSecuritySchemes(endpointMetadata),
    dataPoints: parseInteractions(interactionMetadata, baseUrl),
  };
}

function parseInteractions(interactionMetadata: Collection | undefined, baseUrl: string): AidDataPoint[] {
  const groups: { kind: AidInteractionKind; semanticId: string; idShort: string }[] = [
    { kind: 'property', semanticId: SEM.propertyAffordance, idShort: 'properties' },
    { kind: 'action', semanticId: SEM.actionAffordance, idShort: 'actions' },
    { kind: 'event', semanticId: SEM.eventAffordance, idShort: 'events' },
  ];

  return groups.flatMap((group) => {
    const collection = findCollection(interactionMetadata?.value, group.semanticId, group.idShort);
    return collections(collection?.value).map((entry) =>
      parseDataPoint(entry, group.kind, group.idShort, baseUrl, true),
    );
  });
}

function parseDataPoint(
  entry: Collection,
  kind: AidInteractionKind,
  parentId: string,
  baseUrl: string,
  isAffordance: boolean,
): AidDataPoint {
  const idShort = entry.idShort ?? '';
  const id = `${parentId}.${idShort}`;
  const items = findCollection(entry.value, SEM.items, 'items');
  const itemType = findValue(items?.value, SEM.type, 'type');
  const dataType = findValue(entry.value, SEM.type, 'type');
  const unitCode = findValue(entry.value, SEM.unit, 'unit', 'unitCode');
  const formsCollection = isAffordance ? findCollection(entry.value, SEM.forms, 'forms') : undefined;

  // Object properties are nested directly, properties of array items below "items"
  const nestedProperties =
    findCollection(entry.value, SEM.properties, 'properties') ??
    findCollection(items?.value, SEM.properties, 'properties');

  return {
    id,
    idShort,
    name: findValue(entry.value, SEM.title, 'title') || findValue(entry.value, SEM.key, 'key') || idShort,
    kind,
    dataType: dataType === 'array' && itemType !== '' ? `array<${itemType}>` : dataType,
    unit: unitSymbol(unitCode),
    unitCode,
    range: readRange(entry.value),
    observable: findValue(entry.value, SEM.observable, 'observable', 'isObservable').toLowerCase() === 'true',
    form: formsCollection != null ? parseForm(formsCollection, baseUrl) : null,
    children: collections(nestedProperties?.value).map((child) => parseDataPoint(child, kind, id, baseUrl, false)),
  };
}

function parseForm(form: Collection, baseUrl: string): AidForm {
  const href = findValue(form.value, SEM.href, 'href', 'target');
  const known = new Set(['href', 'target', 'contenttype', 'htv_methodname', 'methodname']);
  const details: AidDetail[] = (form.value ?? [])
    .filter((el): el is aas.types.Property => el instanceof aas.types.Property)
    .filter((el) => !known.has((el.idShort ?? '').toLowerCase()) && !hasSemanticId(el, SEM.href))
    .map((el) => ({ label: el.idShort ?? '', value: `${el.value ?? ''}`.trim() }))
    .filter((detail) => detail.value !== '');

  // HTTP headers are a list of collections with fieldName and fieldValue
  const headers = findElement(form.value, SEM.headers, 'htv_headers', 'headers');
  for (const header of collections(
    headers instanceof aas.types.SubmodelElementCollection || headers instanceof aas.types.SubmodelElementList
      ? headers.value
      : [],
  )) {
    const name = findValue(header.value, 'http#fieldname', 'htv_fieldName', 'fieldName');
    const value = findValue(header.value, 'http#fieldvalue', 'htv_fieldValue', 'fieldValue');
    if (name !== '') details.push({ label: name, value });
  }

  return {
    href,
    url: resolveUrl(href, baseUrl),
    method: findValue(form.value, SEM.method, 'htv_methodName', 'methodName'),
    contentType: findValue(form.value, SEM.contentType, 'contentType'),
    details,
  };
}

function parseSecuritySchemes(endpointMetadata: Collection | undefined): AidSecurityScheme[] {
  const definitions = findCollection(endpointMetadata?.value, SEM.securityDefinitions, 'securityDefinitions');
  return collections(definitions?.value).map((scheme) => ({
    idShort: scheme.idShort ?? '',
    scheme: findValue(scheme.value, SEM.scheme, 'scheme'),
    in: findValue(scheme.value, 'wot/td#in', 'in'),
    name: findValue(scheme.value, 'wot/td#name', 'name'),
    description: findValue(scheme.value, 'wot/td#description', 'description'),
  }));
}

// Common UN/ECE Recommendation 20 codes used as schema.org unitCode
const UNIT_SYMBOLS: Record<string, string> = {
  CEL: '°C',
  KEL: 'K',
  FAH: '°F',
  P1: '%',
  A97: 'hPa',
  PAL: 'Pa',
  BAR: 'bar',
  MTR: 'm',
  MMT: 'mm',
  SEC: 's',
  MIN: 'min',
  HUR: 'h',
  WTT: 'W',
  KWT: 'kW',
  KWH: 'kWh',
  VLT: 'V',
  AMP: 'A',
  HTZ: 'Hz',
  LUX: 'lx',
  KGM: 'kg',
  LTR: 'l',
};

function unitSymbol(unitCode: string): string {
  return UNIT_SYMBOLS[unitCode.toUpperCase()] ?? unitCode;
}

function readRange(elements: Element[] | null | undefined): string {
  const range = (elements ?? []).find((el): el is aas.types.Range => el instanceof aas.types.Range);
  const min = range?.min ?? findValue(elements, SEM.minimum, 'minimum', 'min');
  const max = range?.max ?? findValue(elements, SEM.maximum, 'maximum', 'max');
  if (!min && !max) return '';
  if (min === max) return `${min}`;
  return `${min ?? ''} – ${max ?? ''}`.trim();
}

function detectProtocol(baseUrl: string, entry: Collection): string {
  const scheme = baseUrl.toLowerCase().split(':')[0];
  if (scheme.startsWith('http')) return 'HTTP';
  if (scheme.startsWith('mqtt')) return 'MQTT';
  if (scheme.startsWith('modbus')) return 'Modbus';

  const supplemental = (entry.supplementalSemanticIds ?? []).map((ref) =>
    `${ref.keys?.[0]?.value ?? ''}`.toLowerCase(),
  );
  if (supplemental.some((id) => id.includes('/mqtt'))) return 'MQTT';
  if (supplemental.some((id) => id.includes('/modbus'))) return 'Modbus';
  if (supplemental.some((id) => id.includes('/http'))) return 'HTTP';
  return '';
}

function resolveUrl(href: string, baseUrl: string): string {
  if (href === '') return baseUrl;
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return href;
  }
}

function hasSemanticId(el: Element, suffix: string): boolean {
  return (el.semanticId?.keys ?? []).some((key) => `${key.value ?? ''}`.toLowerCase().includes(suffix));
}

function collections(elements: Element[] | null | undefined): Collection[] {
  return (elements ?? []).filter((el): el is Collection => el instanceof aas.types.SubmodelElementCollection);
}

function findElement(elements: Element[] | null | undefined, semanticId: string, ...idShorts: string[]) {
  const lowerIdShorts = idShorts.map((idShort) => idShort.toLowerCase());
  return (
    (elements ?? []).find((el) => hasSemanticId(el, semanticId)) ??
    (elements ?? []).find((el) => lowerIdShorts.includes((el.idShort ?? '').toLowerCase()))
  );
}

function findCollection(elements: Element[] | null | undefined, semanticId: string, idShort: string) {
  const found = findElement(collections(elements), semanticId, idShort);
  return found instanceof aas.types.SubmodelElementCollection ? found : undefined;
}

function findValue(elements: Element[] | null | undefined, semanticId: string, ...idShorts: string[]): string {
  const properties = (elements ?? []).filter((el): el is aas.types.Property => el instanceof aas.types.Property);
  const found = findElement(properties, semanticId, ...idShorts);
  return found instanceof aas.types.Property ? `${found.value ?? ''}`.trim() : '';
}
