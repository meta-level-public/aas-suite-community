import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { FilenameHelper, HandoverSemantics, SemanticIdHelper } from '@aas/helpers';
import { Reference } from '@aas/model';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { Helper } from './helper';

export class DocumentClassification {
  classId: string = '';
  className: aas.types.LangStringTextType[] = [];
  classificationSystem: string = '';
}

export class DocumentId {
  documentDomainId: string = '';
  valueId: string = '';
  isPrimary: boolean = false;
}

export class DocumentVersion {
  language: string = '';
  documentVersionId: string = '';
  title: string = '';
  subtitle: string = '';
  summary: string = '';
  keywords: string = '';
  statusSetDate: Date = new Date();
  statusValue: string = '';
  organizationName: string = '';
  organizationOfficialName: string = '';
  digitalFile: File | null = null;
  previewFile: File | null = null;
  refersTo: Reference[] = []; // brauchen wir das überhaupt?!?
  basedOn: Reference[] = []; // brauchen wir das überhaupt?!?
  translationOf: Reference[] = []; // brauchen wir das überhaupt?!?
}

export class DocumentItem {
  idShort: string = '';

  // das wären die offiziellen Felder
  documentId: DocumentId[] = [];
  documentClassification: DocumentClassification[] = [];
  documentVersion: DocumentVersion[] = [];

  documentType: string = '';
  vdi2770DomainId: string = '';
  vdi2770IdType: 'Primary' | 'Secondary' = 'Primary';
  vdi2770Title: string = '';
  vdi2770Description: string = '';
  vdi2770OrganisationId: string = '';
  vdi2770OrganisationName: string = '';
  vdi2770FileFileName: string = '';
  vdi2770FileFormat: string = '';

  filePath: string = '';

  file: File | null = null;
  mimeType: string | undefined;
  raw: any;

  // und weitere

  static createDraft(currentLanguage: string = 'en') {
    return DocumentItem.ensureDefaults(new DocumentItem(), currentLanguage);
  }

  static clone(documentItem: DocumentItem, currentLanguage: string = 'en') {
    const clonedDocument = Object.assign(new DocumentItem(), structuredClone(documentItem));
    return DocumentItem.ensureDefaults(clonedDocument, currentLanguage);
  }

  static fromDto(dto: any) {
    try {
      const documentItem = new DocumentItem();

      documentItem.raw = dto;

      documentItem.idShort = dto.idShort;
      documentItem.documentType = dto.value?.find((sme: any) => sme.idShort === 'DocumentType')?.value ?? '';
      documentItem.vdi2770DomainId = dto.value?.find((sme: any) => sme.idShort === 'VDI2770_DomainId')?.value ?? '';
      documentItem.vdi2770IdType = dto.value?.find((sme: any) => sme.idShort === 'VDI2770_IdType')?.value ?? '';
      documentItem.vdi2770FileFormat = dto.value?.find((sme: any) => sme.idShort === 'VDI2770_FileFormat')?.value ?? '';
      documentItem.vdi2770FileFileName = dto.value?.find((sme: any) => sme.idShort === 'VDI2770_FileName')?.value ?? '';
      documentItem.vdi2770Title = dto.value?.find((sme: any) => sme.idShort === 'VDI2770_Title')?.value ?? '';
      documentItem.vdi2770Description =
        dto.value?.find((sme: any) => sme.idShort === 'VDI2770_Description')?.value ?? '';
      documentItem.vdi2770OrganisationId =
        dto.value?.find((sme: any) => sme.idShort === 'VDI2770_OrganisationId')?.value ?? '';
      documentItem.vdi2770OrganisationName =
        dto.value?.find((sme: any) => sme.idShort === 'VDI2770_OrganisationName')?.value ?? '';
      documentItem.filePath = dto.value?.find((sme: any) => sme.idShort === 'File')?.value ?? '';
      documentItem.mimeType = dto.value?.find((sme: any) => sme.idShort === 'File')?.mimeType ?? '';
      return documentItem;
    } catch {
      // TODO: Dem Benutzer mitteilen, dass hier umgültige Daten vorliegen
      return null;
    }
  }

