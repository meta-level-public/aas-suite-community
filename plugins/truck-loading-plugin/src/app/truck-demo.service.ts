import { computed, inject, Injectable, signal } from '@angular/core';

import { AasApiService, Infrastructure } from './aas-api.service';
import { AssetAdministrationShell, Submodel, displayText } from './aas-json';
import {
  BOX_ASSET_TYPE,
  BOX_SUBMODEL_ID_SHORT,
  BOX_SUBMODEL_SEMANTIC_ID,
  BoxIdentity,
  LoadedPart,
  NewPart,
  SLOT_IDS,
  SlotId,
  TRUCK_ASSET_TYPE,
  TRUCK_SUBMODEL_ID_SHORT,
  TRUCK_SUBMODEL_SEMANTIC_ID,
  addPart,
  boxIdShort,
  boxLabel,
  clearSlot,
  createBoxSubmodel,
  createTruckSubmodel,
  findTruckShell,
  hasSubmodel,
  isBoxShell,
  placeBox,
  readBoxParts,
  readTruckSlots,
  removePart,
  submodelIdFor,
  withSubmodelSemantics,
} from './loading-model';

export const BOX_COUNT = 6;
const STORAGE_KEY = 'truck-loading:infrastructure';

export interface BoxState {
  aasId: string;
  idShort: string;
  label: string;
  globalAssetId: string;
  parts: LoadedPart[];
  hasContentSubmodel: boolean;
}

export interface SlotState {
  slot: SlotId;
  box?: BoxState;
}

/** Hält den Zustand von Lkw und Kisten und schreibt Änderungen in deren AAS. */
@Injectable({ providedIn: 'root' })
export class TruckDemoService {
  private readonly api = inject(AasApiService);

  readonly infrastructures = signal<Infrastructure[]>([]);
  readonly infrastructureId = signal<number | null>(null);
  readonly truck = signal<AssetAdministrationShell | null>(null);
  readonly truckSubmodel = signal<Submodel | null>(null);
  readonly boxes = signal<BoxState[]>([]);
  readonly busy = signal(false);
  readonly error = signal<string | null>(null);

  readonly writableInfrastructures = computed(() =>
    this.infrastructures().filter((infrastructure) => !infrastructure.isReadonly),
  );

  readonly slots = computed<SlotState[]>(() => {
    const submodel = this.truckSubmodel();
    const occupied = submodel ? readTruckSlots(submodel) : new Map<SlotId, string>();
    return SLOT_IDS.map((slot) => ({
      slot,
      box: this.boxes().find((box) => box.globalAssetId === occupied.get(slot)),
    }));
  });

  readonly boxesOffTruck = computed(() => {
    const onTruck = new Set(this.slots().map((slot) => slot.box?.aasId));
    return this.boxes().filter((box) => !onTruck.has(box.aasId));
  });

  readonly needsSetup = computed(
    () =>
      !this.truckSubmodel() ||
      this.boxes().length < BOX_COUNT ||
      this.boxes().some((box) => !box.hasContentSubmodel),
  );

  async init(): Promise<void> {
    await this.run(async () => {
      const infrastructures = await this.api.getInfrastructures();
      this.infrastructures.set(infrastructures);
      const stored = Number(localStorage.getItem(STORAGE_KEY));
      const writable = infrastructures.filter((infrastructure) => !infrastructure.isReadonly);
      const initial =
        writable.find((infrastructure) => infrastructure.id === stored) ?? writable[0];
      if (initial) {
        this.infrastructureId.set(initial.id);
        await this.reload();
      }
    });
  }

  async selectInfrastructure(id: number): Promise<void> {
    this.infrastructureId.set(id);
    localStorage.setItem(STORAGE_KEY, String(id));
    await this.run(() => this.reload());
  }

  refresh(): Promise<void> {
    return this.run(() => this.reload());
  }

