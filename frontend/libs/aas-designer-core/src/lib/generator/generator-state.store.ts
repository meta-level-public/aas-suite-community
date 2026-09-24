import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { IdGenerationUtil } from '@aas/helpers';
import { MultiLanguagePropertyValue } from '@aas/model';
import { computed, Injectable, signal } from '@angular/core';
import {
  buildAssetIdentifier,
  buildAssetShellIdentifier,
  buildAssetShellIdShortSuggestion,
  normalizeAssetShellIdShort,
} from './asset-shell-id.utils';

interface GeneratorRootSnapshot {
  environment: aas.types.Environment;
  shell: aas.types.AssetAdministrationShell;
}

interface GeneratorThumbnailAttachment {
  filename: string;
  file: File | null;
}

interface GeneratorAssetMetadataInput {
  kind?: 'Type' | 'Instance';
  assetId?: string;
  assetShellId?: string;
  assetShellIdentifier?: string;
  assetShellDescription?: MultiLanguagePropertyValue[];
  assetThumbnailFilename?: string;
  assetThumbnailFile?: File;
}

@Injectable({
  providedIn: 'root',
})
export class GeneratorStateStore {
  environment = signal<aas.types.Environment | null>(null);
  shell = signal<aas.types.AssetAdministrationShell | null>(null);
  submodels = signal<aas.types.Submodel[]>([]);
  conceptDescriptions = signal<aas.types.ConceptDescription[]>([]);
  fileAttachments = signal<Map<string, File>>(new Map());
  packageThumbnail = signal<GeneratorThumbnailAttachment>({ filename: '', file: null });

  shellIdShort = computed(() => this.shell()?.idShort ?? '');
  shellIdentifier = computed(() => this.shell()?.id ?? '');
  assetIdentifier = computed(() => this.shell()?.assetInformation.globalAssetId ?? '');

  reset() {
    this.environment.set(null);
    this.shell.set(null);
    this.submodels.set([]);
    this.conceptDescriptions.set([]);
    this.fileAttachments.set(new Map());
    this.packageThumbnail.set({ filename: '', file: null });
  }

  initialize(
    shell: aas.types.AssetAdministrationShell,
    submodels: aas.types.Submodel[] = [],
    conceptDescriptions: aas.types.ConceptDescription[] = [],
  ) {
    const normalizedShell = this.normalizeShell(shell);
    const normalizedSubmodels = this.normalizeSubmodels(submodels);
    const normalizedConceptDescriptions = this.normalizeConceptDescriptions(conceptDescriptions);

    normalizedShell.submodels = this.createSubmodelReferences(normalizedSubmodels);

    this.shell.set(normalizedShell);
    this.environment.set(new aas.types.Environment([normalizedShell], [], []));
    this.submodels.set(normalizedSubmodels);
    this.conceptDescriptions.set(normalizedConceptDescriptions);
  }

  setSubmodels(submodels: aas.types.Submodel[]) {
    const normalizedSubmodels = this.normalizeSubmodels(submodels);
    this.submodels.set(normalizedSubmodels);
    this.syncShellSubmodelReferences(normalizedSubmodels);
  }

  upsertSubmodel(submodel: aas.types.Submodel) {
    const normalizedSubmodel = this.normalizeSubmodel(submodel);
    const nextSubmodels = [...this.submodels()];
    const existingIndex = nextSubmodels.findIndex(
      (candidate) =>
        candidate.id === normalizedSubmodel.id ||
        (`${candidate.idShort ?? ''}` !== '' && `${candidate.idShort ?? ''}` === `${normalizedSubmodel.idShort ?? ''}`),
    );

    if (existingIndex === -1) {
      nextSubmodels.push(normalizedSubmodel);
    } else {
      nextSubmodels[existingIndex] = normalizedSubmodel;
    }

    this.submodels.set(nextSubmodels);
    this.syncShellSubmodelReferences(nextSubmodels);
  }

  setConceptDescriptions(conceptDescriptions: aas.types.ConceptDescription[]) {
    this.conceptDescriptions.set(this.normalizeConceptDescriptions(conceptDescriptions));
  }