  static ensureDefaults(documentItem: DocumentItem, currentLanguage: string = 'en') {
    if (documentItem.documentClassification == null || documentItem.documentClassification.length === 0) {
      documentItem.documentClassification = [new DocumentClassification()];
    }

    if (documentItem.documentClassification[0].className.length === 0) {
      documentItem.documentClassification[0].className = [new aas.types.LangStringTextType(currentLanguage, '')];
    }

    if (documentItem.documentVersion == null || documentItem.documentVersion.length === 0) {
      documentItem.documentVersion = [new DocumentVersion()];
    }

    if (documentItem.documentId == null || documentItem.documentId.length === 0) {
      documentItem.documentId = [new DocumentId()];
    }

    return documentItem;
  }

  static fromHandoverSubmodelElement(dto: any, currentLanguage: string = 'en') {
    const documentItem = DocumentItem.ensureDefaults(new DocumentItem(), currentLanguage);
    documentItem.raw = dto;
    documentItem.idShort = dto?.idShort ?? '';

    const documentIdCollection =
      this.findFirstCollectionInList(dto, 'DocumentIds', HandoverSemantics.DOCUMENT_ID_LIST_V2) ??
      this.findCollection(dto, 'DocumentId', '0173-1#02-ABI501#001/0173-1#01-AHF580#001');
    const versionCollection =
      this.findFirstCollectionInList(dto, 'DocumentVersions', HandoverSemantics.VERSION_LIST_V2) ??
      this.findCollection(dto, 'DocumentVersion', '0173-1#02-ABI503#001/0173-1#01-AHF582#001');
    const classificationCollections =
      this.findCollectionsInList(dto, 'DocumentClassifications', HandoverSemantics.DOCUMENT_CLASSIFICATION_LIST_V2) ??
      this.findCollections(dto, 'DocumentIdClassification', '0173-1#02-ABI502#001/0173-1#01-AHF581#001');

    documentItem.documentId = [
      {
        documentDomainId: this.getPropertyValue(documentIdCollection, 'DocumentDomainId', '0173-1#02-ABH994#001'),
        valueId: this.getPropertyValue(documentIdCollection, 'ValueId', '0173-1#02-AAO099#002'),
        isPrimary:
          this.getPropertyValue(documentIdCollection, 'IsPrimary', '0173-1#02-ABH995#001').toLowerCase() === 'true',
      },
    ];

    documentItem.documentClassification =
      classificationCollections.length > 0
        ? classificationCollections.map((classification: any) => ({
            classId: this.getPropertyValue(classification, 'ClassId', '0173-1#02-ABH996#001'),
            className: this.getMultiLanguageValueList(classification, 'ClassName', '0173-1#02-AAO102#003'),
            classificationSystem: this.getPropertyValue(classification, 'ClassificationSystem', '0173-1#02-ABH997#001'),
          }))
        : documentItem.documentClassification;

    const digitalFile = this.findPrimaryDocumentFile(versionCollection);
    const filePath = `${digitalFile?.value ?? ''}`.trim();
    const language = this.getLanguageValue(versionCollection);

    documentItem.documentVersion = [
      {
        language,
        documentVersionId: this.getPropertyValueWithIdShorts(
          versionCollection,
          ['DocumentVersionId', 'Version'],
          '0173-1#02-AAO100#002',
        ),
        title: this.getLocalizedText(versionCollection, 'Title', currentLanguage, '0173-1#02-ABH998#001'),
        subtitle: this.getLocalizedTextWithIdShorts(
          versionCollection,
          ['SubTitle', 'Subtitle'],
          currentLanguage,
          '0173-1#02-AAO105#002',
        ),
        summary: this.getLocalizedTextWithIdShorts(
          versionCollection,
          ['Summary', 'Description'],
          currentLanguage,
          '0173-1#02-AAO106#002',
        ),
        keywords: this.getLocalizedText(versionCollection, 'KeyWords', currentLanguage, '0173-1#02-ABH999#001'),
        statusSetDate: this.parseDate(
          this.getPropertyValue(versionCollection, 'StatusSetDate', '0173-1#02-ABI000#001'),
        ),
        statusValue: this.getPropertyValue(versionCollection, 'StatusValue', '0173-1#02-ABI001#001'),
        organizationName: this.getPropertyValue(versionCollection, 'OrganizationName', '0173-1#02-ABI002#001'),
        organizationOfficialName: this.getPropertyValue(
          versionCollection,
          'OrganizationOfficialName',
          '0173-1#02-ABI004#001',
        ),
        digitalFile: null,
        previewFile: null,
        refersTo: [],
        basedOn: [],
        translationOf: [],
      },
    ];

    documentItem.filePath = filePath;
    documentItem.vdi2770FileFileName = this.extractFilename(filePath);
    documentItem.vdi2770FileFormat = `${digitalFile?.contentType ?? ''}`.trim();
    documentItem.mimeType = documentItem.vdi2770FileFormat || undefined;

    return DocumentItem.ensureDefaults(documentItem, currentLanguage);
  }