  /**
   * Legt fehlende Kisten und fehlende Ladelisten-Teilmodelle an.
   * Mit existingTruckAasId wird eine bestehende AAS (z. B. die des echten Lkw) zum Lkw:
   * Sie bekommt nur das Teilmodell "Ladung", alles andere bleibt unverändert.
   * Ohne sie und ohne erkannten Lkw wird ein Demo-Lkw angelegt.
   */
  async setUp(existingTruckAasId?: string): Promise<void> {
    await this.run(async () => {
      const infrastructureId = this.requireInfrastructure();
      const shells = await this.api.listShells(infrastructureId);
      const truck = existingTruckAasId
        ? await this.api.getShell(infrastructureId, existingTruckAasId)
        : findTruckShell(shells);
      if (truck && isBoxShell(truck)) {
        throw new Error('Eine Kiste kann nicht als Lkw verwendet werden.');
      }
      if (!truck) {
        await this.createDemoShell(
          infrastructureId,
          'Lkw',
          'Demo-Lkw',
          TRUCK_ASSET_TYPE,
          (aasId, assetId) => createTruckSubmodel(aasId, assetId),
        );
      } else {
        await this.ensureSubmodel(infrastructureId, truck, TRUCK_SUBMODEL_ID_SHORT, (assetId) =>
          createTruckSubmodel(truck.id, assetId),
        );
      }

      for (let number = 1; number <= BOX_COUNT; number++) {
        const idShort = boxIdShort(number);
        const box = shells.find((shell) => isBoxShell(shell) && shell.idShort === idShort);
        const create = (aasId: string, assetId: string) =>
          createBoxSubmodel(aasId, { idShort, globalAssetId: assetId });
        if (!box) {
          await this.createDemoShell(
            infrastructureId,
            idShort,
            `Kiste ${boxLabel(idShort)}`,
            BOX_ASSET_TYPE,
            create,
          );
        } else {
          await this.ensureSubmodel(infrastructureId, box, BOX_SUBMODEL_ID_SHORT, (assetId) =>
            create(box.id, assetId),
          );
        }
      }
      await this.reload();
    });
  }

  setSlot(slot: SlotId, box: BoxState | null): Promise<void> {
    const truck = this.truck();
    if (!truck) {
      return Promise.resolve();
    }
    return this.updateSubmodel(
      submodelIdFor(truck.id, TRUCK_SUBMODEL_ID_SHORT),
      TRUCK_SUBMODEL_SEMANTIC_ID,
      (submodel) =>
        box ? placeBox(submodel, slot, this.identity(box)) : clearSlot(submodel, slot),
      (saved) => this.truckSubmodel.set(saved),
    );
  }

  loadPart(box: BoxState, part: NewPart): Promise<void> {
    return this.updateBox(box, (submodel) => addPart(submodel, part));
  }

  unloadPart(box: BoxState, partIdShort: string): Promise<void> {
    return this.updateBox(box, (submodel) => removePart(submodel, partIdShort));
  }

  viewerLink(infrastructureId: number, aasId: string): string {
    return `${appBaseUrl()}viewer/aas-view/${infrastructureId}/${encodeURIComponent(aasId)}`;
  }

  // ---------------------------------------------------------------- intern

  private async reload(): Promise<void> {
    const infrastructureId = this.requireInfrastructure();
    const shells = await this.api.listShells(infrastructureId);
    const truck = findTruckShell(shells) ?? null;
    const boxShells = shells
      .filter(isBoxShell)
      .sort((a, b) => (a.idShort ?? '').localeCompare(b.idShort ?? ''));

    const [truckSubmodel, ...boxSubmodels] = await Promise.all([
      truck ? this.tryGetSubmodel(infrastructureId, truck, TRUCK_SUBMODEL_ID_SHORT) : null,
      ...boxShells.map((box) => this.tryGetSubmodel(infrastructureId, box, BOX_SUBMODEL_ID_SHORT)),
    ]);

    this.truck.set(truck);
    this.truckSubmodel.set(truckSubmodel);
    this.boxes.set(boxShells.map((shell, index) => this.toBoxState(shell, boxSubmodels[index])));
  }

  private toBoxState(shell: AssetAdministrationShell, submodel: Submodel | null): BoxState {
    return {
      aasId: shell.id,
      idShort: shell.idShort ?? '',
      label: boxLabel(shell.idShort) || displayText(shell.displayName) || shell.id,
      globalAssetId: shell.assetInformation.globalAssetId ?? shell.id,
      parts: submodel ? readBoxParts(submodel) : [],
      hasContentSubmodel: submodel !== null,
    };
  }

  private identity(box: BoxState): BoxIdentity {
    return { idShort: box.idShort, globalAssetId: box.globalAssetId };
  }

