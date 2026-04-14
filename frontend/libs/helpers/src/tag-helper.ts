import * as aas from '@aas-core-works/aas-core3.1-typescript';

export class TagHelper {
  static getVersionSeverity(version: string) {
    switch (version) {
      case 'V2':
        return 'info';
      case 'V3':
        return 'success';
      default:
        return 'warn';
    }
  }

  static getAasTypeTagSeverity(
    shell: aas.types.AssetAdministrationShell,
  ): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
    if (shell?.assetInformation?.assetKind === 0) return 'info';
    if (shell?.assetInformation?.assetKind === 1) return 'success';
    if (shell?.assetInformation?.assetKind === 2) return 'danger';
    if (shell?.assetInformation?.assetKind === 3) return 'contrast';

    return 'secondary';
  }

  static getAasTypeTagSeverityByString(
    typeString: string,
  ): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | undefined {
    switch (typeString?.trim().toLowerCase()) {
      case '1':
      case 'instance':
        return 'success';
      case '0':
      case 'type':
        return 'info';
      case '2':
      case 'role':
        return 'danger';
      case '3':
      case 'notapplicable':
        return 'contrast';
      default:
        return 'contrast';
    }
  }

  static getAasTypeTag(shell: aas.types.AssetAdministrationShell) {
    if (shell?.assetInformation?.assetKind === 0) return 'Type';
    if (shell?.assetInformation?.assetKind === 1) return 'Instance';
    if (shell?.assetInformation?.assetKind === 2) return 'Role';
    if (shell?.assetInformation?.assetKind === 3) return 'NotApplicable';

    return shell?.assetInformation?.assetKind ?? 'NotApplicable';
  }

  static getAasTypeStringTag(assetTypeString: string) {
    if (assetTypeString === '0') return 'Type';
    if (assetTypeString === '1') return 'Instance';
    if (assetTypeString === '2') return 'Role';
    if (assetTypeString === '3') return 'NotApplicable';

    return 'NotApplicable';
  }
}
