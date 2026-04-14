export interface InfoItem {
  irdi: string;
  iri: string;
  custom: string;
}

export class Info {
  static MANUFACTURER: InfoItem = {
    irdi: '0173-1#02-AAO677#002',
    iri: '',
    custom: '',
  };
  static PRODUCT_DESIGNATION: InfoItem = {
    irdi: '0173-1#02-AAW338#001',
    iri: '',
    custom: '',
  };
  static PRODUCT_FAMILY: InfoItem = {
    irdi: '0173-1#02-AAU731#001',
    iri: '',
    custom: '',
  };
  static ADDRESS_COUNTRY_CODE: InfoItem = {
    irdi: '0173-1#02-AAO730#001',
    iri: '',
    custom: '',
  };
  static ADDRESS_STREET: InfoItem = {
    irdi: '0173-1#02-AAO128#001',
    iri: '',
    custom: '',
  };
  static ADDRESS_ZIP: InfoItem = {
    irdi: '0173-1#02-AAO129#002',
    iri: '',
    custom: '',
  };
  static ADDRESS_CITY_TOWN: InfoItem = {
    irdi: '0173-1#02-AAO132#001',
    iri: '',
    custom: '',
  };
  static ADDRESS_STATE_COUNTY: InfoItem = {
    irdi: '0173-1#02-AAO133#002',
    iri: '',
    custom: '',
  };
  static GLN_OF_MANUFACTURER: InfoItem = {
    irdi: '0173-1#02-AAY812#001',
    iri: '',
    custom: '',
  };
  static DOCUMENT_VALUE_ID: InfoItem = {
    irdi: '0173-1#02-AAO099#002',
    iri: '',
    custom: '',
  };
  static SERIAL_NUMBER: InfoItem = { irdi: '', iri: '', custom: '' };
  static KENNZEICHEN: InfoItem = { irdi: '', iri: '', custom: '' };
  static ASSET_SHELL_ID: InfoItem = {
    irdi: '',
    iri: '',
    custom: 'ASSET_SHELL_ID',
  };
  static ASSET_SHELL_DESCRIPTION: InfoItem = {
    irdi: '',
    iri: '',
    custom: 'ASSET_SHELL_DESCRIPTION',
  };
  static ASSET_ID: InfoItem = { irdi: '', iri: '', custom: 'ASSET_ID_EXPL' };
  static ASSET_DESCRIPTION: InfoItem = {
    irdi: '',
    iri: '',
    custom: 'ASSET_DESCRIPTION',
  };

