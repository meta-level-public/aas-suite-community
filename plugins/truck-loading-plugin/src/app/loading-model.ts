import {
  AasReference,
  AssetAdministrationShell,
  Entity,
  RelationshipElement,
  Submodel,
  SubmodelElement,
  displayText,
  globalReference,
  hasSemanticId,
  isEntity,
  isProperty,
  isReferenceElement,
  stringProperty,
  toIdShort,
} from './aas-json';

/**
 * Ladeliste nach IDTA "Hierarchical Structures enabling Bills of Material".
 *
 * Lkw-AAS, Teilmodell "Ladung":
 *   Lkw (EntryNode) → Ladetablett → Kiste_K01 (Property "Stellplatz" = "A1") …
 * Kisten-AAS, Teilmodell "Inhalt":
 *   Kiste_K01 (EntryNode) → Teil_… (globalAssetId des Teils, Referenz auf seine AAS)
 *
 * Der Stellplatz gehört zum Lkw, der Inhalt zur Kiste. Wird eine Kiste umgesetzt,
 * ändert sich nur das Teilmodell des Lkw.
 */

export const HS = {
  submodel: 'https://admin-shell.io/idta/HierarchicalStructures/1/1/Submodel',
  entryNode: 'https://admin-shell.io/idta/HierarchicalStructures/EntryNode/1/0',
  node: 'https://admin-shell.io/idta/HierarchicalStructures/Node/1/0',
  hasPart: 'https://admin-shell.io/idta/HierarchicalStructures/HasPart/1/0',
  archeType: 'https://admin-shell.io/idta/HierarchicalStructures/ArcheType/1/0',
} as const;

/**
 * Eigene semanticIds der beiden Teilmodelle. Eine Ladung ist keine Stückliste des Lkw; die
 * Struktur folgt aber HierarchicalStructures, das deshalb als supplementalSemanticId angegeben
 * ist. Die AAS Suite stellt die Teilmodelle darüber als Diagramm dar.
 */
export const TRUCK_SUBMODEL_SEMANTIC_ID = 'urn:aas-suite:demo:truck-loading:LoadingList:1:0';
export const BOX_SUBMODEL_SEMANTIC_ID = 'urn:aas-suite:demo:truck-loading:BoxContent:1:0';

export const TRUCK_ASSET_TYPE = 'urn:aas-suite:demo:truck-loading:truck';
export const BOX_ASSET_TYPE = 'urn:aas-suite:demo:truck-loading:box';
export const TRUCK_SUBMODEL_ID_SHORT = 'Ladung';
export const BOX_SUBMODEL_ID_SHORT = 'Inhalt';
export const TRAY_ID_SHORT = 'Ladetablett';
export const SLOT_PROPERTY = 'Stellplatz';

/** Stellplätze auf dem Tablett: zwei Spalten (A, B), drei Reihen, Reihe 1 am Fahrerhaus. */
export const SLOT_IDS = ['A1', 'B1', 'A2', 'B2', 'A3', 'B3'] as const;
export type SlotId = (typeof SLOT_IDS)[number];

export interface BoxIdentity {
  idShort: string;
  globalAssetId: string;
}

export interface LoadedPart {
  idShort: string;
  name: string;
  globalAssetId?: string;
  aasId?: string;
  infrastructureId?: number;
  viewerLink?: string;
  loadedAt?: string;
}

export interface NewPart {
  name: string;
  sourceIdShort?: string;
  globalAssetId?: string;
  aasId: string;
  infrastructureId: number;
  viewerLink?: string;
  loadedAt: string;
}

export function submodelIdFor(aasId: string, idShort: string): string {
  return `${aasId}/submodels/${idShort}`;
}

export function boxIdShort(number: number): string {
  return `Kiste_K${String(number).padStart(2, '0')}`;
}

