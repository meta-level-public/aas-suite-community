import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { jsonization } from '@aas-core-works/aas-core3.1-typescript';
import { ViewerDescriptor } from '@aas/webapi-client';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import type { SearchHit } from './search/search.types';
import { LoadedSubmodel, SubmodelLoadState, submodelLabelFromUrl } from './submodel-load-state';

@Injectable({
  providedIn: 'root',
})
export class ViewerStoreService {
  http = inject(HttpClient);

  apiKey = signal<string | null>('');

  viewerDescriptor = signal<ViewerDescriptor | null>(null);
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
  private submodelLoadStatesState = signal<SubmodelLoadState[]>([]);
  private submodelLoadGeneration = 0;

  newDescriptorEffect = effect(() => {
    this.viewerDescriptor();
    this.currentlyloadedFiles.set([]);
    this.aasState.set(null);
    // The submodel load states are reset by submodelsLoaderEffect.
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
    const generation = ++this.submodelLoadGeneration;

    this.submodelLoadStatesState.set(
      urls.map((url) => ({ url, label: submodelLabelFromUrl(url), status: 'loading' as const })),
    );

    // Every submodel is shown as soon as its own request finished, so a slow submodel does not
    // block the ones that are already available.
    urls.forEach(async (smUrl, index) => {
      let update: Partial<SubmodelLoadState>;
      try {
        const res = await lastValueFrom(this.http.get<any>(smUrl, { headers }));
        const sm = jsonization.submodelFromJsonable(res);
        update =
          sm.value && sm.value.semanticId?.keys[0].value !== 'AasDesignerChangelog'
            ? { status: 'loaded', submodel: { idShort: res.idShort, id: res.id, url: smUrl, sm: sm.value } }
            : { status: 'skipped' };
      } catch {
        update = { status: 'failed' };
      }

      if (generation !== this.submodelLoadGeneration) {
        return;
      }
      this.submodelLoadStatesState.update((states) =>
        states.map((state, stateIndex) => (stateIndex === index ? { ...state, ...update } : state)),
      );
    });
  });

  submodelLoadStates = computed(() => this.submodelLoadStatesState().filter((state) => state.status !== 'skipped'));

  isLoadingSubmodels = computed(() => this.submodelLoadStatesState().some((state) => state.status === 'loading'));

  submodelLoadProgress = computed(() => {
    const states = this.submodelLoadStates();
    return { done: states.filter((state) => state.status !== 'loading').length, total: states.length };
  });

  submodels = computed(() =>
    this.submodelLoadStatesState()
      .map((state) => state.submodel)
      .filter((submodel): submodel is LoadedSubmodel => submodel != null),
  );

  cdUrl = computed(() => {
    return this.viewerDescriptor()?.cdEndpoint ?? '';
  });

  currentSubmodelId = signal<string>('');

  currentSmUrl = computed(() => this.submodels().find((sm) => sm.id === this.currentSubmodelId())?.url ?? '');

  currentSubmodel = computed(() => {
    this.reloadTrigger();
    return this.submodels().find((submodel) => submodel.id === this.currentSubmodelId())?.sm ?? undefined;
  });

  async reloadSubmodel() {
    const id = this.currentSubmodelId();
    const smUrl = this.currentSmUrl();
    if (smUrl === '') {
      return;
    }
    const res = await lastValueFrom(this.http.get<any>(smUrl, { headers: this.headers() }));
    const loadedSubmodel = jsonization.submodelFromJsonable(res);

    const reloaded = loadedSubmodel.value;
    if (reloaded != null && this.submodels().some((s) => s.id === id)) {
      this.submodelLoadStatesState.update((states) =>
        states.map((state) =>
          state.submodel?.id === id ? { ...state, submodel: { ...state.submodel, sm: reloaded } } : state,
        ),
      );
      this.reloadTrigger.set(this.reloadTrigger() + 1);
    }
  }

  addFileToCurrentlyLoadedFiles(file: { submodelId: string; idShortPath: string; path: string; blob: Blob }) {
    const currentFiles = this.currentlyloadedFiles();
    currentFiles.push(file);
    this.currentlyloadedFiles.set(currentFiles);
  }
}
