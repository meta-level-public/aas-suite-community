import * as aas from '@aas-core-works/aas-core3.1-typescript';

export type SpecializedSubmodelViewerType =
  | 'AssetInterfacesDescription'
  | 'AasDesignerChangelog'
  | 'Circularity'
  | 'ProductCondition'
  | 'MaterialComposition'
  | 'Nameplate'
  | 'BatteryNameplate'
  | 'SoftwareNameplate'
  | 'CapabilityDescription'
  | 'ContactInformation'
  | 'TimeSeries'
  | 'HandoverDocumentation'
  | 'HandoverDocumentation_V2'
  | 'TechnicalData'
  | 'Bom'
  | 'PCF'
  | 'PCF_V1'
  | 'ArticleInformation'
  | 'Generic';

export class SubmodelViewerResolver {
  static resolve(submodel: aas.types.Submodel | null | undefined): SpecializedSubmodelViewerType {
    const semanticId = this.getSemanticId(submodel);
    const semId = semanticId?.trim().toLowerCase();

    switch (semId) {
      case 'aasdesignerchangelog':
        return 'AasDesignerChangelog';
      case 'urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#circularity':
        return 'Circularity';
      case 'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#productcondition':
        return 'ProductCondition';
      case 'urn:samm:io.admin-shell.idta.batterypass.material_composition:1.0.0#materialcomposition':
        return 'MaterialComposition';
      case 'https://admin-shell.io/idta/assetinterfacesdescription/1/0/submodel':
      case 'https://admin-shell.io/idta/assetinterfacesdescription/1/0':
        return 'AssetInterfacesDescription';
      case 'https://admin-shell.io/zvei/nameplate/2/0/nameplate':
      case 'https://admin-shell.io/idta/nameplate/3/0/nameplate':
        return 'Nameplate';
      case 'https://admin-shell.io/idta/digitalbatterypassport/nameplate/1/0/nameplate':
        return 'BatteryNameplate';
      case 'https://admin-shell.io/idta/softwarenameplate/1/0':
        return 'SoftwareNameplate';
      case 'https://admin-shell.io/idta/capabilitydescription/1/0/submodel':
      case 'https://admin-shell.io/idta/submodeltemplate/capabilitydescription/1/0':
        return 'CapabilityDescription';
      case 'https://admin-shell.io/idta/timeseries/1/1':
        return 'TimeSeries';
      case '0173-1#01-ahf578#001':
      case '0173-1#01-ahf578#003':
        return 'HandoverDocumentation_V2';
      case '0173-1#01-ahf578#002':
        return 'HandoverDocumentation';
      case 'https://admin-shell.io/zvei/technicaldata/submodel/1/1':
      case 'https://admin-shell.io/zvei/technicaldata/submodel/1/2':
        return 'TechnicalData';
      case 'https://admin-shell.io/idta/hierarchicalstructures/1/0/submodel':
      case 'https://admin-shell.io/idta/hierarchicalstructures/1/1/submodel':
        return 'Bom';
      case 'pcf-demo':
      case '0173-1#01-ahe712#001':
      case 'https://zvei.org/demo/productcarbonfootprint/1/0':
      case 'https://zvei.org/demo/sm/productcarbonfootprint/1/0':
      case 'https://admin-shell.io/idta/carbonfootprint/carbonfootprint/0/9':
        return 'PCF';
      case 'https://admin-shell.io/idta/carbonfootprint/carbonfootprint/1/0':
        return 'PCF_V1';
      case 'https://admin-shell.io/sandbox/vdma/article-information/0/8':
      case 'https://admin-shell.io/sandbox/vdma/article-information/0/8/':
      case 'https://admin-shell.io/sandbox/idta/articleinformation/0/8/':
      case 'https://admin-shell.io/sandbox/idta/articleinformation/0/8':
        return 'ArticleInformation';
      case 'https://admin-shell.io/zvei/nameplate/1/0/contactinformations':
        return 'ContactInformation';
      default:
        return 'Generic';
    }
  }

  static hasSpecializedViewer(submodel: aas.types.Submodel | null | undefined): boolean {
    return this.resolve(submodel) !== 'Generic';
  }

  private static getSemanticId(submodel: aas.types.Submodel | null | undefined): string | undefined {
    return submodel?.semanticId?.keys?.find(
      (k) =>
        k.type === aas.types.KeyTypes.ConceptDescription ||
        k.type === aas.types.KeyTypes.GlobalReference ||
        k.type === aas.types.KeyTypes.Submodel,
    )?.value;
  }
}
