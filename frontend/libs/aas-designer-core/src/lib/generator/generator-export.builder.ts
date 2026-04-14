import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { IdGenerationUtil } from '@aas/helpers';
import { buildAssetIdentifier, buildAssetShellIdentifier, normalizeAssetShellIdShort } from './asset-shell-id.utils';
import { GeneratorExportFileSource } from './generator-file-export.builder';
import { GeneratorNameplateSource } from './generator-nameplate.builder';
import {
  appendGeneratorVariantSubmodels,
  GeneratorVariantExportBuilderHooks,
} from './generator-variant-export.builder';
import { DocumentItem } from './model/document-item';

export interface GeneratorExportState {
  formData: FormData;
  env: aas.types.Environment;
  shell: aas.types.AssetAdministrationShell;
  requiredSemanticIds: string[];
  assetGlobalId: string;
  dppId: string;
  isBatteryPassport: boolean;
  isDppCore: boolean;
  usesTemplateBackedCoreSubmodels: boolean;
  additionalSubmodels: aas.types.Submodel[];
  assetKind: 'Type' | 'Instance';
  documentItems: DocumentItem[];
  nameplateSource: GeneratorNameplateSource | null;
  generatorFiles: GeneratorExportFileSource | null;
}

export interface CreateGeneratorExportStateOptions {
  baseEnvironment?: aas.types.Environment | null;
  baseShell?: aas.types.AssetAdministrationShell | null;
  mode: string | undefined;
  iriPrefix: string;
  standardGeneratorTemplateRoles: Array<unknown>;
  additionalSubmodels: aas.types.Submodel[];
}

export interface GeneratorExportBuilderHooks extends GeneratorVariantExportBuilderHooks {
  applyDppFileReferences: () => void;
  appendGeneratorFilesToExport: (state: GeneratorExportState) => void;
  loadExportConceptDescriptions: (state: GeneratorExportState) => Promise<void>;
}

export function createGeneratorExportState(options: CreateGeneratorExportStateOptions): GeneratorExportState {
  const env =
    options.baseEnvironment != null ? cloneEnvironment(options.baseEnvironment) : new aas.types.Environment([], [], []);
  const isBatteryPassport = options.mode === 'battery-passport';
  const isDppCore = options.mode === 'dpp-core';
  const shell = findOrCreateRootShell(env, options);
  const shellIdShort = normalizeAssetShellIdShort(shell.idShort) || 'aa';
  shell.idShort = shellIdShort;
  shell.id =
    shell.id?.trim() ||
    buildAssetShellIdentifier(options.iriPrefix, shellIdShort) ||
    IdGenerationUtil.generateIri('aas', options.iriPrefix);
  shell.description = shell.description ?? [];
  shell.submodels ??= [];
  shell.administration ??= new aas.types.AdministrativeInformation(
    null,
    '1',
    '0',
    new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
      new aas.types.Key(aas.types.KeyTypes.GlobalReference, 'AasSuite'),
    ]),
  );
  const assetGlobalId =
    shell.assetInformation.globalAssetId?.trim() ||
    buildAssetIdentifier(options.iriPrefix, shellIdShort) ||
    IdGenerationUtil.generateIri('asset', options.iriPrefix);
  shell.assetInformation.globalAssetId = assetGlobalId;
  env.assetAdministrationShells = [shell];

  const formData = new FormData();
  formData.append('aasxFilename', shell.idShort + '.aasx');

  return {
    formData,
    env,
    shell,
    requiredSemanticIds: [],
    assetGlobalId,
    dppId: IdGenerationUtil.generateIri('dpp', options.iriPrefix),
    isBatteryPassport,
    isDppCore,
    usesTemplateBackedCoreSubmodels: !isBatteryPassport && options.standardGeneratorTemplateRoles.length > 0,
    additionalSubmodels: options.additionalSubmodels,
    assetKind: shell.assetInformation.assetKind === aas.types.AssetKind.Instance ? 'Instance' : 'Type',
    documentItems: [],
    nameplateSource: null,
    generatorFiles: null,
  };
}

function findOrCreateRootShell(env: aas.types.Environment, options: CreateGeneratorExportStateOptions) {
  const existingShell = env.assetAdministrationShells?.[0];
  if (existingShell != null) {
    return existingShell;
  }

  if (options.baseShell != null) {
    const shell = cloneShell(options.baseShell);
    shell.description = shell.description ?? [];
    shell.submodels ??= [];
    shell.administration ??= new aas.types.AdministrativeInformation(
      null,
      '1',
      '0',
      new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
        new aas.types.Key(aas.types.KeyTypes.GlobalReference, 'AasSuite'),
      ]),
    );
    return shell;
  }

  const assetInfo = new aas.types.AssetInformation(aas.types.AssetKind.Type);

  const shellIdShort = 'aa';
  const shellId =
    buildAssetShellIdentifier(options.iriPrefix, shellIdShort) ||
    IdGenerationUtil.generateIri('aas', options.iriPrefix);
  const shell = new aas.types.AssetAdministrationShell(shellId, assetInfo);
  shell.idShort = shellIdShort;
  shell.description = shell.description ?? [];
  shell.submodels ??= [];
  shell.administration ??= new aas.types.AdministrativeInformation(
    null,
    '1',
    '0',
    new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
      new aas.types.Key(aas.types.KeyTypes.GlobalReference, 'AasSuite'),
    ]),
  );
  return shell;
}

function cloneEnvironment(environment: aas.types.Environment) {
  const cloned = aas.jsonization.environmentFromJsonable(aas.jsonization.toJsonable(environment));
  if (cloned.value == null) {
    throw new Error('Failed to clone generator export environment');
  }

  return cloned.value;
}

function cloneShell(shell: aas.types.AssetAdministrationShell) {
  const cloned = aas.jsonization.assetAdministrationShellFromJsonable(aas.jsonization.toJsonable(shell));
  if (cloned.value == null) {
    throw new Error('Failed to clone generator export shell');
  }

  return cloned.value;
}

export function createSubmodelRef(submodel: aas.types.Submodel): aas.types.Reference {
  return new aas.types.Reference(aas.types.ReferenceTypes.ModelReference, [
    new aas.types.Key(aas.types.KeyTypes.Submodel, submodel.id),
  ]);
}

export function appendExportSubmodel(state: GeneratorExportState, submodel: aas.types.Submodel) {
  state.env.submodels?.push(submodel);
  state.shell.submodels?.push(createSubmodelRef(submodel));
}

export async function buildGeneratorExportPayload(state: GeneratorExportState, hooks: GeneratorExportBuilderHooks) {
  hooks.applyDppFileReferences();

  appendGeneratorVariantSubmodels(state, hooks);

  hooks.appendGeneratorFilesToExport(state);
  await hooks.loadExportConceptDescriptions(state);

  state.formData.append('plainJson', JSON.stringify(aas.jsonization.toJsonable(state.env)));
  state.formData.append('id', '-1');

  return state.formData;
}
