import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { readableIdShort } from '@aas/helpers';
import { viewerFieldOf } from '../../concept-unit.service';

/** One labelled value of the data sheet; semanticId is used to look up the unit in the concept description. */
export interface DataSheetRow {
  label: string;
  value: string;
  semanticId: string;
  /** Unit stored directly at the element (IEC 61360 embedded data specification). */
  unit: string;
}

/** Collections whose children all have the same fields (e.g. one collection per pin) shown as one table. */
export interface DataSheetTable {
  title: string;
  columns: { key: string; label: string; semanticId: string; unit: string }[];
  rows: { label: string; cells: Record<string, string> }[];
}

/** Element the data sheet cannot show as a value (reference, entity, blob, operation, ...); shown by the generic viewer. */
export interface DataSheetElement {
  label: string;
  idShortPath: string;
  element: aas.types.ISubmodelElement;
}

export interface DataSheetSection {
  title: string;
  rows: DataSheetRow[];
  tables: DataSheetTable[];
  elements: DataSheetElement[];
  /** Nested groups; the depth of generic submodels is not known in advance. */
  sections: DataSheetSection[];
}

export interface DataSheetFile {
  idShortPath: string;
  value: string;
  note: string;
}

export interface DataSheetClassification {
  system: string;
  version: string;
  classId: string;
  className: string;
}

export interface TechnicalDataSheet {
  manufacturerName: string;
  productDesignation: string;
  articleNumber: string;
  orderCode: string;
  logo: DataSheetFile | null;
  images: DataSheetFile[];
  classifications: DataSheetClassification[];
  /** Further fields of the general information (e.g. battery category, mass, warranty in the battery passport). */
  general: DataSheetSection;
  areas: DataSheetSection[];
  furtherInformation: { statements: string[]; validDate: string };
}

const GENERAL_INFORMATION = ['GeneralInformation'];
/** Shown in the header; all other general information goes to the general section. */
const HEADER_FIELDS = [
  'ManufacturerName',
  'ManufacturerProductDesignation',
  'ManufacturerArticleNumber',
  'ManufacturerPartNumber',
  'ManufacturerOrderCode',
  'CompanyLogo',
  'ProductImages',
  'ProductImage',
];
const PRODUCT_CLASSIFICATIONS = ['ProductClassifications'];
/** TD 2.0 groups the properties in areas, TD 1.x has a single TechnicalProperties collection. */
const PROPERTY_AREAS = ['TechnicalPropertyAreas', 'SpecificDescriptions'];
const TECHNICAL_PROPERTIES = ['TechnicalProperties'];
const FURTHER_INFORMATION = ['FurtherInformation'];

/**
 * Turns a Technical Data submodel (IDTA 02003, versions 1.x and 2.0) into a flat data sheet. Elements are matched by
 * idShort, which is stable across both versions; empty values are left out.
 */
export function buildTechnicalDataSheet(
  submodel: aas.types.Submodel | null | undefined,
  language: string,
): TechnicalDataSheet {
  const reader = new ElementReader(language);
  const elements = submodel?.submodelElements ?? [];
  const generalInformation = findByIdShort(elements, GENERAL_INFORMATION);
  const general = childrenOf(generalInformation);

  const sheet: TechnicalDataSheet = {
    manufacturerName: reader.text(findByIdShort(general, ['ManufacturerName'])),
    productDesignation: reader.text(findByIdShort(general, ['ManufacturerProductDesignation'])),
    articleNumber: reader.text(findByIdShort(general, ['ManufacturerArticleNumber', 'ManufacturerPartNumber'])),
    orderCode: reader.text(findByIdShort(general, ['ManufacturerOrderCode'])),
    logo: toFile(findByIdShort(general, ['CompanyLogo']), ['GeneralInformation', 'CompanyLogo'], reader),
    images: collectImages(general, reader),
    classifications: childrenOf(findByIdShort(elements, PRODUCT_CLASSIFICATIONS))
      .map((classification) => toClassification(childrenOf(classification), reader))
      .filter((classification) => classification.classId !== '' || classification.className !== ''),
    general: toSectionFromChildren(
      '',
      general.filter((element) => !HEADER_FIELDS.includes(element.idShort ?? '')),
      generalInformation,
      generalInformation?.idShort ?? '',
      reader,
    ),
    areas: [],
    furtherInformation: { statements: [], validDate: '' },
  };

  for (const container of elements.filter((element) => PROPERTY_AREAS.includes(element.idShort ?? ''))) {
    const areas = childrenOf(container)
      .map((area, index) => toSection(area, childPath(container, container.idShort ?? '', area, index), reader))
      .filter(hasContent);
    // Several small areas (e.g. the battery passport: CapacityEnergyVoltage, Resistance, ...) become the groups of one
    // area under the container's name, so they look like the groups of a structured area (cards under a heading).
    // Areas with tables keep their own heading, a table does not fit into a card.
    const smallAreas = areas.length > 1 && areas.every((area) => !containsTable(area));
    if (smallAreas) {
      // Without a display name the container's idShort says nothing ("TechnicalPropertyAreas"); the viewer then
      // shows a translated heading
      sheet.areas.push({ title: reader.displayName(container), rows: [], tables: [], elements: [], sections: areas });
    } else {
      sheet.areas.push(...areas);
    }
  }
  const legacyProperties = findByIdShort(elements, TECHNICAL_PROPERTIES);
  if (legacyProperties != null) {
    sheet.areas.push(toSection(legacyProperties, legacyProperties.idShort ?? '', reader));
  }
  sheet.areas = sheet.areas.filter(hasContent);

  const further = childrenOf(findByIdShort(elements, FURTHER_INFORMATION));
  sheet.furtherInformation = {
    statements: further
      .filter((element) => (element.idShort ?? '').startsWith('TextStatement'))
      .map((element) => reader.text(element))
      .filter((text) => text !== ''),
    validDate: reader.text(findByIdShort(further, ['ValidDate'])),
  };

  return sheet;
}

