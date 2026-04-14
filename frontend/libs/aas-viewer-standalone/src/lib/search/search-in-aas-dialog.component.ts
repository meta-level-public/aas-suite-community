import * as aas from '@aas-core-works/aas-core3.1-typescript';

import { Component, computed, inject, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ViewerStoreService } from '../viewer-store.service';
import type { SearchHit } from './search.types';

// moved to search.types.ts

@Component({
  selector: 'aas-search-in-aas-dialog',

  imports: [FormsModule, InputTextModule, ButtonModule, TableModule, TranslateModule],
  templateUrl: './search-in-aas-dialog.component.html',
})
export class SearchInAasDialogComponent {
  private viewerStore = inject(ViewerStoreService);
  private ref = inject(DynamicDialogRef);

  query = model<string>('');
  loading = signal(false);
  hits = signal<SearchHit[]>([]);
  // public computed for current index (1-based display)
  lastIndex = computed(() => this.viewerStore.lastSearchIndex());

  constructor() {
    // Initialize from persisted store state
    const q = this.viewerStore.lastSearchQuery();
    const prevHits = this.viewerStore.lastSearchHits();
    if (q) this.query.set(q);
    if (prevHits && prevHits.length) this.hits.set(prevHits);
    // Also restore highlight query so inline highlights remain visible
    if (q) this.viewerStore.highlightedTextQuery.set(q);
  }

  async doSearch() {
    const q = (this.query() ?? '').trim();
    if (!q) {
      this.hits.set([]);
      return;
    }

    this.loading.set(true);
    try {
      // Use a map to prevent duplicate hits per element path (prefer value over idShort)
      const resultsMap = new Map<string, { hit: SearchHit; score: number }>();
      const submodels = this.viewerStore.submodels();
      const qNorm = this.normalize(q);

      for (const sm of submodels) {
        const root = sm.sm;
        const ctx = {
          submodelId: sm.id,
          submodelIdShort: sm.idShort ?? sm.id,
        };

        // traverse submodel elements
        if (Array.isArray(root.submodelElements)) {
          for (const el of root.submodelElements) {
            this.scanElement(el as aas.types.ISubmodelElement, ctx, el.idShort ?? '', resultsMap, qNorm);
          }
        }
      }

      // flatten map to array
      const list = Array.from(resultsMap.values()).map((v) => v.hit);
      this.hits.set(list);
      // Persist
      this.viewerStore.lastSearchQuery.set(q);
      this.viewerStore.lastSearchHits.set(list);
      this.viewerStore.lastSearchIndex.set(list.length ? 0 : -1);
    } finally {
      this.loading.set(false);
    }
  }

  private static getElementType(el: aas.types.ISubmodelElement): string {
    return el.modelType?.name ?? (el as any)?.modelType ?? 'Element';
  }

  private addOrUpdateHit(
    resultsMap: Map<string, { hit: SearchHit; score: number }>,
    ctx: { submodelId: string; submodelIdShort: string },
    idShortPath: string,
    el: aas.types.ISubmodelElement,
    snippet: string,
    score: number, // 2 = value match (preferred), 1 = idShort match
  ) {
    const existing = resultsMap.get(idShortPath);
    const base: SearchHit = {
      submodelId: ctx.submodelId,
      submodelIdShort: ctx.submodelIdShort,
      idShortPath,
      elementType: SearchInAasDialogComponent.getElementType(el),
      snippet,
    };
    if (!existing || score > existing.score) {
      resultsMap.set(idShortPath, { hit: base, score });
    }
  }

  private valueToString(el: aas.types.ISubmodelElement): string | undefined {
    try {
      if ((el as aas.types.Property).value != null) return String((el as aas.types.Property).value);
      if ((el as aas.types.MultiLanguageProperty).value != null) {
        const arr = (el as aas.types.MultiLanguageProperty).value as any[];
        return arr
          ?.map((x: any) => x?.text)
          ?.filter(Boolean)
          ?.join(' | ');
      }
      if ((el as aas.types.File).value != null) return String((el as aas.types.File).value);
      if ((el as aas.types.Blob).value != null) return '[Blob]';
      if ((el as aas.types.Range).max != null || (el as aas.types.Range).min != null) {
        const r = el as aas.types.Range;
        return `min:${r.min ?? ''} max:${r.max ?? ''}`;
      }
      if ((el as aas.types.ReferenceElement).value != null) return '[Reference]';
    } catch {
      // ignore conversion issues
    }
    return undefined;
  }

