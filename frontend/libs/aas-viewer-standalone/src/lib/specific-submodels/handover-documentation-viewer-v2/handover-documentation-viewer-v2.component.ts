import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { FilenameHelper } from '@aas/helpers';
import { NgClass } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, Input, OnChanges, OnDestroy, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MarkdownComponent } from 'ngx-markdown';
import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from 'primeng/accordion';
import { PrimeTemplate } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Ripple } from 'primeng/ripple';
import { Skeleton } from 'primeng/skeleton';
import { Tooltip } from 'primeng/tooltip';
import { lastValueFrom, Subscription } from 'rxjs';
import { ViewerStoreService } from '../../viewer-store.service';
import { DocumentClassificationsComponent } from './document-classifications/document-classifications.component';
import { DocumentIdentificationComponent } from './document-identification/document-identification.component';
import { DocumentVersionsComponent } from './document-versions/document-versions.component';
import { HandoverDocumentationService, HandoverFileGroup } from './handover-documentation.service';
import { HandoverStructureMode } from './structure-mode';

@Component({
  selector: 'aas-handover-documentation-viewer-v2',
  templateUrl: './handover-documentation-viewer-v2.component.html',
  styleUrls: ['./handover-documentation-viewer-v2.component.css'],
  imports: [
    Skeleton,
    ButtonModule,
    Accordion,
    AccordionPanel,
    Ripple,
    AccordionHeader,
    AccordionContent,
    DocumentIdentificationComponent,
    DocumentClassificationsComponent,
    DocumentVersionsComponent,
    Dialog,
    NgClass,
    MarkdownComponent,
    PrimeTemplate,
    TranslateModule,
    Tooltip,
  ],
})
export class HandoverDocumentationViewerV2Component implements OnChanges, OnDestroy {
  @Input({ required: true }) documentation: aas.types.Submodel | undefined;
  submodelVersion = signal<string | undefined>(undefined);

  documents: aas.types.SubmodelElementCollection[] = [];
  structureMode = signal<HandoverStructureMode>(HandoverStructureMode.UNKNOWN);

  expandedPanels = signal<number[]>([0]);
  nestedExpandedPanels = signal<Record<number, string[]>>({});

  currentLang = signal('en');
  private subscriptions: Subscription[] = [];

  fileGroups: HandoverFileGroup[] = [];

  get totalFileCount(): number {
    return this.fileGroups.reduce((s, g) => s + g.files.length, 0);
  }

  previewVisible = signal(false);
  previewData = signal<
    | {
        name: string;
        url: string;
        type: 'image' | 'pdf' | 'xml' | 'json' | 'csv';
        safeUrl?: SafeResourceUrl;
        idPath?: string;
        isExternal?: boolean;
        originalValue?: string;
        objectUrl?: string;
        xmlContent?: string;
        jsonContent?: string;
        csvContent?: string;
      }
    | undefined
  >(undefined);

  private http = inject(HttpClient);
  private translate = inject(TranslateService);
  private sanitizer = inject(DomSanitizer);
  private viewerStore = inject(ViewerStoreService);
  private handoverSvc = inject(HandoverDocumentationService);

  constructor() {
    this.subscriptions.push(
      this.translate.onLangChange.subscribe((e) => {
        this.currentLang.set(e.lang);
        this.buildFileGroups();
      }),
    );
    this.currentLang.set(this.translate.currentLang || 'en');
  }

  ngOnChanges(): void {
    this.submodelVersion.set((this.documentation as any)?.administration?.version);
    this.runAnalysisAndBuild();
  }

  ngOnDestroy(): void {
    for (const s of this.subscriptions)
      try {
        s.unsubscribe();
      } catch {
        // Ignore unsubscribe errors
      }
    this.revokePreviewUrl();
    this.revokeGroupPreviewUrls();
  }

  private async runAnalysisAndBuild() {
    const { mode, documents } = this.handoverSvc.analyze(this.documentation);
    this.structureMode.set(mode);
    this.documents = documents;
    await this.buildFileGroups();
  }