function toSection(element: aas.types.ISubmodelElement, idShortPath: string, reader: ElementReader): DataSheetSection {
  return toSectionFromChildren(reader.label(element), childrenOf(element), element, idShortPath, reader);
}

function toSectionFromChildren(
  title: string,
  children: aas.types.ISubmodelElement[],
  parent: aas.types.ISubmodelElement | undefined,
  parentPath: string,
  reader: ElementReader,
): DataSheetSection {
  const section: DataSheetSection = { title, rows: [], tables: [], elements: [], sections: [] };
  const allChildren = childrenOf(parent);

  for (const child of children) {
    const idShortPath = childPath(parent, parentPath, child, allChildren.indexOf(child));
    if (isCollection(child)) {
      const table = toTable(child, reader);
      if (table != null) {
        section.tables.push(table);
      } else {
        const nested = toSection(child, idShortPath, reader);
        if (hasContent(nested)) section.sections.push(nested);
      }
      continue;
    }

    if (!isValueElement(child)) {
      // Nothing gets lost: references, entities, blobs, operations, ... are shown by the generic element viewer
      section.elements.push({ label: reader.label(child), idShortPath, element: child });
      continue;
    }
    const value = reader.text(child);
    if (value !== '') {
      section.rows.push({
        label: reader.label(child),
        value,
        ...viewerFieldOf(child),
      });
    }
  }

  return section;
}

/** Number of entries of a section including all nested groups; long groups start collapsed. */
export function sectionSize(section: DataSheetSection): number {
  return (
    section.rows.length +
    section.elements.length +
    section.tables.reduce((sum, table) => sum + table.rows.length, 0) +
    section.sections.reduce((sum, nested) => sum + 1 + sectionSize(nested), 0)
  );
}

/** idShort paths address list items by index and collection children by idShort. */
function childPath(
  parent: aas.types.ISubmodelElement | undefined,
  parentPath: string,
  child: aas.types.ISubmodelElement,
  index: number,
) {
  if (parent instanceof aas.types.SubmodelElementList) {
    return `${parentPath}[${index}]`;
  }
  return parentPath === '' ? (child.idShort ?? '') : `${parentPath}.${child.idShort ?? ''}`;
}

/** A collection becomes a table if it has at least two child collections that only contain simple values. */
function toTable(element: aas.types.ISubmodelElement, reader: ElementReader): DataSheetTable | null {
  const children = childrenOf(element);
  if (children.length < 2 || !children.every((child) => isCollection(child))) {
    return null;
  }
  if (!children.every((child) => childrenOf(child).every((field) => isValueElement(field)))) {
    return null;
  }

  const columns: DataSheetTable['columns'] = [];
  for (const child of children) {
    for (const field of childrenOf(child)) {
      const key = field.idShort ?? '';
      if (key !== '' && !columns.some((column) => column.key === key)) {
        columns.push({ key, label: reader.label(field), ...viewerFieldOf(field) });
      }
    }
  }

  const rows = children.map((child) => ({
    label: reader.label(child),
    cells: Object.fromEntries(childrenOf(child).map((field) => [field.idShort ?? '', reader.text(field)])),
  }));

  // Columns that only some rows fill (e.g. a GPIO number) stay; columns that are empty everywhere or merely repeat
  // the row label (e.g. the pin name printed on the board) are left out
  const usedColumns = columns.filter(
    (column) =>
      rows.some((row) => (row.cells[column.key] ?? '') !== '') &&
      !rows.every((row) => (row.cells[column.key] ?? '') === row.label),
  );
  return usedColumns.length === 0 ? null : { title: reader.label(element), columns: usedColumns, rows };
}

