import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { TreeNode } from 'primeng/api';

type EnumObject = Record<string, string | number>;

export interface BatteryEditorFieldLike {
  idShort?: string;
  label?: string;
  path?: string;
  description?: string;
  element?: any;
}

export interface BatteryEditorTreeItem<TField = never> {
  key: string;
  label: string;
  path: string;
  description: string;
  kind: 'field' | 'container' | 'special';
  fields: TField[];
  children: BatteryEditorTreeItem<TField>[];
  element?: any;
  icon?: string;
}

export interface BatteryEditorSelectOption {
  label: string;
  value: string;
}

export function getBatteryEditorChildElements(element: any): any[] {
  const submodelElements = element?.submodelElements;
  if (Array.isArray(submodelElements)) {
    return submodelElements;
  }
  if (isIterableValue(submodelElements)) {
    return Array.from(submodelElements);
  }

  const value = element?.value;
  if (Array.isArray(value)) {
    return value;
  }
  if (isIterableValue(value)) {
    return Array.from(value);
  }
  return [];
}

export function getBatteryEditorModelTypeName(element: any): string {
  const rawType = element?.modelType?.name ?? element?.modelType;
  if (typeof rawType === 'string') {
    return rawType;
  }
  const ctorName = rawType?.constructor?.name;
  if (typeof ctorName === 'string' && ctorName.length > 0 && ctorName !== 'Object') {
    return ctorName;
  }
  return rawType != null ? String(rawType) : '';
}

export function isBatteryEditorContainerElement(element: any, modelTypeLower?: string) {
  const normalizedModelType = `${modelTypeLower ?? getBatteryEditorModelTypeName(element)}`.trim().toLowerCase();
  return normalizedModelType === 'submodelelementcollection' || normalizedModelType === 'submodelelementlist';
}

export function createBatteryEditorTreeKey(pathSegments: string[]) {
  return pathSegments
    .map((segment) => `${segment}`.trim().replace(/[^a-zA-Z0-9_-]+/g, '_'))
    .filter((segment) => segment !== '')
    .join('__');
}

export function flattenBatteryEditorTreeItems<TField>(
  items: BatteryEditorTreeItem<TField>[],
): BatteryEditorTreeItem<TField>[] {
  return items.flatMap((item) => [item, ...flattenBatteryEditorTreeItems(item.children)]);
}

export function getBatteryEditorTreeItemIndexLabel<TField>(
  items: BatteryEditorTreeItem<TField>[],
  key: string | null | undefined,
): string {
  if (key == null || key === '') {
    return '';
  }

  return findBatteryEditorTreeItemIndexLabel(items, key, []);
}

function findBatteryEditorTreeItemIndexLabel<TField>(
  items: BatteryEditorTreeItem<TField>[],
  key: string,
  parentIndexPath: number[],
): string {
  for (const [index, item] of items.entries()) {
    const currentIndexPath = [...parentIndexPath, index + 1];
    if (item.key === key) {
      return currentIndexPath.join('.');
    }

    const childMatch = findBatteryEditorTreeItemIndexLabel(item.children, key, currentIndexPath);
    if (childMatch !== '') {
      return childMatch;
    }
  }

  return '';
}

export function findBatteryEditorTreeItemByKey<TField>(
  items: BatteryEditorTreeItem<TField>[],
  key: string | null | undefined,
): BatteryEditorTreeItem<TField> | null {
  if (key == null || key === '') {
    return null;
  }

  for (const item of items) {
    if (item.key === key) {
      return item;
    }

    const childMatch = findBatteryEditorTreeItemByKey(item.children, key);
    if (childMatch != null) {
      return childMatch;
    }
  }

  return null;
}

export function getFirstBatteryEditorTreeItem<TField>(items: BatteryEditorTreeItem<TField>[]) {
  return flattenBatteryEditorTreeItems(items)[0] ?? null;
}

export function mapBatteryEditorTreeItemsToNodes<TField>(
  items: BatteryEditorTreeItem<TField>[],
  depth: number = 0,
): TreeNode<BatteryEditorTreeItem<TField>>[] {
  return items.map((item) => ({
    key: item.key,
    label: item.label,
    data: item,
    icon: item.icon,
    selectable: true,
    expanded: depth === 0,
    children: mapBatteryEditorTreeItemsToNodes(item.children, depth + 1),
  }));
}

