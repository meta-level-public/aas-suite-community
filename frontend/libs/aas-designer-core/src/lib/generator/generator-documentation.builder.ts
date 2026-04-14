import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { FilenameHelper, HandoverSemantics, IdGenerationUtil, SemanticIdHelper } from '@aas/helpers';
import { MultiLanguagePropertyValue } from '@aas/model';

import { DocumentItem } from './model/document-item';

export function createDocumentationSubmodel(requiredSemanticIds: string[]) {
  const documentation = new aas.types.Submodel(
    'HandoverDocumentation',
    null,
    null,
    'HandoverDocumentation',
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
    new aas.types.Reference(aas.types.ReferenceTypes.ModelReference, [
      new aas.types.Key(aas.types.KeyTypes.Submodel, HandoverSemantics.SUBMODEL_V3),
    ]),
  );
  requiredSemanticIds.push(HandoverSemantics.SUBMODEL_V3);
  return documentation;
}

export function populateDocumentationSubmodel(
  documentation: aas.types.Submodel,
  options: {
    iriPrefix: string;
    currentLanguage: string;
    documentItems: DocumentItem[];
    requiredSemanticIds: string[];
  },
) {
  documentation.id = IdGenerationUtil.generateIri('submodel', options.iriPrefix);
  syncDocumentationDocuments(documentation, options);
}

export function buildDocumentationExportSubmodel(
  templateSubmodel: aas.types.Submodel | null | undefined,
  options: {
    iriPrefix: string;
    currentLanguage: string;
    documentItems: DocumentItem[];
    requiredSemanticIds: string[];
  },
) {
  const documentation =
    templateSubmodel != null
      ? cloneDocumentationSubmodel(templateSubmodel)
      : createDocumentationSubmodel(options.requiredSemanticIds);

  populateDocumentationSubmodel(documentation, options);

  return documentation;
}

export function syncDocumentationDocuments(
  documentation: aas.types.Submodel,
  options: {
    currentLanguage: string;
    documentItems: DocumentItem[];
    requiredSemanticIds: string[];
  },
) {
  const documentHost = getDocumentationDocumentHost(documentation);
  if (documentHost == null) {
    return;
  }

  const documentSemanticId = getDocumentationDocumentSemanticId(documentHost);
  const preservedElements = isStrictDocumentationListHost(documentHost)
    ? []
    : getChildElements(documentHost).filter((element) => !isDocumentationDocumentCollection(element));
  const documentElements = options.documentItems.map((documentItem, index) =>
    createDocumentationDocument(
      index,
      options.requiredSemanticIds,
      documentItem,
      options.currentLanguage,
      documentSemanticId,
    ),
  );

  setChildElements(documentHost, [...preservedElements, ...documentElements]);
}

export function getDocumentationDocumentHost(documentation: aas.types.Submodel | null) {
  if (documentation == null) {
    return null;
  }

  const topLevelElements = getChildElements(documentation);
  const documentListHost = topLevelElements.find(
    (element) =>
      element instanceof aas.types.SubmodelElementList &&
      SemanticIdHelper.hasSemanticId(element, HandoverSemantics.CONTAINER_V2),
  );

  if (documentListHost != null) {
    return documentListHost;
  }

  return (
    topLevelElements.find((element) => SemanticIdHelper.hasSemanticId(element, HandoverSemantics.CONTAINER_V2)) ??
    documentation
  );
}

export function isDocumentationDocumentCollection(element: aas.types.ISubmodelElement | null | undefined) {
  if (element == null) {
    return false;
  }

  const isCollection =
    getModelTypeName(element).toLowerCase() === 'submodelelementcollection' ||
    element instanceof aas.types.SubmodelElementCollection;
  const hasChildren = getChildElements(element).length > 0;

  if (!isCollection && !hasChildren) {
    return false;
  }

  return (
    /^Document\d+/i.test(`${element.idShort ?? ''}`) ||
    SemanticIdHelper.hasSemanticId(element, HandoverSemantics.DOCUMENT_V1_A) ||
    SemanticIdHelper.hasSemanticId(element, HandoverSemantics.DOCUMENT_V2) ||
    SemanticIdHelper.hasSemanticId(element, HandoverSemantics.DOCUMENT_V2_VARIANT_LEGACY)
  );
}

