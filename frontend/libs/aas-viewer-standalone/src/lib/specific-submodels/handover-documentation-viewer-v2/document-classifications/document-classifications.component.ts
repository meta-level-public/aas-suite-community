import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { AasExtractHelper } from '@aas/helpers';
import { Component, Input, computed, signal } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputText } from 'primeng/inputtext';
import { HandoverStructureMode } from '../structure-mode';

@Component({
  selector: 'aas-handover-doc-classifications',
  templateUrl: './document-classifications.component.html',
  imports: [InputGroup, InputGroupAddon, InputText, TranslateModule],
})
export class DocumentClassificationsComponent {
  // --- Input ---------------------------------------------------------------
  private _document = signal<aas.types.SubmodelElementCollection | undefined>(undefined);
  @Input() set document(val: aas.types.SubmodelElementCollection | undefined) {
    this._document.set(val);
  }
  @Input() submodelVersion?: string;

  // --- Sprache -------------------------------------------------------------
  private lang = signal<string>('en');

  // --- Semantik Konstanten ------------------------------------------------
  private static readonly SEM = {
    V1_CONTAINER: '0173-1#02-ABI502#001/0173-1#01-AHF581#001*01',
    V2_CONTAINER: '0173-1#02-ABI502#003',
    CLASS_ID: ['0173-1#02-ABH994#003', '0173-1#02-ABH996#001'],
    CLASS_NAME: ['0173-1#02-AAO099#004', '0173-1#02-AAO102#003'],
    CLASS_SYSTEM: ['0173-1#02-ABH997#001', '0173-1#02-ABH997#003'],
  };

  // --- Modus (V1 vs V2) ---------------------------------------------------
  @Input() mode: HandoverStructureMode = HandoverStructureMode.UNKNOWN;

  // Öffentliche Klassifikationsliste
  classifications = computed<ClassificationEntry[]>(() =>
    this.mode === HandoverStructureMode.V2 ? this.buildV2() : this.buildV1(),
  );

  // --- Konstruktor --------------------------------------------------------
  constructor(private translate: TranslateService) {
    this.lang.set((this.translate.currentLang || this.translate.getDefaultLang() || 'en').toLowerCase());
    this.translate.onLangChange.subscribe((ev) => this.lang.set(ev.lang.toLowerCase()));
  }

  // --- Builder V2 ----------------------------------------------------------

  private buildV2(): ClassificationEntry[] {
    const doc = this._document();
    const c = AasExtractHelper.findList(doc, DocumentClassificationsComponent.SEM.V2_CONTAINER);

    if (!c) return [];
    return (c.value ?? [])
      .filter(
        (entry): entry is aas.types.SubmodelElementCollection => entry instanceof aas.types.SubmodelElementCollection,
      )
      .map((entry) => this.mapCollection(entry));
  }

  // --- Builder V1 ----------------------------------------------------------
  private buildV1(): ClassificationEntry[] {
    const doc = this._document();
    const c = AasExtractHelper.findCollections(doc, DocumentClassificationsComponent.SEM.V1_CONTAINER);

    if (!c) return [];
    return c.map((col) => this.mapCollection(col));
  }

  // --- Mapping ------------------------------------------------------------
  private mapCollection(col: aas.types.SubmodelElementCollection): ClassificationEntry {
    return {
      collectionIdShort: col.idShort ?? undefined,
      classId: AasExtractHelper.findProperty(col, DocumentClassificationsComponent.SEM.CLASS_ID),
      className: AasExtractHelper.findFirstMLP(col, DocumentClassificationsComponent.SEM.CLASS_NAME, this.lang()),
      classificationSystem: AasExtractHelper.findProperty(col, DocumentClassificationsComponent.SEM.CLASS_SYSTEM),
    };
  }
}

export interface ClassificationEntry {
  collectionIdShort?: string;
  classId?: string;
  className?: string;
  classificationSystem?: string;
}

// Mode Typ durch HandoverStructureMode ersetzt
