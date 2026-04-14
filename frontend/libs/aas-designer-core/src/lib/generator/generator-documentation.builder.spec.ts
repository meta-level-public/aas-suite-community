import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { HandoverSemantics } from '@aas/helpers';

import { describe, expect, it } from 'vitest';

import {
  buildDocumentationExportSubmodel,
  createDocumentationDocument,
  createDocumentationSubmodel,
  getDocumentFilename,
  getDocumentationDocumentHost,
  isDocumentationDocumentCollection,
  populateDocumentationSubmodel,
  syncDocumentationDocuments,
} from './generator-documentation.builder';
import { DocumentItem } from './model/document-item';

function createDocumentItem() {
  const documentItem = new DocumentItem();
  documentItem.documentId = [
    {
      documentDomainId: 'DOC-DOMAIN',
      valueId: 'DOC-001',
      isPrimary: true,
    },
  ];
  documentItem.documentClassification = [
    {
      classId: 'CLASS-01',
      className: [new aas.types.LangStringTextType('en', 'Manual')],
      classificationSystem: 'VDI2770 Blatt 1:2020',
    },
  ] as never;
  documentItem.documentVersion = [
    {
      language: 'en',
      documentVersionId: 'v1',
      title: 'Operation manual',
      subtitle: '',
      summary: 'Initial handover',
      keywords: 'manual',
      statusSetDate: new Date('2026-01-15'),
      statusValue: 'Released',
      organizationName: 'ACME',
      organizationOfficialName: 'ACME GmbH',
      digitalFile: null,
      previewFile: null,
      refersTo: [],
      basedOn: [],
      translationOf: [],
    },
  ];
  documentItem.filePath = 'file:/aasx/files/operation-manual.pdf';
  documentItem.mimeType = 'application/pdf';
  return documentItem;
}