  // Normalize string for accent-insensitive, case-insensitive search
  private normalize(s: string | undefined | null): string {
    return (s ?? '')
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '');
  }

  // Try to produce a meaningful snippet from a text that matched
  private makeSnippetFrom(text: string, query: string): string {
    const textLower = text.toLowerCase();
    const idx = textLower.indexOf(query.toLowerCase());
    if (idx >= 0) {
      const start = Math.max(0, idx - 20);
      const end = Math.min(text.length, idx + 80);
      return text.substring(start, end);
    }
    // Fallback: return at most 120 chars
    return text.length > 120 ? text.slice(0, 120) : text;
  }

  private matchValue(el: aas.types.ISubmodelElement, qNorm: string): { matched: boolean; snippet: string | undefined } {
    try {
      // MultiLanguageProperty: check each text separately
      if (el instanceof aas.types.MultiLanguageProperty) {
        const arr = (el.value ?? []) as any[];
        for (const item of arr) {
          const txt = String(item?.text ?? '');
          if (!txt) continue;
          if (this.normalize(txt).includes(qNorm)) {
            return { matched: true, snippet: this.makeSnippetFrom(txt, this.query() ?? '') };
          }
        }
        return { matched: false, snippet: undefined };
      }

      const valStr = this.valueToString(el);
      if (valStr && this.normalize(valStr).includes(qNorm)) {
        return { matched: true, snippet: this.makeSnippetFrom(valStr, this.query() ?? '') };
      }
    } catch {
      // ignore
    }
    return { matched: false, snippet: undefined };
  }

  private scanElement(
    el: aas.types.ISubmodelElement,
    ctx: { submodelId: string; submodelIdShort: string },
    currentPath: string,
    resultsMap: Map<string, { hit: SearchHit; score: number }>,
    qNorm: string,
  ) {
    // Check idShort itself
    const idShort = el.idShort ?? '';
    if (this.normalize(idShort).includes(qNorm)) {
      this.addOrUpdateHit(resultsMap, ctx, currentPath, el, idShort, 1);
    }

    // Check value-like content (with special handling for MLP)
    const match = this.matchValue(el, qNorm);
    if (match.matched && match.snippet != null) {
      this.addOrUpdateHit(resultsMap, ctx, currentPath, el, match.snippet, 2);
    }

    // Traverse collections / lists
    if ((el as aas.types.SubmodelElementCollection).value instanceof Array) {
      const coll = el as aas.types.SubmodelElementCollection;
      (coll.value ?? []).forEach((child) =>
        this.scanElement(child, ctx, `${currentPath}.${child.idShort ?? '?'}`, resultsMap, qNorm),
      );
      return;
    }

    if ((el as aas.types.SubmodelElementList).value instanceof Array) {
      const list = el as aas.types.SubmodelElementList;
      (list.value ?? []).forEach((child, idx) =>
        this.scanElement(
          child,
          ctx,
          `${currentPath}[${idx}]${child.idShort ? '.' + child.idShort : ''}`,
          resultsMap,
          qNorm,
        ),
      );
    }
  }

  select(hit: SearchHit) {
    // Switch to submodel and close with selected path
    this.viewerStore.currentSubmodelId.set(hit.submodelId);
    this.viewerStore.highlightedIdShortPath.set(hit.idShortPath);
    this.viewerStore.highlightedTextQuery.set(this.query() ?? '');
    // Update current index
    const idx = this.hits().findIndex((h) => h.submodelId === hit.submodelId && h.idShortPath === hit.idShortPath);
    this.viewerStore.lastSearchIndex.set(idx);
    this.close();
  }

  close() {
    // Keep highlightedTextQuery so results remain visible when dialog is reopened
    this.ref.close();
  }

  next() {
    const hits = this.hits();
    if (!hits.length) return;
    let idx = this.viewerStore.lastSearchIndex();
    idx = (idx + 1 + hits.length) % hits.length;
    this.viewerStore.lastSearchIndex.set(idx);
    const hit = hits[idx];
    this.viewerStore.currentSubmodelId.set(hit.submodelId);
    this.viewerStore.highlightedIdShortPath.set(hit.idShortPath);
    this.viewerStore.highlightedTextQuery.set(this.query() ?? '');
  }

  prev() {
    const hits = this.hits();
    if (!hits.length) return;
    let idx = this.viewerStore.lastSearchIndex();
    if (idx < 0) idx = 0;
    idx = (idx - 1 + hits.length) % hits.length;
    this.viewerStore.lastSearchIndex.set(idx);
    const hit = hits[idx];
    this.viewerStore.currentSubmodelId.set(hit.submodelId);
    this.viewerStore.highlightedIdShortPath.set(hit.idShortPath);
    this.viewerStore.highlightedTextQuery.set(this.query() ?? '');
  }

  // Clear all highlight state while keeping search results and query
  clearHighlight() {
    this.viewerStore.highlightedIdShortPath.set('');
    this.viewerStore.highlightedTextQuery.set('');
  }
}
