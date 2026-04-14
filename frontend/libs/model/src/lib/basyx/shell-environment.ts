import { ConceptDescription } from './concept-description';
import { EnvironmentAssetAdministrationShell } from './environment-asset-administration-shell';

export class AssetAdministrationShellEnvironment {
  assetAdministrationShells: EnvironmentAssetAdministrationShell[] = [];
  assets: any[] = [];
  submodels: any[] = [];
  conceptDescriptions: ConceptDescription[] = [];
  supplementalFiles: any[] = [];
  id: number | null = null;
  mlGenUuid: string = '';

  static fromDto(dto: any) {
    const env = new AssetAdministrationShellEnvironment();
    Object.assign(env, dto);

    env.conceptDescriptions = dto?.conceptDescriptions.map((cd: any) => ConceptDescription.fromDto(cd));

    env.assetAdministrationShells = dto?.assetAdministrationShells.map((shell: any) =>
      EnvironmentAssetAdministrationShell.fromDto(shell),
    );

    // kleine Fehlerbehebungen aus dem Forschungsprojekt vornehmen
    // idShort mit leerzeichen
    env.assetAdministrationShells?.forEach((s) => (s.idShort = s.idShort.replace(/\s/g, '')));
    // defekte semantic-ids
    env.submodels?.forEach((sm) => AssetAdministrationShellEnvironment.updateSemanticIdsRecursive(sm));

    // defekte identifikationen
    env.submodels.forEach((sm) => AssetAdministrationShellEnvironment.updateIdentificationsRecursive(sm));
    env.assets.forEach((asset) => AssetAdministrationShellEnvironment.updateIdentificationsRecursive(asset));

    // todo: sollen wir die fehlenden Konzeptbeschreibungen korrigieren?

    if (env.assetAdministrationShells == null) env.assetAdministrationShells = [];
    if (env.submodels == null) env.submodels = [];
    if (env.conceptDescriptions == null) env.conceptDescriptions = [];
    if (env.supplementalFiles == null) env.supplementalFiles = [];

    return env;
  }

  static updateIdentificationsRecursive(el: any) {
    // conceptDescription finden
    if (el.identification != null && el.identification.id === undefined) {
      el.identification.id = '';
    }

    if (el.modelType?.name === 'AssetAdministrationShell') {
      el.submodels?.forEach((sme: any) => {
        this.updateIdentificationsRecursive(sme);
      });
    }

    if (el.modelType?.name === 'Submodel') {
      el.submodelElements?.forEach((sme: any) => {
        this.updateIdentificationsRecursive(sme);
      });
    }

    if (el.modelType?.name === 'SubmodelElementCollection') {
      el.value?.forEach((sme: any) => {
        this.updateIdentificationsRecursive(sme);
      });
    }
  }

  static updateSemanticIdsRecursive(el: any) {
    // conceptDescription finden
    const cd = el.semanticId?.keys?.find((s: any) => s.type === 'ConceptDescription');
    if (cd != null && cd.value === undefined) {
      cd.value = '';
    }

    if (el.modelType?.name === 'AssetAdministrationShell') {
      el.submodels?.forEach((sme: any) => {
        this.updateSemanticIdsRecursive(sme);
      });
    }

    if (el.modelType?.name === 'Submodel') {
      el.submodelElements?.forEach((sme: any) => {
        this.updateSemanticIdsRecursive(sme);
      });
    }

    if (el.modelType?.name === 'SubmodelElementCollection') {
      el.value?.forEach((sme: any) => {
        this.updateSemanticIdsRecursive(sme);
      });
    }
  }
}
