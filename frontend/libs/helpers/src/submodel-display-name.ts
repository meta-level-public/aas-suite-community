import { TranslateService } from '@ngx-translate/core';

const SEMANTIC_ID_TO_I18N_KEY: Record<string, string> = {
  'https://admin-shell.io/idta/nameplate/3/0/nameplate': 'MARKT_SUBMODEL_NAMEPLATE',
  'https://admin-shell.io/zvei/nameplate/2/0/nameplate': 'MARKT_SUBMODEL_NAMEPLATE',
  'https://admin-shell.io/idta/digitalbatterypassport/nameplate/1/0/nameplate': 'MARKT_SUBMODEL_BATTERY_NAMEPLATE',
  'https://admin-shell.io/idta/softwarenameplate/1/0': 'MARKT_SUBMODEL_SOFTWARE_NAMEPLATE',
  'https://admin-shell.io/zvei/technicaldata/submodel/1/1': 'MARKT_SUBMODEL_TECHNICAL_DATA',
  'https://admin-shell.io/zvei/technicaldata/submodel/1/2': 'MARKT_SUBMODEL_TECHNICAL_DATA',
  '0173-1#01-ahf578#001': 'MARKT_SUBMODEL_HANDOVER_DOC',
  '0173-1#01-ahf578#002': 'MARKT_SUBMODEL_HANDOVER_DOC',
  '0173-1#01-ahf578#003': 'MARKT_SUBMODEL_HANDOVER_DOC',
  'https://admin-shell.io/idta/hierarchicalstructures/1/0/submodel': 'MARKT_SUBMODEL_BOM',
  'https://admin-shell.io/idta/hierarchicalstructures/1/1/submodel': 'MARKT_SUBMODEL_BOM',
  'pcf-demo': 'MARKT_SUBMODEL_PCF',
  '0173-1#01-ahe712#001': 'MARKT_SUBMODEL_PCF',
  'https://zvei.org/demo/productcarbonfootprint/1/0': 'MARKT_SUBMODEL_PCF',
  'https://zvei.org/demo/sm/productcarbonfootprint/1/0': 'MARKT_SUBMODEL_PCF',
  'https://admin-shell.io/idta/carbonfootprint/carbonfootprint/0/9': 'MARKT_SUBMODEL_PCF',
  'https://admin-shell.io/idta/carbonfootprint/carbonfootprint/1/0': 'MARKT_SUBMODEL_PCF',
  'https://admin-shell.io/zvei/nameplate/1/0/contactinformations': 'MARKT_SUBMODEL_CONTACT_INFO',
  'https://admin-shell.io/idta/capabilitydescription/1/0/submodel': 'MARKT_SUBMODEL_CAPABILITY_DESC',
  'https://admin-shell.io/idta/submodeltemplate/capabilitydescription/1/0': 'MARKT_SUBMODEL_CAPABILITY_DESC',
  'https://admin-shell.io/idta/timeseries/1/1': 'MARKT_SUBMODEL_TIME_SERIES',
  'https://admin-shell.io/sandbox/vdma/article-information/0/8': 'MARKT_SUBMODEL_ARTICLE_INFO',
  'https://admin-shell.io/sandbox/vdma/article-information/0/8/': 'MARKT_SUBMODEL_ARTICLE_INFO',
  'https://admin-shell.io/sandbox/idta/articleinformation/0/8/': 'MARKT_SUBMODEL_ARTICLE_INFO',
  'https://admin-shell.io/sandbox/idta/articleinformation/0/8': 'MARKT_SUBMODEL_ARTICLE_INFO',
  'https://admin-shell.io/idta/assetinterfacesdescription/1/0/submodel': 'MARKT_SUBMODEL_ASSET_INTERFACES',
  'https://admin-shell.io/idta/assetinterfacesdescription/1/0': 'MARKT_SUBMODEL_ASSET_INTERFACES',
};

export function semanticIdToDisplayName(semanticId: string, idShort?: string, translate?: TranslateService): string {
  const key = SEMANTIC_ID_TO_I18N_KEY[semanticId.trim().toLowerCase()];
  if (key && translate) {
    return translate.instant(key);
  }
  if (idShort) {
    return idShort;
  }
  const trimmed = semanticId.trim();
  return trimmed.length > 60 ? '…' + trimmed.slice(-57) : trimmed;
}