export function isBatteryEditorMultiLanguagePropertyElement(element: any, modelTypeLower: string): boolean {
  if (modelTypeLower === 'multilanguageproperty' || element instanceof aas.types.MultiLanguageProperty) {
    return true;
  }
  if (!Array.isArray(element?.value)) {
    return false;
  }
  if (element.value.length === 0) {
    return false;
  }
  return element.value.every(
    (entry: any) => entry != null && typeof entry === 'object' && typeof entry.language === 'string' && 'text' in entry,
  );
}

export function isBatteryEditorFileElement(element: any, modelTypeLower: string): boolean {
  return modelTypeLower === 'file' || element instanceof aas.types.File;
}

export function isBatteryEditorBlobElement(element: any, modelTypeLower: string): boolean {
  if (modelTypeLower === 'blob' || element instanceof aas.types.Blob) {
    return true;
  }

  return typeof element?.contentType === 'string' && Object.prototype.hasOwnProperty.call(element ?? {}, 'value');
}

export function isBatteryEditorRangeElement(element: any, modelTypeLower: string): boolean {
  if (modelTypeLower === 'range' || element instanceof aas.types.Range) {
    return true;
  }

  return element?.valueType != null && ('min' in (element ?? {}) || 'max' in (element ?? {}));
}

export function isBatteryEditorReferenceElement(element: any, modelTypeLower: string): boolean {
  if (modelTypeLower === 'referenceelement' || element instanceof aas.types.ReferenceElement) {
    return true;
  }

  return Array.isArray(element?.value?.keys);
}

export function isBatteryEditorPropertyElement(
  element: any,
  modelTypeLower: string,
  options: { supportsFileElement?: boolean; supportsBlobElement?: boolean } = {},
): boolean {
  if (modelTypeLower === 'property' || element instanceof aas.types.Property) {
    return true;
  }

  if (
    isBatteryEditorMultiLanguagePropertyElement(element, modelTypeLower) ||
    isBatteryEditorRangeElement(element, modelTypeLower) ||
    isBatteryEditorReferenceElement(element, modelTypeLower) ||
    (options.supportsFileElement === true && isBatteryEditorFileElement(element, modelTypeLower)) ||
    (options.supportsBlobElement === true && isBatteryEditorBlobElement(element, modelTypeLower))
  ) {
    return false;
  }

  if (getBatteryEditorChildElements(element).length > 0) {
    return false;
  }

  if (modelTypeLower !== '') {
    return false;
  }

  if (element?.valueType != null) {
    return true;
  }

  return (
    Object.prototype.hasOwnProperty.call(element ?? {}, 'value') &&
    (element.value == null || ['string', 'number', 'boolean'].includes(typeof element.value))
  );
}

export function shouldRenderBatteryEditorUnsupported(
  element: any,
  modelTypeLower: string,
  options: { supportsFileElement?: boolean; supportsBlobElement?: boolean } = {},
): boolean {
  if (element == null) {
    return false;
  }

  const supportedTypes = [
    '',
    'property',
    'multilanguageproperty',
    'range',
    'referenceelement',
    'submodelelementcollection',
    'submodelelementlist',
  ];

  if (options.supportsFileElement === true) {
    supportedTypes.push('file');
  }

  if (options.supportsBlobElement === true) {
    supportedTypes.push('blob');
  }

  return !supportedTypes.includes(modelTypeLower);
}

export function getBatteryEditorBlobContentType(contentType: unknown) {
  const normalizedValue = `${contentType ?? ''}`.trim();
  return normalizedValue !== '' ? normalizedValue : null;
}

export function getBatteryEditorBlobValue(value: unknown) {
  return `${value ?? ''}`;
}

export function getBatteryEditorBlobLength(value: unknown) {
  return getBatteryEditorBlobValue(value).length;
}

export function isBatteryEditorTextualBlob(contentType: unknown, value: unknown) {
  const normalizedContentType = `${contentType ?? ''}`.trim().toLowerCase();
  if (normalizedContentType !== '') {
    if (
      normalizedContentType.startsWith('text/') ||
      normalizedContentType.includes('json') ||
      normalizedContentType.includes('xml') ||
      normalizedContentType.includes('yaml') ||
      normalizedContentType.includes('csv') ||
      normalizedContentType.includes('javascript') ||
      normalizedContentType.includes('svg')
    ) {
      return true;
    }

    if (
      normalizedContentType.startsWith('image/') ||
      normalizedContentType === 'application/pdf' ||
      normalizedContentType.startsWith('application/octet-stream')
    ) {
      return false;
    }
  }

  const normalizedValue = getBatteryEditorBlobValue(value).trim();
  if (normalizedValue === '') {
    return true;
  }

  const printableCharacters = normalizedValue.replace(/[\x20-\x7E\n\r\t]/g, '');
  const printableRatio = 1 - printableCharacters.length / normalizedValue.length;
  return printableRatio > 0.9;
}

