import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { AasExtractHelper } from '@aas/helpers';
import { Component, computed, Input, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputText } from 'primeng/inputtext';
import { HandoverStructureMode } from '../structure-mode';

@Component({
  selector: 'aas-handover-doc-identification',
  templateUrl: './document-identification.component.html',
  imports: [InputGroup, InputGroupAddon, InputText, TranslateModule],
})
export class DocumentIdentificationComponent {
  // --- Input ---------------------------------------------------------------
  private _document = signal<aas.types.SubmodelElementCollection | undefined>(undefined);
  @Input() set document(val: aas.types.SubmodelElementCollection | undefined) {
    this._document.set(val);
  }
  @Input() submodelVersion?: string;

  // --- Semantics -----------------------------------------------------------
  private static readonly SEM = {
    V1_CONTAINER: '0173-1#02-ABI501#001/0173-1#01-AHF580#001*01',
    V2_CONTAINER: '0173-1#02-ABI501#003',
    DOMAIN_ID: ['0173-1#02-ABH994#003', '0173-1#02-ABH994#001'],
    IDENTIFIER: ['0173-1#02-AAO099#004', '0173-1#02-AAO099#002'],
    IS_PRIMARY: ['0173-1#02-ABH995#001', '0173-1#02-ABH995#003'],
  };

  // --- Mode ----------------------------------------------------------------
  @Input() mode: HandoverStructureMode = HandoverStructureMode.UNKNOWN;

  // Öffentliche identifications
  identifications = computed<IdentificationEntry[]>(() =>
    this.mode === HandoverStructureMode.V2 ? this.buildV2() : this.buildV1(),
  );

  // --- Builder V2 ----------------------------------------------------------
  private buildV2(): IdentificationEntry[] {
    const doc = this._document();
    const c = AasExtractHelper.findList(doc, DocumentIdentificationComponent.SEM.V2_CONTAINER);

    if (!c) return [];
    return (c.value ?? [])
      .filter(
        (entry): entry is aas.types.SubmodelElementCollection => entry instanceof aas.types.SubmodelElementCollection,
      )
      .map((entry) => this.mapCollection(entry));
  }

  // --- Builder V1 ----------------------------------------------------------
  private buildV1(): IdentificationEntry[] {
    const doc = this._document();
    const c = AasExtractHelper.findCollections(doc, DocumentIdentificationComponent.SEM.V1_CONTAINER);

    if (!c) return [];
    return c.map((col) => this.mapCollection(col));
  }

  // --- Mapping -------------------------------------------------------------
  private mapCollection(col: aas.types.SubmodelElementCollection): IdentificationEntry {
    const primaryRaw = AasExtractHelper.findProperty(col, DocumentIdentificationComponent.SEM.IS_PRIMARY);
    return {
      collectionIdShort: col.idShort ?? undefined,
      domainId: AasExtractHelper.findProperty(col, DocumentIdentificationComponent.SEM.DOMAIN_ID),
      identifier: AasExtractHelper.findProperty(col, DocumentIdentificationComponent.SEM.IDENTIFIER),
      isPrimary: this.parseBoolean(primaryRaw),
    };
  }

  // --- Helpers -------------------------------------------------------------
  private parseBoolean(val: string | undefined): boolean | undefined {
    if (val == null) return undefined;
    const norm = val.toString().trim().toLowerCase();
    if (['true', '1', 'yes', 'ja'].includes(norm)) return true;
    if (['false', '0', 'no', 'nein'].includes(norm)) return false;
    return undefined;
  }
}

export interface IdentificationEntry {
  collectionIdShort?: string;
  domainId?: string;
  identifier?: string;
  isPrimary?: boolean;
}

// Mode-Typ ersetzt durch HandoverStructureMode
