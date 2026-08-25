import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { AppConfigService, EncodingService, NotificationService, PortalService } from '@aas/common-services';
import { ShellResult, SupplementalFile } from '@aas/model';
import {
  ConceptDescriptionClient,
  EditorDescriptor,
  EditorDescriptorEntry,
  ShellsClient,
  SubmodelClient,
} from '@aas/webapi-client';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { PrimeTemplate } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { Splitter } from 'primeng/splitter';
import { lastValueFrom } from 'rxjs';
import { EditorTypeOption } from '../v3-editor/model/editor-type-option';
import { V3TreeItem } from '../v3-editor/model/v3-tree-item';
import { V3EditorDataStoreService } from '../v3-editor/v3-editor-data-store.service';
import { V3EditorComponent } from '../v3-editor/v3-editor/v3-editor.component';
import { V3TreeComponent } from '../v3-editor/v3-tree/v3-tree.component';

interface ReferencingAasInfo {
  id: string;
  idShort: string;
}

interface SubmodelInfoSummary {
  submodelId: string;
  submodelIdShort: string;
  fileCount: number;
  conceptDescriptionCount: number;
  referencingAas: ReferencingAasInfo[];
}

@Component({
  selector: 'aas-submodel-editor',
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    Splitter,
    PrimeTemplate,
    ButtonModule,
    DialogModule,
    InputGroupModule,
    InputGroupAddonModule,
    InputTextModule,
    V3TreeComponent,
    V3EditorComponent,
  ],
  templateUrl: './submodel-editor.component.html',
  styleUrls: ['../../host.scss'],
})
export class SubmodelEditorComponent implements OnInit {
  PortalService = PortalService;

  appConfigService = inject(AppConfigService);
  route = inject(ActivatedRoute);
  submodelClient = inject(SubmodelClient);
  shellsClient = inject(ShellsClient);
  conceptDescriptionClient = inject(ConceptDescriptionClient);
  notificationService = inject(NotificationService);
  editorStore = inject(V3EditorDataStoreService);
  http = inject(HttpClient);

  loading = signal(false);
  saving = signal(false);

  submodelNode = signal<V3TreeItem<aas.types.Submodel> | null>(null);
  shellResult = signal<ShellResult | null>(null);
  selectedElement = signal<V3TreeItem<any> | undefined>(undefined);
  currentSubmodelId = signal<string>('');
  infoDialogVisible = signal(false);
  infoDialogLoading = signal(false);
  infoDialogError = signal(false);
  infoSummary = signal<SubmodelInfoSummary | null>(null);
  private initialConceptDescriptionIds = new Set<string>();

  // Required input for V3SubmodelEditorComponent, we use a neutral value for submodel-only editing.
  assetInformation = new aas.types.AssetInformation(
    aas.types.AssetKind.Instance,
    'urn:aas-suite:submodel-editor:virtual-asset',
  );

  async ngOnInit() {
    const submodelId = this.route.snapshot.paramMap.get('submodelId');
    if (!submodelId) {
      this.notificationService.showMessageAlways('NO_DATA_FOUND', 'ERROR', 'error');
      return;
    }

    this.currentSubmodelId.set(submodelId);
    await this.loadSubmodel(submodelId);
  }

