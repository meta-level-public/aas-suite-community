import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { IdGenerationUtil } from '@aas/helpers';
import { MultiLanguagePropertyValue } from '@aas/model';

export interface GeneratorNameplateMarkingSource {
  name?: string;
  filename?: string;
  additionalText?: string;
  file?: File;
}

export interface GeneratorNameplateSource {
  nameplate?: {
    manufacturer?: MultiLanguagePropertyValue[];
    address?: {
      street?: MultiLanguagePropertyValue[];
      zip?: MultiLanguagePropertyValue[];
      cityTown?: MultiLanguagePropertyValue[];
      stateCounty?: MultiLanguagePropertyValue[];
      countryCode?: MultiLanguagePropertyValue[];
    };
    productDesignation?: MultiLanguagePropertyValue[];
    productRoot?: MultiLanguagePropertyValue[];
    productFamily?: MultiLanguagePropertyValue[];
    serialNumber?: string;
    yearOfConstruction?: string;
    markings?: GeneratorNameplateMarkingSource[];
  };
}

export interface BuildTemplateBackedNameplateSubmodelOptions {
  nameplateTemplate: aas.types.Submodel;
  currentNameplate?: aas.types.Submodel | null;
  source: GeneratorNameplateSource | null | undefined;
  iriPrefix: string;
  requiredSemanticIds: string[];
}

export function populateStandardNameplateSubmodel(
  nameplate: aas.types.Submodel,
  source: GeneratorNameplateSource | null | undefined,
  iriPrefix: string,
  requiredSemanticIds: string[] = [],
) {
  if (nameplate.submodelElements == null) {
    nameplate.submodelElements = [];
  }

  nameplate.id = IdGenerationUtil.generateIri('submodel', iriPrefix);

  nameplate.submodelElements.push(
    createProperty('URIOfTheProduct', aas.types.DataTypeDefXsd.String, '0173-1#02-AAY811#001', '', requiredSemanticIds),
  );
  nameplate.submodelElements.push(
    createMultilanguageProperty(
      'ManufacturerName',
      '0173-1#02-AAO677#002',
      source?.nameplate?.manufacturer,
      requiredSemanticIds,
    ),
  );
  nameplate.submodelElements.push(
    createMultilanguageProperty(
      'ManufacturerProductDesignation',
      '0173-1#02-AAW338#001',
      source?.nameplate?.productDesignation,
      requiredSemanticIds,
    ),
  );

  const contactInfo = new aas.types.SubmodelElementCollection(null, null, 'ContactInformation');
  contactInfo.value = [
    createMultilanguageProperty(
      'Street',
      '0173-1#02-AAO128#002',
      source?.nameplate?.address?.street,
      requiredSemanticIds,
    ),
    createMultilanguageProperty(
      'Zipcode',
      '0173-1#02-AAO129#002',
      source?.nameplate?.address?.zip,
      requiredSemanticIds,
    ),
    createMultilanguageProperty(
      'CityTown',
      '0173-1#02-AAO132#002',
      source?.nameplate?.address?.cityTown,
      requiredSemanticIds,
    ),
    createMultilanguageProperty(
      'NationalCode',
      '0173-1#02-AAO134#002',
      source?.nameplate?.address?.countryCode,
      requiredSemanticIds,
    ),
  ];
  nameplate.submodelElements.push(contactInfo);

  nameplate.submodelElements.push(
    createMultilanguageProperty('ManufacturerProductRoot', '0173-1#02-AAU732#001', undefined, requiredSemanticIds),
  );
  nameplate.submodelElements.push(
    createMultilanguageProperty(
      'ManufacturerProductFamily',
      '0173-1#02-AAU731#001',
      source?.nameplate?.productFamily,
      requiredSemanticIds,
    ),
  );
  nameplate.submodelElements.push(
    createMultilanguageProperty('ManufacturerProductType', '0173-1#02-AAO057#002', undefined, requiredSemanticIds),
  );
  nameplate.submodelElements.push(
    createMultilanguageProperty('OrderCodeOfManufacturer', '0173-1#02-AAO227#002', undefined, requiredSemanticIds),
  );
  nameplate.submodelElements.push(
    createMultilanguageProperty(
      'ProductArticleNumberOfManufacturer',
      '0173-1#02-AAO676#003',
      undefined,
      requiredSemanticIds,
    ),
  );
  nameplate.submodelElements.push(
    createProperty(
      'SerialNumber',
      aas.types.DataTypeDefXsd.String,
      '0173-1#02-AAM556#002',
      source?.nameplate?.serialNumber,
      requiredSemanticIds,
    ),
  );
  nameplate.submodelElements.push(
    createProperty(
      'YearOfConstruction',
      aas.types.DataTypeDefXsd.String,
      '0173-1#02-AAP906#001',
      source?.nameplate?.yearOfConstruction,
      requiredSemanticIds,
    ),
  );
  nameplate.submodelElements.push(
    createProperty(
      'DateOfManufacture',
      aas.types.DataTypeDefXsd.Date,
      '0173-1#02-AAR972#002',
      undefined,
      requiredSemanticIds,
    ),
  );
  nameplate.submodelElements.push(
    createMultilanguageProperty('HardwareVersion', '0173-1#02-AAN270#002', undefined, requiredSemanticIds),
  );
  nameplate.submodelElements.push(
    createMultilanguageProperty('FirmwareVersion', '0173-1#02-AAM985#002', undefined, requiredSemanticIds),
  );
  nameplate.submodelElements.push(
    createMultilanguageProperty('SoftwareVersion', '0173-1#02-AAM737#002', undefined, requiredSemanticIds),
  );
  nameplate.submodelElements.push(
    createProperty(
      'CountryOfOrigin',
      aas.types.DataTypeDefXsd.String,
      '0173-1#02-AAO259#004',
      source?.nameplate?.yearOfConstruction,
      requiredSemanticIds,
    ),
  );

  syncNameplateMarkingsElement(
    nameplate,
    source?.nameplate?.markings ?? [],
    requiredSemanticIds,
    getElementSemanticValues,
  );

  const assetSpecificProperties = new aas.types.SubmodelElementCollection(null, null, 'AssetSpecificProperties');
  assetSpecificProperties.value = null;
  assetSpecificProperties.semanticId = createSemanticId('0173-1#01-AGZ672#001', requiredSemanticIds);
  nameplate.submodelElements.push(assetSpecificProperties);
}