  private static findCollection(dto: any, idShort: string, semanticId: string) {
    return (dto?.value ?? []).find(
      (entry: any) => entry?.idShort === idShort || SemanticIdHelper.hasSemanticId(entry, semanticId),
    );
  }

  private static findCollections(dto: any, idShortPrefix: string, semanticId: string) {
    return (dto?.value ?? []).filter(
      (entry: any) =>
        `${entry?.idShort ?? ''}`.startsWith(idShortPrefix) || SemanticIdHelper.hasSemanticId(entry, semanticId),
    );
  }

  private static findValue(collection: any, idShort: string, semanticId: string) {
    return (collection?.value ?? []).find(
      (entry: any) => entry?.idShort === idShort || SemanticIdHelper.hasSemanticId(entry, semanticId),
    );
  }

  private static findValueByIdShorts(collection: any, idShorts: string[], semanticId?: string) {
    return (collection?.value ?? []).find(
      (entry: any) =>
        idShorts.includes(`${entry?.idShort ?? ''}`) ||
        (semanticId != null && SemanticIdHelper.hasSemanticId(entry, semanticId)),
    );
  }

  private static findFirstCollectionInList(dto: any, idShort: string, semanticId: string) {
    const list = this.findValueByIdShorts(dto, [idShort], semanticId);
    const firstEntry = (list?.value ?? []).find(
      (entry: any) =>
        entry instanceof aas.types.SubmodelElementCollection ||
        `${entry?.modelType ?? ''}` === 'SubmodelElementCollection',
    );
    return firstEntry;
  }

  private static findCollectionsInList(dto: any, idShort: string, semanticId: string) {
    const list = this.findValueByIdShorts(dto, [idShort], semanticId);
    const entries = (list?.value ?? []).filter(
      (entry: any) =>
        entry instanceof aas.types.SubmodelElementCollection ||
        `${entry?.modelType ?? ''}` === 'SubmodelElementCollection',
    );
    return entries.length > 0 ? entries : undefined;
  }

  private static findPrimaryDocumentFile(versionCollection: any) {
    const fileList = this.findValueByIdShorts(
      versionCollection,
      ['File_List_V2', 'DigitalFiles'],
      HandoverSemantics.FILE_LIST_V2,
    );
    const fileEntries = (fileList?.value ?? []).filter(
      (entry: any) =>
        entry instanceof aas.types.File ||
        entry?.modelType === 'File' ||
        (typeof entry?.value === 'string' && `${entry?.idShort ?? ''}`.trim() !== ''),
    );

    const preferredFile =
      fileEntries.find((entry: any) => `${entry?.contentType ?? ''}`.toLowerCase() === 'application/pdf') ??
      fileEntries[0];

    if (preferredFile != null) {
      return preferredFile;
    }

    return this.findValue(versionCollection, 'DigitalFile', '0173-1#02-ABI504#001/0173-1#01-AHF583#001');
  }

  private static getLanguageValue(versionCollection: any) {
    const languageEntry = this.findValueByIdShorts(versionCollection, ['Language']);
    if (languageEntry == null) {
      return this.getPropertyValue(versionCollection, 'Language', '0173-1#02-AAN468#006');
    }

    if (Array.isArray(languageEntry.value)) {
      const listValue = languageEntry.value.find(
        (entry: any) => entry instanceof aas.types.Property || `${entry?.modelType ?? ''}` === 'Property',
      );
      const listText = `${listValue?.value ?? ''}`.trim();
      if (listText !== '') {
        return listText;
      }
    }

    const directText = `${languageEntry.value ?? ''}`.trim();
    if (directText !== '') {
      return directText;
    }

    return this.getPropertyValue(versionCollection, 'Language', '0173-1#02-AAN468#006');
  }

  private static getPropertyValue(collection: any, idShort: string, semanticId: string) {
    const value = this.findValue(collection, idShort, semanticId)?.value;
    return `${value ?? ''}`.trim();
  }

