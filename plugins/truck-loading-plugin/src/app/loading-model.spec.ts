import { Entity, RelationshipElement, globalReference } from './aas-json';
import {
  BOX_SUBMODEL_SEMANTIC_ID,
  HS,
  TRUCK_ASSET_TYPE,
  TRUCK_SUBMODEL_SEMANTIC_ID,
  addPart,
  findTruckShell,
  boxLabel,
  clearSlot,
  createBoxSubmodel,
  createTruckSubmodel,
  placeBox,
  readBoxParts,
  readTruckSlots,
  removePart,
  withSubmodelSemantics,
} from './loading-model';

const K1 = { idShort: 'Kiste_K01', globalAssetId: 'urn:asset:k01' };
const K2 = { idShort: 'Kiste_K02', globalAssetId: 'urn:asset:k02' };

function newPart(name: string, sourceIdShort = name) {
  return {
    name,
    sourceIdShort,
    globalAssetId: `urn:asset:${name}`,
    aasId: `urn:aas:${name}`,
    infrastructureId: 7,
    viewerLink: `https://suite/viewer/aas-view/7/${name}`,
    loadedAt: '2026-11-23T10:00:00Z',
  };
}

describe('Lkw-Ladung', () => {
  it('legt Lkw und Ladetablett als HierarchicalStructures an', () => {
    const submodel = createTruckSubmodel('urn:aas:lkw', 'urn:asset:lkw');

    expect(submodel.semanticId?.keys[0].value).toBe(TRUCK_SUBMODEL_SEMANTIC_ID);
    expect(submodel.supplementalSemanticIds?.map((ref) => ref.keys[0].value)).toEqual([
      HS.submodel,
    ]);
    const entryNode = submodel.submodelElements?.[0] as Entity;
    expect(entryNode.globalAssetId).toBe('urn:asset:lkw');
    expect(entryNode.statements?.map((s) => s.idShort)).toEqual([
      'Ladetablett',
      'HasPart_Ladetablett',
    ]);
    expect(readTruckSlots(submodel).size).toBe(0);
  });

  it('stellt eine Kiste auf einen Stellplatz und verknüpft sie per HasPart', () => {
    const submodel = placeBox(createTruckSubmodel('urn:aas:lkw', 'urn:asset:lkw'), 'B2', K1);

    expect(readTruckSlots(submodel).get('B2')).toBe(K1.globalAssetId);
    const tray = (submodel.submodelElements?.[0] as Entity).statements?.[0] as Entity;
    const relation = tray.statements?.find(
      (s) => s.idShort === 'HasPart_Kiste_K01',
    ) as RelationshipElement;
    expect(relation.second.keys.map((k) => k.value)).toEqual([
      submodel.id,
      'Lkw',
      'Ladetablett',
      'Kiste_K01',
    ]);
  });

  it('setzt eine Kiste um, statt sie doppelt zu führen', () => {
    let submodel = placeBox(createTruckSubmodel('urn:aas:lkw', 'urn:asset:lkw'), 'A1', K1);
    submodel = placeBox(submodel, 'B3', K1);

    const slots = readTruckSlots(submodel);
    expect(slots.get('A1')).toBeUndefined();
    expect(slots.get('B3')).toBe(K1.globalAssetId);
    const tray = (submodel.submodelElements?.[0] as Entity).statements?.[0] as Entity;
    expect(tray.statements?.length).toBe(2);
  });

  it('nimmt eine Kiste vom Platz, wenn dort eine andere abgestellt wird', () => {
    let submodel = placeBox(createTruckSubmodel('urn:aas:lkw', 'urn:asset:lkw'), 'A1', K1);
    submodel = placeBox(submodel, 'A1', K2);

    expect([...readTruckSlots(submodel).values()]).toEqual([K2.globalAssetId]);
  });

  it('leert einen Stellplatz samt Relation, ohne das Original zu verändern', () => {
    const loaded = placeBox(createTruckSubmodel('urn:aas:lkw', 'urn:asset:lkw'), 'A2', K1);
    const cleared = clearSlot(loaded, 'A2');

    expect(readTruckSlots(cleared).size).toBe(0);
    const tray = (cleared.submodelElements?.[0] as Entity).statements?.[0] as Entity;
    expect(tray.statements?.length).toBe(0);
    expect(readTruckSlots(loaded).get('A2')).toBe(K1.globalAssetId);
  });
});