  private normalizeShell(shell: aas.types.AssetAdministrationShell | unknown) {
    if (shell instanceof aas.types.AssetAdministrationShell) {
      this.normalizeNestedReferences(shell);
      return shell;
    }

    const normalized = aas.jsonization.assetAdministrationShellFromJsonable(JSON.parse(JSON.stringify(shell)));
    if (normalized.value == null) {
      throw new Error('Failed to normalize generator shell state');
    }

    return normalized.value;
  }

  private normalizeSubmodels(submodels: aas.types.Submodel[] | unknown[]) {
    return submodels.map((submodel) => this.normalizeSubmodel(submodel));
  }

  private normalizeSubmodel(submodel: aas.types.Submodel | unknown) {
    if (submodel instanceof aas.types.Submodel) {
      this.normalizeNestedReferences(submodel);
      return submodel;
    }

    const normalized = aas.jsonization.submodelFromJsonable(JSON.parse(JSON.stringify(submodel)));
    if (normalized.value == null) {
      throw new Error('Failed to normalize generator submodel state');
    }

    return normalized.value;
  }

  private normalizeConceptDescriptions(conceptDescriptions: aas.types.ConceptDescription[] | unknown[]) {
    return conceptDescriptions.map((conceptDescription) => this.normalizeConceptDescription(conceptDescription));
  }

  private normalizeConceptDescription(conceptDescription: aas.types.ConceptDescription | unknown) {
    if (conceptDescription instanceof aas.types.ConceptDescription) {
      return conceptDescription;
    }

    const normalized = aas.jsonization.conceptDescriptionFromJsonable(JSON.parse(JSON.stringify(conceptDescription)));
    if (normalized.value == null) {
      throw new Error('Failed to normalize generator concept description state');
    }

    return normalized.value;
  }

  private normalizeNestedReferences(value: unknown, visited = new WeakSet<object>()) {
    if (value == null || typeof value !== 'object') {
      return value;
    }

    if (visited.has(value)) {
      return value;
    }
    visited.add(value);

    if (Array.isArray(value)) {
      value.forEach((item) => this.normalizeNestedReferences(item, visited));
      return value;
    }

    const candidate = value as Record<string, unknown>;
    if (Array.isArray(candidate['keys']) && typeof candidate['type'] === 'string') {
      candidate['keys'] = candidate['keys'].map((key) => {
        if (key instanceof aas.types.Key) {
          return key;
        }

        const plainKey = key as Record<string, unknown>;
        return new aas.types.Key(plainKey['type'] as aas.types.KeyTypes, `${plainKey['value'] ?? ''}`);
      });
    }

    Object.entries(candidate).forEach(([key, child]) => {
      if (key !== 'keys') {
        this.normalizeNestedReferences(child, visited);
      }
    });

    return value;
  }

  setFileAttachment(key: string, file: File | null) {
    const nextAttachments = new Map(this.fileAttachments());

    if (file == null) {
      nextAttachments.delete(key);
    } else {
      nextAttachments.set(key, file);
    }

    this.fileAttachments.set(nextAttachments);
  }

  getFileAttachment(key: string | null | undefined) {
    if (key == null || key === '') {
      return null;
    }

    return this.fileAttachments().get(key) ?? null;
  }

  setPackageThumbnail(file: File | null, filename: string | null | undefined) {
    this.packageThumbnail.set({
      file,
      filename: `${filename ?? ''}`.trim(),
    });
  }

