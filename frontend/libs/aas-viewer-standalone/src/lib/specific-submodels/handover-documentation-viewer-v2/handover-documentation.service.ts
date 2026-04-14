import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { EncodingService } from '@aas/common-services';
import { FilenameHelper, HandoverSemanticGroups, HandoverSemantics, SemanticIdHelper } from '@aas/helpers';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { lastValueFrom } from 'rxjs';
import { ViewerStoreService } from '../../viewer-store.service';
import { HandoverStructureMode } from './structure-mode';

export interface HandoverFileGroup {
  groupId: string;
  title: string;
  previewUrl?: string;
  previewType?: 'image' | 'pdf';
  previewContentType?: string;
  previewSafeUrl?: SafeResourceUrl;
  previewIdPath?: string;
  previewObjectUrl?: string;
  previewOriginalValue?: string;
  previewError?: boolean;
  previewLoading?: boolean;
  docIndex: number;
  files: Array<{
    file: aas.types.File;
    name: string;
    value: string;
    contentType?: string;
    isExternal: boolean;
    idPath: string;
  }>;
}

@Injectable({ providedIn: 'root' })
export class HandoverDocumentationService {
  private http = inject(HttpClient);
  private translate = inject(TranslateService);
  private sanitizer = inject(DomSanitizer);
  private viewerStore = inject(ViewerStoreService);

  analyze(sub: aas.types.Submodel | undefined): {
    mode: HandoverStructureMode;
    documents: aas.types.SubmodelElementCollection[];
  } {
    const documents: aas.types.SubmodelElementCollection[] = [];
    if (!sub) return { mode: HandoverStructureMode.UNKNOWN, documents };
    const adminVersion: string | undefined = (sub as any)?.administration?.version;
    let mode: HandoverStructureMode = HandoverStructureMode.UNKNOWN;
    if (adminVersion === '2' || this.hasV2DocumentStructure(sub)) mode = HandoverStructureMode.V2;
    else if (adminVersion === '1' || this.hasV1DocumentStructure(sub)) mode = HandoverStructureMode.V1;

    if (mode === HandoverStructureMode.V2) {
      const container = this.findContainerSmc(sub);
      if (container) {
        for (const v of (container as any).value || []) {
          if (v instanceof aas.types.SubmodelElementCollection) {
            if (SemanticIdHelper.hasSemanticId(v, HandoverSemantics.DOCUMENT_V2)) documents.push(v);
          }
        }
      }
    } else if (mode === HandoverStructureMode.V1) {
      if (sub.submodelElements) {
        for (const el of sub.submodelElements) {
          if (el instanceof aas.types.SubmodelElementCollection) {
            if (HandoverSemanticGroups.LEGACY_DOCUMENTS.some((s) => SemanticIdHelper.hasSemanticId(el, s as any)))
              documents.push(el);
          }
        }
      }
    }
    return { mode, documents };
  }