  private updateBox(box: BoxState, change: (submodel: Submodel) => Submodel): Promise<void> {
    return this.updateSubmodel(
      submodelIdFor(box.aasId, BOX_SUBMODEL_ID_SHORT),
      BOX_SUBMODEL_SEMANTIC_ID,
      change,
      (saved) =>
        this.boxes.update((boxes) =>
          boxes.map((entry) =>
            entry.aasId === box.aasId ? { ...entry, parts: readBoxParts(saved) } : entry,
          ),
        ),
    );
  }

  /** Liest den aktuellen Stand neu, damit parallele Änderungen (Tablet, Handy) erhalten bleiben. */
  private updateSubmodel(
    submodelId: string,
    semanticId: string,
    change: (submodel: Submodel) => Submodel,
    apply: (saved: Submodel) => void,
  ): Promise<void> {
    return this.run(async () => {
      const infrastructureId = this.requireInfrastructure();
      const current = await this.api.getSubmodel(infrastructureId, submodelId);
      const changed = withSubmodelSemantics(change(current), semanticId);
      await this.api.saveSubmodel(infrastructureId, changed);
      apply(changed);
    });
  }

  private async createDemoShell(
    infrastructureId: number,
    idShort: string,
    name: string,
    assetType: string,
    createSubmodel: (aasId: string, globalAssetId: string) => Submodel,
  ): Promise<void> {
    const aasId = await this.api.createShell(infrastructureId);
    const shell = await this.api.getShell(infrastructureId, aasId);
    shell.idShort = idShort;
    shell.displayName = [{ language: 'de', text: name }];
    shell.assetInformation = { ...shell.assetInformation, assetType };
    await this.addSubmodel(infrastructureId, shell, createSubmodel);
  }

  private async ensureSubmodel(
    infrastructureId: number,
    shell: AssetAdministrationShell,
    idShort: string,
    createSubmodel: (globalAssetId: string) => Submodel,
  ): Promise<void> {
    if (await this.tryGetSubmodel(infrastructureId, shell, idShort)) {
      return;
    }
    await this.addSubmodel(infrastructureId, shell, (_aasId, assetId) => createSubmodel(assetId));
  }

  private async addSubmodel(
    infrastructureId: number,
    shell: AssetAdministrationShell,
    createSubmodel: (aasId: string, globalAssetId: string) => Submodel,
  ): Promise<void> {
    const submodel = createSubmodel(shell.id, shell.assetInformation.globalAssetId ?? shell.id);
    const references = (shell.submodels ?? []).filter(
      (reference) => reference.keys[0]?.value !== submodel.id,
    );
    shell.submodels = [
      ...references,
      { type: 'ModelReference', keys: [{ type: 'Submodel', value: submodel.id }] },
    ];
    await this.api.saveShell(infrastructureId, shell, [submodel]);
  }

  private async tryGetSubmodel(
    infrastructureId: number,
    shell: AssetAdministrationShell,
    idShort: string,
  ): Promise<Submodel | null> {
    if (!hasSubmodel(shell, idShort)) {
      return null;
    }
    try {
      return await this.api.getSubmodel(infrastructureId, submodelIdFor(shell.id, idShort));
    } catch {
      return null;
    }
  }

  private requireInfrastructure(): number {
    const id = this.infrastructureId();
    if (id === null) {
      throw new Error('Keine beschreibbare Infrastruktur ausgewählt.');
    }
    return id;
  }

  private async run(action: () => Promise<void>): Promise<void> {
    this.busy.set(true);
    this.error.set(null);
    try {
      await action();
    } catch (error) {
      this.error.set(describeError(error));
    } finally {
      this.busy.set(false);
    }
  }
}

/**
 * Basis-URL der AAS Suite (z. B. https://host/designer-ui/). Das Plugin läuft in einem
 * Frame auf demselben Origin, daher liefert das umgebende Fenster seinen base href.
 */
function appBaseUrl(): string {
  try {
    if (window.parent !== window) {
      return window.parent.document.baseURI;
    }
  } catch {
    // anderes Origin, z. B. bei lokaler Entwicklung mit ng serve
  }
  return `${window.location.origin}/`;
}

function describeError(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = (error as { status: number }).status;
    if (status === 401 || status === 403) {
      return 'Keine Berechtigung. Zum Schreiben ist die Rolle AAS-Bearbeitung nötig.';
    }
    return `Die AAS Suite hat mit Status ${status} geantwortet.`;
  }
  return error instanceof Error ? error.message : 'Unbekannter Fehler.';
}