  private static getPropertyValueWithIdShorts(collection: any, idShorts: string[], semanticId: string) {
    const value = this.findValueByIdShorts(collection, idShorts, semanticId)?.value;
    return `${value ?? ''}`.trim();
  }

  private static getMultiLanguageValueList(collection: any, idShort: string, semanticId: string) {
    const value = this.findValue(collection, idShort, semanticId)?.value;
    return Array.isArray(value) ? value : [];
  }

  private static getLocalizedText(collection: any, idShort: string, currentLanguage: string, semanticId: string) {
    const values = this.getMultiLanguageValueList(collection, idShort, semanticId);
    const normalizedLanguage = currentLanguage.toLowerCase();
    const localized =
      values.find((entry: any) => `${entry?.language ?? ''}`.toLowerCase() === normalizedLanguage) ??
      values.find((entry: any) => `${entry?.language ?? ''}`.toLowerCase() === 'en') ??
      values[0];

    return `${localized?.text ?? ''}`.trim();
  }

  private static getLocalizedTextWithIdShorts(
    collection: any,
    idShorts: string[],
    currentLanguage: string,
    semanticId: string,
  ) {
    const value = this.findValueByIdShorts(collection, idShorts, semanticId)?.value;
    const values = Array.isArray(value) ? value : [];
    const normalizedLanguage = currentLanguage.toLowerCase();
    const localized =
      values.find((entry: any) => `${entry?.language ?? ''}`.toLowerCase() === normalizedLanguage) ??
      values.find((entry: any) => `${entry?.language ?? ''}`.toLowerCase() === 'en') ??
      values[0];

    return `${localized?.text ?? ''}`.trim();
  }

  private static extractFilename(reference: string) {
    const normalizedReference = `${reference ?? ''}`.replace(/^file:/, '').trim();
    if (normalizedReference === '') {
      return '';
    }

    return (
      normalizedReference
        .split('/')
        .filter((segment) => segment !== '')
        .at(-1) ?? normalizedReference
    );
  }

  private static parseDate(value: string) {
    if (value.trim() === '') {
      return new Date();
    }

    const parsedDate = new Date(value);
    return Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
  }

  async toDto(apiPath: string, prefix: string, http?: HttpClient) {
    if (this.raw != null) {
      this.raw.idShort = this.idShort;

      Helper.setValue(
        this.raw.value,
        'File',
        `/aasx/files/${FilenameHelper.sanitizeFilename(this.file?.name ?? '')}`,
        prefix,
      );
      Helper.setMimeType(this.raw.value, 'File', this.mimeType);

      Helper.setValue(this.raw.value, 'DocumentType', this.documentType, prefix);
      Helper.setValue(this.raw.value, 'VDI2770_DomainId', this.vdi2770DomainId, prefix);
      Helper.setValue(this.raw.value, 'VDI2770_IdType', this.vdi2770IdType, prefix);
      Helper.setValue(this.raw.value, 'VDI2770_FileFormat', this.vdi2770FileFormat, prefix);
      Helper.setValue(this.raw.value, 'VDI2770_FileName', this.vdi2770FileFileName, prefix);
      Helper.setValue(this.raw.value, 'VDI2770_Title', this.vdi2770Title, prefix);
    } else {
      if (http == null) {
        throw new Error('HttpClient is required to create a new document item dto');
      }

      const template = await lastValueFrom(http.get<any>(`${apiPath}/SubmodelTemplate/GetDocumentTemplate`));
      template.idShort = this.idShort;
      Helper.setValue(
        template.value,
        'File',
        `/aasx/files/${FilenameHelper.sanitizeFilename(this.file?.name ?? '')}`,
        prefix,
      );
      Helper.setMimeType(template.value, 'File', this.mimeType);

      Helper.setValue(template.value, 'DocumentType', this.documentType, prefix);
      Helper.setValue(template.value, 'VDI2770_DomainId', this.vdi2770DomainId, prefix);
      Helper.setValue(template.value, 'VDI2770_IdType', this.vdi2770IdType, prefix);
      Helper.setValue(template.value, 'VDI2770_FileFormat', this.vdi2770FileFormat, prefix);
      Helper.setValue(template.value, 'VDI2770_FileName', this.vdi2770FileFileName, prefix);
      Helper.setValue(template.value, 'VDI2770_Title', this.vdi2770Title, prefix);

      this.raw = template;
    }
    return this.raw;
  }
}