  async loadSubmodel(submodelId: string) {
    this.loading.set(true);
    try {
      const smPlain = await lastValueFrom(this.submodelClient.submodel_GetSmPlain(submodelId));
      const smJsonable = JSON.parse(smPlain);
      const sm = aas.jsonization.submodelFromJsonable(smJsonable).value;
      if (!sm) {
        throw new Error('Could not parse submodel.');
      }

      const shellResult = new ShellResult();
      shellResult.v3Shell = new aas.types.Environment();

      const shell = new aas.types.AssetAdministrationShell(`urn:aas:submodel-editor:${sm.id}`, this.assetInformation);
      shell.idShort = sm.idShort ?? 'SubmodelEditor';
      shell.submodels = [
        new aas.types.Reference(aas.types.ReferenceTypes.ModelReference, [
          new aas.types.Key(aas.types.KeyTypes.Submodel, sm.id),
        ]),
      ];

      shellResult.v3Shell.assetAdministrationShells = [shell];
      shellResult.v3Shell.submodels = [sm];
      shellResult.v3Shell.conceptDescriptions = await this.loadReferencedConceptDescriptions(sm);
      shellResult.supplementalFiles = this.loadReferencedSupplementalFiles(sm);
      this.initialConceptDescriptionIds = new Set(
        (shellResult.v3Shell.conceptDescriptions ?? [])
          .map((conceptDescription) => conceptDescription.id)
          .filter((id) => id != null && id !== ''),
      );

      const submodelNode = new V3TreeItem<aas.types.Submodel>();
      submodelNode.content = sm;
      submodelNode.editorType = EditorTypeOption.Submodel;
      submodelNode.id = sm.id;

      const endpointBaseUrl = this.getSubmodelRepositoryBaseUrl();
      const endpointBase = endpointBaseUrl === '' ? '' : `${endpointBaseUrl}/submodels/`;
      const descriptor = new EditorDescriptor({
        aasDescriptorEntry: new EditorDescriptorEntry({ oldId: '', newId: '', endpoint: '' }),
        submodelDescriptorEntries: [
          new EditorDescriptorEntry({
            oldId: sm.id,
            newId: sm.id,
            endpoint: `${endpointBase}${EncodingService.base64urlEncode(sm.id)}`,
            idShort: sm.idShort ?? '',
          }),
        ],
      });

      this.editorStore.editorDescriptor.set(descriptor);
      this.shellResult.set(shellResult);
      this.submodelNode.set(submodelNode);
      this.selectedElement.set(undefined);
    } finally {
      this.loading.set(false);
    }
  }

  selectElement(element: V3TreeItem<any> | undefined) {
    this.selectedElement.set(element);
  }

  openInfoDialog() {
    this.infoDialogVisible.set(true);
    void this.loadInfoSummary();
  }

  async saveSubmodel() {
    const submodel = this.shellResult()?.v3Shell?.submodels?.[0];
    if (!submodel) {
      return;
    }

    const payload = JSON.stringify(aas.jsonization.toJsonable(submodel));
    const formData = new FormData();
    formData.append('plainJson', payload);
    formData.append('editorDescriptor', JSON.stringify(this.editorStore.editorDescriptor()));

    this.saving.set(true);
    try {
      await this.saveConceptDescriptions();
      await lastValueFrom(this.http.post(`${this.appConfigService.config.aasApiPath}/Submodel/SaveSm`, formData));
      this.notificationService.showMessageAlways('SAVE_SUCCESS', 'SUCCESS', 'success');
    } catch {
      this.notificationService.showMessageAlways('SAVE_FAILED', 'ERROR', 'error');
    } finally {
      this.saving.set(false);
    }
  }

  private async loadReferencedConceptDescriptions(
    submodel: aas.types.Submodel,
  ): Promise<aas.types.ConceptDescription[]> {
    const conceptDescriptionIds = this.collectReferencedConceptDescriptionIds(submodel);
    if (conceptDescriptionIds.length === 0) {
      return [];
    }

    const fetchedConceptDescriptions = await Promise.all(
      conceptDescriptionIds.map(async (id) => {
        try {
          const cdPlain = await lastValueFrom(this.conceptDescriptionClient.conceptDescription_GetCd(id));
          const cdJsonable = JSON.parse(cdPlain);
          return aas.jsonization.conceptDescriptionFromJsonable(cdJsonable).value;
        } catch {
          return null;
        }
      }),
    );

    return fetchedConceptDescriptions.filter((cd): cd is aas.types.ConceptDescription => cd != null);
  }

