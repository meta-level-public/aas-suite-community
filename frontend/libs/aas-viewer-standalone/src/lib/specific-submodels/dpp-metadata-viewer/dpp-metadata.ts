import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { DPP_GRANULARITY_OPTIONS, DPP_STATUS_OPTIONS, readableIdShort, submodelDisplayNameKey } from '@aas/helpers';
import { semanticIdOf } from '../../concept-unit.service';

/** One value of the DPP metadata with the semantic ID of its element (for the "?" to the concept description). */
export interface DppMetadataField {
  value: string;
  semanticId: string;
}

export type DppStatusTone = 'success' | 'warning' | 'danger' | 'neutral';

export interface DppMetadataView {
  digitalProductPassportId: DppMetadataField;
  uniqueProductIdentifier: DppMetadataField;
  dppSchemaVersion: DppMetadataField;
  dppStatus: DppMetadataField;
  economicOperatorId: DppMetadataField;
  facilityId: DppMetadataField;
  granularity: DppMetadataField;
  lastUpdate: DppMetadataField;
  contentSpecificationIds: DppMetadataField[];
  /** Semantic ID of the list of content specifications. */
  contentSpecificationsSemanticId: string;
}

/** Semantic IDs of the IDTA DPP metadata 1.0 follow this pattern, e.g. https://admin-shell.io/idta/cds/dppStatus/1 */
const cdsId = (name: string) => `https://admin-shell.io/idta/cds/${name}/1`.toLowerCase();

/** Reads the DPP metadata submodel (IDTA DPP metadata 1.0); elements are matched by semantic ID or idShort. */
export function buildDppMetadataView(submodel: aas.types.Submodel | null | undefined): DppMetadataView {
  const elements = submodel?.submodelElements ?? [];
  const field = (name: string): DppMetadataField => toField(find(elements, name));
  const specifications = find(elements, 'contentSpecificationIds');
  const specificationEntries =
    specifications instanceof aas.types.SubmodelElementList ||
    specifications instanceof aas.types.SubmodelElementCollection
      ? (specifications.value ?? [])
      : [];

  return {
    digitalProductPassportId: field('digitalProductPassportId'),
    uniqueProductIdentifier: field('uniqueProductIdentifier'),
    dppSchemaVersion: field('dppSchemaVersion'),
    dppStatus: field('dppStatus'),
    economicOperatorId: field('economicOperatorId'),
    facilityId: field('facilityId'),
    granularity: field('granularity'),
    lastUpdate: field('lastUpdate'),
    contentSpecificationIds: specificationEntries.map(toField).filter((entry) => entry.value !== ''),
    contentSpecificationsSemanticId: semanticIdOf(specifications),
  };
}

/**
 * Readable name of a content specification (usually the semantic ID of a submodel): the translation key of a known
 * submodel, otherwise the name part of the ID, e.g. "Material composition" for
 * urn:samm:io.admin-shell.idta.batterypass.material_composition:1.0.0#MaterialComposition.
 */
export function contentSpecificationName(id: string): { key: string; text: string } {
  const key = submodelDisplayNameKey(id);
  if (key != null) return { key, text: '' };
  const trimmed = id.trim();
  const name = trimmed.includes('#')
    ? trimmed.slice(trimmed.lastIndexOf('#') + 1)
    : (trimmed
        .split('/')
        .reverse()
        .find((part) => part !== '' && !/^\d+$/.test(part)) ?? '');
  // IRDIs like 0173-1#01-AHF578#003 have no readable name part
  return { key: '', text: /^[A-Za-z][A-Za-z0-9_]*$/.test(name) ? readableIdShort(name) : '' };
}

/** Translation key of a status or granularity value; unknown values are shown as they are. */
export function dppStatusLabel(status: string): string {
  return DPP_STATUS_OPTIONS.find((option) => equalsIgnoreCase(option.value, status))?.label ?? status;
}

export function dppGranularityLabel(granularity: string): string {
  return DPP_GRANULARITY_OPTIONS.find((option) => equalsIgnoreCase(option.value, granularity))?.label ?? granularity;
}

/** Colour of the status: active passports green, suspended amber, withdrawn red, drafts and unknown neutral. */
export function dppStatusTone(status: string): DppStatusTone {
  switch (status.trim().toLowerCase()) {
    case 'active':
      return 'success';
    case 'suspended':
      return 'warning';
    case 'withdrawn':
      return 'danger';
    default:
      return 'neutral';
  }
}

function find(elements: aas.types.ISubmodelElement[], name: string) {
  const semanticId = cdsId(name);
  return (
    elements.find((element) => semanticIdOf(element).toLowerCase() === semanticId) ??
    elements.find((element) => equalsIgnoreCase(element.idShort ?? '', name))
  );
}

function toField(element: aas.types.ISubmodelElement | undefined): DppMetadataField {
  const value = element instanceof aas.types.Property ? (element.value ?? '').trim() : '';
  return { value, semanticId: semanticIdOf(element) };
}

function equalsIgnoreCase(left: string, right: string) {
  return left.trim().toLowerCase() === right.trim().toLowerCase();
}