describe('generator-documentation.builder', () => {
  it('creates the base handover documentation submodel', () => {
    const requiredSemanticIds: string[] = [];

    const submodel = createDocumentationSubmodel(requiredSemanticIds);

    expect(submodel.idShort).toBe('HandoverDocumentation');
    expect(submodel.semanticId?.keys[0].value).toBe(HandoverSemantics.SUBMODEL_V3);
    expect(requiredSemanticIds).toContain(HandoverSemantics.SUBMODEL_V3);
  });

  it('creates a VDI2770 document collection', () => {
    const document = createDocumentationDocument(0, [], createDocumentItem(), 'en');
    const documentVersion = document.value?.find(
      (element): element is aas.types.SubmodelElementCollection =>
        element instanceof aas.types.SubmodelElementCollection && element.idShort === 'DocumentVersion',
    );
    const fileList = documentVersion?.value?.find(
      (element): element is aas.types.SubmodelElementList =>
        element instanceof aas.types.SubmodelElementList && element.idShort === 'File_List_V2',
    );

    expect(document.idShort).toBe('Document00');
    expect(document.value).toHaveLength(3);
    expect(fileList?.semanticId?.keys[0].value).toBe(HandoverSemantics.FILE_LIST_V2);
    expect(fileList?.value).toHaveLength(1);
    expect((fileList?.value?.[0] as aas.types.File | undefined)?.value).toBe('operation_manual.pdf');
  });

  it('creates the v2 language list with a string valueTypeListElement', () => {
    const document = createDocumentationDocument(0, [], createDocumentItem(), 'en', HandoverSemantics.DOCUMENT_V2);
    const versionsList = document.value?.find(
      (element): element is aas.types.SubmodelElementList =>
        element instanceof aas.types.SubmodelElementList && element.idShort === 'DocumentVersions',
    );
    const versionEntry = versionsList?.value?.[0] as aas.types.SubmodelElementCollection | undefined;
    const languageList = versionEntry?.value?.find(
      (element): element is aas.types.SubmodelElementList =>
        element instanceof aas.types.SubmodelElementList && element.idShort === 'Language',
    );
    const languageEntry = languageList?.value?.[0] as aas.types.Property | undefined;

    expect(languageList?.valueTypeListElement).toBe(aas.types.DataTypeDefXsd.String);
    expect(languageEntry?.valueType).toBe(aas.types.DataTypeDefXsd.String);
    expect(languageEntry?.value).toBe('en');
  });

  it('populates the documentation submodel and derives file names', () => {
    const submodel = createDocumentationSubmodel([]);
    const documentItem = createDocumentItem();

    populateDocumentationSubmodel(submodel, {
      iriPrefix: 'https://example.com/',
      currentLanguage: 'en',
      documentItems: [documentItem],
      requiredSemanticIds: [],
    });

    expect(submodel.submodelElements).toHaveLength(1);
    expect(getDocumentFilename(documentItem)).toBe('operation-manual.pdf');
  });

  it('builds an export submodel from a template clone without mutating the template', () => {
    const template = createDocumentationSubmodel([]);
    const documentHost = new aas.types.SubmodelElementCollection(null, null, 'Documents');
    documentHost.semanticId = new aas.types.Reference(aas.types.ReferenceTypes.ModelReference, [
      new aas.types.Key(aas.types.KeyTypes.ConceptDescription, HandoverSemantics.CONTAINER_V2),
    ]);
    template.submodelElements = [documentHost];

    const exported = buildDocumentationExportSubmodel(template, {
      iriPrefix: 'https://example.com/',
      currentLanguage: 'en',
      documentItems: [createDocumentItem()],
      requiredSemanticIds: [],
    });

    expect(exported).not.toBe(template);
    expect((template.submodelElements?.[0] as aas.types.SubmodelElementCollection).value ?? []).toHaveLength(0);
    expect((exported.submodelElements?.[0] as aas.types.SubmodelElementCollection).value ?? []).toHaveLength(1);
  });

  it('syncs only document collections into an existing template host', () => {
    const submodel = createDocumentationSubmodel([]);
    const documentHost = new aas.types.SubmodelElementCollection(null, null, 'Documents');
    documentHost.semanticId = new aas.types.Reference(aas.types.ReferenceTypes.ModelReference, [
      new aas.types.Key(aas.types.KeyTypes.ConceptDescription, HandoverSemantics.CONTAINER_V2),
    ]);
    documentHost.value = [
      new aas.types.Property(aas.types.DataTypeDefXsd.String, null, null, 'Title', null, null, null),
      createDocumentationDocument(0, [], createDocumentItem(), 'en'),
    ];
    submodel.submodelElements = [documentHost];

    syncDocumentationDocuments(submodel, {
      currentLanguage: 'en',
      documentItems: [createDocumentItem(), createDocumentItem()],
      requiredSemanticIds: [],
    });

    const host = getDocumentationDocumentHost(submodel);
    const hostChildren = host?.value ?? [];

    expect(hostChildren.filter((element: any) => element.idShort === 'Title')).toHaveLength(1);
    expect(hostChildren.filter((element: any) => isDocumentationDocumentCollection(element))).toHaveLength(2);
  });

  it('prefers a top-level document SML host and writes document entries into its value list', () => {
    const submodel = createDocumentationSubmodel([]);
    const documentList = new aas.types.SubmodelElementList(aas.types.AasSubmodelElements.SubmodelElementCollection);
    documentList.idShort = 'Documents';
    documentList.semanticId = new aas.types.Reference(aas.types.ReferenceTypes.ModelReference, [
      new aas.types.Key(aas.types.KeyTypes.ConceptDescription, HandoverSemantics.CONTAINER_V2),
    ]);
    documentList.value = [
      new aas.types.Property(aas.types.DataTypeDefXsd.String, null, null, 'Title', null, null, null),
    ];
    submodel.submodelElements = [documentList];

    syncDocumentationDocuments(submodel, {
      currentLanguage: 'en',
      documentItems: [createDocumentItem()],
      requiredSemanticIds: [],
    });

    const host = getDocumentationDocumentHost(submodel);

    expect(host).toBe(documentList);
    expect((documentList.value ?? []).some((element: any) => element.idShort === 'Title')).toBe(false);
    expect((documentList.value ?? []).some((element: any) => element.idShort === 'Document00')).toBe(true);
  });

  it('matches generated first-level document semantic ids to semanticIdListElement for SML hosts', () => {
    const submodel = createDocumentationSubmodel([]);
    const documentList = new aas.types.SubmodelElementList(aas.types.AasSubmodelElements.SubmodelElementCollection);
    documentList.idShort = 'Documents';
    documentList.semanticId = new aas.types.Reference(aas.types.ReferenceTypes.ModelReference, [
      new aas.types.Key(aas.types.KeyTypes.ConceptDescription, HandoverSemantics.CONTAINER_V2),
    ]);
    documentList.semanticIdListElement = new aas.types.Reference(aas.types.ReferenceTypes.ModelReference, [
      new aas.types.Key(aas.types.KeyTypes.ConceptDescription, HandoverSemantics.DOCUMENT_V2),
    ]);
    documentList.value = [];
    submodel.submodelElements = [documentList];

    syncDocumentationDocuments(submodel, {
      currentLanguage: 'en',
      documentItems: [createDocumentItem()],
      requiredSemanticIds: [],
    });

    const createdDocument = (documentList.value ?? []).find(
      (element): element is aas.types.SubmodelElementCollection =>
        element instanceof aas.types.SubmodelElementCollection && element.idShort === 'Document00',
    );

    expect(createdDocument?.semanticId?.keys[0].value).toBe(HandoverSemantics.DOCUMENT_V2);
  });

  it('drops non-document children from SML hosts to keep list entries semantically uniform', () => {
    const submodel = createDocumentationSubmodel([]);
    const documentList = new aas.types.SubmodelElementList(aas.types.AasSubmodelElements.SubmodelElementCollection);
    documentList.idShort = 'Documents';
    documentList.semanticId = new aas.types.Reference(aas.types.ReferenceTypes.ModelReference, [
      new aas.types.Key(aas.types.KeyTypes.ConceptDescription, HandoverSemantics.CONTAINER_V2),
    ]);
    documentList.semanticIdListElement = new aas.types.Reference(aas.types.ReferenceTypes.ModelReference, [
      new aas.types.Key(aas.types.KeyTypes.ConceptDescription, HandoverSemantics.DOCUMENT_V2),
    ]);

    const generalNote = new aas.types.Property(
      aas.types.DataTypeDefXsd.String,
      null,
      null,
      'GeneralNote',
      null,
      null,
      null,
    );
    generalNote.semanticId = new aas.types.Reference(aas.types.ReferenceTypes.ModelReference, [
      new aas.types.Key(aas.types.KeyTypes.ConceptDescription, 'urn:test:general-note'),
    ]);
    documentList.value = [generalNote];
    submodel.submodelElements = [documentList];

    syncDocumentationDocuments(submodel, {
      currentLanguage: 'en',
      documentItems: [createDocumentItem()],
      requiredSemanticIds: [],
    });

    expect((documentList.value ?? []).some((element: any) => element.idShort === 'GeneralNote')).toBe(false);
    expect((documentList.value ?? []).some((element: any) => element.idShort === 'Document00')).toBe(true);
  });
});
