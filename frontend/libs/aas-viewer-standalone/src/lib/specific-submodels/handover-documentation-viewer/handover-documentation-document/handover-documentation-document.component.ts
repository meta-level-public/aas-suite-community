import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { ISubmodelElement } from '@aas-core-works/aas-core3.1-typescript/types';
import { Component, computed, effect, inject, input, Input, OnChanges, signal, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { AasViewerService } from '../../../aas-viewer.service';

import { EncodingService } from '@aas/common-services';
import { FilenameHelper, SemanticIdHelper } from '@aas/helpers';
import { HttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { saveAs } from 'file-saver-es';
import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from 'primeng/accordion';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputText } from 'primeng/inputtext';
import { Ripple } from 'primeng/ripple';
import { Textarea } from 'primeng/textarea';
import { lastValueFrom } from 'rxjs';
import { ViewerStoreService } from '../../../viewer-store.service';
import { HandoverDocumentationFileComponent } from '../handover-documentation-file/handover-documentation-file.component';
import { SelectDocumentFile } from '../select-document-file';

@Component({
  selector: 'aas-handover-documentation-document',
  templateUrl: './handover-documentation-document.component.html',
  imports: [
    InputGroup,
    InputGroupAddon,
    InputText,
    Textarea,
    Accordion,
    AccordionPanel,
    Ripple,
    AccordionHeader,
    AccordionContent,
    HandoverDocumentationFileComponent,
    TranslateModule,
  ],
})
export class HandoverDocumentationDocumentComponent implements OnChanges {
  document = input.required<aas.types.SubmodelElementCollection | undefined>();
  @Input() currentLang = 'de';
  @Input({ required: true }) submodelIdentifier = '';
  @Input({ required: true }) fileMap: Map<string, string> = new Map<string, string>();
  fileDataMap: Map<string, string> = new Map<string, string>();
  @Input({ required: true }) documentFiles: Map<string, SelectDocumentFile[]> = new Map<string, SelectDocumentFile[]>();
  @ViewChild('fileViewer') fileViewer: HandoverDocumentationFileComponent | undefined;

  documentIds: aas.types.SubmodelElementCollection[] = [];
  classifications: aas.types.SubmodelElementCollection[] = [];

  viewerStore = inject(ViewerStoreService);

  // Expanded panels control
  expandedClassificationPanels = signal<number[]>([0]);
  expandedDocumentIdPanels = signal<number[]>([0]);

  constructor(
    private aasxViewerService: AasViewerService,
    private sanitizer: DomSanitizer,
    private http: HttpClient,
  ) {}

  ngOnChanges(): void {
    this.documentIds = [];
    this.classifications = [];
    const doc = this.document();
    doc?.value?.forEach((sme: any) => {
      if (this.hasSemanticId(sme, '0173-1#02-ABI501#001/0173-1#01-AHF580#001')) {
        this.documentIds.push(sme);
      } else if (
        sme instanceof aas.types.SubmodelElementCollection &&
        (sme.idShort?.toLowerCase().startsWith('documentclassification') ||
          this.hasSemanticId(sme, '0173-1#02-ABI502#001/0173-1#01-AHF581#001'))
      ) {
        this.classifications.push(sme);
      }
    });

    // Update defaults when inputs change
    this.expandedClassificationPanels.set([0]);
    this.expandedDocumentIdPanels.set([0]);
  }

  // React to highlighted path to open the relevant inner accordions
  private _pathEffect = effect(() => {
    const target = this.viewerStore.highlightedIdShortPath();
    const docId = this.document()?.idShort ?? '';
    if (!target || !docId) return;

    // Only proceed if target is within this document
    if (!(target === docId || target.startsWith(docId + '.') || target.startsWith(docId + '['))) return;

    // DocumentClassification index
    const clsPrefix = docId + '.DocumentClassification';
    const clsIdx = this.extractIndexAfterPrefix(target, clsPrefix);
    if (clsIdx != null) {
      this.expandedClassificationPanels.set([clsIdx]);
    }

    // DocumentId index (some AAS use DocumentId as a collection, optionally indexed)
    const idPrefix = docId + '.DocumentId';
    const idIdx = this.extractIndexAfterPrefix(target, idPrefix);
    if (idIdx != null) {
      this.expandedDocumentIdPanels.set([idIdx]);
    } else if (target.startsWith(idPrefix)) {
      // At least open the first DocumentId panel if it targets DocumentId but has no explicit index
      this.expandedDocumentIdPanels.set([0]);
    }
  });

  private extractIndexAfterPrefix(target: string, prefix: string): number | null {
    if (!target.startsWith(prefix)) return null;
    const rest = target.slice(prefix.length);
    if (rest.startsWith('[')) {
      const end = rest.indexOf(']');
      if (end > 1) {
        const idxStr = rest.slice(1, end);
        const idx = Number(idxStr);
        return Number.isFinite(idx) ? idx : null;
      }
    } else if (rest.startsWith('.')) {
      // no index specified, default to 0
      return 0;
    } else if (rest.length === 0) {
      return 0;
    }
    return null;
  }

  async loadPreview(selectedDocument: SelectDocumentFile) {
    if (this.fileMap.has(selectedDocument.path)) return;
    if (selectedDocument.path === '') return;

    try {
      const _submodelIdentifier = EncodingService.base64urlEncode(this.submodelIdentifier);

      const url = `${await this.viewerStore.currentSmUrl()}/submodel-elements/${encodeURIComponent(selectedDocument.idPath)}/attachment`;

      const response = await lastValueFrom(
        this.http.get<any>(url, {
          responseType: 'blob' as any,
          observe: 'response',
          headers: this.viewerStore.headers(),
        }),
      );

      if (FilenameHelper.isPdf(selectedDocument.filename)) {
        const newBlob = new Blob([response.body], { type: 'application/pdf' });
        this.fileMap.set(selectedDocument.path, URL.createObjectURL(newBlob));
      } else {
        this.fileMap.set(selectedDocument.path, URL.createObjectURL(response.body));
      }

      if (FilenameHelper.isXmlType(selectedDocument.filename)) {
        const xmlText = await response.body.text();
        this.fileDataMap.set(selectedDocument.path, xmlText);
      }

      this.fileViewer?.selectedFileChanged();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
      // ignore
    }
  }

  documentId = computed(() => {
    return (
      (
        (
          this.document()?.value?.find(
            (v) =>
              v.idShort === 'DocumentId' ||
              SemanticIdHelper.hasSemanticId(v, '0173-1#02-ABI501#001/0173-1#01-AHF580#001'),
          ) as aas.types.SubmodelElementCollection
        )?.value?.find((v) => v.idShort === 'DocumentDomainId') as aas.types.Property
      )?.value ?? ''
    );
  });

  documentIsPrimary = computed(() => {
    return (
      (
        (
          this.document()?.value?.find(
            (v) =>
              v.idShort === 'DocumentId' ||
              SemanticIdHelper.hasSemanticId(v, '0173-1#02-ABI501#001/0173-1#01-AHF580#001'),
          ) as aas.types.SubmodelElementCollection
        )?.value?.find((v) => v.idShort === 'IsPrimary') as aas.types.Property
      )?.value === 'true'
    );
  });

  getClassificationId(sme: aas.types.SubmodelElementCollection) {
    return (
      (
        sme.value?.find(
          (v) => v.idShort === 'ClassId' || SemanticIdHelper.hasSemanticId(v, '0173-1#02-ABH996#001'),
        ) as aas.types.Property
      )?.value ?? ''
    );
  }

  getClassificationSystem(sme: aas.types.SubmodelElementCollection) {
    const el = sme.value?.find(
      (v) => v.idShort === 'ClassName' || SemanticIdHelper.hasSemanticId(v, '0173-1#02-ABJ219#003'),
    );
    if (el instanceof aas.types.MultiLanguageProperty) {
      return this.getElementValue(el);
    }
    if (el instanceof aas.types.Property) {
      return el.value;
    }
    return '';
  }

  getClassificationName(sme: aas.types.SubmodelElementCollection) {
    return (
      (
        sme.value?.find(
          (v) => v.idShort === 'ClassificationSystem' || SemanticIdHelper.hasSemanticId(v, '0173-1#02-ABH997#003'),
        ) as aas.types.Property
      )?.value ?? ''
    );
  }

  language = computed(() => {
    return (
      (
        (
          this.document()?.value?.find(
            (v) =>
              v.idShort === 'DocumentVersion' ||
              SemanticIdHelper.hasSemanticId(v, '0173-1#02-ABI503#001/0173-1#01-AHF582#001'),
          ) as aas.types.SubmodelElementCollection
        )?.value?.find((v) => v.idShort === 'Language') as aas.types.Property
      )?.value ?? ''
    );
  });

  version = computed(() => {
    return (
      (
        (
          this.document()?.value?.find(
            (v) =>
              v.idShort === 'DocumentVersion' ||
              SemanticIdHelper.hasSemanticId(v, '0173-1#02-ABI503#001/0173-1#01-AHF582#001'),
          ) as aas.types.SubmodelElementCollection
        )?.value?.find(
          (v) => v.idShort === 'DocumentVersionId' || SemanticIdHelper.hasSemanticId(v, '0173-1#02-AAO100#002'),
        ) as aas.types.Property
      )?.value ?? ''
    );
  });

  title = computed(() => {
    const el = (
      this.document()?.value?.find(
        (v) =>
          v.idShort === 'DocumentVersion' ||
          SemanticIdHelper.hasSemanticId(v, '0173-1#02-ABI503#001/0173-1#01-AHF582#001'),
      ) as aas.types.SubmodelElementCollection
    )?.value?.find((v) => v.idShort === 'Title') as aas.types.MultiLanguageProperty;

    return this.getElementValue(el);
  });

  summary = computed(() => {
    const el = (
      this.document()?.value?.find(
        (v) =>
          v.idShort === 'DocumentVersion' ||
          SemanticIdHelper.hasSemanticId(v, '0173-1#02-ABI503#001/0173-1#01-AHF582#001'),
      ) as aas.types.SubmodelElementCollection
    )?.value?.find((v) => v.idShort === 'Summary') as aas.types.MultiLanguageProperty;

    return this.getElementValue(el);
  });

  keyWords = computed(() => {
    const el = (
      this.document()?.value?.find(
        (v) =>
          v.idShort === 'DocumentVersion' ||
          SemanticIdHelper.hasSemanticId(v, '0173-1#02-ABI503#001/0173-1#01-AHF582#001'),
      ) as aas.types.SubmodelElementCollection
    )?.value?.find((v) => v.idShort === 'KeyWords') as aas.types.MultiLanguageProperty;

    return this.getElementValue(el);
  });

  previewFilename = computed(() => {
    const el = (
      this.document()?.value?.find(
        (v) =>
          v.idShort === 'DocumentVersion' ||
          SemanticIdHelper.hasSemanticId(v, '0173-1#02-ABI503#001/0173-1#01-AHF582#001'),
      ) as aas.types.SubmodelElementCollection
    )?.value?.find((v) => v.idShort === 'PreviewFile') as aas.types.MultiLanguageProperty;

    return this.getElementValue(el);
  });

  getElementValue(el: aas.types.MultiLanguageProperty) {
    if (el != null) {
      let found = el.value?.find((e: any) => e.language.toLowerCase() === this.currentLang.toLowerCase());
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

  hasSemanticId(sme: ISubmodelElement, semanticId: string) {
    return sme.semanticId?.keys.find((k) => k.value.startsWith(semanticId)) != null;
  }

  async download(file: SelectDocumentFile) {
    const blob = await fetch(this.fileMap.get(file.path) ?? '').then((r) => r.blob());

    saveAs(blob, file.filename);
  }
}
