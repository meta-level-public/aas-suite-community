import type { IconName } from './icons';

type DataObject = Record<string, unknown>;

export interface PassField {
  key: string;
  label: string;
  value: string;
  unit?: string;
  href?: string;
  icon?: IconName;
  flag?: 'yes' | 'no';
  asOf?: string;
  mono?: boolean;
  percent?: number;
}

export interface PassTable { key: string; title: string; icon: IconName; columns: string[]; rows: PassField[][]; }

export interface PassGroup {
  key: string;
  title: string;
  icon: IconName;
  fields: PassField[];
  groups: PassGroup[];
  tables: PassTable[];
}

export interface PassDocument { title: string; url: string; meta: string; }

export interface PassSection {
  id: string;
  title: string;
  icon: IconName;
  semanticId: string;
  layout: 'list' | 'tiles';
  content: PassGroup;
  documents: PassDocument[];
}

export interface PassMetric { key: string; label: string; value: string; unit: string; icon: IconName; hint: string; percent?: number; }

export interface PassLink { label: string; url: string; icon: IconName; imageUrl: string; }

export interface BaSyxNameplate {
  logoUrl: string;
  manufacturer: string;
  designation: string;
  identification: PassField[];
  manufacturing: PassField[];
  contact: PassField[];
  compliance: PassLink[];
}

export interface BaSyxPassport {
  kind: 'battery' | 'product';
  kicker: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  logoUrl: string;
  status: { label: string; tone: 'ok' | 'warn' | 'muted' } | null;
  chips: PassField[];
  identity: PassField[];
  metrics: PassMetric[];
  gauges: PassMetric[];
  nameplate: BaSyxNameplate | null;
  sections: PassSection[];
  emptySections: string[];
}

