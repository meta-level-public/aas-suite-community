import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class V3EditorUiStateStoreService {
  errorPanelCollapsed = signal<boolean>(true);
  detailsPanelCollapsed = signal<boolean>(false);
  administrativeInformationPanelCollapsed = signal<boolean>(true);
  assetPanelCollapsed = signal<boolean>(false);
  semanticIdPanelCollapsed = signal<boolean>(false);
  qualifiersPanelCollapsed = signal<boolean>(true);
  bomPanelCollapsed = signal<boolean>(false);
  changelogPanelCollapsed = signal<boolean>(false);
  contentPanelCollapsed = signal<boolean>(false);
  embeddedDataspecPanelCollapsed = signal<boolean>(false);
  executionPanelCollapsed = signal<boolean>(true);
  endpointUrlPanelCollapsed = signal<boolean>(true);
  dataDefinitionPanelCollapsed = signal<boolean>(true);
  pcnPanelCollapsed = signal<boolean>(true);

  constructor() {
    this.restoreStateFromLocalStorage();
  }

  storeStateToLocalStorage() {
    localStorage.setItem('errorPanelCollapsed', JSON.stringify(this.errorPanelCollapsed()));
    localStorage.setItem('detailsPanelCollapsed', JSON.stringify(this.detailsPanelCollapsed()));
    localStorage.setItem(
      'administrativeInformationPanelCollapsed',
      JSON.stringify(this.administrativeInformationPanelCollapsed()),
    );
    localStorage.setItem('assetPanelCollapsed', JSON.stringify(this.assetPanelCollapsed()));
    localStorage.setItem('semanticIdPanelCollapsed', JSON.stringify(this.semanticIdPanelCollapsed()));
    localStorage.setItem('qualifiersPanelCollapsed', JSON.stringify(this.qualifiersPanelCollapsed()));
    localStorage.setItem('bomPanelCollapsed', JSON.stringify(this.bomPanelCollapsed()));
    localStorage.setItem('changelogPanelCollapsed', JSON.stringify(this.changelogPanelCollapsed()));
    localStorage.setItem('contentPanelCollapsed', JSON.stringify(this.contentPanelCollapsed()));
    localStorage.setItem('embeddedDataspecPanelCollapsed', JSON.stringify(this.embeddedDataspecPanelCollapsed()));
    localStorage.setItem('executionPanelCollapsed', JSON.stringify(this.executionPanelCollapsed()));
    localStorage.setItem('endpointUrlPanelCollapsed', JSON.stringify(this.endpointUrlPanelCollapsed()));
    localStorage.setItem('dataDefinitionPanelCollapsed', JSON.stringify(this.dataDefinitionPanelCollapsed()));
    localStorage.setItem('pcnPanelCollapsed', JSON.stringify(this.pcnPanelCollapsed()));
  }

  restoreStateFromLocalStorage() {
    const errorPanelCollapsed = localStorage.getItem('errorPanelCollapsed');
    if (errorPanelCollapsed) {
      this.errorPanelCollapsed.set(JSON.parse(errorPanelCollapsed));
    }

    const detailsPanelCollapsed = localStorage.getItem('detailsPanelCollapsed');
    if (detailsPanelCollapsed) {
      this.detailsPanelCollapsed.set(JSON.parse(detailsPanelCollapsed));
    }

    const administrativeInformationPanelCollapsed = localStorage.getItem('administrativeInformationPanelCollapsed');
    if (administrativeInformationPanelCollapsed) {
      this.administrativeInformationPanelCollapsed.set(JSON.parse(administrativeInformationPanelCollapsed));
    }

    const assetPanelCollapsed = localStorage.getItem('assetPanelCollapsed');
    if (assetPanelCollapsed) {
      this.assetPanelCollapsed.set(JSON.parse(assetPanelCollapsed));
    }

    const semanticIdPanelCollapsed = localStorage.getItem('semanticIdPanelCollapsed');
    if (semanticIdPanelCollapsed) {
      this.semanticIdPanelCollapsed.set(JSON.parse(semanticIdPanelCollapsed));
    }

    const qualifiersPanelCollapsed = localStorage.getItem('qualifiersPanelCollapsed');
    if (qualifiersPanelCollapsed) {
      this.qualifiersPanelCollapsed.set(JSON.parse(qualifiersPanelCollapsed));
    }

    const bomPanelCollapsed = localStorage.getItem('bomPanelCollapsed');
    if (bomPanelCollapsed) {
      this.bomPanelCollapsed.set(JSON.parse(bomPanelCollapsed));
    }

    const changelogPanelCollapsed = localStorage.getItem('changelogPanelCollapsed');
    if (changelogPanelCollapsed) {
      this.changelogPanelCollapsed.set(JSON.parse(changelogPanelCollapsed));
    }

    const contentPanelCollapsed = localStorage.getItem('contentPanelCollapsed');
    if (contentPanelCollapsed) {
      this.contentPanelCollapsed.set(JSON.parse(contentPanelCollapsed));
    }

    const embeddedDataspecPanelCollapsed = localStorage.getItem('embeddedDataspecPanelCollapsed');
    if (embeddedDataspecPanelCollapsed) {
      this.embeddedDataspecPanelCollapsed.set(JSON.parse(embeddedDataspecPanelCollapsed));
    }

    const executionPanelCollapsed = localStorage.getItem('executionPanelCollapsed');
    if (executionPanelCollapsed) {
      this.executionPanelCollapsed.set(JSON.parse(executionPanelCollapsed));
    }

    const endpointUrlPanelCollapsed = localStorage.getItem('endpointUrlPanelCollapsed');
    if (endpointUrlPanelCollapsed) {
      this.endpointUrlPanelCollapsed.set(JSON.parse(endpointUrlPanelCollapsed));
    }

    const dataDefinitionPanelCollapsed = localStorage.getItem('dataDefinitionPanelCollapsed');
    if (dataDefinitionPanelCollapsed) {
      this.dataDefinitionPanelCollapsed.set(JSON.parse(dataDefinitionPanelCollapsed));
    }

    const pcnPanelCollapsed = localStorage.getItem('pcnPanelCollapsed');
    if (pcnPanelCollapsed) {
      this.pcnPanelCollapsed.set(JSON.parse(pcnPanelCollapsed));
    }
  }

  setErrorPanelCollapsed(collapsed: boolean) {
    this.errorPanelCollapsed.set(collapsed);
    this.storeStateToLocalStorage();
  }

  setDetailsPanelCollapsed(collapsed: boolean) {
    this.detailsPanelCollapsed.set(collapsed);
    this.storeStateToLocalStorage();
  }

  setAdministrativeInformationPanelCollapsed(collapsed: boolean) {
    this.administrativeInformationPanelCollapsed.set(collapsed);
    this.storeStateToLocalStorage();
  }

  setAssetPanelCollapsed(collapsed: boolean) {
    this.assetPanelCollapsed.set(collapsed);
    this.storeStateToLocalStorage();
  }

  setSemanticIdPanelCollapsed(collapsed: boolean) {
    this.semanticIdPanelCollapsed.set(collapsed);
    this.storeStateToLocalStorage();
  }

  setQualifiersPanelCollapsed(collapsed: boolean) {
    this.qualifiersPanelCollapsed.set(collapsed);
    this.storeStateToLocalStorage();
  }

  setBomPanelCollapsed(collapsed: boolean) {
    this.bomPanelCollapsed.set(collapsed);
    this.storeStateToLocalStorage();
  }

  setChangelogPanelCollapsed(collapsed: boolean) {
    this.changelogPanelCollapsed.set(collapsed);
    this.storeStateToLocalStorage();
  }

  setContentPanelCollapsed(collapsed: boolean) {
    this.contentPanelCollapsed.set(collapsed);
    this.storeStateToLocalStorage();
  }

  setEmbeddedDataspecPanelCollapsed(collapsed: boolean) {
    this.embeddedDataspecPanelCollapsed.set(collapsed);
    this.storeStateToLocalStorage();
  }

  setExecutionPanelCollapsed(collapsed: boolean) {
    this.executionPanelCollapsed.set(collapsed);
    this.storeStateToLocalStorage();
  }

  setEndpointUrlPanelCollapsed(collapsed: boolean) {
    this.endpointUrlPanelCollapsed.set(collapsed);
    this.storeStateToLocalStorage();
  }

  setDataDefinitionPanelCollapsed(collapsed: boolean) {
    this.dataDefinitionPanelCollapsed.set(collapsed);
    this.storeStateToLocalStorage();
  }

  setPcnPanelCollapsed(collapsed: boolean) {
    this.pcnPanelCollapsed.set(collapsed);
    this.storeStateToLocalStorage();
  }
}