export function createStandardAssistantNameplateSubmodel(
  source: GeneratorNameplateSource | null | undefined,
  iriPrefix: string,
  requiredSemanticIds: string[],
) {
  const nameplate = new aas.types.Submodel(
    'Nameplate',
    null,
    null,
    'Nameplate',
    null,
    null,
    new aas.types.AdministrativeInformation(
      null,
      '1',
      '0',
      new aas.types.Reference(aas.types.ReferenceTypes.ModelReference, [
        new aas.types.Key(aas.types.KeyTypes.GlobalReference, 'AasSuite'),
      ]),
    ),
    aas.types.ModellingKind.Instance,
    new aas.types.Reference(aas.types.ReferenceTypes.ModelReference, [
      new aas.types.Key(aas.types.KeyTypes.Submodel, 'https://admin-shell.io/zvei/nameplate/2/0/Nameplate'),
    ]),
  );

  populateStandardNameplateSubmodel(nameplate, source, iriPrefix, requiredSemanticIds);

  return nameplate;
}

export function createDppDigitalNameplateSubmodel(
  source: GeneratorNameplateSource | null | undefined,
  iriPrefix: string,
  requiredSemanticIds: string[],
) {
  const nameplate = new aas.types.Submodel(
    IdGenerationUtil.generateIri('submodel', iriPrefix),
    null,
    null,
    'DigitalNameplate',
    null,
    null,
    new aas.types.AdministrativeInformation(
      null,
      '1',
      '0',
      new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
        new aas.types.Key(aas.types.KeyTypes.GlobalReference, 'AasSuite'),
      ]),
    ),
    aas.types.ModellingKind.Instance,
    new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
      new aas.types.Key(aas.types.KeyTypes.GlobalReference, 'https://admin-shell.io/idta/nameplate/3/0/Nameplate'),
    ]),
  );

  populateStandardNameplateSubmodel(nameplate, source, iriPrefix, requiredSemanticIds);

  return nameplate;
}