  private async buildFileGroups() {
    this.handoverSvc.revokeGroupPreviewUrls(this.fileGroups);
    this.fileGroups = await this.handoverSvc.buildFileGroups(
      this.documentation,
      this.documents,
      this.structureMode(),
      this.currentLang(),
    );
  }

  // entfernt: lokale Filename/External Helfer -> im Service zentral

  // Delegated helper wrappers (kept for template bindings / previous API expectations)
  private resolveFileUrl(val: string) {
    return this.handoverSvc.resolveFileUrl(val);
  }
  private isExternal(val: string) {
    return this.handoverSvc.isExternal(val);
  }
  private deriveMimeFromName(name: string, type: 'image' | 'pdf') {
    return this.handoverSvc.deriveMimeFromName(name, type);
  }

  private isImageLike(path: string) {
    return FilenameHelper.isImage(path);
  }

  // (Leftover compatibility stubs removed: version title & localization handled in service)

  // entfernt: eigene resolveFileUrl Implementierung (Service Wrapper oben)

  async downloadFile(item: { value: string; name: string; idPath?: string; isExternal?: boolean }, ev: Event) {
    ev.preventDefault();
    let downloadUrl: string;
    if (item.idPath && !(item.isExternal || this.isExternal(item.value))) {
      downloadUrl = await this.buildAttachmentUrl(item.idPath, item.value);
    } else if (item.value.endsWith('/attachment')) {
      downloadUrl = item.value;
    } else if (!item.isExternal && !this.isExternal(item.value)) {
      downloadUrl = await this.buildAttachmentUrl(item.idPath, item.value);
    } else {
      downloadUrl = this.resolveFileUrl(item.value);
    }
    try {
      const headers = (this.viewerStore as any).headers();
      const resp: any = await lastValueFrom(
        this.http.get(downloadUrl, { responseType: 'blob' as 'json', observe: 'response', headers }),
      );
      const blob = resp.body as unknown as Blob;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = item.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    } catch {
      window.open(downloadUrl, '_blank');
    }
  }

  canPreview(file: { value: string; isExternal: boolean; contentType?: string }): boolean {
    if (file.isExternal) return false; // Vorgabe: externe Links direkt in neuem Tab
    const contentType = `${file.contentType ?? ''}`.trim().toLowerCase();
    if (FilenameHelper.isImageContentType(contentType) || contentType.includes('pdf')) return true;
    const val = file.value.toLowerCase();
    return FilenameHelper.isImage(val) || /(\.pdf|\.xml|\.vec|\.json|\.csv)$/.test(val);
  }