  private collectReferencedConceptDescriptionIds(submodel: aas.types.Submodel): string[] {
    const ids = new Set<string>();
    const visited = new Set<unknown>();

    const visit = (value: unknown) => {
      if (value == null || typeof value !== 'object') {
        return;
      }
      if (visited.has(value)) {
        return;
      }
      visited.add(value);

      if (Array.isArray(value)) {
        for (const item of value) {
          visit(item);
        }
        return;
      }

      const record = value as Record<string, unknown>;
      const keys = record['keys'];
      if (Array.isArray(keys)) {
        for (const key of keys) {
          if (key == null || typeof key !== 'object') {
            continue;
          }

          const keyRecord = key as Record<string, unknown>;
          const type = keyRecord['type'];
          const refValue = keyRecord['value'];
          if (type === aas.types.KeyTypes.ConceptDescription && typeof refValue === 'string' && refValue !== '') {
            ids.add(refValue);
          }
        }
      }

      for (const nestedValue of Object.values(record)) {
        visit(nestedValue);
      }
    };

    visit(submodel);
    return [...ids];
  }

  private loadReferencedSupplementalFiles(submodel: aas.types.Submodel): SupplementalFile[] {
    const repositoryBaseUrl = this.getSubmodelRepositoryBaseUrl();
    const submodelIdEncoded = EncodingService.base64urlEncode(submodel.id);
    const entries = new Map<string, SupplementalFile>();

    this.collectReferencedSupplementalFilesRecursively(
      submodel.submodelElements ?? [],
      '',
      false,
      submodelIdEncoded,
      repositoryBaseUrl,
      entries,
    );

    return [...entries.values()];
  }

  private collectReferencedSupplementalFilesRecursively(
    elements: aas.types.ISubmodelElement[],
    idShortPath: string,
    indexed: boolean,
    submodelIdEncoded: string,
    repositoryBaseUrl: string,
    entries: Map<string, SupplementalFile>,
  ) {
    let nestedCollectionIndex = 0;

    for (let index = 0; index < elements.length; index++) {
      const element = elements[index];

      if (element instanceof aas.types.SubmodelElementCollection) {
        let newPath = this.appendIdShortPath(idShortPath, element.idShort ?? '');
        if (indexed) {
          newPath = this.appendIndexPath(idShortPath, nestedCollectionIndex);
          nestedCollectionIndex++;
        }

        this.collectReferencedSupplementalFilesRecursively(
          element.value ?? [],
          newPath,
          false,
          submodelIdEncoded,
          repositoryBaseUrl,
          entries,
        );
        continue;
      }

      if (element instanceof aas.types.SubmodelElementList) {
        let newPath = this.appendIdShortPath(idShortPath, element.idShort ?? '');
        if (indexed) {
          newPath = this.appendIndexPath(idShortPath, nestedCollectionIndex);
          nestedCollectionIndex++;
        }

        this.collectReferencedSupplementalFilesRecursively(
          element.value ?? [],
          newPath,
          true,
          submodelIdEncoded,
          repositoryBaseUrl,
          entries,
        );
        continue;
      }

      if (element instanceof aas.types.Entity) {
        let newPath = this.appendIdShortPath(idShortPath, element.idShort ?? '');
        if (indexed) {
          newPath = this.appendIndexPath(idShortPath, nestedCollectionIndex);
          nestedCollectionIndex++;
        }

        this.collectReferencedSupplementalFilesRecursively(
          element.statements ?? [],
          newPath,
          false,
          submodelIdEncoded,
          repositoryBaseUrl,
          entries,
        );
        continue;
      }

      if (!(element instanceof aas.types.File)) {
        continue;
      }

      const rawPath = element.value ?? '';
      if (rawPath === '') {
        continue;
      }

      const normalizedPath = this.normalizeFileReferencePath(rawPath);
      if (entries.has(normalizedPath)) {
        continue;
      }

      const idShort = element.idShort ?? '';
      const elementPath = indexed
        ? this.appendIndexPath(idShortPath, index)
        : this.appendIdShortPath(idShortPath, idShort);

      entries.set(normalizedPath, {
        path: normalizedPath,
        filename: this.resolveFilenameFromPath(normalizedPath),
        fileApiUrl: this.resolveSupplementalFileApiUrl(
          normalizedPath,
          repositoryBaseUrl,
          submodelIdEncoded,
          elementPath,
        ),
        contentType: element.contentType ?? '',
        isThumbnail: false,
        file: undefined as unknown as File,
        isLoaded: false,
        isLoading: false,
        isLocal: false,
        fileUrl: null,
        fileData: null,
        id: null,
      });
    }
  }