  updateAssetMetadata(input: GeneratorAssetMetadataInput | null | undefined, iriPrefix: string) {
    let shell = this.shell();
    if (shell == null) {
      shell = this.createFallbackShell(input?.kind, iriPrefix);
      this.initialize(shell, this.submodels(), this.conceptDescriptions());
    }

    const shellIdShort =
      normalizeAssetShellIdShort(input?.assetShellId) ||
      normalizeAssetShellIdShort(shell.idShort) ||
      buildAssetShellIdShortSuggestion(input?.assetShellDescription, ['de', 'en']) ||
      'aa';

    shell.assetInformation.assetKind =
      input?.kind === 'Instance' ? aas.types.AssetKind.Instance : aas.types.AssetKind.Type;
    shell.idShort = shellIdShort;
    shell.id =
      input?.assetShellIdentifier?.trim() ||
      shell.id?.trim() ||
      buildAssetShellIdentifier(iriPrefix, shellIdShort) ||
      IdGenerationUtil.generateIri('aas', iriPrefix);
    shell.description = this.toLangStrings(input?.assetShellDescription) ?? shell.description ?? [];
    shell.submodels = this.createSubmodelReferences(this.submodels());

    shell.assetInformation.globalAssetId =
      input?.assetId?.trim() ||
      shell.assetInformation.globalAssetId?.trim() ||
      buildAssetIdentifier(iriPrefix, shellIdShort) ||
      IdGenerationUtil.generateIri('asset', iriPrefix);

    const assetThumbnailFilename = `${input?.assetThumbnailFilename ?? ''}`.trim();
    if (assetThumbnailFilename !== '') {
      shell.assetInformation.defaultThumbnail = new aas.types.Resource(
        `file:/aasx/files/${assetThumbnailFilename}`,
        input?.assetThumbnailFile?.type,
      );
    } else {
      shell.assetInformation.defaultThumbnail = null;
    }

    this.shell.set(shell);
    const environment = this.environment() ?? new aas.types.Environment([], [], []);
    environment.assetAdministrationShells = [shell];
    this.environment.set(environment);
  }

  createRootSnapshot(): GeneratorRootSnapshot {
    const environment = this.cloneEnvironment(this.environment() ?? new aas.types.Environment([], [], []));
    const shell = environment.assetAdministrationShells?.[0];

    if (shell == null) {
      throw new Error('Generator state store has no shell root for export');
    }

    return { environment, shell };
  }

  private cloneEnvironment(environment: aas.types.Environment) {
    const cloned = aas.jsonization.environmentFromJsonable(aas.jsonization.toJsonable(environment));
    if (cloned.value == null) {
      throw new Error('Failed to clone generator environment state');
    }

    return cloned.value;
  }

  private createFallbackShell(kind: 'Type' | 'Instance' | undefined, iriPrefix: string) {
    const shell = new aas.types.AssetAdministrationShell(
      IdGenerationUtil.generateIri('aas', iriPrefix),
      new aas.types.AssetInformation(kind === 'Instance' ? aas.types.AssetKind.Instance : aas.types.AssetKind.Type),
    );
    shell.idShort = 'aa';
    shell.description = [];
    shell.submodels = null;

    return shell;
  }

  private syncShellSubmodelReferences(submodels: aas.types.Submodel[]) {
    const shell = this.shell();
    if (shell == null) return;

    shell.submodels = this.createSubmodelReferences(submodels);
    this.shell.set(shell);
    const environment = this.environment();
    if (environment != null) {
      environment.assetAdministrationShells = [shell];
      this.environment.set(environment);
    }
  }

  private createSubmodelReferences(submodels: aas.types.Submodel[]) {
    if (submodels.length === 0) return null;

    return submodels.map(
      (submodel) =>
        new aas.types.Reference(aas.types.ReferenceTypes.ModelReference, [
          new aas.types.Key(aas.types.KeyTypes.Submodel, submodel.id),
        ]),
    );
  }

  private toLangStrings(value: MultiLanguagePropertyValue[] | undefined) {
    const result: aas.types.LangStringTextType[] = [];
    value?.forEach((entry) => {
      if (entry.text != null && entry.text !== '') {
        result.push(new aas.types.LangStringTextType(entry.language, entry.text ?? ''));
      }
    });

    return result.length > 0 ? result : null;
  }

  private describeVerificationTarget(element: aas.types.Class) {
    const candidate = element as unknown as Record<string, unknown>;
    const id = typeof candidate['id'] === 'string' ? candidate['id'] : null;
    const idShort = typeof candidate['idShort'] === 'string' ? candidate['idShort'] : null;
    const category = typeof candidate['category'] === 'string' ? candidate['category'] : null;
    const modelType = typeof candidate['modelType'] === 'string' ? candidate['modelType'] : null;

    return {
      type: element.constructor.name,
      modelType,
      id,
      idShort,
      category,
    };
  }
}