  async buildFileGroups(
    sub: aas.types.Submodel | undefined,
    documents: aas.types.SubmodelElementCollection[],
    mode: HandoverStructureMode,
    currentLang: string,
  ): Promise<HandoverFileGroup[]> {
    const groups: HandoverFileGroup[] = [];
    if (!sub || !documents.length) return groups;
    const container = mode === HandoverStructureMode.V2 ? this.findContainerSmc(sub) : undefined;
    const containerId = container?.idShort || undefined;
    const containerIsList = !!container && container instanceof aas.types.SubmodelElementList;
    const submodelIdentification: string | undefined = (sub as any)?.id;
    const base64Id = submodelIdentification ? EncodingService.base64urlEncode(submodelIdentification) : undefined;

    for (let docIdx = 0; docIdx < documents.length; docIdx++) {
      const doc = documents[docIdx];
      let baseDocPath: string | undefined;
      if (mode === HandoverStructureMode.V2 && container && containerId) {
        const cIdx = (container as any).value?.indexOf(doc) ?? -1;
        if (cIdx < 0) continue;
        baseDocPath = containerIsList
          ? `${containerId}[${cIdx}]`
          : doc.idShort
            ? `${containerId}.${doc.idShort}`
            : undefined;
      } else if (doc.idShort) baseDocPath = doc.idShort;
      if (!baseDocPath) continue;

      const versionList = this.findDocumentVersionList(doc);
      if (versionList && versionList.idShort) {
        const versionListIsList = versionList instanceof aas.types.SubmodelElementList;
        const versions = versionList.value || [];
        for (let vIdx = 0; vIdx < versions.length; vIdx++) {
          const versionEntry = versions[vIdx];
          if (!(versionEntry instanceof aas.types.SubmodelElementCollection)) continue;
          if (!versionListIsList && !versionEntry.idShort) continue;
          const versionPath = `${baseDocPath}.${versionList.idShort}${versionListIsList ? `[${vIdx}]` : `.${versionEntry.idShort}`}`;
          const fileList = versionEntry.value?.find(
            (v): v is aas.types.SubmodelElementList =>
              v instanceof aas.types.SubmodelElementList &&
              SemanticIdHelper.hasSemanticId(v, HandoverSemantics.FILE_LIST_V2),
          );
          if (!fileList || !fileList.idShort) continue;
          const fileListIsList = fileList instanceof aas.types.SubmodelElementList;
          const files: HandoverFileGroup['files'] = [];
          for (let fIdx = 0; fIdx < (fileList.value || []).length; fIdx++) {
            const f = (fileList.value || [])[fIdx];
            if (!(f instanceof aas.types.File)) continue;
            if (typeof f.value !== 'string' || f.value.trim() === '') continue;
            const raw = f.value.trim();
            const idPath = `${versionPath}.${fileList.idShort}${fileListIsList ? `[${fIdx}]` : `.${f.idShort}`}`;
            let name = this.extractFilename(raw) || f.idShort || `file${fIdx}`;
            name = this.stripSubmodelArtifacts(name, base64Id, idPath);
            files.push({
              file: f,
              name,
              value: raw,
              contentType: f.contentType?.trim() || undefined,
              isExternal: this.isExternal(raw),
              idPath,
            });
          }
          if (!files.length) continue;
          const previewMeta = this.resolvePreview(versionEntry, versionPath, currentLang);
          groups.push({
            groupId: `${doc.idShort || baseDocPath}:${(versionEntry as any).idShort ?? vIdx}`,
            title: this.getVersionTitle(versionEntry, currentLang) || versionEntry.idShort || doc.idShort || 'Document',
            previewUrl: previewMeta?.url, // raw (will be replaced by blob later if internal)
            previewType: previewMeta?.type,
            previewContentType: previewMeta?.contentType,
            previewSafeUrl: previewMeta?.safeUrl,
            previewOriginalValue: previewMeta?.url,
            previewIdPath: previewMeta?.idPath,
            docIndex: docIdx,
            files,
          });
        }
        continue;
      }

      const legacyVersion = this.findLegacyVersionCollection(doc);
      if (legacyVersion && legacyVersion.idShort) {
        const versionPath = `${baseDocPath}.${legacyVersion.idShort}`;
        const legacyFiles: HandoverFileGroup['files'] = [];
        for (const f of legacyVersion.value || []) {
          if (!(f instanceof aas.types.File)) continue;
          if (typeof f.value !== 'string' || f.value.trim() === '') continue;
          if (this.isLegacyFile(f)) {
            const raw = f.value.trim();
            const idPath = `${versionPath}.${f.idShort}`;
            let name = this.extractFilename(raw) || f.idShort || 'file';
            name = this.stripSubmodelArtifacts(name, base64Id, idPath);
            legacyFiles.push({
              file: f,
              name,
              value: raw,
              contentType: f.contentType?.trim() || undefined,
              isExternal: this.isExternal(raw),
              idPath,
            });
          }
        }
        if (legacyFiles.length) {
          const legacyPreviewMeta = this.resolvePreview(legacyVersion, versionPath, currentLang);
          groups.push({
            groupId: `${doc.idShort || baseDocPath}:legacy`,
            title:
              this.getVersionTitle(legacyVersion, currentLang) || legacyVersion.idShort || doc.idShort || 'Document',
            previewUrl: legacyPreviewMeta?.url,
            previewType: legacyPreviewMeta?.type,
            previewContentType: legacyPreviewMeta?.contentType,
            previewSafeUrl: legacyPreviewMeta?.safeUrl,
            previewOriginalValue: legacyPreviewMeta?.url,
            previewIdPath: legacyPreviewMeta?.idPath,
            docIndex: docIdx,
            files: legacyFiles,
          });
          continue;
        }
      }

      const directFileList = doc.value?.find(
        (v): v is aas.types.SubmodelElementList =>
          v instanceof aas.types.SubmodelElementList &&
          SemanticIdHelper.hasSemanticId(v, HandoverSemantics.FILE_LIST_V2),
      );
      if (directFileList && directFileList.idShort) {
        const listIsList = directFileList instanceof aas.types.SubmodelElementList;
        const files: HandoverFileGroup['files'] = [];
        for (let fIdx = 0; fIdx < (directFileList.value || []).length; fIdx++) {
          const f = (directFileList.value || [])[fIdx];
          if (!(f instanceof aas.types.File)) continue;
          if (typeof f.value !== 'string' || f.value.trim() === '') continue;
          const raw = f.value.trim();
          const idPath = `${baseDocPath}.${directFileList.idShort}${listIsList ? `[${fIdx}]` : `.${f.idShort}`}`;
          let name = this.extractFilename(raw) || f.idShort || `file${fIdx}`;
          name = this.stripSubmodelArtifacts(name, base64Id, idPath);
          files.push({
            file: f,
            name,
            value: raw,
            contentType: f.contentType?.trim() || undefined,
            isExternal: this.isExternal(raw),
            idPath,
          });
        }
        if (files.length) {
          const previewMeta = this.resolvePreview(doc, baseDocPath, currentLang);
          groups.push({
            groupId: `${doc.idShort || baseDocPath}:root`,
            title: this.getVersionTitle(doc, currentLang) || doc.idShort || 'Document',
            previewUrl: previewMeta?.url,
            previewType: previewMeta?.type,
            previewContentType: previewMeta?.contentType,
            previewSafeUrl: previewMeta?.safeUrl,
            previewOriginalValue: previewMeta?.url,
            previewIdPath: previewMeta?.idPath,
            docIndex: docIdx,
            files,
          });
          continue;
        }
      }

      const directLegacyFiles: HandoverFileGroup['files'] = [];
      for (const v of doc.value || []) {
        if (v instanceof aas.types.File) {
          if (typeof v.value !== 'string' || v.value.trim() === '') continue;
          if (this.isLegacyFile(v)) {
            const raw = v.value.trim();
            const idPath = `${baseDocPath}.${v.idShort}`;
            let name = this.extractFilename(raw) || v.idShort || 'file';
            name = this.stripSubmodelArtifacts(name, base64Id, idPath);
            directLegacyFiles.push({
              file: v,
              name,
              value: raw,
              contentType: v.contentType?.trim() || undefined,
              isExternal: this.isExternal(raw),
              idPath,
            });
          }
        }
      }
      if (directLegacyFiles.length) {
        const previewMeta = this.resolvePreview(doc, baseDocPath, currentLang);
        groups.push({
          groupId: `${doc.idShort || baseDocPath}:root`,
          title: this.getVersionTitle(doc, currentLang) || doc.idShort || 'Document',
          previewUrl: previewMeta?.url,
          previewType: previewMeta?.type,
          previewContentType: previewMeta?.contentType,
          previewSafeUrl: previewMeta?.safeUrl,
          previewOriginalValue: previewMeta?.url,
          previewIdPath: previewMeta?.idPath,
          docIndex: docIdx,
          files: directLegacyFiles,
        });
      }
    }

    // Previews (Bilder) laden (intern) -> asynchron
    await this.loadPreviewBlobs(groups);

    // Sort files inside each group so that the preview file (if any) comes first
    for (const g of groups) {
      if (g.previewOriginalValue) {
        g.files.sort((a, b) => (a.value === g.previewOriginalValue ? -1 : b.value === g.previewOriginalValue ? 1 : 0));
      }
    }
    return groups;
  }

