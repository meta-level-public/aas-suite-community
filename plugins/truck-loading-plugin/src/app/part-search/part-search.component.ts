import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AasApiService } from '../aas-api.service';
import { AssetAdministrationShell, displayText } from '../aas-json';
import {
  TRUCK_ASSET_TYPE,
  TRUCK_SUBMODEL_ID_SHORT,
  hasSubmodel,
  isBoxShell,
} from '../loading-model';
import { TruckDemoService } from '../truck-demo.service';

export interface PartCandidate {
  name: string;
  idShort?: string;
  aasId: string;
  globalAssetId?: string;
  infrastructureId: number;
}

const MAX_RESULTS = 50;

/**
 * Sucht AAS in einem der konfigurierten Repositories: Teile zum Einladen oder,
 * mit fester Infrastruktur, die bestehende AAS des Lkw. Lkw und Kisten selbst
 * erscheinen nicht in den Ergebnissen.
 */
@Component({
  selector: 'app-part-search',
  imports: [FormsModule],
  templateUrl: './part-search.component.html',
  styleUrl: './part-search.component.scss',
})
export class PartSearchComponent {
  private readonly api = inject(AasApiService);
  protected readonly demo = inject(TruckDemoService);

  /** Gesetzt: nur in dieser Infrastruktur suchen, ohne Auswahl des Repositorys. */
  readonly fixedInfrastructureId = input<number | null>(null);
  readonly actionLabel = input('Einladen');
  readonly partChosen = output<PartCandidate>();

  protected readonly sourceId = signal<number | null>(null);
  protected readonly query = signal('');
  protected readonly shells = signal<AssetAdministrationShell[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly sources = computed(() =>
    this.demo.infrastructures().filter((infrastructure) => !infrastructure.noShellsListEndpoint),
  );

  protected readonly results = computed<PartCandidate[]>(() => {
    const sourceId = this.sourceId();
    if (sourceId === null) {
      return [];
    }
    const terms = this.query().toLowerCase().split(/\s+/).filter(Boolean);
    return this.shells()
      .filter(
        (shell) =>
          !isBoxShell(shell) &&
          shell.assetInformation.assetType !== TRUCK_ASSET_TYPE &&
          !hasSubmodel(shell, TRUCK_SUBMODEL_ID_SHORT),
      )
      .map((shell) => ({
        name: displayText(shell.displayName) ?? shell.idShort ?? shell.id,
        idShort: shell.idShort,
        aasId: shell.id,
        globalAssetId: shell.assetInformation.globalAssetId,
        infrastructureId: sourceId,
      }))
      .filter((candidate) => {
        const haystack = [
          candidate.name,
          candidate.idShort,
          candidate.aasId,
          candidate.globalAssetId,
        ]
          .join(' ')
          .toLowerCase();
        return terms.every((term) => haystack.includes(term));
      })
      .slice(0, MAX_RESULTS);
  });

  constructor() {
    effect(() => {
      const fixed = this.fixedInfrastructureId();
      if (fixed !== null) {
        void this.selectSource(fixed);
      }
    });
  }

  protected async selectSource(id: number): Promise<void> {
    this.sourceId.set(id);
    this.shells.set([]);
    this.error.set(null);
    this.loading.set(true);
    try {
      this.shells.set(await this.api.listShells(id));
    } catch {
      this.error.set('Das Repository konnte nicht gelesen werden.');
    } finally {
      this.loading.set(false);
    }
  }
}