/** "Kiste_K03" → "K-03"; andere idShorts bleiben unverändert. */
export function boxLabel(idShort: string | undefined): string {
  const match = /^Kiste_K(\d+)$/.exec(idShort ?? '');
  return match ? `K-${match[1]}` : (idShort ?? '?');
}

export function hasSubmodel(shell: AssetAdministrationShell, idShort: string): boolean {
  const id = submodelIdFor(shell.id, idShort);
  return shell.submodels?.some((reference) => reference.keys[0]?.value === id) ?? false;
}

/**
 * Der Lkw ist die AAS mit dem Teilmodell "Ladung". Das kann eine bestehende AAS des echten
 * Lkw sein; ihr assetType bleibt dabei unverändert. Vom Plugin angelegte Demo-Lkw erkennt
 * es zusätzlich am assetType.
 */
export function findTruckShell(
  shells: AssetAdministrationShell[],
): AssetAdministrationShell | undefined {
  return (
    shells.find((shell) => hasSubmodel(shell, TRUCK_SUBMODEL_ID_SHORT)) ??
    shells.find((shell) => shell.assetInformation.assetType === TRUCK_ASSET_TYPE)
  );
}

export function isBoxShell(shell: AssetAdministrationShell): boolean {
  return shell.assetInformation.assetType === BOX_ASSET_TYPE;
}

export function isSlotId(value: string | undefined): value is SlotId {
  return (SLOT_IDS as readonly string[]).includes(value ?? '');
}

// ---------------------------------------------------------------- Lkw

export function createTruckSubmodel(truckAasId: string, truckGlobalAssetId: string): Submodel {
  const id = submodelIdFor(truckAasId, TRUCK_SUBMODEL_ID_SHORT);
  const tray = entity(TRAY_ID_SHORT, HS.node, 'CoManagedEntity');
  const truck: Entity = {
    ...entity('Lkw', HS.entryNode, 'SelfManagedEntity', truckGlobalAssetId),
    statements: [tray, hasPart(id, ['Lkw'], TRAY_ID_SHORT)],
  };
  return hierarchicalSubmodel(
    id,
    TRUCK_SUBMODEL_ID_SHORT,
    truck,
    'Full',
    TRUCK_SUBMODEL_SEMANTIC_ID,
  );
}

/**
 * Setzt die eigene semanticId und HierarchicalStructures als supplementalSemanticId.
 * Stellt Teilmodelle aus früheren Versionen des Plugins beim nächsten Speichern um.
 */
export function withSubmodelSemantics(submodel: Submodel, semanticId: string): Submodel {
  return {
    ...submodel,
    semanticId: globalReference(semanticId),
    supplementalSemanticIds: [globalReference(HS.submodel)],
  };
}

/** Liefert für jeden Stellplatz die globalAssetId der dort stehenden Kiste. */
export function readTruckSlots(submodel: Submodel): Map<SlotId, string> {
  const result = new Map<SlotId, string>();
  for (const box of trayBoxes(submodel)) {
    const slot = box.statements?.find(
      (element) => isProperty(element) && element.idShort === SLOT_PROPERTY,
    );
    const slotId = isProperty(slot) ? slot.value : undefined;
    if (isSlotId(slotId) && box.globalAssetId && !result.has(slotId)) {
      result.set(slotId, box.globalAssetId);
    }
  }
  return result;
}

/**
 * Stellt eine Kiste auf einen Stellplatz. Steht die Kiste schon woanders, wird sie umgesetzt.
 * Steht auf dem Platz bereits eine andere Kiste, wird diese vom Tablett genommen.
 */