const labels: Record<string, string> = {
  AddressInformation: 'Adresse und Kontakt', AddressOfSupplier: 'Adresse', AtSoC: 'bei Ladezustand', atSoc: 'bei Ladezustand',
  BatteryCategory: 'Batteriekategorie', BatteryChemistry: 'Batteriechemie', BatteryMass: 'Batteriemasse',
  BatteryMaterialIdentifier: 'Kennung (CAS)', BatteryMaterialLocation: 'Position', BatteryMaterialMass: 'Masse',
  BatteryMaterialName: 'Material', BatteryMaterials: 'Batteriematerialien',
  CRateOfRelevantCycleLifeTest: 'C-Rate des Zyklentests', CapacityEnergyVoltage: 'Kapazität, Energie und Spannung',
  CapacityFade: 'Kapazitätsverlust', CapacityThresholdExhaustion: 'Kapazitätsschwelle Lebensende',
  CapacityThroughput: 'Kapazitätsdurchsatz', CertifiedUsableBatteryEnergy: 'Zertifizierte nutzbare Energie',
  CityTown: 'Ort', ClearName: 'Bezeichnung', CompanyLogo: 'Firmenlogo', ComponentId: 'Komponenten-ID',
  ComponentName: 'Komponente', Components: 'Komponenten', ContactInformation: 'Kontakt',
  CurrentSelfDischargingRate: 'Aktuelle Selbstentladung', DateOfManufacture: 'Herstellungsdatum',
  DateOfPuttingIntoService: 'Inbetriebnahme', DismantlingAndRemovalInformation: 'Demontage und Entnahme',
  Documents: 'Dokumente', EUDeclarationOfConformity: 'EU-Konformitätserklärung', EmailAddress: 'E-Mail',
  EmailAddressOfSupplier: 'E-Mail', EndOfLifeInformation: 'Lebensende', EnergyRoundTripEfficiencyFade: 'Wirkungsgradverlust',
  EnergyThroughput: 'Energiedurchsatz', EvolutionOfSelfDischarge: 'Entwicklung der Selbstentladung',
  ExpectedLifetimeInCalendarYears: 'Erwartete Lebensdauer', ExpectedNumberOfCycles: 'Erwartete Zyklenzahl',
  ExtinguishingAgents: 'Löschmittel', GeneralInformation: 'Allgemeine Angaben',
  HazardousSubstanceClass: 'Gefahrstoffklasse', HazardousSubstanceConcentration: 'Konzentration',
  HazardousSubstanceIdentifier: 'Kennung', HazardousSubstanceImpact: 'Auswirkungen',
  HazardousSubstanceLocation: 'Position', HazardousSubstanceName: 'Gefahrstoff', HazardousSubstances: 'Gefahrstoffe',
  InformationOnAccidents: 'Unfälle', InformationOnCollection: 'Sammlung und Rücknahme',
  InitialInternalResistanceOnBatteryCellLevel: 'Anfangsinnenwiderstand Zelle',
  InitialInternalResistanceOnBatteryModuleLevel: 'Anfangsinnenwiderstand Modul',
  InitialInternalResistanceOnBatteryPackLevel: 'Anfangsinnenwiderstand Pack',
  InitialRoundTripEnergyEfficiency: 'Anfänglicher Wirkungsgrad', InitialSelfDischargingRate: 'Anfängliche Selbstentladung',
  InternalResistanceIncreaseOfBatteryCellLevel: 'Widerstandsanstieg Zelle',
  InternalResistanceIncreaseOfBatteryModuleLevel: 'Widerstandsanstieg Modul',
  InternalResistanceIncreaseOfBatteryPackLevel: 'Widerstandsanstieg Pack',
  IsCriticalRawMaterial: 'Kritischer Rohstoff', LastUpdate: 'Stand', LifeCycleStage: 'Lebenszyklusphase',
  Lifetime: 'Lebensdauer', ManufacturerIdentifier: 'Herstellerkennung', ManufacturerName: 'Hersteller',
  Markings: 'Kennzeichnungen', MaterialComposition: 'Materialzusammensetzung',
  MaxVoltage: 'Maximale Spannung', MaximumPermittedBatteryPower: 'Maximal zulässige Leistung',
  MeasuredTemp: 'Gemessene Temperatur', MinVoltage: 'Minimale Spannung', NameOfSupplier: 'Lieferant',
  NationalCode: 'Land', NegativeEventValue: 'Ereignis', NegativeEvents: 'Negative Ereignisse',
  NominalVoltage: 'Nennspannung', NumberOfFullCycles: 'Vollzyklen', OperatorIdentifier: 'Betreiberkennung',
  OriginalPowerCapability: 'Ursprüngliche Leistungsfähigkeit', PartName: 'Bauteil', PartNumber: 'Teilenummer',
  PostConsumerShare: 'Post-Consumer-Anteil', PostalCode: 'PLZ', PowerCapability: 'Leistungsfähigkeit',
  PowerCapabilityAt: 'Leistung', powerCapabilityAt: 'Leistung', PowerFade: 'Leistungsverlust',
  PreConsumerShare: 'Pre-Consumer-Anteil', ProductImages: 'Produktbilder', RPCLastUpdated: 'Stand',
  RatedCapacity: 'Nennkapazität', RatioNorminalBatteryPowerAndBatteryEnergy: 'Verhältnis Leistung zu Energie',
  RecycledContentInformation: 'Rezyklatanteile', RecycledMaterial: 'Material', RemainingCapacity: 'Restkapazität',
  RemainingEnergy: 'Restenergie', RemainingPowerCapability: 'Verbleibende Leistungsfähigkeit',
  RemainingPowerCapabilityDynamicAt: 'Dynamische Messung', RemainingRoundTripEnergyEfficiency: 'Verbleibender Wirkungsgrad',
  RenewableContent: 'Anteil erneuerbarer Stoffe', Resistance: 'Innenwiderstand',
  ResultsOfTestReportsProvingCompliance: 'Prüfberichte', RoundTripEnergyEfficiency: 'Wirkungsgrad und Selbstentladung',
  RoundTripEnergyEfficiencyAt50PercentOfCycleLife: 'Wirkungsgrad bei 50 % Lebensdauer', SafetyInstructions: 'Sicherheitshinweise',
  SafetyMeasures: 'Sicherheit', SeparateCollection: 'Getrennte Sammlung', SerialNumber: 'Seriennummer', ShortName: 'Kurzname',
  SparePartSources: 'Ersatzteilquellen', StateOfCertifiedEnergy: 'Zertifizierte Energie (SOCE)',
  StateOfCharge: 'Ladezustand (SoC)', Street: 'Straße', SupplierWebAddress: 'Website',
  TechnicalPropertyAreas: 'Technische Eigenschaften', Temperature: 'Temperaturbereich',
  TemperatureInformation: 'Temperaturhistorie', TemperatureRangeIdleState_LowerBoundary: 'Lagertemperatur min.',
  TemperatureRangeIdleState_UpperBoundary: 'Lagertemperatur max.', TimeExtremeHighTemp: 'Zeit bei extremer Hitze',
  TimeExtremeHighTempCharging: 'Laden bei extremer Hitze', TimeExtremeLowTemp: 'Zeit bei extremer Kälte',
  TimeExtremeLowTempCharging: 'Laden bei extremer Kälte', URIOfTheProduct: 'Produkt-URI',
  UniqueFacilityIdentifier: 'Betriebsstättenkennung', WarrantyInformation: 'Garantie', WarrantyPeriod: 'Garantiezeitraum',
  WastePrevention: 'Abfallvermeidung',
};

const units: Record<string, string> = {
  BatteryMass: 'kg', CapacityFade: '%', CapacityThresholdExhaustion: '%', CapacityThroughputValue: 'Ah',
  CertifiedUsableBatteryEnergy: 'kWh', CurrentSelfDischargingRateValue: '%', EnergyRoundTripEfficiencyFade: '%',
  EnergyThroughputValue: 'kWh', EvolutionOfSelfDischargeValue: '%', ExpectedLifetimeInCalendarYears: 'Jahre',
  ExpectedNumberOfCycles: 'Zyklen', InitialRoundTripEnergyEfficiency: '%', InitialSelfDischargingRate: '%',
  MaxVoltage: 'V', MeasuredTemp: '°C', MinVoltage: 'V', NominalVoltage: 'V', NumberOfFullCyclesValue: 'Zyklen',
  PostConsumerShare: '%', PowerFade: '%', PreConsumerShare: '%', RatedCapacity: 'Ah', RemainingCapacityValue: 'Ah',
  RemainingEnergyValue: 'kWh', RemainingRoundTripEnergyEfficiencyValue: '%', RenewableContent: '%',
  RoundTripEnergyEfficiencyAt50PercentOfCycleLife: '%', StateOfCertifiedEnergyValue: '%', StateOfChargeValue: '%',
  TemperatureRangeIdleState_LowerBoundary: '°C', TemperatureRangeIdleState_UpperBoundary: '°C', AtSoC: '%', atSoc: '%',
};