export function formatBatteryEditorLabel(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim();
}

export function getBatteryEditorElementDisplayName(
  element: any,
  preferredLanguage?: string | null,
  modelTypeName?: string | null,
  fallbackIndex?: number,
) {
  const displayName = resolveBatteryEditorLangString(element?.displayName, preferredLanguage);
  if (displayName !== '') {
    return displayName;
  }

  const idShort = `${element?.idShort ?? ''}`.trim();
  if (idShort !== '') {
    return idShort;
  }

  const semanticLabel = getBatteryEditorSemanticLabel(element);
  if (semanticLabel != null) {
    return semanticLabel;
  }

  const normalizedModelTypeName = `${modelTypeName ?? getBatteryEditorModelTypeName(element)}`.trim();
  if (normalizedModelTypeName !== '') {
    return formatBatteryEditorLabel(normalizedModelTypeName);
  }

  if (fallbackIndex != null) {
    return `Element ${fallbackIndex + 1}`;
  }

  return 'Element';
}

export function resolveBatteryEditorLangString(values: any[] | null | undefined, preferredLanguage?: string | null) {
  const entries = (values ?? []).filter(
    (entry) => entry != null && typeof entry === 'object' && `${entry.text ?? ''}`.trim() !== '',
  );
  if (entries.length === 0) {
    return '';
  }

  const normalizedPreferredLanguage = `${preferredLanguage ?? 'en'}`.trim().toLowerCase() || 'en';
  const preferredBaseLanguage = normalizedPreferredLanguage.split('-')[0];

  const exactMatch = entries.find((entry) => `${entry.language ?? ''}`.toLowerCase() === normalizedPreferredLanguage);
  if (exactMatch != null) {
    return `${exactMatch.text ?? ''}`.trim();
  }

  const baseMatch = entries.find(
    (entry) => `${entry.language ?? ''}`.toLowerCase().split('-')[0] === preferredBaseLanguage,
  );
  if (baseMatch != null) {
    return `${baseMatch.text ?? ''}`.trim();
  }

  const englishMatch = entries.find((entry) => `${entry.language ?? ''}`.toLowerCase().split('-')[0] === 'en');
  if (englishMatch != null) {
    return `${englishMatch.text ?? ''}`.trim();
  }

  return `${entries[0]?.text ?? ''}`.trim();
}

export function resolveBatteryEditorConceptDescriptionDefinition(
  conceptDescription: any,
  preferredLanguage?: string | null,
) {
  const embeddedDataSpecifications = Array.isArray(conceptDescription?.embeddedDataSpecifications)
    ? conceptDescription.embeddedDataSpecifications
    : [];

  for (const specification of embeddedDataSpecifications) {
    const definition = resolveBatteryEditorLangString(
      specification?.dataSpecificationContent?.definition,
      preferredLanguage,
    );
    if (definition !== '') {
      return definition;
    }
  }

  return '';
}