export function createDocumentationDocument(
  count: number,
  requiredSemanticIds: string[],
  documentItem: DocumentItem,
  currentLanguage: string,
  semanticId: string = HandoverSemantics.DOCUMENT_V1_A,
) {
  if (semanticId === HandoverSemantics.DOCUMENT_V2) {
    return createDocumentationDocumentV2(count, requiredSemanticIds, documentItem, currentLanguage, semanticId);
  }

  return createDocumentationDocumentLegacy(count, requiredSemanticIds, documentItem, currentLanguage, semanticId);
}

function createDocumentationDocumentLegacy(
  count: number,
  requiredSemanticIds: string[],
  documentItem: DocumentItem,
  currentLanguage: string,
  semanticId: string,
) {
  const document = new aas.types.SubmodelElementCollection(null, null, 'Document' + count.toString().padStart(2, '0'));
  document.value = [];
  document.semanticId = createSemanticId(semanticId, requiredSemanticIds);

  const primaryDocumentId = documentItem.documentId[0];
  const primaryDocumentVersion = documentItem.documentVersion[0];

  const documentId = new aas.types.SubmodelElementCollection(null, null, 'DocumentId');
  documentId.value = [];
  documentId.semanticId = createSemanticId('0173-1#02-ABI501#001/0173-1#01-AHF580#001', requiredSemanticIds);
  documentId.value.push(
    createProperty(
      'DocumentDomainId',
      aas.types.DataTypeDefXsd.String,
      '0173-1#02-ABH994#001',
      primaryDocumentId.documentDomainId,
      requiredSemanticIds,
    ),
  );
  documentId.value.push(
    createProperty(
      'ValueId',
      aas.types.DataTypeDefXsd.String,
      '0173-1#02-AAO099#002',
      primaryDocumentId.valueId,
      requiredSemanticIds,
    ),
  );
  documentId.value.push(
    createProperty(
      'IsPrimary',
      aas.types.DataTypeDefXsd.Boolean,
      '0173-1#02-ABH995#001',
      primaryDocumentId.isPrimary.toString(),
      requiredSemanticIds,
    ),
  );
  document.value.push(documentId);

  documentItem.documentClassification.forEach((classification, classificationIndex) => {
    const documentClassification = new aas.types.SubmodelElementCollection(
      null,
      null,
      'DocumentIdClassification' + classificationIndex.toString().padStart(2, '0'),
    );
    documentClassification.value = [];
    documentClassification.semanticId = createSemanticId(
      '0173-1#02-ABI502#001/0173-1#01-AHF581#001',
      requiredSemanticIds,
    );
    documentClassification.value.push(
      createProperty(
        'ClassId',
        aas.types.DataTypeDefXsd.String,
        '0173-1#02-ABH996#001',
        classification.classId,
        requiredSemanticIds,
      ),
    );
    documentClassification.value.push(
      createMultilanguageProperty(
        'ClassName',
        '0173-1#02-AAO102#003',
        classification.className as MultiLanguagePropertyValue[],
        requiredSemanticIds,
      ),
    );
    documentClassification.value.push(
      createProperty(
        'ClassificationSystem',
        aas.types.DataTypeDefXsd.String,
        '0173-1#02-ABH997#001',
        classification.classificationSystem,
        requiredSemanticIds,
      ),
    );

    document.value?.push(documentClassification);
  });

  const documentVersion = new aas.types.SubmodelElementCollection(null, null, 'DocumentVersion');
  documentVersion.value = [];
  documentVersion.semanticId = createSemanticId('0173-1#02-ABI503#001/0173-1#01-AHF582#001', requiredSemanticIds);
  documentVersion.value.push(
    createProperty(
      'Language',
      aas.types.DataTypeDefXsd.String,
      '0173-1#02-AAN468#006',
      primaryDocumentVersion.language,
      requiredSemanticIds,
    ),
  );
  documentVersion.value.push(
    createProperty(
      'DocumentVersionId',
      aas.types.DataTypeDefXsd.String,
      '0173-1#02-AAO100#002',
      primaryDocumentVersion.documentVersionId,
      requiredSemanticIds,
    ),
  );
  documentVersion.value.push(
    createMultilanguageProperty(
      'Title',
      '0173-1#02-ABH998#001',
      [{ language: currentLanguage, text: primaryDocumentVersion.title }],
      requiredSemanticIds,
    ),
  );
  documentVersion.value.push(
    createMultilanguageProperty(
      'SubTitle',
      '0173-1#02-AAO105#002',
      [{ language: currentLanguage, text: '' }],
      requiredSemanticIds,
    ),
  );
  documentVersion.value.push(
    createMultilanguageProperty(
      'Summary',
      '0173-1#02-AAO106#002',
      [{ language: currentLanguage, text: primaryDocumentVersion.summary }],
      requiredSemanticIds,
    ),
  );
  documentVersion.value.push(
    createMultilanguageProperty(
      'KeyWords',
      '0173-1#02-ABH999#001',
      [{ language: currentLanguage, text: primaryDocumentVersion.keywords }],
      requiredSemanticIds,
    ),
  );
  documentVersion.value.push(
    createProperty(
      'StatusSetDate',
      aas.types.DataTypeDefXsd.Date,
      '0173-1#02-ABI000#001',
      formatDate(primaryDocumentVersion.statusSetDate),
      requiredSemanticIds,
    ),
  );
  documentVersion.value.push(
    createProperty(
      'StatusValue',
      aas.types.DataTypeDefXsd.String,
      '0173-1#02-ABI001#001',
      primaryDocumentVersion.statusValue,
      requiredSemanticIds,
    ),
  );
  documentVersion.value.push(
    createProperty(
      'OrganizationName',
      aas.types.DataTypeDefXsd.String,
      '0173-1#02-ABI002#001',
      primaryDocumentVersion.organizationName,
      requiredSemanticIds,
    ),
  );
  documentVersion.value.push(
    createProperty(
      'OrganizationOfficialName',
      aas.types.DataTypeDefXsd.String,
      '0173-1#02-ABI004#001',
      primaryDocumentVersion.organizationOfficialName,
      requiredSemanticIds,
    ),
  );

  const fileList = new aas.types.SubmodelElementList(aas.types.AasSubmodelElements.File);
  fileList.idShort = 'File_List_V2';
  fileList.semanticId = createSemanticId(HandoverSemantics.FILE_LIST_V2, requiredSemanticIds);
  fileList.value = [];

  const digitalFile = new aas.types.File();
  digitalFile.contentType = documentItem.mimeType ?? '';
  digitalFile.idShort = 'DigitalFile';
  digitalFile.value = FilenameHelper.sanitizeFilename(getDocumentFilename(documentItem));
  fileList.value.push(digitalFile);

  documentVersion.value.push(fileList);

  document.value.push(documentVersion);

  return document;
}

