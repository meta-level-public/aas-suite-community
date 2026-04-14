import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { DateProxyPipe } from '@aas/common-pipes';
import { AasExtractHelper } from '@aas/helpers';
import { Component, computed, Input, signal } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputText } from 'primeng/inputtext';
import { HandoverStructureMode } from '../structure-mode';

@Component({
  selector: 'aas-handover-doc-versions',
  templateUrl: './document-versions.component.html',
  imports: [InputGroup, InputGroupAddon, InputText, TranslateModule, DateProxyPipe],
})
export class DocumentVersionsComponent {
  // --- Input ---------------------------------------------------------------
  private _document = signal<aas.types.SubmodelElementCollection | undefined>(undefined);
  @Input() set document(val: aas.types.SubmodelElementCollection | undefined) {
    this._document.set(val);
  }
  @Input() submodelVersion?: string;

  // --- Semantics -----------------------------------------------------------
  private static readonly SEM = {
    V1_VERSIONS_CONTAINER: '0173-1#02-ABI503#001/0173-1#01-AHF582#001*01',
    V2_VERSIONS_CONTAINER: '0173-1#02-ABI503#003',
    TITLE: ['0173-1#02-ABH998#003', '0173-1#02-ABH998#001'],
    SUBTITLE: ['0173-1#02-AAO105#002'],
    DESCRIPTION: ['0173-1#02-AAO106#002'],
    VERSION_NUMBER: ['0173-1#02-AAP003#005', '0173-1#02-AAO100#002'],
    KEYWORDS: ['0173-1#02-ABH999#003', '0173-1#02-ABH999#001'],
    STATUS_DATE: ['0173-1#02-ABI000#003', '0173-1#02-ABI000#001'],
    STATUS_VALUE: ['0173-1#02-ABI001#003', '0173-1#02-ABI001#001'],
  };

  // --- Mode ----------------------------------------------------------------
  @Input() mode: HandoverStructureMode = HandoverStructureMode.UNKNOWN;

  // Öffentliche Versionsliste
  versions = computed<VersionEntry[]>(() => (this.mode === HandoverStructureMode.V2 ? this.buildV2() : this.buildV1()));

  constructor(private translate: TranslateService) {}

  // --- Builder V2 ----------------------------------------------------------
  private buildV2(): VersionEntry[] {
    const doc = this._document();
    const c = AasExtractHelper.findList(doc, DocumentVersionsComponent.SEM.V2_VERSIONS_CONTAINER);

    if (!c) return [];
    return (c.value ?? [])
      .filter(
        (entry): entry is aas.types.SubmodelElementCollection => entry instanceof aas.types.SubmodelElementCollection,
      )
      .map((entry) => this.mapCollection(entry));
  }

  // --- Builder V1 ----------------------------------------------------------
  private buildV1(): VersionEntry[] {
    const doc = this._document();
    const c = AasExtractHelper.findCollections(doc, DocumentVersionsComponent.SEM.V1_VERSIONS_CONTAINER);

    if (!c) return [];
    return c.map((col) => this.mapCollection(col));
  }

  // --- Mapping -------------------------------------------------------------
  private mapCollection(col: aas.types.SubmodelElementCollection): VersionEntry {
    const lang = (this.translate.currentLang || this.translate.getDefaultLang() || 'en').toLowerCase();
    const title = AasExtractHelper.findFirstMLP(col, DocumentVersionsComponent.SEM.TITLE, lang) ?? '';
    const statusDateStr = AasExtractHelper.findProperty(col, DocumentVersionsComponent.SEM.STATUS_DATE);
    const statusDate = this.parseUtcDate(statusDateStr);
    return {
      collectionIdShort: col.idShort ?? undefined,
      title,
      versionNumber:
        AasExtractHelper.findProperty(col, DocumentVersionsComponent.SEM.VERSION_NUMBER) ??
        this.findPropertyByIdShort(col, ['Version', 'DocumentVersionId']),
      subtitle: AasExtractHelper.findMLP(col, DocumentVersionsComponent.SEM.SUBTITLE, lang),
      changeDescription:
        AasExtractHelper.findMLP(col, DocumentVersionsComponent.SEM.DESCRIPTION, lang) ??
        this.findMlpByIdShort(col, ['Description', 'Summary'], lang),
      keywords: AasExtractHelper.findMLP(col, DocumentVersionsComponent.SEM.KEYWORDS, lang),
      statusDate,
      status: AasExtractHelper.findProperty(col, DocumentVersionsComponent.SEM.STATUS_VALUE),
    };
  }

  private parseUtcDate(value: string | undefined): Date | undefined {
    if (!value) return undefined;
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    // Ensure we have a timezone; if absent, assume UTC
    const withZone = /Z$|[+-]\d{2}:?\d{2}$/.test(trimmed) ? trimmed : `${trimmed}Z`;
    const time = Date.parse(withZone);
    if (isNaN(time)) return undefined;
    return new Date(time);
  }

  private findPropertyByIdShort(col: aas.types.SubmodelElementCollection, idShorts: string[]) {
    const property = col.value?.find(
      (entry): entry is aas.types.Property =>
        entry instanceof aas.types.Property && idShorts.includes(entry.idShort ?? ''),
    );
    return property?.value ?? undefined;
  }

  private findMlpByIdShort(col: aas.types.SubmodelElementCollection, idShorts: string[], currentLang: string) {
    const mlp = col.value?.find(
      (entry): entry is aas.types.MultiLanguageProperty =>
        entry instanceof aas.types.MultiLanguageProperty && idShorts.includes(entry.idShort ?? ''),
    );
    if (!mlp?.value?.length) return undefined;
    const localized =
      mlp.value.find((entry) => entry.language?.toLowerCase() === currentLang.toLowerCase()) ??
      mlp.value.find((entry) => entry.language?.toLowerCase().startsWith('en')) ??
      mlp.value[0];
    return localized?.text;
  }
}

export interface VersionEntry {
  collectionIdShort?: string;
  title: string;
  versionNumber?: string;
  changeDescription?: string;
  subtitle?: string;
  keywords?: string;
  statusDate?: Date;
  status?: string;
}

// Mode type replaced by HandoverStructureMode
