import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { ISubmodelElement } from '@aas-core-works/aas-core3.1-typescript/types';
import { FilenameHelper, HandoverSemanticGroups, SemanticIdHelper } from '@aas/helpers';
import { Component, Input, OnChanges, OnDestroy, effect, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from 'primeng/accordion';
import { Card } from 'primeng/card';
import { Ripple } from 'primeng/ripple';
import { Subscription } from 'rxjs';
import { ViewerStoreService } from '../../viewer-store.service';
import { HandoverDocumentationDocumentComponent } from './handover-documentation-document/handover-documentation-document.component';
import { SelectDocumentFile } from './select-document-file';

@Component({
  selector: 'aas-handover-documentation-viewer',
  templateUrl: './handover-documentation-viewer.component.html',
  imports: [
    Card,
    Accordion,
    AccordionPanel,
    Ripple,
    AccordionHeader,
    AccordionContent,
    HandoverDocumentationDocumentComponent,
  ],
})
export class HandoverDocumentationViewerComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) documentation: aas.types.Submodel | undefined;

  currentLang = signal('en');

  documents: aas.types.SubmodelElementCollection[] = [];

  // Control which document panels are expanded; default to opening the first, as before
  expandedDocPanels = signal<number[]>([0]);

  private viewerStore = inject(ViewerStoreService);

  specificAssetIds: aas.types.SpecificAssetId[] = [];
  numberOfDocuments: number = 0;
  globalAssetId: string = '';
  FilenameHelper = FilenameHelper;

  fileMap: Map<string, string> = new Map<string, string>();
  fileDataMap: Map<string, string> = new Map<string, string>();
  documentFiles: Map<string, SelectDocumentFile[]> = new Map<string, SelectDocumentFile[]>();

  subscriptions: Subscription[] = [];

  constructor(private translate: TranslateService) {
    this.subscriptions.push(
      this.translate.onLangChange.subscribe((event) => {
        this.currentLang.set(event.lang);
      }),
    );
    this.currentLang.set(this.translate.currentLang);

    // React to highlighted path and expand the corresponding document panel
    effect(() => {
      const target = this.viewerStore.highlightedIdShortPath();
      // no-op if no target
      if (!target) return;
      const matchIdx = this.findDocumentIndexForTarget(target);
      if (matchIdx >= 0) {
        this.expandedDocPanels.set([matchIdx]);
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  ngOnChanges() {
    this.documents = [];
    this.documentation?.submodelElements?.forEach((sme: any) => {
      if (sme instanceof aas.types.SubmodelElementCollection && this.isHandoverDocumentCollection(sme)) {
        this.documents.push(sme);
        if (sme.idShort != null) this.documentFiles.set(sme.idShort, this.getFilenames(sme));
      }
    });

    // Also recompute expansion after documents refresh
    const target = this.viewerStore.highlightedIdShortPath();
    const matchIdx = target ? this.findDocumentIndexForTarget(target) : -1;
    this.expandedDocPanels.set([matchIdx >= 0 ? matchIdx : 0]);
  }

  private findDocumentIndexForTarget(target: string): number {
    // Match if the target starts with the document idShort or includes it followed by '.' or '['
    return this.documents.findIndex((doc) => {
      const id = doc.idShort ?? '';
      if (!id) return false;
      return target === id || target.startsWith(id + '.') || target.startsWith(id + '[');
    });
  }

  getFilenames(document: aas.types.SubmodelElementCollection) {
    const filenames: SelectDocumentFile[] = [];
    const smc = document.value?.find(
      (v) =>
        v.idShort === 'DocumentVersion' ||
        this.hasSemanticId(v, '0173-1#02-ABI503#001/0173-1#01-AHF582#001') ||
        this.hasSemanticId(v, '0173-1#02-ABI503#003/0173-1#01-AHF582#003*01'),
    ) as aas.types.SubmodelElementCollection;
    smc?.value?.forEach((v) => {
      if (
        (v.idShort?.toLowerCase().startsWith('previewfile') ||
          this.hasSemanticId(v, '0173-1#02-ABI505#001/0173-1#01-AHF584#001')) &&
        v instanceof aas.types.File
      ) {
        const filename = v?.value;
        if (filename != null)
          filenames.push({
            path: filename,
            label: this.translate.instant('PREVIEW'),
            idPath: document.idShort + '.' + smc.idShort + '.' + v.idShort,
            idShort: v.idShort ?? '',
            filename: v.value?.replace('file:', '').split('/')?.pop() ?? '',
          });
      }
      if (
        (v.idShort?.toLowerCase().startsWith('digitalfile') ||
          this.hasSemanticId(v, '0173-1#02-ABI504#001/0173-1#01-AHF583#001') ||
          this.hasSemanticId(v, '0173-1#02-ABK126#003')) &&
        v instanceof aas.types.File
      ) {
        const filename = v?.value;
        if (filename != null)
          filenames.push({
            path: filename,
            label: v.idShort ?? filename,
            idPath: document.idShort + '.' + smc.idShort + '.' + v.idShort,
            idShort: v.idShort ?? '',
            filename: v.value?.replace('file:', '').split('/')?.pop() ?? '',
          });
      }
    });
    return filenames;
  }

  hasSemanticId(sme: ISubmodelElement, semanticId: string) {
    return sme.semanticId?.keys.find((k) => k.value.startsWith(semanticId)) != null;
  }

  private isHandoverDocumentCollection(sme: ISubmodelElement) {
    return HandoverSemanticGroups.LEGACY_DOCUMENTS.some((semanticId) => this.hasSemanticId(sme, semanticId));
  }

  getHeader(document: aas.types.SubmodelElementCollection) {
    const el = (
      document.value?.find(
        (v) =>
          v.idShort === 'DocumentVersion' ||
          SemanticIdHelper.hasSemanticId(v, '0173-1#02-ABI503#001/0173-1#01-AHF582#001'),
      ) as aas.types.SubmodelElementCollection
    )?.value?.find(
      (v) => v.idShort === 'Title' || SemanticIdHelper.hasSemanticId(v, '0173-1#02-ABH998#001'),
    ) as aas.types.MultiLanguageProperty;

    const lbl = this.getElementValue(el);
    if (lbl === '') {
      return document.idShort;
    }
    return lbl;
  }

  getElementValue(el: aas.types.MultiLanguageProperty) {
    if (el != null) {
      let found = el.value?.find((e: any) => e.language.toLowerCase() === this.currentLang().toLowerCase());
      if (found != null) {
        return found.text;
      }

      found = el.value?.find((e: any) => e.language.toLowerCase() === 'en');
      if (found != null) {
        return found.text;
      }

      found = el.value?.[0];
      if (found != null) {
        return found.text;
      }
    }

    return '';
  }
}