function createDocumentationDocumentV2(
  count: number,
  requiredSemanticIds: string[],
  documentItem: DocumentItem,
  currentLanguage: string,
  semanticId: string,
) {
  const document = new aas.types.SubmodelElementCollection(null, null, 'Document' + count.toString().padStart(2, '0'));
  document.value = [];
  document.semanticId = createSemanticId(semanticId, requiredSemanticIds);

  const idsList = createCollectionList('DocumentIds', HandoverSemantics.DOCUMENT_ID_LIST_V2, requiredSemanticIds);
  const idEntry = new aas.types.SubmodelElementCollection(null, null, 'Element0');
  idEntry.value = [];
  const primaryDocumentId = documentItem.documentId[0];
  if (`${primaryDocumentId?.documentDomainId ?? ''}`.trim() !== '') {
    idEntry.value.push(
      createProperty(
        'DocumentDomainId',
        aas.types.DataTypeDefXsd.String,
        '0173-1#02-ABH994#001',
        primaryDocumentId.documentDomainId,
        requiredSemanticIds,
      ),
    );
  }
  if (`${primaryDocumentId?.valueId ?? ''}`.trim() !== '') {
    idEntry.value.push(
      createProperty(
        'ValueId',
        aas.types.DataTypeDefXsd.String,
        '0173-1#02-AAO099#002',
        primaryDocumentId.valueId,
        requiredSemanticIds,
      ),
    );
  }
  if (idEntry.value.length > 0) {
    (idsList.value ??= []).push(idEntry);
  }
  document.value.push(idsList);

  const classificationsList = createCollectionList(
    'DocumentClassifications',
    HandoverSemantics.DOCUMENT_CLASSIFICATION_LIST_V2,
    requiredSemanticIds,
  );
  const primaryClassification = documentItem.documentClassification[0];
  if (primaryClassification) {
    const classificationEntry = new aas.types.SubmodelElementCollection(null, null, 'Element0');
    classificationEntry.value = [];
    if (`${primaryClassification.classId ?? ''}`.trim() !== '') {
      classificationEntry.value.push(
        createProperty(
          'ClassId',
          aas.types.DataTypeDefXsd.String,
          '0173-1#02-ABH996#001',
          primaryClassification.classId,
          requiredSemanticIds,
        ),
      );
    }
    const className = mlp2LangString(primaryClassification.className as any);
    if (className) {
      classificationEntry.value.push(
        createMultilanguageProperty(
          'ClassName',
          '0173-1#02-AAO102#003',
          primaryClassification.className as any,
          requiredSemanticIds,
        ),
      );
    }
    if (`${primaryClassification.classificationSystem ?? ''}`.trim() !== '') {
      classificationEntry.value.push(
        createProperty(
          'ClassificationSystem',
          aas.types.DataTypeDefXsd.String,
          '0173-1#02-ABH997#001',
          primaryClassification.classificationSystem,
          requiredSemanticIds,
        ),
      );
    }
    if (classificationEntry.value.length > 0) {
      (classificationsList.value ??= []).push(classificationEntry);
    }
  }
  document.value.push(classificationsList);

  const versionsList = createCollectionList('DocumentVersions', HandoverSemantics.VERSION_LIST_V2, requiredSemanticIds);
  const primaryDocumentVersion = documentItem.documentVersion[0];
  const versionEntry = new aas.types.SubmodelElementCollection(null, null, 'Element0');
  versionEntry.value = [];

  const languageList = new aas.types.SubmodelElementList(aas.types.AasSubmodelElements.Property);
  languageList.idShort = 'Language';
  languageList.valueTypeListElement = aas.types.DataTypeDefXsd.String;
  languageList.value = [];
  if (`${primaryDocumentVersion?.language ?? ''}`.trim() !== '') {
    languageList.value.push(
      createProperty(
        'Element0',
        aas.types.DataTypeDefXsd.String,
        '0173-1#02-AAN468#006',
        primaryDocumentVersion.language,
        requiredSemanticIds,
      ),
    );
  }
  versionEntry.value.push(languageList);

  versionEntry.value.push(
    createProperty(
      'Version',
      aas.types.DataTypeDefXsd.String,
      '0173-1#02-AAO100#002',
      primaryDocumentVersion.documentVersionId,
      requiredSemanticIds,
    ),
  );
  versionEntry.value.push(
    createMultilanguageProperty(
      'Title',
      '0173-1#02-ABH998#001',
      [{ language: currentLanguage, text: primaryDocumentVersion.title }],
      requiredSemanticIds,
    ),
  );
  versionEntry.value.push(
    createMultilanguageProperty(
      'Subtitle',
      '0173-1#02-AAO105#002',
      [{ language: currentLanguage, text: primaryDocumentVersion.subtitle }],
      requiredSemanticIds,
    ),
  );
  versionEntry.value.push(
    createMultilanguageProperty(
      'Description',
      '0173-1#02-AAO106#002',
      [{ language: currentLanguage, text: primaryDocumentVersion.summary }],
      requiredSemanticIds,
    ),
  );

  const digitalFiles = new aas.types.SubmodelElementList(aas.types.AasSubmodelElements.File);
  digitalFiles.idShort = 'DigitalFiles';
  digitalFiles.semanticId = createSemanticId(HandoverSemantics.FILE_LIST_V2, requiredSemanticIds);
  digitalFiles.value = [];

  const digitalFile = new aas.types.File();
  digitalFile.idShort = 'Element0';
  digitalFile.contentType = documentItem.mimeType ?? '';
  digitalFile.value = FilenameHelper.sanitizeFilename(getDocumentFilename(documentItem));
  digitalFiles.value.push(digitalFile);
  versionEntry.value.push(digitalFiles);

  (versionsList.value ??= []).push(versionEntry);
  document.value.push(versionsList);

  return document;
}