export function placeBox(submodel: Submodel, slot: SlotId, box: BoxIdentity): Submodel {
  const copy = structuredClone(submodel);
  const tray = findTray(copy);
  const occupant = readTruckSlots(copy).get(slot);
  removeTrayBoxes(
    copy,
    (entry) => entry.globalAssetId === box.globalAssetId || entry.globalAssetId === occupant,
  );

  const boxEntity: Entity = {
    ...entity(box.idShort, HS.node, 'SelfManagedEntity', box.globalAssetId),
    statements: [stringProperty(SLOT_PROPERTY, slot)],
  };
  tray.statements = [
    ...(tray.statements ?? []),
    boxEntity,
    hasPart(copy.id, ['Lkw', TRAY_ID_SHORT], box.idShort),
  ];
  return copy;
}

export function clearSlot(submodel: Submodel, slot: SlotId): Submodel {
  const occupant = readTruckSlots(submodel).get(slot);
  if (!occupant) {
    return submodel;
  }
  const copy = structuredClone(submodel);
  removeTrayBoxes(copy, (entry) => entry.globalAssetId === occupant);
  return copy;
}

// ---------------------------------------------------------------- Kiste

export function createBoxSubmodel(boxAasId: string, box: BoxIdentity): Submodel {
  const id = submodelIdFor(boxAasId, BOX_SUBMODEL_ID_SHORT);
  const entryNode: Entity = {
    ...entity(box.idShort, HS.entryNode, 'SelfManagedEntity', box.globalAssetId),
    statements: [],
  };
  return hierarchicalSubmodel(
    id,
    BOX_SUBMODEL_ID_SHORT,
    entryNode,
    'OneDown',
    BOX_SUBMODEL_SEMANTIC_ID,
  );
}

export function readBoxParts(submodel: Submodel): LoadedPart[] {
  const entryNode = findEntryNode(submodel);
  return (entryNode.statements ?? []).filter(isEntity).map((part) => {
    const statements = part.statements ?? [];
    const property = (idShort: string) => {
      const found = statements.find((element) => element.idShort === idShort);
      return isProperty(found) ? found.value : undefined;
    };
    const aasReference = statements.find((element) => element.idShort === 'Aas');
    const infrastructureId = Number(property('QuellInfrastruktur'));
    return {
      idShort: part.idShort ?? '',
      name: displayText(part.displayName) ?? part.idShort ?? '',
      globalAssetId: part.globalAssetId,
      aasId: isReferenceElement(aasReference) ? aasReference.value?.keys[0]?.value : undefined,
      infrastructureId: Number.isFinite(infrastructureId) ? infrastructureId : undefined,
      viewerLink: property('ViewerLink'),
      loadedAt: property('GeladenAm'),
    };
  });
}

export function addPart(submodel: Submodel, part: NewPart): Submodel {
  const copy = structuredClone(submodel);
  const entryNode = findEntryNode(copy);
  const statements = entryNode.statements ?? [];
  const idShort = uniqueIdShort(
    `Teil_${toIdShort(part.sourceIdShort ?? part.name, 'Teil')}`,
    statements,
  );

  const partEntity: Entity = {
    ...entity(
      idShort,
      HS.node,
      part.globalAssetId ? 'SelfManagedEntity' : 'CoManagedEntity',
      part.globalAssetId,
    ),
    displayName: [{ language: 'de', text: part.name }],
    statements: [
      {
        modelType: 'ReferenceElement',
        idShort: 'Aas',
        value: {
          type: 'ModelReference',
          keys: [{ type: 'AssetAdministrationShell', value: part.aasId }],
        },
      },
      stringProperty('QuellInfrastruktur', String(part.infrastructureId), 'xs:long'),
      ...(part.viewerLink ? [stringProperty('ViewerLink', part.viewerLink, 'xs:anyURI')] : []),
      stringProperty('GeladenAm', part.loadedAt, 'xs:dateTime'),
    ],
  };

  entryNode.statements = [
    ...statements,
    partEntity,
    hasPart(copy.id, [entryNode.idShort ?? ''], idShort),
  ];
  return copy;
}