export function syncNameplateMarkingsElement(
  nameplate: aas.types.Submodel,
  markings: GeneratorNameplateMarkingSource[],
  requiredSemanticIds: string[],
  getSemanticValues: (element: aas.types.ISubmodelElement) => string[],
) {
  const markingsValue = buildNameplateMarkingElements(markings, requiredSemanticIds);
  const markingsElement: any = (nameplate.submodelElements ?? []).find(
    (element) =>
      (element.idShort === 'Markings' ||
        getSemanticValues(element).includes('0173-1#01-agz673#001') ||
        getSemanticValues(element).includes('0112/2///61360_7#aas006#001')) &&
      (element.modelType.name === 'SubmodelElementCollection' || element.modelType.name === 'SubmodelElementList'),
  );

  if (markingsElement != null) {
    markingsElement.value = markingsValue;
    return;
  }

  if (markingsValue.length === 0) {
    return;
  }

  const markingsCollection = new aas.types.SubmodelElementCollection(null, null, 'Markings');
  markingsCollection.semanticId = createSemanticId('0173-1#01-AGZ673#001', requiredSemanticIds);
  markingsCollection.value = markingsValue;
  nameplate.submodelElements = [...(nameplate.submodelElements ?? []), markingsCollection];
}

export function syncTemplateBackedNameplateMirrorValues(
  nameplate: aas.types.Submodel,
  source: GeneratorNameplateSource | null | undefined,
  requiredSemanticIds: string[],
) {
  setElementFromMlp(nameplate, ['ManufacturerName'], source?.nameplate?.manufacturer);
  setElementFromMlp(nameplate, ['Company', 'Name'], source?.nameplate?.manufacturer);
  setElementFromMlp(
    nameplate,
    ['ManufacturerProductDesignation', 'ProductDesignation'],
    source?.nameplate?.productDesignation,
  );
  setElementFromMlp(nameplate, ['ManufacturerProductRoot', 'ProductRoot'], source?.nameplate?.productRoot);
  setElementFromMlp(nameplate, ['ManufacturerProductFamily', 'ProductFamily'], source?.nameplate?.productFamily);
  setElementFromMlp(nameplate, ['Street'], source?.nameplate?.address?.street);
  setElementFromMlp(nameplate, ['Zipcode', 'ZipCode'], source?.nameplate?.address?.zip);
  setElementFromMlp(nameplate, ['CityTown'], source?.nameplate?.address?.cityTown);
  setElementFromMlp(nameplate, ['StateCounty'], source?.nameplate?.address?.stateCounty);
  setElementFromMlp(nameplate, ['NationalCode', 'CountryCode'], source?.nameplate?.address?.countryCode);
  setElementFromPropertyString(nameplate, ['SerialNumber'], source?.nameplate?.serialNumber ?? '');
  setElementFromPropertyString(nameplate, ['YearOfConstruction'], source?.nameplate?.yearOfConstruction ?? '');

  syncNameplateMarkingsElement(
    nameplate,
    source?.nameplate?.markings ?? [],
    requiredSemanticIds,
    getElementSemanticValues,
  );
}

export function buildTemplateBackedNameplateSubmodel(options: BuildTemplateBackedNameplateSubmodelOptions) {
  const currentNameplate = options.currentNameplate;
  const isUsingCurrentWorkState = currentNameplate != null;
  const nameplate = isUsingCurrentWorkState
    ? cloneSubmodel(currentNameplate)
    : cloneSubmodel(options.nameplateTemplate);

  nameplate.id = IdGenerationUtil.generateIri('submodel', options.iriPrefix);
  nameplate.idShort = options.nameplateTemplate.idShort ?? nameplate.idShort;
  nameplate.semanticId = options.nameplateTemplate.semanticId;
  nameplate.supplementalSemanticIds = options.nameplateTemplate.supplementalSemanticIds;
  nameplate.administration = options.nameplateTemplate.administration;
  nameplate.kind = options.nameplateTemplate.kind;
  nameplate.description = options.nameplateTemplate.description;
  nameplate.displayName = options.nameplateTemplate.displayName;

  if (!isUsingCurrentWorkState) {
    syncTemplateBackedNameplateMirrorValues(nameplate, options.source, options.requiredSemanticIds);
  }

  collectSemanticIdsFromSubmodel(nameplate, options.requiredSemanticIds);

  return nameplate;
}