  async loadPreviewBlobs(groups: HandoverFileGroup[]): Promise<void> {
    if (!groups.length) return;
    const headers = (this.viewerStore as any).headers?.() || undefined;
    const currentRef = groups;
    const tasks: Promise<void>[] = [];
    for (const group of groups) {
      if (!group.previewIdPath || !group.previewOriginalValue) continue;
      // Nur für interne Previews mit idPath downloaden
      if (this.isExternal(group.previewOriginalValue)) continue;
      group.previewLoading = true;
      tasks.push(
        (async () => {
          try {
            const attachmentUrl = await this.buildAttachmentUrl(group.previewIdPath!, group.previewOriginalValue);
            const resp: any = await lastValueFrom(
              this.http.get(attachmentUrl, { responseType: 'blob' as 'json', observe: 'response', headers }),
            );
            let blob = resp.body as unknown as Blob;
            const desiredType =
              group.previewContentType ||
              this.deriveMimeFromName((group.previewOriginalValue || '').toLowerCase(), group.previewType || 'image');
            if (desiredType && blob && (!blob.type || blob.type !== desiredType)) {
              const head = await blob
                .slice(0, 8)
                .arrayBuffer()
                .catch(() => undefined);
              if (head) {
                const bytes = new Uint8Array(head);
                const isPng = bytes[0] === 0x89 && bytes[1] === 0x50;
                const isJpg = bytes[0] === 0xff && bytes[1] === 0xd8;
                if (isPng || isJpg) blob = new Blob([blob], { type: desiredType });
              }
            }
            const previewName = this.extractFilename(group.previewOriginalValue ?? '') || 'preview';
            const previewBlob =
              group.previewType === 'image'
                ? await FilenameHelper.buildPreviewImageBlob(
                    new File([blob], previewName, {
                      type: blob.type || desiredType || 'application/octet-stream',
                    }),
                  )
                : blob;
            const objectUrl = URL.createObjectURL(previewBlob);
            if (groups !== currentRef) {
              URL.revokeObjectURL(objectUrl);
              return;
            }
            group.previewObjectUrl = objectUrl;
            group.previewUrl = objectUrl;
            group.previewSafeUrl =
              group.previewType === 'pdf' ? this.sanitizer.bypassSecurityTrustResourceUrl(objectUrl) : undefined;
            group.previewLoading = false;
          } catch {
            group.previewLoading = false;
            /* ignore */
          }
        })(),
      );
    }
    await Promise.all(tasks).catch(() => undefined);
  }