const enums: Record<string, Record<string, string>> = {
  BatteryCategory: {
    ev: 'Elektrofahrzeug (EV)', lmt: 'Leichtes Verkehrsmittel (LMT)', industrial: 'Industriebatterie',
    sli: 'Starterbatterie (SLI)', portable: 'Gerätebatterie',
  },
  NegativeEventValue: { overcharged: 'Überladung', deepDischarged: 'Tiefentladung', overheated: 'Überhitzung' },
  dppStatus: { Active: 'Aktiv', Draft: 'Entwurf', Inactive: 'Inaktiv', Archived: 'Archiviert' },
  granularity: { Item: 'Einzelprodukt', Batch: 'Charge', Model: 'Modell' },
};

const categoryNouns: Record<string, string> = {
  ev: 'Traktionsbatterie', lmt: 'LMT-Batterie', industrial: 'Industriebatterie', sli: 'Starterbatterie', portable: 'Gerätebatterie',
};

const groupIcons: Record<string, IconName> = {
  AddressOfSupplier: 'pin', BatteryChemistry: 'flask', BatteryMaterials: 'layers', CapacityEnergyVoltage: 'battery',
  Components: 'wrench', Documents: 'file', EndOfLifeInformation: 'recycle', GeneralInformation: 'info',
  HazardousSubstances: 'alert', Lifetime: 'hourglass', NegativeEvents: 'alert', OriginalPowerCapability: 'plug',
  PowerCapability: 'plug', RecycledContentInformation: 'recycle', RemainingPowerCapability: 'plug',
  RemainingPowerCapabilityDynamicAt: 'plug', Resistance: 'resistance', RoundTripEnergyEfficiency: 'refresh',
  SafetyMeasures: 'flame', SparePartSources: 'wrench', Temperature: 'thermometer', TemperatureInformation: 'thermometer',
  WarrantyInformation: 'shield',
};

const fieldIcons: [RegExp, IconName][] = [
  [/^BatteryCategory$/, 'car'], [/Mass$/, 'scale'], [/ManufacturerName|NameOfSupplier/, 'building'],
  [/Warranty/, 'shield'], [/RatedCapacity|RemainingCapacity|CapacityThroughput/, 'battery'],
  [/Energy(Value)?$|Voltage$|EnergyThroughput/, 'zap'], [/Fade$|Increase/, 'trendingDown'],
  [/Lifetime|Cycles|NumberOfFullCycles/, 'hourglass'], [/Temp/, 'thermometer'], [/Efficiency/, 'refresh'],
  [/SelfDischarg/, 'trendingDown'], [/StateOf/, 'gauge'], [/Power/, 'plug'], [/Resistance/, 'resistance'],
  [/Date|Year/, 'calendar'], [/LastUpdate|Updated/, 'clock'], [/Accident|NegativeEvent|Hazard/, 'alert'],
  [/Identifier|SerialNumber|PartNumber|ArticleNumber|OrderCode|Id$/, 'hash'], [/Threshold|Ratio|CRate/, 'gauge'], [/URI|Web|Link|Declaration|Report/, 'link'],
  [/Email/, 'mail'], [/Street|City|Postal|Zip|NationalCode/, 'pin'], [/Extinguishing|Safety/, 'flame'],
  [/Collection|Waste|Recycled|Renewable|Consumer/, 'recycle'], [/Dismantling|Part/, 'wrench'],
  [/Material|Component/, 'layers'], [/Chemistry|ClearName|ShortName/, 'flask'], [/LifeCycleStage/, 'refresh'],
];

const sectionTypes: { match: RegExp; title: string; icon: IconName; layout?: 'tiles' }[] = [
  { match: /technicaldata|ahx837/i, title: 'Technische Daten', icon: 'zap' },
  { match: /product_?condition/i, title: 'Zustand und Nutzung', icon: 'activity', layout: 'tiles' },
  { match: /material_?composition/i, title: 'Materialzusammensetzung', icon: 'flask' },
  { match: /circularity/i, title: 'Kreislaufwirtschaft', icon: 'recycle' },
  { match: /carbon|footprint|pcf/i, title: 'CO₂-Fußabdruck', icon: 'leaf' },
  { match: /handover|ahf578/i, title: 'Dokumentation', icon: 'file' },
  { match: /conformity|compliance/i, title: 'Konformität', icon: 'shield' },
];

const numberFormat = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 3 });
const regionNames = typeof Intl.DisplayNames === 'function' ? new Intl.DisplayNames(['de'], { type: 'region' }) : null;

function object(value: unknown): DataObject | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as DataObject : null;
}

function isLangString(value: unknown): value is DataObject[] {
  return Array.isArray(value) && value.length > 0
    && value.every((entry) => object(entry) !== null && 'language' in (entry as DataObject));
}