function setElementFromMlp(
  submodel: aas.types.Submodel,
  idShortAliases: string[],
  value: MultiLanguagePropertyValue[] | undefined,
) {
  walkSubmodelElements(submodel.submodelElements ?? [], (element) => {
    if (!matchesAlias(element.idShort, idShortAliases)) {
      return;
    }

    if (element.modelType.name === 'MultiLanguageProperty') {
      (element as aas.types.MultiLanguageProperty).value = mlp2LangString(value);
    } else if (element.modelType.name === 'Property') {
      (element as aas.types.Property).value = toSingleString(value);
    }
  });
}

function setElementFromPropertyString(submodel: aas.types.Submodel, idShortAliases: string[], value: string) {
  walkSubmodelElements(submodel.submodelElements ?? [], (element) => {
    if (!matchesAlias(element.idShort, idShortAliases)) {
      return;
    }

    if (element.modelType.name === 'Property') {
      (element as aas.types.Property).value = value;
    } else if (element.modelType.name === 'MultiLanguageProperty') {
      (element as aas.types.MultiLanguageProperty).value = mlp2LangString([{ language: 'en', text: value }]);
    }
  });
}

export function buildNameplateMarkingElements(
  markings: GeneratorNameplateMarkingSource[] | null | undefined,
  requiredSemanticIds: string[],
) {
  if (markings == null || markings.length === 0) {
    return [] as aas.types.SubmodelElementCollection[];
  }

  return markings.map((marking, index) => {
    const collection = new aas.types.SubmodelElementCollection(
      null,
      null,
      'Marking' + index.toString().padStart(2, '0'),
    );
    collection.value = [];
    collection.semanticId = createSemanticId('0173-1#01-AHD206#001', requiredSemanticIds);

    collection.value.push(
      createProperty(
        'MarkingName',
        aas.types.DataTypeDefXsd.String,
        'https://admin-shell.io/zvei/nameplate/2/0/Nameplate/Markings/Marking/MarkingName',
        marking.name,
        requiredSemanticIds,
      ),
    );
    collection.value.push(
      createProperty(
        'DesignationOfCertificateOrApproval',
        aas.types.DataTypeDefXsd.String,
        ' 0112/2///61987#ABH783#001',
        undefined,
        requiredSemanticIds,
      ),
    );
    collection.value.push(
      createProperty(
        'IssueDate',
        aas.types.DataTypeDefXsd.Date,
        'https://admin-shell.io/zvei/nameplate/2/0/Nameplate/Markings/Marking/IssueDate',
        undefined,
        requiredSemanticIds,
      ),
    );
    collection.value.push(
      createProperty(
        'ExpiryDate',
        aas.types.DataTypeDefXsd.Date,
        'https://admin-shell.io/zvei/nameplate/2/0/Nameplate/Markings/Marking/ExpiryDate',
        undefined,
        requiredSemanticIds,
      ),
    );

    const markingFile = new aas.types.File();
    markingFile.contentType = marking.file?.type ?? 'image/png';
    markingFile.semanticId = createSemanticId(
      'https://admin-shell.io/zvei/nameplate/2/0/Nameplate/Markings/Marking/MarkingFile',
      requiredSemanticIds,
    );
    if (marking.filename) {
      markingFile.value = `file:${marking.filename}`;
    }
    markingFile.idShort = 'MarkingFile';
    collection.value.push(markingFile);

    collection.value.push(
      createProperty(
        'MarkingAdditionalText',
        aas.types.DataTypeDefXsd.String,
        'https://admin-shell.io/zvei/nameplate/2/0/Nameplate/Markings/Marking/MarkingAdditionalText',
        marking.additionalText,
        requiredSemanticIds,
      ),
    );

    return collection;
  });
}

function createProperty(
  idShort: string,
  datatype: aas.types.DataTypeDefXsd,
  semId: string,
  value: any,
  requiredSemanticIds: string[],
) {
  const property = new aas.types.Property(
    datatype,
    null,
    null,
    idShort,
    null,
    null,
    semId !== '' ? createSemanticId(semId, requiredSemanticIds) : null,
  );
  property.value = value;
  return property;
}