  async openPreview(
    file: { value: string; name: string; idPath?: string; isExternal?: boolean; contentType?: string },
    ev: Event,
  ) {
    if (ev) ev.preventDefault();
    this.revokePreviewUrl();
    // Dateityp bestimmen
    const lower = file.value.toLowerCase();
    const contentType = `${file.contentType ?? ''}`.trim().toLowerCase();
    let type: 'image' | 'pdf' | 'xml' | 'json' | 'csv' | undefined;
    if (FilenameHelper.isImageContentType(contentType) || FilenameHelper.isImage(lower)) type = 'image';
    else if (contentType.includes('pdf') || /\.pdf$/.test(lower)) type = 'pdf';
    else if (/\.(xml|vec)$/.test(lower)) type = 'xml';
    else if (/\.json$/.test(lower)) type = 'json';
    else if (/\.csv$/.test(lower)) type = 'csv';
    if (!type) return;
    // Externe Dateien nicht herunterladen (CORS/Größe) -> direkt anzeigen
    if (file.isExternal || this.isExternal(file.value)) {
      const directUrl = this.resolveFileUrl(file.value);
      // Für XML/JSON/CSV versuchen wir Inhalt zu laden (kann bei CORS scheitern)
      if (type === 'xml' || type === 'json' || type === 'csv') {
        try {
          const resp: any = await lastValueFrom(
            this.http.get(directUrl, { responseType: 'text' as 'json', observe: 'response' }),
          );
          const text = resp.body as string;
          if (type === 'xml') {
            this.previewData.set({
              name: file.name,
              url: directUrl,
              type: 'xml',
              idPath: file.idPath,
              isExternal: true,
              originalValue: file.value,
              xmlContent: text,
            });
          } else {
            if (type === 'json') {
              let pretty = text;
              try {
                pretty = JSON.stringify(JSON.parse(text), null, 2);
              } catch {
                // Use original text if JSON parsing fails
              }
              this.previewData.set({
                name: file.name,
                url: directUrl,
                type: 'json',
                idPath: file.idPath,
                isExternal: true,
                originalValue: file.value,
                jsonContent: pretty,
              });
            } else {
              // csv
              this.previewData.set({
                name: file.name,
                url: directUrl,
                type: 'csv',
                idPath: file.idPath,
                isExternal: true,
                originalValue: file.value,
                csvContent: text,
              });
            }
          }
        } catch {
          // Fallback without content on fetch error
          this.previewData.set({
            name: file.name,
            url: directUrl,
            type,
            idPath: file.idPath,
            isExternal: true,
            originalValue: file.value,
          });
        }
        this.previewVisible.set(true);
        return;
      } else {
        const safeUrl = type === 'pdf' ? this.sanitizer.bypassSecurityTrustResourceUrl(directUrl) : undefined;
        this.previewData.set({
          name: file.name,
          url: directUrl,
          type,
          safeUrl,
          idPath: file.idPath,
          isExternal: true,
          originalValue: file.value,
        });
        this.previewVisible.set(true);
        return;
      }
    }

    try {
      const attachmentUrl = await this.buildAttachmentUrl(file.idPath, file.value);
      const headers = (this.viewerStore as any).headers();

      if (type === 'xml' || type === 'json' || type === 'csv') {
        // Text abrufen
        const resp: any = await lastValueFrom(
          this.http.get(attachmentUrl, { responseType: 'text' as 'json', observe: 'response', headers }),
        );
        let textContent = resp.body as string;
        if (type === 'xml') {
          try {
            if (textContent && textContent.indexOf('\n') < 0) {
              const parser = new DOMParser();
              const dom = parser.parseFromString(textContent, 'application/xml');
              if (!dom.querySelector('parsererror')) {
                const serializer = new XMLSerializer();
                textContent = serializer.serializeToString(dom);
              }
            }
          } catch {
            // Keep original XML if formatting fails
          }
        } else if (type === 'json') {
          try {
            textContent = JSON.stringify(JSON.parse(textContent), null, 2);
          } catch {
            // Keep original JSON if formatting fails
          }
        } else if (type === 'csv') {
          // Optional könnten wir Spalten trimmen – vorerst Rohtext
        }
        const blob = new Blob([textContent], {
          type: type === 'xml' ? 'application/xml' : type === 'json' ? 'application/json' : 'text/csv',
        });
        const objectUrl = URL.createObjectURL(blob);
        this.previewData.set({
          name: file.name,
          url: objectUrl,
          type,
          idPath: file.idPath,
          isExternal: false,
          originalValue: file.value,
          objectUrl,
          xmlContent: type === 'xml' ? textContent : undefined,
          jsonContent: type === 'json' ? textContent : undefined,
          csvContent: type === 'csv' ? textContent : undefined,
        });
        this.previewVisible.set(true);
        return;
      }

      // Bisheriges Verhalten für image/pdf
      const resp: any = await lastValueFrom(
        this.http.get(attachmentUrl, { responseType: 'blob' as 'json', observe: 'response', headers }),
      );
      let blob = resp.body as unknown as Blob;
      const desiredType = file.contentType || this.deriveMimeFromName(file.name, type);
      if (blob && desiredType && blob.type !== desiredType) {
        if (type === 'pdf') {
          const head = await blob
            .slice(0, 5)
            .text()
            .catch(() => '');
          if (head.startsWith('%PDF')) blob = new Blob([blob], { type: desiredType });
        } else {
          blob = new Blob([blob], { type: desiredType });
        }
      }
      const previewBlob =
        type === 'image'
          ? await FilenameHelper.buildPreviewImageBlob(
              new File([blob], file.name, { type: blob.type || desiredType || 'application/octet-stream' }),
            )
          : blob;
      const objectUrl = URL.createObjectURL(previewBlob);
      const safeUrl = type === 'pdf' ? this.sanitizer.bypassSecurityTrustResourceUrl(objectUrl) : undefined;
      this.previewData.set({
        name: file.name,
        url: objectUrl,
        type,
        safeUrl,
        idPath: file.idPath,
        isExternal: false,
        originalValue: file.value,
        objectUrl,
      });
      this.previewVisible.set(true);
    } catch {
      const url = await this.buildAttachmentUrl(file.idPath, file.value);
      window.open(url, '_blank');
    }
  }