export function resolveBatteryEditorDescriptionFromConceptDescriptions(
  element: any,
  conceptDescriptionSources: Array<readonly any[] | null | undefined>,
  preferredLanguage?: string | null,
  fallbackConceptDescriptionIdShorts: string[] = [],
) {
  const conceptDescriptionsById = new Map<string, any>();
  const conceptDescriptionsByIdShort = new Map<string, any[]>();

  for (const source of conceptDescriptionSources) {
    for (const conceptDescription of source ?? []) {
      const stableId = getBatteryEditorConceptDescriptionStableId(conceptDescription);
      if (stableId !== '' && !conceptDescriptionsById.has(stableId)) {
        conceptDescriptionsById.set(stableId, conceptDescription);
      }

      const normalizedIdShort = `${conceptDescription?.idShort ?? ''}`.trim().toLowerCase();
      if (normalizedIdShort !== '') {
        const existingMatches = conceptDescriptionsByIdShort.get(normalizedIdShort) ?? [];
        existingMatches.push(conceptDescription);
        conceptDescriptionsByIdShort.set(normalizedIdShort, existingMatches);
      }
    }
  }

  for (const semanticId of getBatteryEditorSemanticReferenceValues(element)) {
    const conceptDescription = conceptDescriptionsById.get(semanticId);
    if (conceptDescription == null) {
      continue;
    }

    const definition = resolveBatteryEditorConceptDescriptionDefinition(conceptDescription, preferredLanguage);
    if (definition !== '') {
      return definition;
    }
  }

  const fallbackIdShorts = Array.from(
    new Set(
      [`${element?.idShort ?? ''}`.trim(), ...fallbackConceptDescriptionIdShorts].filter((value) => value !== ''),
    ),
  );

  for (const fallbackIdShort of fallbackIdShorts) {
    const conceptDescriptions = conceptDescriptionsByIdShort.get(fallbackIdShort.toLowerCase()) ?? [];
    for (const conceptDescription of conceptDescriptions) {
      const definition = resolveBatteryEditorConceptDescriptionDefinition(conceptDescription, preferredLanguage);
      if (definition !== '') {
        return definition;
      }
    }
  }

  return '';
}

export function stringifyBatteryEditorDebugValue(value: unknown) {
  const seen = new WeakSet<object>();

  return JSON.stringify(
    value,
    (_key, currentValue) => {
      if (typeof currentValue === 'bigint') {
        return currentValue.toString();
      }

      if (currentValue != null && typeof currentValue === 'object') {
        if (seen.has(currentValue)) {
          return '[Circular]';
        }

        seen.add(currentValue);
      }

      return currentValue;
    },
    2,
  );
}

export function getBatteryEditorValueListOptions(
  element: any,
  conceptDescriptions: aas.types.ConceptDescription[] | null | undefined,
): BatteryEditorSelectOption[] {
  const embeddedOptions = readBatteryEditorValueListOptions(element?.embeddedDataSpecifications);
  if (embeddedOptions.length > 0) {
    return embeddedOptions;
  }

  const semanticIds = getBatteryEditorSemanticIds(element);
  if (semanticIds.length === 0) {
    return [];
  }

  const conceptDescription = getBatteryEditorConceptDescription(element, conceptDescriptions);

  return readBatteryEditorValueListOptions(conceptDescription?.embeddedDataSpecifications);
}

export function getBatteryEditorConceptDescription(
  element: any,
  conceptDescriptions: aas.types.ConceptDescription[] | null | undefined,
) {
  const semanticIds = getBatteryEditorSemanticIds(element);
  if (semanticIds.length === 0) {
    return null;
  }

  return (
    (conceptDescriptions ?? []).find((candidate) => {
      const candidateRecord = candidate as any;
      const conceptDescriptionIds = [
        `${candidateRecord?.id ?? ''}`.trim(),
        `${candidateRecord?.identification?.id ?? ''}`.trim(),
      ].filter((value) => value !== '');

      return conceptDescriptionIds.some((conceptDescriptionId) => semanticIds.includes(conceptDescriptionId));
    }) ?? null
  );
}