  static ID_SHORT: InfoItem = {
    irdi: '',
    iri: '',
    custom: 'ID_SHORT_DESCRIPTION',
  };
  static ID_SHORT_IDENTIFIABLE: InfoItem = {
    irdi: '',
    iri: '',
    custom: 'HELP_INFO.ID_SHORT_IDENTIFIABLE',
  };
  static ID_SHORT_REFERRABLE: InfoItem = {
    irdi: '',
    iri: '',
    custom: 'HELP_INFO.ID_SHORT_REFERRABLE',
  };
  static ALLOW_MULTIPLE: InfoItem = {
    irdi: '',
    iri: '',
    custom: 'ALLOW_MULTIPLE_DESCRIPTION',
  };
  static ORDERED: InfoItem = {
    irdi: '',
    iri: '',
    custom: 'ORDERED_DESCRIPTION',
  };
  static SHORT_NAME: InfoItem = {
    irdi: '',
    iri: '',
    custom: 'SHORT_NAME_DESCRIPTION',
  };
  static DEFINITION: InfoItem = {
    irdi: '',
    iri: '',
    custom: 'DEFINITION_DESCRIPTION',
  };
  static PREFERRED_NAME: InfoItem = {
    irdi: '',
    iri: '',
    custom: 'PREFERRED_NAME_DESCRIPTION',
  };
  static UNIT: InfoItem = {
    irdi: '',
    iri: '',
    custom: 'UNIT_DESCRIPTION',
  };
  static VALUE_FORMAT: InfoItem = {
    irdi: '',
    iri: '',
    custom: 'VALUE_FORMAT_DESCRIPTION',
  };
  static SPECIFIC_ASSET_IDS: InfoItem = {
    irdi: '',
    iri: '',
    custom: 'HELP_INFO.ASSET_INFORMATION_SPECIFIC_ASSET_IDS',
  };
  static GLOBAL_ASSET_ID: InfoItem = {
    irdi: '',
    iri: '',
    custom: 'HELP_INFO.ASSET_INFORMATION_GLOBAL_ASSET_ID',
  };
  static ASSET_KIND: InfoItem = {
    irdi: '',
    iri: '',
    custom: 'HELP_INFO.ASSET_KIND',
  };
  static MODELING_KIND: InfoItem = {
    irdi: '',
    iri: '',
    custom: 'HELP_INFO.MODELING_KIND',
  };
  static ID: InfoItem = {
    irdi: '',
    iri: '',
    custom: 'HELP_INFO.ID',
  };
  static ORDER_RELEVANT: InfoItem = {
    irdi: '',
    iri: '',
    custom: 'HELP_INFO.ORDER_RELEVANT',
  };
  static SML_ELEMENT_TYPE: InfoItem = {
    irdi: '',
    iri: '',
    custom: 'HELP_INFO.SML_ELEMENT_TYPE',
  };
  static SML_ELEMENT_VALUE_TYPE: InfoItem = {
    irdi: '',
    iri: '',
    custom: 'HELP_INFO.SML_ELEMENT_VALUE_TYPE',
  };
  static DOCUMENT_DOMAIN_ID: InfoItem = {
    irdi: '0173-1#02-ABH994#001',
    iri: '',
    custom: 'HELP_INFO.DOCUMENT_DOMAIN_ID',
  };
  static DOCUMENT_IS_PRIMARY: InfoItem = {
    irdi: '0173-1#02-ABH995#001',
    iri: '',
    custom: 'HELP_INFO.DOCUMENT_IS_PRIMARY',
  };
  static CLASSIFICATION_SYSTEM: InfoItem = {
    irdi: '0173-1#02-ABH997#001',
    iri: '',
    custom: 'HELP_INFO.CLASSIFICATION_SYSTEM',
  };
  static CLASS_ID: InfoItem = {
    irdi: '0173-1#02-ABH996#001',
    iri: '',
    custom: 'HELP_INFO.CLASS_ID',
  };
  static CLASS_NAME: InfoItem = {
    irdi: '0173-1#02-AAO102#003',
    iri: '',
    custom: 'HELP_INFO.CLASS_NAME',
  };
  static DOC_LANGUAGE: InfoItem = {
    irdi: '0173-1#02-AAN468#006',
    iri: '',
    custom: 'HELP_INFO.DOC_LANGUAGE',
  };
  static DOC_VERSION: InfoItem = {
    irdi: '0173-1#02-AAO100#002',
    iri: '',
    custom: 'HELP_INFO.DOC_VERSION',
  };
  static DOC_TITLE: InfoItem = {
    irdi: '0173-1#02-AAO105#002',
    iri: '',
    custom: 'HELP_INFO.DOC_TITLE',
  };
  static DOC_SUBTITLE: InfoItem = {
    irdi: '0173-1#02-ABH998#001',
    iri: '',
    custom: 'HELP_INFO.DOC_SUBTITLE',
  };
  static DOC_SUMMARY: InfoItem = {
    irdi: '0173-1#02-AAO106#002',
    iri: '',
    custom: 'HELP_INFO.DOC_SUMMARY',
  };
  static DOC_KEYWORDS: InfoItem = {
    irdi: '0173-1#02-ABH999#001',
    iri: '',
    custom: 'HELP_INFO.DOC_KEYWORDS',
  };
  static DOC_STATUS_DATE: InfoItem = {
    irdi: '0173-1#02-ABI000#001',
    iri: '',
    custom: 'HELP_INFO.DOC_STATUS_DATE',
  };
  static DOC_STATUS: InfoItem = {
    irdi: '0173-1#02-ABI001#001',
    iri: '',
    custom: 'HELP_INFO.DOC_STATUS',
  };
  static DOC_ORGANIZATION_NAME: InfoItem = {
    irdi: '0173-1#02-ABI002#001',
    iri: '',
    custom: 'HELP_INFO.DOC_ORGANIZATION_NAME',
  };
  static DOC_ORGANIZATION_OFFICIAL_NAME: InfoItem = {
    irdi: '0173-1#02-ABI004#001',
    iri: '',
    custom: 'HELP_INFO.DOC_ORGANIZATION_OFFICIAL_NAME',
  };
  static REFERENCE_TYPE: InfoItem = {
    irdi: '',
    iri: '',
    custom: 'HELP_INFO.REFERENCE_TYPE',
  };
  static KEY_TYPE: InfoItem = {
    irdi: '',
    iri: '',
    custom: 'HELP_INFO.KEY_TYPE',
  };
  static SPECIFIC_ASSET_ID_VALUE: InfoItem = {
    irdi: '',
    iri: '',
    custom: 'HELP_INFO.SPECIFIC_ASSET_ID_VALUE',
  };
  static SPECIFIC_ASSET_ID_NAME: InfoItem = {
    irdi: '',
    iri: '',
    custom: 'HELP_INFO.SPECIFIC_ASSET_ID_NAME',
  };
  static ASSET_TYPE: InfoItem = {
    irdi: '',
    iri: '',
    custom: 'HELP_INFO.ASSET_TYPE',
  };

  static DESCRIPTION: InfoItem = {
    irdi: '',
    iri: '',
    custom: 'HELP_INFO.DESCRIPTION',
  };
  static DISPLAY_NAME: InfoItem = {
    irdi: '',
    iri: '',
    custom: 'HELP_INFO.DISPLAY_NAME',
  };
  static DATA_TYPE: InfoItem = {
    irdi: '',
    iri: '',
    custom: 'HELP_INFO.DATA_TYPE',
  };
  static CATEGORY: InfoItem = {
    irdi: '',
    iri: '',
    custom: 'HELP_INFO.CATEGORY',
  };
  static ASSET_THUMBNAIL: InfoItem = {
    irdi: '',
    iri: '',
    custom: 'HELP_INFO.ASSET_THUMBNAIL',
  };
  static PACKAGE_THUMBNAIL: InfoItem = {
    irdi: '',
    iri: '',
    custom: 'HELP_INFO.PACKAGE_THUMBNAIL',
  };
}