export function removePart(submodel: Submodel, partIdShort: string): Submodel {
  const copy = structuredClone(submodel);
  const entryNode = findEntryNode(copy);
  entryNode.statements = (entryNode.statements ?? []).filter(
    (element) => element.idShort !== partIdShort && !pointsTo(element, partIdShort),
  );
  return copy;
}

// ---------------------------------------------------------------- intern

function hierarchicalSubmodel(
  id: string,
  idShort: string,
  entryNode: Entity,
  archeType: 'Full' | 'OneDown',
  semanticId: string,
): Submodel {
  return withSubmodelSemantics(
    {
      modelType: 'Submodel',
      id,
      idShort,
      kind: 'Instance',
      submodelElements: [
        entryNode,
        stringProperty('ArcheType', archeType, 'xs:string', HS.archeType),
      ],
    },
    semanticId,
  );
}

function entity(
  idShort: string,
  semanticId: string,
  entityType: Entity['entityType'],
  globalAssetId?: string,
): Entity {
  return {
    modelType: 'Entity',
    idShort,
    semanticId: globalReference(semanticId),
    entityType,
    ...(entityType === 'SelfManagedEntity' && globalAssetId ? { globalAssetId } : {}),
    statements: [],
  };
}

function entityReference(submodelId: string, path: string[]): AasReference {
  return {
    type: 'ModelReference',
    keys: [
      { type: 'Submodel', value: submodelId },
      ...path.map((value) => ({ type: 'Entity', value })),
    ],
  };
}

function hasPart(
  submodelId: string,
  parentPath: string[],
  childIdShort: string,
): RelationshipElement {
  return {
    modelType: 'RelationshipElement',
    idShort: `HasPart_${childIdShort}`,
    semanticId: globalReference(HS.hasPart),
    first: entityReference(submodelId, parentPath),
    second: entityReference(submodelId, [...parentPath, childIdShort]),
  };
}

function pointsTo(element: SubmodelElement, childIdShort: string): boolean {
  if (element.modelType !== 'RelationshipElement') {
    return false;
  }
  const keys = (element as RelationshipElement).second?.keys ?? [];
  return keys[keys.length - 1]?.value === childIdShort;
}

function findEntryNode(submodel: Submodel): Entity {
  const entryNode = submodel.submodelElements?.find(
    (element) => isEntity(element) && hasSemanticId(element, HS.entryNode.replace(/\/1\/0$/, '')),
  );
  if (!isEntity(entryNode)) {
    throw new Error(`Teilmodell ${submodel.idShort ?? submodel.id} hat keinen EntryNode.`);
  }
  return entryNode;
}

function findTray(submodel: Submodel): Entity {
  const tray = findEntryNode(submodel).statements?.find(
    (element) => isEntity(element) && element.idShort === TRAY_ID_SHORT,
  );
  if (!isEntity(tray)) {
    throw new Error(`Im Teilmodell ${TRUCK_SUBMODEL_ID_SHORT} fehlt das ${TRAY_ID_SHORT}.`);
  }
  return tray;
}

function trayBoxes(submodel: Submodel): Entity[] {
  return (findTray(submodel).statements ?? []).filter(isEntity);
}

function removeTrayBoxes(submodel: Submodel, matches: (box: Entity) => boolean): void {
  const tray = findTray(submodel);
  const removed = new Set(
    (tray.statements ?? [])
      .filter((element) => isEntity(element) && matches(element))
      .map((element) => element.idShort),
  );
  tray.statements = (tray.statements ?? []).filter(
    (element) =>
      !removed.has(element.idShort) &&
      ![...removed].some((idShort) => idShort !== undefined && pointsTo(element, idShort)),
  );
}

function uniqueIdShort(base: string, existing: SubmodelElement[]): string {
  const taken = new Set(existing.map((element) => element.idShort));
  if (!taken.has(base)) {
    return base;
  }
  let counter = 2;
  while (taken.has(`${base}_${counter}`)) {
    counter++;
  }
  return `${base}_${counter}`;
}
