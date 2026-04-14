import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { jsonization } from '@aas-core-works/aas-core3.1-typescript';
import { ViewerDescriptor } from '@aas/webapi-client';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import type { SearchHit } from './search/search.types';

@Injectable({
  providedIn: 'root',
})
export class ViewerStoreService {
  http = inject(HttpClient);

  apiKey = signal<string | null>('');

  viewerDescriptor = signal<ViewerDescriptor | null>(null);
  isLoadingSubmodels = signal(false);
  isLoadingAas = signal(false);
  reloadTrigger = signal(0);
  highlightedIdShortPath = signal<string>('');
  highlightedTextQuery = signal<string>('');

  // Persisted search state for the dialog
  lastSearchQuery = signal<string>('');
  lastSearchHits = signal<SearchHit[]>([]);
  lastSearchIndex = signal<number>(-1); // -1 means none selected yet

  currentlyloadedFiles = signal<{ submodelId: string; path: string; idShortPath: string; blob: Blob }[]>([]);
  private aasState = signal<aas.types.AssetAdministrationShell | null>(null);
  private submodelsState = signal<{ idShort: string; id: string; url: string; sm: aas.types.Submodel }[]>([]);

  newDescriptorEffect = effect(() => {
    this.viewerDescriptor();
    this.currentlyloadedFiles.set([]);
    this.aasState.set(null);
    this.submodelsState.set([]);
  });

  aasUrl = computed(() => {
    return this.viewerDescriptor()?.aasEndpoint ?? '';
  });

  aasId = computed(() => {
    return this.viewerDescriptor()?.aasId;
  });

  headers = computed(() => {
    let headers = new HttpHeaders();
    const apiKey = this.apiKey();
    if (apiKey != null && apiKey !== '') {
      headers = headers.append('Apikey', apiKey);
    }
    return headers;
  });

  aasLoaderEffect = effect(() => {
    const aasUrl = this.aasUrl();
    const headers = this.headers();

    if (aasUrl === '') {
      this.aasState.set(null);
      return;
    }

    this.isLoadingAas.set(true);
    void lastValueFrom(this.http.get<any>(aasUrl, { headers }))
      .then((res) => {
        const jsonized = jsonization.assetAdministrationShellFromJsonable(res);
        this.aasState.set(jsonized.value ?? null);
      })
      .catch(() => {
        this.aasState.set(null);
      })
      .finally(() => {
        this.isLoadingAas.set(false);
      });
  });

  aas = computed(() => this.aasState());

  submodelUrls = computed(() => {
    return this.viewerDescriptor()?.submodelEndpoints;
  });

  submodelsLoaderEffect = effect(() => {
    const urls = this.viewerDescriptor()?.submodelEndpoints ?? [];
    const headers = this.headers();

    if (urls.length === 0) {
      this.submodelsState.set([]);
      return;
    }

    queueMicrotask(() => this.isLoadingSubmodels.set(true));
    void Promise.all(
      urls.map(async (smUrl) => {
        try {
          const res = await lastValueFrom(this.http.get<any>(smUrl, { headers }));
          const sm = jsonization.submodelFromJsonable(res);
          if (sm.value && sm.value.semanticId?.keys[0].value !== 'AasDesignerChangelog') {
            return { idShort: res.idShort, id: res.id, url: smUrl, sm: sm.value };
          }
        } catch {
          return null;
        }
        return null;
      }),
    )
      .then((submodels) => {
        this.submodelsState.set(
          submodels.filter(
            (submodel): submodel is { idShort: string; id: string; url: string; sm: aas.types.Submodel } =>
              submodel != null,
          ),
        );
      })
      .finally(() => {
        queueMicrotask(() => this.isLoadingSubmodels.set(false));
      });
  });

  submodels = computed(() => this.submodelsState());

  cdUrl = computed(() => {
    return this.viewerDescriptor()?.cdEndpoint ?? '';
  });

  currentSubmodelId = signal<string>('');

  currentSmUrl = computed(() => this.submodelsState().find((sm) => sm.id === this.currentSubmodelId())?.url ?? '');

  currentSubmodel = computed(() => {
    this.reloadTrigger();
    return this.submodelsState().find((submodel) => submodel.id === this.currentSubmodelId())?.sm ?? undefined;
  });

  async reloadSubmodel() {
    const id = this.currentSubmodelId();
    const smUrl = this.currentSmUrl();
    if (smUrl === '') {
      return;
    }
    const res = await lastValueFrom(this.http.get<any>(smUrl, { headers: this.headers() }));
    const loadedSubmodel = jsonization.submodelFromJsonable(res);

    const sm = this.submodelsState().find((s) => s.id === id);
    if (sm != null && loadedSubmodel.value != null) {
      sm.sm = loadedSubmodel.value;
      this.submodelsState.set([...this.submodelsState()]);
      this.reloadTrigger.set(this.reloadTrigger() + 1);
    }
  }

  addFileToCurrentlyLoadedFiles(file: { submodelId: string; idShortPath: string; path: string; blob: Blob }) {
    const currentFiles = this.currentlyloadedFiles();
    currentFiles.push(file);
    this.currentlyloadedFiles.set(currentFiles);
  }
}