function isScalar(value: unknown): boolean {
  return value === null || value === undefined || ['string', 'number', 'boolean'].includes(typeof value) || isLangString(value);
}

function text(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) {
    const entries = value.map(object).filter((entry): entry is DataObject => entry !== null);
    const preferred = entries.find((entry) => entry['language'] === 'de' && text(entry['value']))
      ?? entries.find((entry) => entry['language'] === 'en' && text(entry['value']))
      ?? entries.find((entry) => text(entry['value']));
    return preferred ? text(preferred['value']) : '';
  }
  if (typeof value === 'string') return value.trim();
  return typeof value === 'number' || typeof value === 'boolean' ? String(value) : '';
}

function label(key: string): string {
  return labels[key] ?? key.replace(/Value$/, '').replace(/_+\d*_*$/, '').replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ').trim().replace(/^./, (letter) => letter.toUpperCase());
}

function fieldIcon(key: string): IconName | undefined {
  return fieldIcons.find(([pattern]) => pattern.test(key))?.[1];
}

function httpsUrl(value: unknown): string {
  const url = text(value);
  return /^https:\/\//i.test(url) ? url : '';
}

function formatDate(raw: string): string {
  // Midnight UTC timestamps are dates in practice (e.g. UNTP validFrom); showing a local time would mislead.
  if (/T00:00(:00(\.0+)?)?(Z|[+-]00:00)$/.test(raw)) raw = raw.slice(0, 10);
  const date = new Date(raw.replace(/(\.\d{3})\d+/, '$1'));
  if (Number.isNaN(date.getTime())) return raw;
  const day = date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  return raw.includes('T') ? `${day}, ${date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}` : day;
}

function formatDuration(raw: string): string | null {
  const match = /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?$/.exec(raw);
  if (!match || raw === 'P') return null;
  const [years, months, days] = match.slice(1).map((part) => Number(part ?? 0));
  const totalMonths = years * 12 + months;
  const parts: string[] = [];
  if (totalMonths) {
    const inYears = totalMonths % 12 === 0 ? totalMonths / 12 : 0;
    parts.push(inYears ? `${inYears} ${inYears === 1 ? 'Jahr' : 'Jahre'}` : `${totalMonths} Monate`);
  }
  if (days) parts.push(`${days} ${days === 1 ? 'Tag' : 'Tage'}`);
  return parts.join(', ');
}

const identifierKey = /(Identifier|Id|ID|Number|Code|Version|Year|YearOfConstruction|Zipcode|PostalCode)$/;

/** Turns a raw AAS value into a display value with unit, flag and link information. */
export function present(key: string, raw: string): Omit<PassField, 'key' | 'label'> {
  const mapped = enums[key]?.[raw] ?? enums[key]?.[raw.toLowerCase()];
  if (mapped) return { value: mapped };
  if (/^(true|false)$/i.test(raw)) {
    const yes = raw.toLowerCase() === 'true';
    return { value: yes ? 'Ja' : 'Nein', flag: yes ? 'yes' : 'no' };
  }
  if (/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}.*)?$/.test(raw)) return { value: formatDate(raw) };
  const duration = formatDuration(raw);
  if (duration) return { value: duration };
  if (/^[A-Z]{2}$/.test(raw) && /Country|NationalCode/.test(key)) return { value: regionNames?.of(raw) ?? raw };
  if (/^-?\d+(\.\d+)?$/.test(raw) && !identifierKey.test(key)) {
    const unit = units[key] ?? '';
    const numeric = Number(raw);
    return { value: numberFormat.format(numeric), unit, percent: unit === '%' ? Math.max(0, Math.min(100, numeric)) : undefined };
  }
  if (raw.includes('0173-1#07-DAA603')) return { value: 'CE-Kennzeichnung' };
  if (/^https:\/\//i.test(raw)) return { value: raw, href: raw };
  return { value: raw, mono: identifierKey.test(key) || /^0173-1#/.test(raw) };
}

const words: Record<string, string> = {
  ...enums['BatteryCategory'], ...enums['dppStatus'], ...enums['granularity'],
  item: 'Einzelprodukt', batch: 'Charge', model: 'Modell', manufacturer: 'Hersteller',
};

/** Display formatting for already formatted values of other passport formats (dates and common codes). */
export function presentText(raw: string): string {
  const word = words[raw] ?? words[raw.toLowerCase()];
  if (word) return word;
  return /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}.*)?$/.test(raw) ? formatDate(raw) : raw;
}

function makeField(key: string, raw: string, title = label(key)): PassField {
  return { key, label: title, icon: fieldIcon(key), ...present(key, raw) };
}

function isFile(data: DataObject): boolean {
  return 'url' in data && Object.keys(data).every((key) => ['url', 'contentType', 'value'].includes(key));
}

function measurement(data: DataObject): { key: string; raw: string; asOf: string } | null {
  const keys = Object.keys(data);
  const valueKey = keys.find((key) => key.endsWith('Value'));
  if (!valueKey || keys.length !== 2 || !('LastUpdate' in data) || !isScalar(data[valueKey])) return null;
  const lastUpdate = text(data['LastUpdate']);
  return { key: valueKey, raw: text(data[valueKey]), asOf: lastUpdate ? formatDate(lastUpdate) : '' };
}