export function getDocumentationDocumentSemanticIdForHost(host: aas.types.ISubmodelElement | aas.types.Submodel) {
  return getDocumentationDocumentSemanticId(host);
}

export function getDocumentFilename(documentItem: DocumentItem) {
  if (documentItem.file?.name != null && documentItem.file.name.trim() !== '') {
    return documentItem.file.name;
  }

  const normalizedPath = `${documentItem.filePath ?? ''}`.replace(/^file:/, '').trim();
  if (normalizedPath === '') {
    return '';
  }

  return (
    normalizedPath
      .split('/')
      .filter((segment) => segment !== '')
      .at(-1) ?? normalizedPath
  );
}

function getChildElements(element: any): aas.types.ISubmodelElement[] {
  const submodelElements = element?.submodelElements;
  if (Array.isArray(submodelElements)) {
    return submodelElements;
  }
  if (isIterable(submodelElements)) {
    return Array.from(submodelElements);
  }

  const value = element?.value;
  if (Array.isArray(value)) {
    return value;
  }
  if (isIterable(value)) {
    return Array.from(value);
  }
  return [];
}

function cloneDocumentationSubmodel(submodel: aas.types.Submodel) {
  const jsonable = aas.jsonization.toJsonable(submodel);
  const instanceOrError = aas.jsonization.submodelFromJsonable(jsonable);

  if (instanceOrError.value == null) {
    throw new Error('Failed to clone documentation submodel');
  }

  return instanceOrError.value;
}