  revokeGroupPreviewUrls(groups: HandoverFileGroup[]) {
    for (const g of groups) {
      if (g.previewObjectUrl && g.previewObjectUrl.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(g.previewObjectUrl);
        } catch {
          // Ignore revoke errors
        }
      }
      g.previewObjectUrl = undefined;
      g.previewSafeUrl = undefined;
    }
  }

  // --- Preview & Download helpers for component reuse ---
  async buildAttachmentUrl(idPath?: string, originalValue?: string): Promise<string> {
    if (!idPath) return this.resolveFileUrl(originalValue || '');
    const base = (await (this.viewerStore as any).currentSmUrl()) as string;
    return `${base}/submodel-elements/${encodeURIComponent(idPath)}/attachment`;
  }

  resolveFileUrl(val: string): string {
    if (this.isExternal(val)) return val;
    return FilenameHelper.replaceFileUri(val) ?? val;
  }

  isExternal(val: string) {
    return /^https?:\/\//i.test(val);
  }

  deriveMimeFromName(name: string, type: 'image' | 'pdf'): string | undefined {
    if (type === 'pdf') return 'application/pdf';
    return FilenameHelper.getImageContentType(name);
  }

  // --- Internal helpers ---
  private findContainerSmc(
    sub: aas.types.Submodel,
  ): aas.types.SubmodelElementCollection | aas.types.SubmodelElementList | undefined {
    if (!sub?.submodelElements) return undefined;
    return sub.submodelElements.find(
      (v: any) =>
        (v instanceof aas.types.SubmodelElementCollection || v instanceof aas.types.SubmodelElementList) &&
        SemanticIdHelper.hasSemanticId(v, HandoverSemantics.CONTAINER_V2),
    ) as any;
  }

  private hasV2DocumentStructure(sub: aas.types.Submodel): boolean {
    const container = this.findContainerSmc(sub);
    if (!container) {
      return false;
    }

    return (container.value || []).some(
      (element): element is aas.types.SubmodelElementCollection =>
        element instanceof aas.types.SubmodelElementCollection &&
        SemanticIdHelper.hasSemanticId(element, HandoverSemantics.DOCUMENT_V2),
    );
  }

  private hasV1DocumentStructure(sub: aas.types.Submodel): boolean {
    if (!sub.submodelElements) {
      return false;
    }

    return sub.submodelElements.some(
      (element): element is aas.types.SubmodelElementCollection =>
        element instanceof aas.types.SubmodelElementCollection &&
        HandoverSemanticGroups.LEGACY_DOCUMENTS.some((semanticId) =>
          SemanticIdHelper.hasSemanticId(element, semanticId),
        ),
    );
  }

  private findDocumentVersionList(doc: aas.types.SubmodelElementCollection): aas.types.SubmodelElementList | undefined {
    return doc.value?.find(
      (v): v is aas.types.SubmodelElementList =>
        v instanceof aas.types.SubmodelElementList &&
        SemanticIdHelper.hasSemanticId(v, HandoverSemantics.VERSION_LIST_V2),
    );
  }

  private findLegacyVersionCollection(
    doc: aas.types.SubmodelElementCollection,
  ): aas.types.SubmodelElementCollection | undefined {
    return doc.value?.find(
      (v): v is aas.types.SubmodelElementCollection =>
        v instanceof aas.types.SubmodelElementCollection &&
        (SemanticIdHelper.hasSemanticId(v, HandoverSemantics.VERSION_SINGLE_V1) ||
          SemanticIdHelper.hasSemanticId(v, HandoverSemantics.VERSION_SINGLE_V1_VARIANT)),
    );
  }

  private extractFilename(path: string): string {
    const sanitized = path.replace(/\\/g, '/');
    const parts = sanitized.split('/');
    return parts[parts.length - 1] || path;
  }

  private stripSubmodelArtifacts(name: string, encodedId?: string, idPath?: string): string {
    let result = name;
    if (encodedId) {
      const esc = encodedId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const allOccurrences = new RegExp(`${esc}(?:[_.-])?`, 'gi');
      result = result.replace(allOccurrences, '');
    }
    // Semantische Segmente
    result = result.replace(/(CEDeclaration\.DocumentVersion\.DigitalFile[-_.])+/g, '');
    // idPath Tokens entfernen (falls vorhanden)
    if (idPath) {
      // Tokens extrahieren (Punkte, Indizes entfernen)
      const rawTokens = idPath
        .split(/\./g)
        .map((t) => t.replace(/\[[0-9]+\]/g, ''))
        .filter((t) => !!t && !/^\d+$/.test(t));
      if (rawTokens.length) {
        // längere Varianten zuerst (ganzer Pfad zusammengesetzt)
        const variants: string[] = [];
        const joinedDot = rawTokens.join('.');
        if (joinedDot.length > 4) variants.push(joinedDot);
        const joinedDash = rawTokens.join('-');
        if (joinedDash !== joinedDot && joinedDash.length > 4) variants.push(joinedDash);
        const joinedUnderscore = rawTokens.join('_');
        if (joinedUnderscore !== joinedDot && joinedUnderscore.length > 4) variants.push(joinedUnderscore);
        // Einzel-Tokens auch (ab Länge > 3 um Noise zu vermeiden)
        for (const token of rawTokens.filter((t) => t.length > 3)) variants.push(token);
        for (const v of variants) {
          const escv = v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          // Entferne Variante mit optionalen Trennern davor/danach
          const re = new RegExp(`(?:^|[-_.])${escv}(?=$|[-_.])`, 'gi');
          result = result.replace(re, (m) => {
            // Wenn Match einen Trenner davor hat und danach ebenfalls einer folgt → reduziere doppelte
            return m.startsWith('-') || m.startsWith('_') || m.startsWith('.') ? m[0] : '';
          });
        }
      }
    }
    // Mehrfache Trenner reduzieren & trimmen
    result = result.replace(/[-_.]{2,}/g, '-');
    result = result.replace(/^[-_.]+/, '').replace(/[-_.]+$/, '');
    return result || name;
  }

  private isLegacyFile(f: aas.types.File): boolean {
    return !!(
      f.idShort?.toLowerCase().startsWith('previewfile') ||
      f.idShort?.toLowerCase().startsWith('digitalfile') ||
      SemanticIdHelper.hasSemanticId(f, HandoverSemantics.FILE_PREVIEW_LEGACY) ||
      SemanticIdHelper.hasSemanticId(f, HandoverSemantics.FILE_DIGITAL_LEGACY) ||
      SemanticIdHelper.hasSemanticId(f, HandoverSemantics.FILE_GENERIC_LEGACY)
    );
  }

  private resolvePreview(
    versionSmc: aas.types.SubmodelElementCollection,
    versionPath: string | undefined,
    currentLang: string,
  ):
    | { url: string; type: 'image' | 'pdf'; contentType?: string; idPath?: string; safeUrl?: SafeResourceUrl }
    | undefined {
    const fileListPreview = this.resolvePreviewFromFileList(versionSmc, versionPath);
    if (fileListPreview) {
      return fileListPreview;
    }

    const previewEl = versionSmc.value?.find(
      (v) =>
        (v.idShort?.toLowerCase() === 'previewfile' ||
          (v instanceof aas.types.File &&
            (SemanticIdHelper.hasSemanticId(v, HandoverSemantics.FILE_PREVIEW_LEGACY) ||
              SemanticIdHelper.hasSemanticId(v, HandoverSemantics.FILE_DIGITAL_LEGACY) ||
              SemanticIdHelper.hasSemanticId(v, HandoverSemantics.FILE_GENERIC_LEGACY)))) &&
        (v instanceof aas.types.MultiLanguageProperty || v instanceof aas.types.File),
    );
    if (!previewEl) return undefined;

    if (previewEl instanceof aas.types.File && typeof previewEl.value === 'string') {
      const url = previewEl.value.trim();
      const type = this.getPreviewType(url, previewEl.contentType ?? undefined);
      if (type) {
        const idPath = previewEl.idShort && versionPath ? `${versionPath}.${previewEl.idShort}` : undefined;
        return {
          url: this.resolveFileUrl(url),
          contentType: previewEl.contentType?.trim() || undefined,
          idPath,
          type,
          safeUrl: this.buildSafePreviewUrl(url, type),
        };
      }
      return undefined;
    }
    if (previewEl instanceof aas.types.MultiLanguageProperty) {
      const val = this.getLocalizedText(previewEl, currentLang);
      const type = val ? this.getPreviewType(val) : undefined;
      if (val && type) return { url: this.resolveFileUrl(val), type, safeUrl: this.buildSafePreviewUrl(val, type) };
    }
    return undefined;
  }

  private isImageLike(path: string) {
    return FilenameHelper.isImage(path);
  }

  private resolvePreviewFromFileList(
    versionSmc: aas.types.SubmodelElementCollection,
    versionPath: string | undefined,
  ):
    | { url: string; type: 'image' | 'pdf'; contentType?: string; idPath?: string; safeUrl?: SafeResourceUrl }
    | undefined {
    const fileList = versionSmc.value?.find(
      (value): value is aas.types.SubmodelElementList =>
        value instanceof aas.types.SubmodelElementList &&
        SemanticIdHelper.hasSemanticId(value, HandoverSemantics.FILE_LIST_V2),
    );

    if (!fileList || !fileList.idShort) {
      return undefined;
    }

    const files = (fileList.value || []).filter(
      (entry): entry is aas.types.File =>
        entry instanceof aas.types.File && typeof entry.value === 'string' && `${entry.value ?? ''}`.trim() !== '',
    );

    const previewFile =
      files.find(
        (entry) => this.getPreviewType(`${entry.value ?? ''}`.trim(), entry.contentType ?? undefined) === 'image',
      ) ??
      files.find(
        (entry) => this.getPreviewType(`${entry.value ?? ''}`.trim(), entry.contentType ?? undefined) === 'pdf',
      );

    if (!previewFile) {
      return undefined;
    }

    const previewValue = `${previewFile.value ?? ''}`.trim();
    const previewType = this.getPreviewType(previewValue, previewFile.contentType ?? undefined);

    if (!previewType) {
      return undefined;
    }

    const previewIndex = files.indexOf(previewFile);
    const idPath = versionPath ? `${versionPath}.${fileList.idShort}[${previewIndex}]` : undefined;

    return {
      url: this.resolveFileUrl(previewValue),
      contentType: previewFile.contentType?.trim() || undefined,
      type: previewType,
      idPath,
      safeUrl: this.buildSafePreviewUrl(previewValue, previewType),
    };
  }

  private getPreviewType(path: string, contentType?: string): 'image' | 'pdf' | undefined {
    const normalizedContentType = `${contentType ?? ''}`.trim().toLowerCase();

    if (FilenameHelper.isImageContentType(normalizedContentType)) {
      return 'image';
    }

    if (normalizedContentType.includes('pdf')) {
      return 'pdf';
    }

    if (this.isImageLike(path)) {
      return 'image';
    }

    if (/\.pdf$/i.test(path.toLowerCase())) {
      return 'pdf';
    }

    return undefined;
  }

  private buildSafePreviewUrl(path: string, type: 'image' | 'pdf') {
    if (type !== 'pdf') {
      return undefined;
    }

    return this.sanitizeResourceUrl(this.resolveFileUrl(path));
  }

  private sanitizeResourceUrl(path: string) {
    const sanitizer = this.sanitizer as Partial<DomSanitizer>;
    return typeof sanitizer.bypassSecurityTrustResourceUrl === 'function'
      ? sanitizer.bypassSecurityTrustResourceUrl(path)
      : undefined;
  }

  private getVersionTitle(versionColl: aas.types.SubmodelElementCollection, currentLang: string): string | undefined {
    const titleEl = versionColl.value?.find(
      (v) => v.idShort === 'Title' && v instanceof aas.types.MultiLanguageProperty,
    ) as aas.types.MultiLanguageProperty | undefined;
    if (titleEl) return this.getLocalizedText(titleEl, currentLang);
    return undefined;
  }

  private getLocalizedText(el: aas.types.MultiLanguageProperty | undefined, lang: string): string | undefined {
    if (!el) return undefined;
    const tgt = lang.toLowerCase();
    let found = el.value?.find((e: any) => e.language?.toLowerCase() === tgt)?.text;
    if (found) return found;
    found = el.value?.find((e: any) => e.language?.toLowerCase() === 'en')?.text;
    if (found) return found;
    return el.value?.[0]?.text;
  }
}