function createMultilanguageProperty(
  idShort: string,
  semId: string,
  value: MultiLanguagePropertyValue[] | undefined,
  requiredSemanticIds: string[],
) {
  const property = new aas.types.MultiLanguageProperty(
    null,
    null,
    idShort,
    null,
    null,
    semId !== '' ? createSemanticId(semId, requiredSemanticIds) : null,
  );
  property.value = mlp2LangString(value);
  return property;
}

function mlp2LangString(value: MultiLanguagePropertyValue[] | undefined) {
  const result: aas.types.LangStringTextType[] = [];
  value?.forEach((entry) => {
    if (entry.text != null && entry.text !== '') {
      result.push(new aas.types.LangStringTextType(entry.language, entry.text ?? ''));
    }
  });
  return result.length > 0 ? result : null;
}

function toSingleString(value: MultiLanguagePropertyValue[] | undefined) {
  return (
    value?.find((item) => item.language.toLowerCase() === 'de')?.text ??
    value?.find((item) => item.language.toLowerCase() === 'en')?.text ??
    value?.[0]?.text ??
    ''
  );
}

function matchesAlias(value: string | null | undefined, aliases: string[]) {
  if (value == null) {
    return false;
  }

  return aliases.some((alias) => alias.toLowerCase() === value.toLowerCase());
}

function walkSubmodelElements(
  elements: aas.types.ISubmodelElement[],
  visitor: (element: aas.types.ISubmodelElement) => void,
) {
  elements.forEach((element) => {
    visitor(element);

    if (element.modelType.name === 'SubmodelElementCollection') {
      walkSubmodelElements((element as aas.types.SubmodelElementCollection).value ?? [], visitor);
    }

    if (element.modelType.name === 'SubmodelElementList') {
      walkSubmodelElements((element as aas.types.SubmodelElementList).value ?? [], visitor);
    }
  });
}

function createSemanticId(idShort: string, requiredSemanticIds: string[]) {
  if (idShort !== '') {
    requiredSemanticIds.push(idShort);
  }
  return new aas.types.Reference(aas.types.ReferenceTypes.ModelReference, [
    new aas.types.Key(aas.types.KeyTypes.ConceptDescription, idShort),
  ]);
}

function getElementSemanticValues(element: aas.types.ISubmodelElement) {
  const semanticCarrier = element as aas.types.ISubmodelElement & {
    semanticId?: aas.types.Reference | null;
    supplementalSemanticIds?: aas.types.Reference[] | null;
  };

  return [semanticCarrier.semanticId, ...(semanticCarrier.supplementalSemanticIds ?? [])]
    .flatMap((reference) => reference?.keys ?? [])
    .map((key) => key.value.toLowerCase().trim())
    .filter((value, index, values) => value !== '' && values.indexOf(value) === index);
}

function cloneSubmodel(submodel: aas.types.Submodel) {
  const instanceOrError = aas.jsonization.submodelFromJsonable(aas.jsonization.toJsonable(submodel));

  if (instanceOrError.value == null) {
    throw new Error('Failed to clone template-backed nameplate submodel');
  }

  return instanceOrError.value;
}

function collectSemanticIdsFromSubmodel(submodel: aas.types.Submodel, requiredSemanticIds: string[]) {
  collectSemanticIdsFromReferences(
    [submodel.semanticId, ...(submodel.supplementalSemanticIds ?? [])],
    requiredSemanticIds,
  );

  walkSubmodelElements(submodel.submodelElements ?? [], (element) => {
    const semanticCarrier = element as aas.types.ISubmodelElement & {
      semanticId?: aas.types.Reference | null;
      supplementalSemanticIds?: aas.types.Reference[] | null;
    };

    collectSemanticIdsFromReferences(
      [semanticCarrier.semanticId, ...(semanticCarrier.supplementalSemanticIds ?? [])],
      requiredSemanticIds,
    );
  });
}

function collectSemanticIdsFromReferences(
  references: Array<aas.types.Reference | null | undefined>,
  requiredSemanticIds: string[],
) {
  references.forEach((reference) => {
    reference?.keys?.forEach((key) => {
      const value = `${key.value ?? ''}`.trim();
      if (value !== '') {
        requiredSemanticIds.push(value);
      }
    });
  });
}