function emptyGroup(key: string, title = label(key)): PassGroup {
  return { key, title, icon: groupIcons[key] ?? 'layers', fields: [], groups: [], tables: [] };
}

function hasContent(group: PassGroup): boolean {
  return group.fields.length > 0 || group.tables.length > 0 || group.groups.some(hasContent);
}

function itemTitle(key: string, item: DataObject, index: number, count: number): string {
  const nameKey = Object.keys(item).find((name) => /Name(OfSupplier)?$/.test(name) && isScalar(item[name]));
  return (nameKey && text(item[nameKey])) || (count === 1 ? label(key) : `${label(key)} ${index + 1}`);
}

function flatten(item: DataObject): Map<string, { label: string; raw: string; top: boolean }> | null {
  const cells = new Map<string, { label: string; raw: string; top: boolean }>();
  for (const [key, value] of Object.entries(item)) {
    if (isScalar(value)) {
      cells.set(key, { label: label(key), raw: text(value), top: true });
    } else if (Array.isArray(value) && value.every(isScalar)) {
      cells.set(key, { label: label(key), raw: value.map(text).filter(Boolean).join('; '), top: true });
    } else {
      const nested = object(value);
      if (!nested || !Object.values(nested).every((child) => isScalar(child))) return null;
      for (const [childKey, child] of Object.entries(nested)) {
        cells.set(`${key}.${childKey}`, { label: label(childKey), raw: text(child), top: false });
      }
    }
  }
  return cells;
}

/** Orders table columns: naming columns first, then other direct values, then nested values. */
function columnRank(cellKey: string): number {
  if (cellKey.includes('.')) return 2;
  return /Name$|Value$|Material$/.test(cellKey) ? 0 : 1;
}

function toTable(key: string, items: DataObject[]): PassTable | null {
  const flat = items.map(flatten);
  if (flat.some((row) => row === null)) return null;
  const rows = (flat as NonNullable<ReturnType<typeof flatten>>[])
    .filter((row) => [...row.values()].some((cell) => cell.top && cell.raw));
  const keys = [...new Set(rows.flatMap((row) => [...row.keys()]))]
    .filter((cellKey) => rows.some((row) => row.get(cellKey)?.raw))
    .sort((a, b) => columnRank(a) - columnRank(b));
  const valueKey = (cellKey: string) => cellKey.split('.').at(-1) ?? cellKey;
  return {
    key, title: label(key), icon: groupIcons[key] ?? 'layers',
    columns: keys.map((cellKey) => rows.map((row) => row.get(cellKey)?.label).find(Boolean) ?? label(valueKey(cellKey))),
    rows: rows.map((row) => keys.map((cellKey) => {
      const cell = row.get(cellKey);
      return cell?.raw ? makeField(valueKey(cellKey), cell.raw, cell.label) : { key: cellKey, label: '', value: '' };
    })),
  };
}