  private appendIdShortPath(currentPath: string, segment: string): string {
    if (currentPath === '') {
      return segment;
    }
    return `${currentPath}.${segment}`;
  }

  private appendIndexPath(currentPath: string, index: number): string {
    return `${currentPath}[${index}]`;
  }

  private resolveSupplementalFileApiUrl(
    normalizedPath: string,
    repositoryBaseUrl: string,
    submodelIdEncoded: string,
    idShortPath: string,
  ): string {
    if (normalizedPath.startsWith('http://') || normalizedPath.startsWith('https://')) {
      return this.buildViewerProxyUrl(normalizedPath);
    }

    const infrastructureId = PortalService.getCurrentAasInfrastructureId();
    if (infrastructureId > 0 && idShortPath !== '') {
      const encodedPath = encodeURIComponent(idShortPath);
      return `${this.getAasProxyPath()}/${infrastructureId}/sm-repo/submodels/${submodelIdEncoded}/submodel-elements/${encodedPath}/attachment`;
    }

    if (repositoryBaseUrl === '' || idShortPath === '') {
      return '';
    }

    const encodedPath = encodeURIComponent(idShortPath);
    const targetUrl = `${repositoryBaseUrl}/submodels/${submodelIdEncoded}/submodel-elements/${encodedPath}/attachment`;
    return this.buildViewerProxyUrl(targetUrl);
  }

  private buildViewerProxyUrl(targetUrl: string): string {
    const proxyPath = (this.appConfigService.config.aasViewerProxyPath ?? '').replace(/\/$/, '');
    if (proxyPath === '') {
      return targetUrl;
    }

    return `${proxyPath}/call?target=${encodeURIComponent(targetUrl)}`;
  }

  private getAasProxyPath(): string {
    const aasApiPath = (this.appConfigService.config.aasApiPath ?? '').replace(/\/$/, '');
    if (aasApiPath !== '') {
      return aasApiPath.replace(/\/aas-api$/i, '/aas-proxy');
    }

    return '/aas-proxy';
  }

  private getSubmodelRepositoryBaseUrl(): string {
    const infrastructure = PortalService.getCurrentAasInfrastructureSetting();

    const candidateUrls = [
      infrastructure?.smRepositoryUrl,
      (infrastructure as any)?.submodelRepositoryUrl,
      (infrastructure as any)?.originalSubmodelRepositoryUrl,
      infrastructure?.aasRepositoryUrl,
    ];

    for (const candidateUrl of candidateUrls) {
      if (candidateUrl != null && candidateUrl.trim() !== '') {
        return candidateUrl.replace(/\/$/, '');
      }
    }

    return '';
  }