function collectImages(general: aas.types.ISubmodelElement[], reader: ElementReader) {
  const images: DataSheetFile[] = [];
  const container = findByIdShort(general, ['ProductImages']);
  childrenOf(container).forEach((entry, index) => {
    // TD 2.0: list of collections with ImageFile and ImageNote; TD 1.x: files directly.
    // idShort paths address list items by index and collection children by idShort.
    const entryPath =
      container instanceof aas.types.SubmodelElementList
        ? `GeneralInformation.ProductImages[${index}]`
        : `GeneralInformation.ProductImages.${entry.idShort ?? ''}`;
    if (isCollection(entry)) {
      const file = toFile(findByIdShort(childrenOf(entry), ['ImageFile']), [], reader, `${entryPath}.ImageFile`);
      if (file != null) {
        images.push({ ...file, note: reader.text(findByIdShort(childrenOf(entry), ['ImageNote'])) });
      }
    } else {
      const file = toFile(entry, [], reader, entryPath);
      if (file != null) images.push(file);
    }
  });

  const legacyImage = toFile(findByIdShort(general, ['ProductImage']), ['GeneralInformation', 'ProductImage'], reader);
  if (legacyImage != null) images.push(legacyImage);
  return images;
}

function toFile(
  element: aas.types.ISubmodelElement | undefined,
  path: string[],
  reader: ElementReader,
  idShortPath = path.join('.'),
): DataSheetFile | null {
  const value = reader.text(element);
  return element instanceof aas.types.File && value !== '' ? { idShortPath, value, note: '' } : null;
}

function toClassification(fields: aas.types.ISubmodelElement[], reader: ElementReader): DataSheetClassification {
  return {
    system: reader.text(findByIdShort(fields, ['ProductClassificationSystem', 'ClassificationSystem'])),
    version: reader.text(findByIdShort(fields, ['ClassificationSystemVersion'])),
    classId: reader.text(findByIdShort(fields, ['ProductClassId'])),
    className: reader.text(findByIdShort(fields, ['ProductClassName'])),
  };
}

function containsTable(section: DataSheetSection): boolean {
  return section.tables.length > 0 || section.sections.some(containsTable);
}

function hasContent(section: DataSheetSection): boolean {
  return (
    section.rows.length > 0 || section.tables.length > 0 || section.elements.length > 0 || section.sections.length > 0
  );
}

/** Elements the data sheet shows as a text value. */
function isValueElement(element: aas.types.ISubmodelElement) {
  return (
    element instanceof aas.types.Property ||
    element instanceof aas.types.MultiLanguageProperty ||
    element instanceof aas.types.Range ||
    element instanceof aas.types.File
  );
}

function isCollection(element: aas.types.ISubmodelElement | undefined) {
  return element instanceof aas.types.SubmodelElementCollection || element instanceof aas.types.SubmodelElementList;
}

function childrenOf(element: aas.types.ISubmodelElement | undefined): aas.types.ISubmodelElement[] {
  return isCollection(element)
    ? ((element as aas.types.SubmodelElementCollection | aas.types.SubmodelElementList).value ?? [])
    : [];
}

function findByIdShort(elements: aas.types.ISubmodelElement[], idShorts: string[]) {
  return elements.find((element) => idShorts.includes(element.idShort ?? ''));
}

class ElementReader {
  constructor(private readonly language: string) {}

  /** Display name in the current language, otherwise English, otherwise the idShort. */
  label(element: aas.types.ISubmodelElement) {
    return this.displayName(element) || readableIdShort(element.idShort);
  }

  displayName(element: aas.types.ISubmodelElement) {
    return this.pick(element.displayName ?? []);
  }

  text(element: aas.types.ISubmodelElement | undefined): string {
    if (element instanceof aas.types.Property) {
      return (element.value ?? '').trim();
    }
    if (element instanceof aas.types.MultiLanguageProperty) {
      return this.pick(element.value ?? []);
    }
    if (element instanceof aas.types.Range) {
      const min = element.min ?? '';
      const max = element.max ?? '';
      return min === '' && max === '' ? '' : `${min} – ${max}`;
    }
    if (element instanceof aas.types.File) {
      return (element.value ?? '').trim();
    }
    return '';
  }

  private pick(values: { language: string; text: string }[]) {
    const byLanguage = (language: string) =>
      values.find((value) => value.language.toLowerCase().startsWith(language) && value.text.trim() !== '');
    return (byLanguage(this.language.toLowerCase()) ?? byLanguage('en') ?? values[0])?.text.trim() ?? '';
  }
}