function setChildElements(target: any, elements: aas.types.ISubmodelElement[]) {
  if (target == null) {
    return;
  }

  if ('submodelElements' in target) {
    target.submodelElements = elements;
    return;
  }

  target.value = elements;
}

function isIterable(value: any): value is Iterable<any> {
  return value != null && typeof value !== 'string' && typeof value[Symbol.iterator] === 'function';
}

function getModelTypeName(element: any): string {
  const rawType = element?.modelType?.name ?? element?.modelType;
  if (typeof rawType === 'string') {
    return rawType;
  }

  const ctorName = rawType?.constructor?.name;
  if (typeof ctorName === 'string' && ctorName.length > 0 && ctorName !== 'Object') {
    return ctorName;
  }

  return rawType != null ? String(rawType) : '';
}

function getDocumentationDocumentSemanticId(host: aas.types.ISubmodelElement | aas.types.Submodel) {
  if (host instanceof aas.types.SubmodelElementList) {
    const listElementSemanticId = getReferenceValue(host.semanticIdListElement);
    if (listElementSemanticId !== null) {
      return listElementSemanticId;
    }

    if (SemanticIdHelper.hasSemanticId(host, HandoverSemantics.CONTAINER_V2)) {
      return HandoverSemantics.DOCUMENT_V2;
    }
  }

  return HandoverSemantics.DOCUMENT_V1_A;
}

function isStrictDocumentationListHost(host: aas.types.ISubmodelElement | aas.types.Submodel) {
  return host instanceof aas.types.SubmodelElementList;
}

function getReferenceValue(reference: aas.types.Reference | null | undefined) {
  const firstKeyValue = reference?.keys?.[0]?.value;
  return typeof firstKeyValue === 'string' && firstKeyValue.trim() !== '' ? firstKeyValue : null;
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

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function createSemanticId(idShort: string, requiredSemanticIds: string[] = []) {
  if (idShort !== '') {
    requiredSemanticIds.push(idShort);
  }

  return new aas.types.Reference(aas.types.ReferenceTypes.ModelReference, [
    new aas.types.Key(aas.types.KeyTypes.ConceptDescription, idShort),
  ]);
}

function createCollectionList(idShort: string, semanticId: string, requiredSemanticIds: string[]) {
  const list = new aas.types.SubmodelElementList(aas.types.AasSubmodelElements.SubmodelElementCollection);
  list.idShort = idShort;
  list.semanticId = createSemanticId(semanticId, requiredSemanticIds);
  list.value = [];
  return list;
}
