/**
 * Minimale Typen für das AAS-V3-JSON-Format, so weit das Plugin sie braucht.
 * Unbekannte Felder bleiben über die Index-Signatur erhalten und werden beim Speichern
 * unverändert zurückgeschrieben.
 */

export interface AasKey {
  type: string;
  value: string;
}

export interface AasReference {
  type: 'ExternalReference' | 'ModelReference';
  keys: AasKey[];
}

export interface LangString {
  language: string;
  text: string;
}

export interface SubmodelElement {
  modelType: string;
  idShort?: string;
  semanticId?: AasReference;
  displayName?: LangString[];
  [key: string]: unknown;
}

export interface Entity extends SubmodelElement {
  modelType: 'Entity';
  entityType: 'SelfManagedEntity' | 'CoManagedEntity';
  globalAssetId?: string;
  statements?: SubmodelElement[];
}

export interface Property extends SubmodelElement {
  modelType: 'Property';
  valueType: string;
  value?: string;
}

export interface RelationshipElement extends SubmodelElement {
  modelType: 'RelationshipElement';
  first: AasReference;
  second: AasReference;
}

export interface ReferenceElement extends SubmodelElement {
  modelType: 'ReferenceElement';
  value?: AasReference;
}

export interface Submodel {
  modelType: 'Submodel';
  id: string;
  idShort?: string;
  kind?: string;
  semanticId?: AasReference;
  supplementalSemanticIds?: AasReference[];
  submodelElements?: SubmodelElement[];
  [key: string]: unknown;
}

export interface AssetInformation {
  assetKind: string;
  globalAssetId?: string;
  assetType?: string;
  [key: string]: unknown;
}

export interface AssetAdministrationShell {
  modelType?: 'AssetAdministrationShell';
  id: string;
  idShort?: string;
  displayName?: LangString[];
  assetInformation: AssetInformation;
  submodels?: AasReference[];
  [key: string]: unknown;
}

export function globalReference(value: string): AasReference {
  return { type: 'ExternalReference', keys: [{ type: 'GlobalReference', value }] };
}

export function hasSemanticId(element: { semanticId?: AasReference }, prefix: string): boolean {
  return element.semanticId?.keys.some((key) => key.value.startsWith(prefix)) ?? false;
}

export function isEntity(element: SubmodelElement | undefined): element is Entity {
  return element?.modelType === 'Entity';
}

export function isProperty(element: SubmodelElement | undefined): element is Property {
  return element?.modelType === 'Property';
}

export function isReferenceElement(
  element: SubmodelElement | undefined,
): element is ReferenceElement {
  return element?.modelType === 'ReferenceElement';
}

export function stringProperty(
  idShort: string,
  value: string,
  valueType = 'xs:string',
  semanticId?: string,
): Property {
  return {
    modelType: 'Property',
    idShort,
    valueType,
    value,
    ...(semanticId ? { semanticId: globalReference(semanticId) } : {}),
  };
}

export function displayText(names: LangString[] | undefined, language = 'de'): string | undefined {
  if (!names?.length) {
    return undefined;
  }
  return (names.find((name) => name.language.startsWith(language)) ?? names[0]).text;
}

/** idShort nach AAS 3.1: Buchstabe am Anfang, danach Buchstaben, Ziffern, '_' oder '-'. */
export function toIdShort(raw: string, fallback: string): string {
  const cleaned = raw
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9_]+/g, '_')
    .replace(/^[^a-zA-Z]+/, '')
    .replace(/_+$/, '');
  return cleaned.length > 0 ? cleaned.slice(0, 60) : fallback;
}

export function base64UrlEncode(value: string): string {
  const bytes = new TextEncoder().encode(value);
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}
