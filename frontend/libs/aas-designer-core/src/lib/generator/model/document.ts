import { HandoverSemantics, SemanticIdHelper } from '@aas/helpers';
import { DocumentItem } from './document-item';

const STANDARD_HANDOVER_TEMPLATE_ID = 'https://admin-shell.io/idta-02004-2-0';
const BATTERY_PASSPORT_HANDOVER_TEMPLATE_ID = 'https://admin-shell.io/idta-02035-2';

const HANDOVER_TEMPLATE_IDS = new Set([STANDARD_HANDOVER_TEMPLATE_ID, BATTERY_PASSPORT_HANDOVER_TEMPLATE_ID]);

export class Document {
  documentItems: DocumentItem[] = [];

  deletedDocumentItems: DocumentItem[] = [];

  raw: any;

  static fromDto(dto: any, currentLanguage: string = 'en') {
    const document = new Document();
    document.raw = dto;

    if (this.isStandardHandoverSubmodel(dto)) {
      document.documentItems = this.extractHandoverDocumentItems(dto, currentLanguage);
      return document;
    }

    document.documentItems = (dto?.submodelElements ?? [])
      .map((element: any) => DocumentItem.fromDto(element))
      .filter((element: DocumentItem | null): element is DocumentItem => element != null);

    return document;
  }

  private static isStandardHandoverSubmodel(dto: any) {
    return HANDOVER_TEMPLATE_IDS.has(`${dto?.administration?.templateId ?? ''}`);
  }

  private static extractHandoverDocumentItems(dto: any, currentLanguage: string) {
    const documentHost = this.getDocumentHostElement(dto);
    if (documentHost == null) {
      return [];
    }

    return this.getChildElements(documentHost)
      .filter((element: any) => this.isDocumentCollection(element))
      .map((element: any) => DocumentItem.fromHandoverSubmodelElement(element, currentLanguage))
      .filter((documentItem: DocumentItem) => this.isMeaningfulDocumentItem(documentItem));
  }

  private static getDocumentHostElement(dto: any) {
    const topLevelElements = this.getChildElements(dto);
    const documentListHost = topLevelElements.find(
      (element: any) =>
        `${element?.modelType?.name ?? element?.modelType ?? ''}`.toLowerCase() === 'submodelelementlist' &&
        SemanticIdHelper.hasSemanticId(element, HandoverSemantics.CONTAINER_V2),
    );

    if (documentListHost != null) {
      return documentListHost;
    }

    return (
      topLevelElements.find((element: any) =>
        SemanticIdHelper.hasSemanticId(element, HandoverSemantics.CONTAINER_V2),
      ) ?? dto
    );
  }

  private static getChildElements(element: any) {
    if (Array.isArray(element?.submodelElements)) {
      return element.submodelElements;
    }

    if (Array.isArray(element?.value)) {
      return element.value;
    }

    return [];
  }

  private static isDocumentCollection(element: any) {
    const modelTypeName = `${element?.modelType?.name ?? element?.modelType ?? ''}`.toLowerCase();
    const hasChildren = this.getChildElements(element).length > 0;

    if (modelTypeName !== 'submodelelementcollection' && !hasChildren) {
      return false;
    }

    return (
      /^Document\d+/i.test(`${element?.idShort ?? ''}`) ||
      SemanticIdHelper.hasSemanticId(element, HandoverSemantics.DOCUMENT_V1_A) ||
      SemanticIdHelper.hasSemanticId(element, HandoverSemantics.DOCUMENT_V1_B) ||
      SemanticIdHelper.hasSemanticId(element, HandoverSemantics.DOCUMENT_V2) ||
      SemanticIdHelper.hasSemanticId(element, HandoverSemantics.DOCUMENT_V2_VARIANT_LEGACY)
    );
  }

  private static isMeaningfulDocumentItem(documentItem: DocumentItem) {
    const primaryDocumentId = documentItem.documentId[0];
    const primaryDocumentVersion = documentItem.documentVersion[0];

    const candidates = [
      documentItem.idShort,
      primaryDocumentId?.documentDomainId,
      primaryDocumentId?.valueId,
      primaryDocumentVersion?.documentVersionId,
      primaryDocumentVersion?.title,
      primaryDocumentVersion?.summary,
      primaryDocumentVersion?.keywords,
      documentItem.vdi2770FileFileName,
      documentItem.filePath,
    ];

    return candidates.some((candidate) => `${candidate ?? ''}`.trim() !== '');
  }

  deleteDocumentItem(documentItem: DocumentItem) {
    this.deletedDocumentItems.push(documentItem);
    this.documentItems = this.documentItems.filter((d) => d.idShort !== documentItem.idShort);
  }
}