  private normalizeFileReferencePath(path: string): string {
    return path.replace(/^file:\/\//i, '');
  }

  private resolveFilenameFromPath(path: string): string {
    const parts = path.split('/').filter((segment) => segment !== '');
    return parts.at(-1) ?? path;
  }

  private async loadInfoSummary() {
    const submodel = this.shellResult()?.v3Shell?.submodels?.[0];
    if (!submodel) {
      this.infoDialogError.set(true);
      this.infoSummary.set(null);
      return;
    }

    this.infoDialogLoading.set(true);
    this.infoDialogError.set(false);
    try {
      const fileCount = this.countSubmodelFiles(submodel.submodelElements ?? []);
      const conceptDescriptionCount = this.shellResult()?.v3Shell?.conceptDescriptions?.length ?? 0;
      const referencingAas = await this.findReferencingAas(submodel.id);

      this.infoSummary.set({
        submodelId: submodel.id,
        submodelIdShort: submodel.idShort ?? '',
        fileCount,
        conceptDescriptionCount,
        referencingAas,
      });
    } catch {
      this.infoDialogError.set(true);
      this.infoSummary.set(null);
    } finally {
      this.infoDialogLoading.set(false);
    }
  }

  private countSubmodelFiles(elements: aas.types.ISubmodelElement[]): number {
    let fileCount = 0;

    for (const element of elements) {
      if (element instanceof aas.types.File) {
        fileCount++;
        continue;
      }

      if (element instanceof aas.types.SubmodelElementCollection) {
        fileCount += this.countSubmodelFiles(element.value ?? []);
        continue;
      }

      if (element instanceof aas.types.SubmodelElementList) {
        fileCount += this.countSubmodelFiles(element.value ?? []);
        continue;
      }

      if (element instanceof aas.types.Entity) {
        fileCount += this.countSubmodelFiles(element.statements ?? []);
      }
    }

    return fileCount;
  }

  private async findReferencingAas(submodelId: string): Promise<ReferencingAasInfo[]> {
    const referencesByAasId = new Map<string, ReferencingAasInfo>();
    const visitedCursors = new Set<string>();
    let cursor: string | null | undefined = null;

    while (true) {
      const shellList: {
        shells?: Array<{ id?: string; idShort?: string }>;
        cursor?: string | undefined;
      } = await lastValueFrom(this.shellsClient.shells_GetAllShells(100, cursor, undefined, undefined, undefined));

      for (const shell of shellList.shells ?? []) {
        const shellId = shell.id ?? '';
        if (shellId === '') {
          continue;
        }

        if (await this.shellContainsSubmodel(shellId, submodelId)) {
          referencesByAasId.set(shellId, {
            id: shellId,
            idShort: shell.idShort ?? '',
          });
        }
      }

      const nextCursor: string | undefined = shellList.cursor;
      if (nextCursor == null || nextCursor === '' || visitedCursors.has(nextCursor)) {
        break;
      }

      visitedCursors.add(nextCursor);
      cursor = nextCursor;
    }

    return [...referencesByAasId.values()].sort((a, b) => {
      const left = a.idShort !== '' ? a.idShort : a.id;
      const right = b.idShort !== '' ? b.idShort : b.id;
      return left.localeCompare(right);
    });
  }

  private async shellContainsSubmodel(shellId: string, submodelId: string): Promise<boolean> {
    try {
      const containedSubmodels = await lastValueFrom(this.shellsClient.shells_GetContainedSubmdels(shellId));
      return (containedSubmodels.containedSubmodels ?? []).some(
        (containedSubmodel) => containedSubmodel.id === submodelId,
      );
    } catch {
      return false;
    }
  }

  private async saveConceptDescriptions(): Promise<void> {
    const conceptDescriptions = this.shellResult()?.v3Shell?.conceptDescriptions ?? [];
    const currentConceptDescriptionIds = new Set(
      conceptDescriptions.map((conceptDescription) => conceptDescription.id).filter((id) => id != null && id !== ''),
    );

    const removedConceptDescriptionIds = [...this.initialConceptDescriptionIds].filter(
      (id) => !currentConceptDescriptionIds.has(id),
    );

    for (const conceptDescription of conceptDescriptions) {
      const conceptDescriptionPayload = JSON.stringify(aas.jsonization.toJsonable(conceptDescription));
      await lastValueFrom(this.conceptDescriptionClient.conceptDescription_UpdateCd(conceptDescriptionPayload));
    }

    for (const conceptDescriptionId of removedConceptDescriptionIds) {
      const conceptDescriptionIdBase64 = EncodingService.base64urlEncode(conceptDescriptionId);
      await lastValueFrom(this.conceptDescriptionClient.conceptDescription_DeleteCd(conceptDescriptionIdBase64));
    }

    this.initialConceptDescriptionIds = currentConceptDescriptionIds;
  }
}