describe('withSubmodelSemantics', () => {
  it('stellt ein Teilmodell mit HierarchicalStructures als Haupt-semanticId um', () => {
    const legacy = {
      ...createBoxSubmodel('urn:aas:k01', K1),
      semanticId: globalReference(HS.submodel),
    };
    delete legacy.supplementalSemanticIds;

    const migrated = withSubmodelSemantics(legacy, BOX_SUBMODEL_SEMANTIC_ID);

    expect(migrated.semanticId?.keys[0].value).toBe(BOX_SUBMODEL_SEMANTIC_ID);
    expect(migrated.supplementalSemanticIds?.map((ref) => ref.keys[0].value)).toEqual([
      HS.submodel,
    ]);
    expect(migrated.submodelElements).toEqual(legacy.submodelElements);
  });
});

describe('Kisten-Inhalt', () => {
  it('lädt Teile mit Referenz auf ihre AAS und liest sie wieder aus', () => {
    let submodel = createBoxSubmodel('urn:aas:k01', K1);
    submodel = addPart(submodel, newPart('Schraube'));

    expect(readBoxParts(submodel)).toEqual([
      {
        idShort: 'Teil_Schraube',
        name: 'Schraube',
        globalAssetId: 'urn:asset:Schraube',
        aasId: 'urn:aas:Schraube',
        infrastructureId: 7,
        viewerLink: 'https://suite/viewer/aas-view/7/Schraube',
        loadedAt: '2026-11-23T10:00:00Z',
      },
    ]);
  });

  it('vergibt eindeutige idShorts, wenn dasselbe Teil zweimal geladen wird', () => {
    let submodel = createBoxSubmodel('urn:aas:k01', K1);
    submodel = addPart(submodel, newPart('Schraube'));
    submodel = addPart(submodel, newPart('Schraube'));

    expect(readBoxParts(submodel).map((p) => p.idShort)).toEqual([
      'Teil_Schraube',
      'Teil_Schraube_2',
    ]);
  });

  it('macht aus Sonderzeichen gültige idShorts', () => {
    const submodel = addPart(
      createBoxSubmodel('urn:aas:k01', K1),
      newPart('Mutter M8', '8er Mutter (verzinkt)'),
    );

    expect(readBoxParts(submodel)[0].idShort).toBe('Teil_er_Mutter_verzinkt');
  });

  it('entfernt ein Teil zusammen mit seiner HasPart-Relation', () => {
    let submodel = createBoxSubmodel('urn:aas:k01', K1);
    submodel = addPart(submodel, newPart('Schraube'));
    submodel = addPart(submodel, newPart('Mutter'));
    submodel = removePart(submodel, 'Teil_Schraube');

    const entryNode = submodel.submodelElements?.[0] as Entity;
    expect(entryNode.statements?.map((s) => s.idShort)).toEqual([
      'Teil_Mutter',
      'HasPart_Teil_Mutter',
    ]);
  });
});

describe('findTruckShell', () => {
  const shell = (id: string, assetType?: string, submodelIds: string[] = []) => ({
    id,
    assetInformation: { assetKind: 'Instance', globalAssetId: `${id}-asset`, assetType },
    submodels: submodelIds.map((value) => ({
      type: 'ModelReference' as const,
      keys: [{ type: 'Submodel', value }],
    })),
  });

  it('erkennt eine bestehende AAS am Teilmodell "Ladung", unabhängig vom assetType', () => {
    const realTruck = shell('urn:aas:messe-lkw', 'urn:vendor:truck', [
      'urn:sm:nameplate',
      'urn:aas:messe-lkw/submodels/Ladung',
    ]);
    const demoTruck = shell('urn:aas:demo', TRUCK_ASSET_TYPE);

    expect(findTruckShell([demoTruck, realTruck])).toBe(realTruck);
  });

  it('fällt auf den Demo-assetType zurück', () => {
    const demoTruck = shell('urn:aas:demo', TRUCK_ASSET_TYPE);

    expect(findTruckShell([shell('urn:aas:other'), demoTruck])).toBe(demoTruck);
  });

  it('findet ohne Ladung und Demo-assetType keinen Lkw', () => {
    expect(findTruckShell([shell('urn:aas:other', 'urn:vendor:truck')])).toBeUndefined();
  });
});

describe('boxLabel', () => {
  it('zeigt die Etikettnummer', () => {
    expect(boxLabel('Kiste_K03')).toBe('K-03');
    expect(boxLabel('Sonderkiste')).toBe('Sonderkiste');
  });
});