function addEntry(group: PassGroup, key: string, value: unknown): void {
  if (isScalar(value)) {
    const raw = text(value);
    if (raw) group.fields.push(makeField(key, raw));
    return;
  }
  if (Array.isArray(value)) {
    if (value.every(isScalar)) {
      const values = value.map(text).filter(Boolean);
      if (values.length > 1 && values.every((entry) => /^https:\/\//i.test(entry))) {
        values.forEach((entry, index) => group.fields.push(makeField(key, entry, `${label(key)} ${index + 1}`)));
      } else if (values.length) {
        group.fields.push(makeField(key, values.join('; ')));
      }
      return;
    }
    const items = value.map(object).filter((item): item is DataObject => item !== null);
    if (items.every(isFile)) {
      items.map((item) => httpsUrl(item['url'])).filter(Boolean).forEach((url, index, urls) =>
        group.fields.push({ key, label: urls.length > 1 ? `${label(key)} ${index + 1}` : label(key),
          value: 'Datei öffnen', href: url, icon: 'image' }));
      return;
    }
    const table = toTable(key, items);
    if (table) {
      if (table.rows.length) group.tables.push(table);
      return;
    }
    items.forEach((item, index) => {
      const child = buildGroup(key, item, itemTitle(key, item, index, items.length));
      if (hasContent(child)) group.groups.push(child);
    });
    return;
  }
  const data = object(value);
  if (!data) return;
  if (isFile(data)) {
    const url = httpsUrl(data['url']);
    if (url) group.fields.push({ key, label: label(key), value: 'Datei öffnen', href: url, icon: 'image', unit: text(data['contentType']) });
    return;
  }
  const reading = measurement(data);
  if (reading) {
    if (reading.raw) {
      group.fields.push({ ...makeField(reading.key, reading.raw, label(key)), key, asOf: reading.asOf, icon: fieldIcon(key) });
    }
    return;
  }
  const child = buildGroup(key, data);
  if (hasContent(child)) group.groups.push(child);
}

function buildGroup(key: string, data: DataObject, title = label(key)): PassGroup {
  const group = emptyGroup(key, title);
  for (const [name, value] of Object.entries(data)) addEntry(group, name, value);
  return group;
}

/** Finds the first value stored under the given idShort anywhere below the input. */
function find(input: unknown, key: string): unknown {
  const data = object(input);
  if (data) {
    if (key in data) return data[key];
    for (const value of Object.values(data)) {
      const found = find(value, key);
      if (found !== undefined) return found;
    }
  } else if (Array.isArray(input) && !isLangString(input)) {
    for (const value of input) {
      const found = find(value, key);
      if (found !== undefined) return found;
    }
  }
  return undefined;
}

function documents(data: DataObject): PassDocument[] {
  const entries = find(data, 'Documents');
  return (Array.isArray(entries) ? entries : []).flatMap((entry) => {
    const titleKey = ['Title', 'DocumentTitle', 'Name'];
    const title = titleKey.map((key) => text(find(entry, key))).find(Boolean) ?? '';
    const file = find(entry, 'DigitalFile') ?? find(entry, 'DigitalFile_00');
    const url = httpsUrl(object(file)?.['url'] ?? file) || httpsUrl(find(entry, 'url'));
    const meta = [text(find(entry, 'ClassName')), text(find(entry, 'Version')), text(find(entry, 'Language'))]
      .filter(Boolean).join(' · ');
    return url ? [{ title: title || 'Dokument', url, meta }] : [];
  });
}

function buildSection(semanticId: string, data: DataObject, index: number): PassSection {
  const type = sectionTypes.find((entry) => entry.match.test(semanticId));
  const content = buildGroup('root', data);
  // Collections that only wrap further collections (e.g. TechnicalPropertyAreas) are flattened.
  content.groups = content.groups.flatMap((group) =>
    !group.fields.length && !group.tables.length ? group.groups : [group]);
  const docs = type?.icon === 'file' ? documents(data) : [];
  if (docs.length) content.groups = content.groups.filter((group) => group.key !== 'Documents');
  const suffix = semanticId.split(/[\/#:]/).filter(Boolean).at(-1) ?? semanticId;
  return {
    id: `submodel-${index + 1}`, title: type?.title ?? label(suffix), icon: type?.icon ?? 'layers',
    semanticId, layout: type?.layout ?? 'list', content, documents: docs,
  };
}

function field(key: string, title: string, input: unknown, icon?: IconName): PassField | null {
  const raw = text(input);
  if (!raw) return null;
  const item = makeField(key, raw, title);
  return icon ? { ...item, icon } : item;
}

function compact<T>(items: (T | null | undefined)[]): T[] {
  return items.filter((item): item is T => item !== null && item !== undefined);
}

function formatNameplate(plate: DataObject): BaSyxNameplate {
  const contact = object(plate['ContactInformation']) ?? object(object(plate['AddressInformation'])?.['ContactInformation']) ?? {};
  const email = text(object(contact['Email'])?.['EmailAddress']);
  const phone = object(contact['Phone']) ?? {};
  const chatKey = Object.keys(contact).find((key) => key.startsWith('IPCommunication'));
  const chat = object(chatKey ? contact[chatKey] : undefined) ?? {};
  const manufacturer = text(plate['ManufacturerName']);
  const designation = text(plate['ManufacturerProductDesignation']);
  const phoneNumber = text(phone['TelephoneNumber']);
  const address = [
    text(contact['Street']),
    [text(contact['Zipcode']), text(contact['CityTown'])].filter(Boolean).join(' '),
    text(contact['StateCounty']),
    present('NationalCode', text(contact['NationalCode'])).value,
  ].filter(Boolean).join(', ');

  const markings = Object.values(object(plate['Markings']) ?? (Array.isArray(plate['Markings']) ? plate['Markings'] : []))
    .flatMap((entry) => {
      const marking = object(entry);
      const file = object(marking?.['MarkingFile']);
      const url = httpsUrl(file?.['url']);
      const name = text(marking?.['MarkingName']);
      const title = name.includes('0173-1#07-DAA603') ? 'CE-Kennzeichnung' : name || 'Kennzeichnung';
      return url ? [{ label: title, url, icon: 'shield' as IconName,
        imageUrl: text(file?.['contentType']).startsWith('image/') ? url : '' }] : [];
    });
  const links = (key: string, title: string, icon: IconName) => {
    const value = plate[key];
    const urls = (Array.isArray(value) && !isLangString(value) ? value : [value]).map(httpsUrl).filter(Boolean);
    return urls.map((url, index) => ({ label: urls.length > 1 ? `${title} ${index + 1}` : title, url, icon, imageUrl: '' }));
  };
  const productUrl = httpsUrl(plate['URIOfTheProduct']);

  return {
    logoUrl: httpsUrl(object(plate['CompanyLogo'])?.['url']),
    manufacturer,
    designation,
    identification: compact([
      field('ManufacturerProductDesignation', 'Produktbezeichnung', designation, 'package'),
      field('ManufacturerProductRoot', 'Produktkategorie', plate['ManufacturerProductRoot'], 'tag'),
      field('ManufacturerProductFamily', 'Produktfamilie', plate['ManufacturerProductFamily'], 'tag'),
      field('ManufacturerProductType', 'Produkttyp', plate['ManufacturerProductType'], 'tag'),
      field('ProductArticleNumberOfManufacturer', 'Artikelnummer', plate['ProductArticleNumberOfManufacturer']),
      field('OrderCodeOfManufacturer', 'Bestellnummer', plate['OrderCodeOfManufacturer']),
      field('SerialNumber', 'Seriennummer', plate['SerialNumber']),
      productUrl ? { key: 'URIOfTheProduct', label: 'Produktseite', value: productUrl, href: productUrl, icon: 'globe' as IconName } : null,
    ]),
    manufacturing: compact([
      field('DateOfManufacture', 'Herstellungsdatum', plate['DateOfManufacture']),
      field('YearOfConstruction', 'Baujahr', plate['YearOfConstruction'], 'calendar'),
      field('DateOfPuttingIntoService', 'Inbetriebnahme', plate['DateOfPuttingIntoService']),
      field('CountryOfOrigin', 'Herkunftsland', plate['CountryOfOrigin'], 'globe'),
      field('LifeCycleStage', 'Lebenszyklusphase', plate['LifeCycleStage']),
      field('ManufacturerIdentifier', 'Herstellerkennung', plate['ManufacturerIdentifier']),
      field('UniqueFacilityIdentifier', 'Betriebsstättenkennung', plate['UniqueFacilityIdentifier'], 'factory'),
      field('OperatorIdentifier', 'Betreiberkennung', plate['OperatorIdentifier']),
      field('HardwareVersion', 'Hardware-Version', plate['HardwareVersion'], 'cpu'),
      field('FirmwareVersion', 'Firmware-Version', plate['FirmwareVersion'], 'cpu'),
      field('SoftwareVersion', 'Software-Version', plate['SoftwareVersion'], 'cpu'),
    ]),
    contact: compact([
      field('Company', 'Unternehmen', text(contact['Company']) || manufacturer, 'building'),
      field('Department', 'Abteilung', contact['Department'], 'user'),
      field('Address', 'Adresse', address, 'pin'),
      field('TelephoneNumber', 'Telefon', phoneNumber, 'phone'),
      phoneNumber ? field('PhoneAvailableTime', 'Telefonisch erreichbar', phone['AvailableTime'], 'clock') : null,
      field('Chat', text(chat['TypeOfCommunication']) || 'Online-Kontakt', chat['AvailableTime'], 'message'),
      email ? { key: 'Email', label: 'E-Mail', value: email, href: `mailto:${email}`, icon: 'mail' as IconName } : null,
    ]),
    compliance: [
      ...markings,
      ...links('EUDeclarationOfConformity', 'EU-Konformitätserklärung', 'file'),
      ...links('ResultsOfTestReportsProvingCompliance', 'Prüfbericht', 'award'),
    ],
  };
}

function metric(key: string, title: string, input: unknown, icon: IconName, hint = ''): PassMetric | null {
  const data = object(input);
  const reading = data ? measurement(data) : null;
  const raw = reading ? reading.raw : text(input);
  if (!raw) return null;
  const shown = present(reading?.key ?? key, raw);
  return { key, label: title, value: shown.value, unit: shown.unit ?? '', icon, hint, percent: shown.percent };
}

export function formatBaSyxPassport(input: unknown): BaSyxPassport | null {
  const root = object(input);
  if (!root || typeof root['digitalProductPassportId'] !== 'string'
      || !Array.isArray(root['contentSpecificationIds'])) return null;
  const ids = root['contentSpecificationIds'].filter((id): id is string => typeof id === 'string');
  if (!ids.some((id) => object(root[id]) !== null)) return null;

  const findId = (pattern: RegExp) => ids.find((id) => pattern.test(id));
  const submodel = (id: string | undefined) => object(id ? root[id] : undefined) ?? {};
  const nameplateId = findId(/nameplate/i);
  const technical = submodel(findId(/technicaldata/i));
  const material = submodel(findId(/material_?composition/i));
  const condition = submodel(findId(/product_?condition/i));
  const plate = object(nameplateId ? root[nameplateId] : undefined);
  const formattedPlate = plate ? formatNameplate(plate) : null;
  const nameplate = formattedPlate && (formattedPlate.identification.length || formattedPlate.manufacturing.length
    || formattedPlate.contact.length || formattedPlate.compliance.length || formattedPlate.logoUrl) ? formattedPlate : null;
  const battery = ids.some((id) => /batterypass|digitalbatterypassport/i.test(id));

  const manufacturer = formattedPlate?.manufacturer || text(find(technical, 'ManufacturerName'));
  const categoryRaw = text(find(technical, 'BatteryCategory')).toLowerCase();
  const chemistry = object(find(material, 'BatteryChemistry')) ?? {};
  const chemistryShort = text(chemistry['ShortName']);
  const productId = text(root['uniqueProductIdentifier']);
  const shortId = productId.split('/').filter(Boolean).at(-1) || productId;
  const batteryTitle = [chemistryShort, categoryNouns[categoryRaw] ?? 'Batterie'].filter(Boolean).join('-');
  const title = nameplate?.designation || text(plate?.['ManufacturerProductType'])
    || (battery ? batteryTitle : shortId) || 'Produktpass';

  const statusRaw = text(root['dppStatus']);
  const status = statusRaw ? {
    label: present('dppStatus', statusRaw).value,
    tone: (statusRaw === 'Active' ? 'ok' : statusRaw === 'Draft' ? 'warn' : 'muted') as 'ok' | 'warn' | 'muted',
  } : null;

  const identity = compact([
    field('digitalProductPassportId', 'Pass-ID', root['digitalProductPassportId'], 'passport'),
    field('uniqueProductIdentifier', 'Produkt-ID', root['uniqueProductIdentifier'], 'hash'),
    field('economicOperatorId', 'Wirtschaftsakteur', root['economicOperatorId'], 'building'),
    field('facilityId', 'Betriebsstätte', root['facilityId'], 'factory'),
    field('dppStatus', 'Status', statusRaw, 'check'),
    field('granularity', 'Granularität', root['granularity'], 'layers'),
    field('dppSchemaVersion', 'Schemaversion', root['dppSchemaVersion'], 'info'),
    field('lastUpdate', 'Aktualisiert', root['lastUpdate'], 'clock'),
  ]);
  const chips = identity.filter((item) => ['granularity', 'dppSchemaVersion', 'lastUpdate'].includes(item.key));

  const minVoltage = present('MinVoltage', text(find(technical, 'MinVoltage')));
  const maxVoltage = present('MaxVoltage', text(find(technical, 'MaxVoltage')));
  const voltageRange = minVoltage.value && maxVoltage.value ? `Bereich ${minVoltage.value}–${maxVoltage.value} V` : '';
  const metrics = compact(battery ? [
    metric('BatteryCategory', 'Kategorie', categoryRaw, 'car'),
    metric('BatteryChemistry', 'Zellchemie', chemistryShort || chemistry['ClearName'], 'flask',
      chemistryShort ? text(chemistry['ClearName']) : ''),
    metric('RatedCapacity', 'Nennkapazität', find(technical, 'RatedCapacity'), 'battery'),
    metric('CertifiedUsableBatteryEnergy', 'Nutzbare Energie', find(technical, 'CertifiedUsableBatteryEnergy'), 'zap'),
    metric('NominalVoltage', 'Nennspannung', find(technical, 'NominalVoltage'), 'zap', voltageRange),
    metric('BatteryMass', 'Masse', find(technical, 'BatteryMass'), 'scale'),
    metric('ExpectedLifetimeInCalendarYears', 'Erwartete Lebensdauer', find(technical, 'ExpectedLifetimeInCalendarYears'), 'hourglass'),
    metric('WarrantyPeriod', 'Garantie', find(technical, 'WarrantyPeriod'), 'shield'),
  ] : [
    metric('ManufacturerName', 'Hersteller', manufacturer, 'building'),
    metric('ManufacturerProductType', 'Produkttyp', plate?.['ManufacturerProductType'], 'tag'),
    metric('ProductArticleNumberOfManufacturer', 'Artikelnummer', plate?.['ProductArticleNumberOfManufacturer'], 'hash'),
    metric('SerialNumber', 'Seriennummer', plate?.['SerialNumber'], 'hash'),
    metric('DateOfManufacture', 'Herstellungsdatum', plate?.['DateOfManufacture'], 'calendar'),
    metric('CountryOfOrigin', 'Herkunftsland', plate?.['CountryOfOrigin'], 'globe'),
    metric('HardwareVersion', 'Hardware', plate?.['HardwareVersion'], 'cpu'),
    metric('FirmwareVersion', 'Firmware', plate?.['FirmwareVersion'], 'cpu'),
  ]);

  const asOf = (key: string) => {
    const reading = object(find(condition, key));
    return reading ? measurement(reading)?.asOf ?? '' : '';
  };
  const gauges = compact([
    metric('StateOfCertifiedEnergy', 'Zertifizierte Energie', find(condition, 'StateOfCertifiedEnergy'), 'gauge', asOf('StateOfCertifiedEnergy')),
    metric('StateOfCharge', 'Ladezustand', find(condition, 'StateOfCharge'), 'battery', asOf('StateOfCharge')),
    metric('RemainingRoundTripEnergyEfficiency', 'Wirkungsgrad', find(condition, 'RemainingRoundTripEnergyEfficiency'), 'refresh',
      asOf('RemainingRoundTripEnergyEfficiency')),
  ]).filter((gauge) => gauge.percent !== undefined);

  const built = ids.filter((id) => id !== nameplateId && object(root[id]))
    .map((id, index) => buildSection(id, root[id] as DataObject, index));
  const images = find(technical, 'ProductImages');

  return {
    kind: battery ? 'battery' : 'product',
    kicker: battery ? 'Digitaler Batteriepass' : 'Digitaler Produktpass',
    title,
    subtitle: [manufacturer, battery && nameplate?.designation ? batteryTitle : ''].filter(Boolean).join(' · '),
    imageUrl: (Array.isArray(images) ? images : [images]).map((image) => httpsUrl(object(image)?.['url'])).find(Boolean) ?? '',
    logoUrl: nameplate?.logoUrl || httpsUrl(object(find(technical, 'CompanyLogo'))?.['url']),
    status,
    chips,
    identity,
    metrics,
    gauges,
    nameplate,
    sections: built.filter((section) => hasContent(section.content) || section.documents.length),
    emptySections: [
      ...(plate && !nameplate ? ['Typenschild'] : []),
      ...built.filter((section) => !hasContent(section.content) && !section.documents.length).map((section) => section.title),
    ],
  };
}