  openExternal(file: { value: string }, ev: Event) {
    ev.preventDefault();
    window.open(this.resolveFileUrl(file.value), '_blank');
  }

  closePreview() {
    this.previewVisible.set(false);
    this.revokePreviewUrl();
    this.previewData.set(undefined);
  }

  private revokePreviewUrl() {
    const pd = this.previewData();
    if (pd?.objectUrl && pd.objectUrl.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(pd.objectUrl);
      } catch {
        // Ignore revoke errors
      }
    }
  }

  // entfernt: doppelte deriveMimeFromName (Service Wrapper oben)

  private async buildAttachmentUrl(idPath?: string, originalValue?: string) {
    return this.handoverSvc.buildAttachmentUrl(idPath, originalValue);
  }

  private revokeGroupPreviewUrls() {
    for (const g of this.fileGroups) {
      if (g.previewObjectUrl && g.previewObjectUrl.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(g.previewObjectUrl);
        } catch {
          // Ignore revoke errors
        }
      }
      g.previewObjectUrl = undefined;
    }
  }

  /** Ermittelt den Accordion-Titel für ein Dokument.
   * Priorität:
   * 1. Titel der ersten Versions-Gruppe (group.title) für dieses Dokument
   * 2. doc.idShort
   * 3. Übersetzung 'DOCUMENT'
   */
  docHeaderTitle(docIndex: number, doc: aas.types.SubmodelElementCollection): string {
    const group = this.fileGroups.find((g) => g.docIndex === docIndex && g.title?.trim());
    if (group?.title) return group.title;
    if (doc.idShort && doc.idShort.trim().length) return doc.idShort;
    return this.translate.instant('DOCUMENT');
  }

  // preview blob loading handled inside service during buildFileGroups

  /** Öffnet das übergeordnete Dokument & Versions-Unterpanel und scrollt dorthin */
  openDocumentPanelFor(group: { docIndex: number }) {
    const docIndex = group.docIndex;
    // Hauptpanel öffnen
    const current = new Set(this.expandedPanels());
    current.add(docIndex);
    this.expandedPanels.set(Array.from(current).sort((a, b) => a - b));
    // Nested Versions Panel öffnen ('versions')
    const nested = { ...this.nestedExpandedPanels() };
    const docPanels = new Set(nested[docIndex] || []);
    docPanels.add('versions');
    nested[docIndex] = Array.from(docPanels);
    this.nestedExpandedPanels.set(nested);
    // Scroll nach nächstem Tick
    setTimeout(() => {
      const el = document.getElementById(`doc-panel-${docIndex}`);
      if (el) {
        try {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch {
          // Ignore scroll errors
        }
        // Optional Fokus für Accessibility
        (el.querySelector('p-accordion-header button,button,div') as HTMLElement | undefined)?.focus?.();
      }
    }, 0);
  }
}