function getBatteryEditorSemanticLabel(element: any) {
  const semanticKeys = Array.isArray(element?.semanticId?.keys) ? element.semanticId.keys : [];

  for (const key of semanticKeys) {
    const value = `${key?.value ?? ''}`.trim();
    if (value === '') {
      continue;
    }

    const candidate = value
      .split(/[/#:]+/)
      .map((segment) => segment.trim())
      .filter((segment) => segment !== '')
      .at(-1);

    if (candidate != null && /^[A-Za-z][A-Za-z0-9_-]*$/.test(candidate)) {
      return candidate;
    }
  }

  return null;
}

function getBatteryEditorSemanticReferenceValues(element: any) {
  const references = [
    element?.semanticId,
    ...(Array.isArray(element?.supplementalSemanticIds) ? element.supplementalSemanticIds : []),
  ];

  return references
    .flatMap((reference) => (Array.isArray(reference?.keys) ? reference.keys : []))
    .map((key) => `${key?.value ?? ''}`.trim())
    .filter((value) => value !== '');
}

function getBatteryEditorConceptDescriptionStableId(conceptDescription: any) {
  const directId = `${conceptDescription?.id ?? ''}`.trim();
  if (directId !== '') {
    return directId;
  }

  return `${conceptDescription?.identification?.id ?? ''}`.trim();
}

function getBatteryEditorSemanticIds(element: any) {
  const semanticKeys = Array.isArray(element?.semanticId?.keys) ? element.semanticId.keys : [];

  return semanticKeys.map((key: any) => `${key?.value ?? ''}`.trim()).filter((value: string) => value !== '');
}

function readBatteryEditorValueListOptions(
  embeddedDataSpecifications: aas.types.EmbeddedDataSpecification[] | null | undefined,
): BatteryEditorSelectOption[] {
  const optionMap = new Map<string, BatteryEditorSelectOption>();

  for (const embeddedDataSpecification of embeddedDataSpecifications ?? []) {
    const pairs = (embeddedDataSpecification?.dataSpecificationContent as any)?.valueList?.valueReferencePairs;
    if (!Array.isArray(pairs)) {
      continue;
    }

    for (const pair of pairs) {
      const value = `${pair?.value ?? ''}`.trim();
      if (value === '' || optionMap.has(value)) {
        continue;
      }

      optionMap.set(value, {
        label: value,
        value,
      });
    }
  }

  return Array.from(optionMap.values());
}

export function getBatteryEditorRangeValueTypeLabel(valueType: unknown) {
  if (typeof valueType === 'number') {
    return `${resolveBatteryEditorDataTypeDefXsd(valueType) ?? valueType}`;
  }

  const normalizedValue = `${valueType ?? ''}`.trim();
  return normalizedValue !== '' ? normalizedValue : null;
}

export function getBatteryEditorRangeInputType(valueType: unknown) {
  const normalizedValueType = getNormalizedBatteryEditorRangeValueType(valueType);
  if (normalizedValueType.includes('datetime')) {
    return 'datetime-local';
  }
  if (normalizedValueType === 'date' || normalizedValueType.endsWith(':date')) {
    return 'date';
  }
  if (normalizedValueType === 'time' || normalizedValueType.endsWith(':time')) {
    return 'time';
  }
  return 'text';
}

export function getBatteryEditorRangeEditorValue(value: unknown, inputType: string) {
  const rawValue = `${value ?? ''}`.trim();
  if (rawValue === '') {
    return '';
  }

  switch (inputType) {
    case 'date':
      return rawValue.slice(0, 10);
    case 'time': {
      const timeValue = rawValue.includes('T') ? (rawValue.split('T')[1] ?? rawValue) : rawValue;
      return timeValue.replace(/(Z|[+-]\d{2}:?\d{2})$/, '').slice(0, 8);
    }
    case 'datetime-local':
      return rawValue
        .replace(' ', 'T')
        .replace(/(Z|[+-]\d{2}:?\d{2})$/, '')
        .slice(0, 16);
    default:
      return rawValue;
  }
}

export function parseBatteryEditorRangeDateValue(value: unknown, inputType: string) {
  const rawValue = `${value ?? ''}`.trim();
  if (rawValue === '') {
    return null;
  }

  switch (inputType) {
    case 'date':
      return parseBatteryEditorLocalDate(rawValue);
    case 'datetime-local':
      return parseBatteryEditorLocalDateTime(rawValue);
    default:
      return null;
  }
}

export function formatBatteryEditorRangeDateValue(value: Date | null | undefined, inputType: string) {
  if (value == null || Number.isNaN(value.getTime())) {
    return null;
  }

  switch (inputType) {
    case 'date':
      return formatBatteryEditorLocalDate(value);
    case 'datetime-local':
      return formatBatteryEditorLocalDateTime(value);
    default:
      return null;
  }
}

export function usesBatteryEditorStructuredRangeInput(valueType: unknown) {
  return getBatteryEditorRangeInputType(valueType) !== 'text';
}

export function createBatteryEditorEnumOptions(enumObject: EnumObject) {
  return Object.keys(enumObject)
    .filter((key) => Number.isNaN(Number(key)) === false)
    .map((key) => ({ label: `${enumObject[key]}`, value: Number(key) }))
    .sort((left, right) => left.label.localeCompare(right.label));
}

export function normalizeBatteryEditorEnumValue(enumObject: EnumObject, value: unknown, fallback: number | null) {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const trimmedValue = value.trim();
    if (trimmedValue !== '' && Object.prototype.hasOwnProperty.call(enumObject, trimmedValue)) {
      const enumValue = enumObject[trimmedValue];
      if (typeof enumValue === 'number') {
        return enumValue;
      }
    }
  }

  return fallback;
}

export function getBatteryEditorEnumLabel(enumObject: EnumObject, value: unknown) {
  const normalizedValue = normalizeBatteryEditorEnumValue(enumObject, value, null);
  if (normalizedValue == null) {
    const fallback = `${value ?? ''}`.trim();
    return fallback !== '' ? fallback : null;
  }

  return `${enumObject[String(normalizedValue)]}`;
}

export function ensureBatteryEditorReferenceValue(value: any) {
  const normalizedValue = value != null && typeof value === 'object' ? value : {};

  normalizedValue.type = normalizeBatteryEditorEnumValue(
    aas.types.ReferenceTypes as unknown as EnumObject,
    normalizedValue.type,
    aas.types.ReferenceTypes.ExternalReference,
  );

  if (!Array.isArray(normalizedValue.keys)) {
    normalizedValue.keys = [];
  }

  if (normalizedValue.keys.length === 0) {
    normalizedValue.keys.push({
      type:
        normalizedValue.type === aas.types.ReferenceTypes.ExternalReference
          ? aas.types.KeyTypes.GlobalReference
          : aas.types.KeyTypes.Submodel,
      value: '',
    });
  }

  normalizedValue.keys = normalizedValue.keys.map((key: any) => ({
    ...key,
    type: normalizeBatteryEditorEnumValue(
      aas.types.KeyTypes as unknown as EnumObject,
      key?.type,
      normalizedValue.type === aas.types.ReferenceTypes.ExternalReference
        ? aas.types.KeyTypes.GlobalReference
        : aas.types.KeyTypes.Submodel,
    ),
    value: `${key?.value ?? ''}`,
  }));

  return normalizedValue;
}

export function getBatteryEditorReferenceSummary(value: any) {
  const normalizedValue = ensureBatteryEditorReferenceValue(value);
  if (!Array.isArray(normalizedValue.keys) || normalizedValue.keys.length === 0) {
    return null;
  }

  return normalizedValue.keys
    .map((key: any) => {
      const type = getBatteryEditorEnumLabel(aas.types.KeyTypes as unknown as EnumObject, key?.type) ?? '';
      const keyValue = `${key?.value ?? ''}`.trim();
      return type !== '' && keyValue !== '' ? `${type}: ${keyValue}` : keyValue || type;
    })
    .filter((entry: string) => entry !== '')
    .join(' / ');
}

function getNormalizedBatteryEditorRangeValueType(valueType: unknown) {
  if (typeof valueType === 'number') {
    return `${resolveBatteryEditorDataTypeDefXsd(valueType) ?? ''}`.toLowerCase();
  }

  return `${valueType ?? ''}`.trim().toLowerCase();
}

function resolveBatteryEditorDataTypeDefXsd(value: number) {
  return (aas.types.DataTypeDefXsd as unknown as Record<number, string>)[value] ?? null;
}

function isIterableValue(value: any): value is Iterable<any> {
  return value != null && typeof value !== 'string' && typeof value[Symbol.iterator] === 'function';
}

function parseBatteryEditorLocalDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (match == null) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsedDate = new Date(year, month - 1, day);

  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month - 1 ||
    parsedDate.getDate() !== day
  ) {
    return null;
  }

  return parsedDate;
}

function parseBatteryEditorLocalDateTime(value: string) {
  const normalizedValue = value.replace(' ', 'T').replace(/(Z|[+-]\d{2}:?\d{2})$/, '');
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?$/.exec(normalizedValue);
  if (match == null) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6] ?? '0');

  const parsedDate = new Date(year, month - 1, day, hour, minute, second);
  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month - 1 ||
    parsedDate.getDate() !== day ||
    parsedDate.getHours() !== hour ||
    parsedDate.getMinutes() !== minute ||
    parsedDate.getSeconds() !== second
  ) {
    return null;
  }

  return parsedDate;
}

function formatBatteryEditorLocalDate(value: Date) {
  return [value.getFullYear(), `${value.getMonth() + 1}`.padStart(2, '0'), `${value.getDate()}`.padStart(2, '0')].join(
    '-',
  );
}

function formatBatteryEditorLocalDateTime(value: Date) {
  return `${formatBatteryEditorLocalDate(value)}T${`${value.getHours()}`.padStart(2, '0')}:${`${value.getMinutes()}`.padStart(2, '0')}`;
}
