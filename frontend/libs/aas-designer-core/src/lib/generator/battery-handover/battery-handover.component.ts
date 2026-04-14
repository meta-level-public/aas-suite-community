import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TreeNode } from 'primeng/api';
import { Button } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FileSelectEvent } from 'primeng/fileupload';
import { HandoverdocumentationDocumentAddonComponent } from '../../v3-editor/addons/handoverdocumentation-document-addon/handoverdocumentation-document-addon.component';
import {
  BatteryEditorTreeItem,
  createBatteryEditorEnumOptions,
  createBatteryEditorTreeKey,
  findBatteryEditorTreeItemByKey,
  flattenBatteryEditorTreeItems,
  formatBatteryEditorLabel,
  getBatteryEditorElementDisplayName,
  getBatteryEditorTreeItemIndexLabel,
  getFirstBatteryEditorTreeItem,
  isBatteryEditorContainerElement,
  mapBatteryEditorTreeItemsToNodes,
  resolveBatteryEditorDescriptionFromConceptDescriptions,
  stringifyBatteryEditorDebugValue,
} from '../battery-editor-field-utils';
import {
  getBatteryPassportAdditionalSubmodels,
  getBatteryPassportTemplateKey,
  hasBatteryPassportSubmodel,
} from '../battery-passport-template-registry';
import { getDocumentationDocumentHost, isDocumentationDocumentCollection } from '../generator-documentation.builder';
import { GeneratorFilePreviewState } from '../generator-file-preview.utils';
import {
  buildGeneratorFileUploadCardState,
  getGeneratorDisplayedContentType,
  getGeneratorDisplayedFileName,
  getGeneratorStoredFileReference,
  hasGeneratorFileSelection,
} from '../generator-file-upload-card-state.utils';
import { type GeneratorFileUploadCardState } from '../generator-file-upload-card/generator-file-upload-card.component';
import { GeneratorService } from '../generator.service';
import { DocumentItem } from '../model/document-item';
import { SubmodelEditorHostComponent } from '../submodel-editor-host/submodel-editor-host.component';

type FieldType = 'Property' | 'MultiLanguageProperty' | 'File';

interface HandoverField {
  idShort: string;
  label: string;
  path: string;
  description: string;
  keyPath: string[];
  fileKey: string;
  type: FieldType;
  element: any;
  groupKey: string;
  groupLabel: string;
  groupDescription: string;
}

@Component({
  selector: 'aas-battery-handover',
  templateUrl: './battery-handover.component.html',
  styleUrl: './battery-handover.component.scss',
  host: {
    class: 'flex flex-col flex-1',
  },
  imports: [Button, TranslateModule, SubmodelEditorHostComponent],
})
export class BatteryHandoverComponent implements OnInit, OnDestroy {
  handoverFields: HandoverField[] = [];
  handoverItems: BatteryEditorTreeItem<HandoverField>[] = [];
  handoverNodes: TreeNode<BatteryEditorTreeItem<HandoverField>>[] = [];
  handoverDocuments: DocumentItem[] = [];
  activeItemKey: string | null = null;
  unsupportedFieldPaths: string[] = [];
  ref: DynamicDialogRef | null = null;
  referenceTypeOptions = createBatteryEditorEnumOptions(
    aas.types.ReferenceTypes as unknown as Record<string, string | number>,
  );
  keyTypeOptions = createBatteryEditorEnumOptions(aas.types.KeyTypes as unknown as Record<string, string | number>);
  private readonly filePreviewState = new GeneratorFilePreviewState();
  readonly buildFileUploadCardState = (field: HandoverField) => this.getFileUploadCardState(field);

  constructor(
    private router: Router,
    public generatorService: GeneratorService,
    private dialogService: DialogService,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    if (
      this.generatorService.getCurrentGeneratorRootShell() == null ||
      this.generatorService.vwsTyp !== 'battery-passport'
    ) {
      this.router.navigate(['generator', 'select-type']);
      return;
    }

    this.initializeHandoverDocuments();
    this.handoverFields = this.getHandoverFields();
    this.handoverItems = this.createItems(this.handoverFields);
    this.handoverNodes = mapBatteryEditorTreeItemsToNodes(this.handoverItems);
    this.activeItemKey = getFirstBatteryEditorTreeItem(this.handoverItems)?.key ?? null;
    void Promise.all(
      this.handoverFields.filter((field) => field.type === 'File').map((field) => this.syncFilePreview(field)),
    );
  }

  ngOnDestroy() {
    this.filePreviewState.clearAll();
  }

  get handoverModels() {
    return this.generatorService.additionalV3Submodels.filter(
      (submodel) => getBatteryPassportTemplateKey(submodel) === 'handover-documentation',
    );
  }

  get selectedHandoverModel() {
    const models = this.handoverModels;
    if (models.length === 0) {
      return null;
    }

    const ranked = [...models].sort((left, right) => this.getElementCount(right) - this.getElementCount(left));
    return ranked[0];
  }

  get handoverSemanticId() {
    return `${this.selectedHandoverModel?.semanticId?.keys?.[0]?.value ?? ''}`.trim();
  }

  get handoverDocumentCount() {
    return this.handoverDocuments.length;
  }

  get additionalDbpModels() {
    return getBatteryPassportAdditionalSubmodels(this.generatorService.additionalV3Submodels);
  }

  get activeItem() {
    return (
      findBatteryEditorTreeItemByKey(this.handoverItems, this.activeItemKey) ??
      getFirstBatteryEditorTreeItem(this.handoverItems)
    );
  }

  get activeFields() {
    const activeItem = this.activeItem;
    if (activeItem == null || activeItem.kind === 'special') {
      return [];
    }

    return activeItem.kind === 'field' ? activeItem.fields.slice(0, 1) : activeItem.fields;
  }

  get activeGroup() {
    const activeItem = this.activeItem;
    if (activeItem == null) {
      return null;
    }

    return {
      key: activeItem.key,
      label: activeItem.label,
      description: activeItem.description,
      type: activeItem.kind === 'special' ? 'documents' : 'fields',
      fields: activeItem.kind === 'field' ? activeItem.fields.slice(0, 1) : activeItem.fields,
    };
  }

  get handoverGroups() {
    return this.handoverItems.map((item) => ({
      key: item.key,
      label: item.label,
      description: item.description,
      type: item.kind === 'special' ? 'documents' : 'fields',
      fields: item.kind === 'field' ? item.fields.slice(0, 1) : item.fields,
    }));
  }

  get activeStepLabel() {
    return getBatteryEditorTreeItemIndexLabel(this.handoverItems, this.activeItem?.key) || '1';
  }

  get hasDocumentHost() {
    return this.getDocumentHostElement(this.selectedHandoverModel) != null;
  }

  prevPage() {
    this.generatorService.navigateToPreviousGeneratorFlowStep(this.router, 'battery-handover', [
      'generator',
      'technical-data',
    ]);
  }

  nextPage() {
    this.generatorService.batteryTechnicalDataEdited = true;
    this.generatorService.navigateToNextGeneratorFlowStep(
      this.router,
      'battery-handover',
      this.additionalDbpModels.length > 0 ? ['generator', 'battery-submodels', 0] : ['generator', 'confirmation'],
    );
  }

  onFieldChanged() {
    this.generatorService.batteryTechnicalDataEdited = true;
    this.syncSelectedHandoverWorkState();
  }

  startAddDocument() {
    this.openDocumentDialog();
  }

  editDocument(index: number) {
    const document = this.handoverDocuments[index];
    if (document == null) {
      return;
    }

    this.openDocumentDialog(document, index);
  }

  deleteDocument(index: number) {
    this.handoverDocuments.splice(index, 1);
    this.syncHandoverDocuments();
    this.onFieldChanged();
  }

  getDocumentLabel(document: DocumentItem, index: number) {
    const title = document.documentVersion[0]?.title?.trim();
    if (title) {
      return `${index + 1}. ${title}`;
    }

    const valueId = document.documentId[0]?.valueId?.trim();
    if (valueId) {
      return `${index + 1}. ${valueId}`;
    }

    const filename = this.getDocumentFileName(document);
    if (filename) {
      return `${index + 1}. ${filename}`;
    }

    return `${index + 1}`;
  }

  getDocumentFileName(document: DocumentItem) {
    if (document.file?.name != null && document.file.name.trim() !== '') {
      return document.file.name;
    }

    const filePath = `${document.filePath ?? ''}`.replace(/^file:/, '').trim();
    if (filePath === '') {
      return '';
    }

    return (
      filePath
        .split('/')
        .filter((segment) => segment !== '')
        .at(-1) ?? filePath
    );
  }

  getDocumentSubtitle(document: DocumentItem) {
    const version = document.documentVersion[0]?.documentVersionId?.trim();
    return [version].filter((value) => value != null && value !== '').join(' · ');
  }

  onFileSelected(field: HandoverField, event: FileSelectEvent) {
    const file = event.files[0];
    if (file == null) {
      return;
    }

    this.generatorService.setDppUploadedFile(field.fileKey, file);
    const uploadedFile = this.generatorService.getDppUploadedFile(field.fileKey);
    field.element.value = uploadedFile != null ? `file:${uploadedFile.embeddedPath}` : field.element.value;
    field.element.contentType = file.type || 'application/octet-stream';
    void this.syncFilePreview(field);
    this.onFieldChanged();
  }

  removeFileSelection(field: HandoverField) {
    this.generatorService.removeDppUploadedFile(field.fileKey);
    field.element.value = null;
    field.element.contentType = null;
    this.filePreviewState.clearPreview(field.fileKey);
    this.onFieldChanged();
  }

  private getUploadedFile(field: HandoverField) {
    return this.generatorService.getDppUploadedFile(field.fileKey);
  }

  private async syncFilePreview(field: HandoverField) {
    await this.filePreviewState.syncPreview(field.fileKey, this.getUploadedFile(field)?.file ?? null);
  }

  hasFileSelection(field: HandoverField) {
    return hasGeneratorFileSelection(this.getUploadedFile(field), this.getStoredFileReference(field));
  }

  getDisplayedFileName(field: HandoverField) {
    return getGeneratorDisplayedFileName(this.getUploadedFile(field), field.element?.value);
  }

  getDisplayedContentType(field: HandoverField) {
    return getGeneratorDisplayedContentType(this.getUploadedFile(field), field.element?.contentType);
  }

  getFilePreviewUrl(field: HandoverField) {
    return this.filePreviewState.getPreviewUrl(field.fileKey);
  }

  hasFilePreviewFallback(field: HandoverField) {
    return this.filePreviewState.hasPreviewFallback(field.fileKey);
  }

  getFileUploadCardState(field: HandoverField): GeneratorFileUploadCardState {
    return buildGeneratorFileUploadCardState({
      label: field.label,
      filename: this.getDisplayedFileName(field),
      contentType: this.getDisplayedContentType(field),
      fileReference: this.getStoredFileReference(field),
      hasSelection: this.hasFileSelection(field),
      previewUrl: this.getFilePreviewUrl(field),
      showPreviewFallback: this.hasFilePreviewFallback(field),
    });
  }

  getStoredFileReference(field: HandoverField) {
    return getGeneratorStoredFileReference(field.element?.value);
  }

  nextGroup() {
    const flatItems = this.getFlatItems();
    const currentIndex = flatItems.findIndex((item) => item.key === this.activeItem?.key);

    if (currentIndex !== -1 && currentIndex < flatItems.length - 1) {
      this.activeItemKey = flatItems[currentIndex + 1].key;
      return;
    }

    this.nextPage();
  }

  prevGroup() {
    const flatItems = this.getFlatItems();
    const currentIndex = flatItems.findIndex((item) => item.key === this.activeItem?.key);

    if (currentIndex > 0) {
      this.activeItemKey = flatItems[currentIndex - 1].key;
      return;
    }

    this.prevPage();
  }

  getNextLabel() {
    return 'NEXT';
  }

  handleFileSelected(payload: { field: HandoverField; event: FileSelectEvent }) {
    this.onFileSelected(payload.field, payload.event);
  }

  selectNode(node: TreeNode<BatteryEditorTreeItem<HandoverField>>) {
    this.activeItemKey = `${node.key ?? ''}` || null;
  }

  private getHandoverFields() {
    const selectedHandoverModel = this.selectedHandoverModel;
    if (selectedHandoverModel == null) {
      return [];
    }

    const fields: HandoverField[] = [];
    this.unsupportedFieldPaths = [];
    const documentHost = this.getDocumentHostElement(selectedHandoverModel);
    this.walkElements(
      selectedHandoverModel,
      this.getChildElements(selectedHandoverModel).filter((element) => element !== documentHost),
      fields,
      [selectedHandoverModel.idShort ?? 'Handover'],
      [],
      selectedHandoverModel,
    );
    return fields;
  }

  private walkElements(
    submodel: any,
    elements: any[],
    fields: HandoverField[],
    parentPath: string[],
    parentKeyPath: string[],
    groupElement: any,
  ) {
    elements.forEach((element, index) => {
      const rawIdShort = `${element?.idShort ?? ''}`.trim();
      const modelTypeName = this.getModelTypeName(element);
      const label = getBatteryEditorElementDisplayName(element, this.getPreferredLanguage(), modelTypeName, index);
      const idShort = rawIdShort || label;
      const modelTypeLower = modelTypeName.toLowerCase();
      const nextPath = [...parentPath, label];
      const nextKeyPath = [...parentKeyPath, `${idShort}[${index}]`];
      const group = this.getGroupInfo(nextPath, groupElement);
      const isProperty = this.isPropertyElement(element, modelTypeLower);
      const isMultiLanguageProperty = this.isMultiLanguagePropertyElement(element, modelTypeLower);
      const isFile = this.isFileElement(element, modelTypeLower);

      if (this.isDocumentCollection(element)) {
        return;
      }

      if (isProperty) {
        fields.push({
          idShort,
          label,
          path: nextPath.join(' / '),
          description: this.getFieldDescription(element),
          keyPath: nextKeyPath,
          fileKey: this.generatorService.buildDppFileKey(submodel, nextKeyPath),
          type: 'Property',
          element,
          groupKey: group.key,
          groupLabel: group.label,
          groupDescription: group.description,
        });
        return;
      }

      if (isMultiLanguageProperty) {
        if (element.value == null) {
          element.value = [{ language: 'en', text: '' }];
        }

        fields.push({
          idShort,
          label,
          path: nextPath.join(' / '),
          description: this.getFieldDescription(element),
          keyPath: nextKeyPath,
          fileKey: this.generatorService.buildDppFileKey(submodel, nextKeyPath),
          type: 'MultiLanguageProperty',
          element,
          groupKey: group.key,
          groupLabel: group.label,
          groupDescription: group.description,
        });
        return;
      }

      if (isFile) {
        fields.push({
          idShort,
          label,
          path: nextPath.join(' / '),
          description: this.getFieldDescription(element),
          keyPath: nextKeyPath,
          fileKey: this.generatorService.buildDppFileKey(submodel, nextKeyPath),
          type: 'File',
          element,
          groupKey: group.key,
          groupLabel: group.label,
          groupDescription: group.description,
        });
        return;
      }

      const children = this.getChildElements(element);
      const isContainer = children.length > 0 || isBatteryEditorContainerElement(element, modelTypeLower);
      if (children.length === 0) {
        this.unsupportedFieldPaths.push(nextPath.join(' / '));
        return;
      }

      if (isContainer) {
        const nextGroupElement = parentPath.length === 1 ? element : groupElement;
        this.walkElements(submodel, children, fields, nextPath, nextKeyPath, nextGroupElement);
      }
    });
  }

  private getFilenameFromReference(reference: unknown) {
    const value = `${reference ?? ''}`.trim();
    if (value === '') {
      return null;
    }

    const normalizedValue = value.replace(/^file:/, '');
    const segments = normalizedValue.split('/').filter((segment) => segment !== '');
    return segments.at(-1) ?? normalizedValue;
  }

  private getChildElements(element: any): any[] {
    const submodelElements = element?.submodelElements;
    if (Array.isArray(submodelElements)) {
      return submodelElements;
    }
    if (this.isIterable(submodelElements)) {
      return Array.from(submodelElements);
    }

    const value = element?.value;
    if (Array.isArray(value)) {
      return value;
    }
    if (this.isIterable(value)) {
      return Array.from(value);
    }
    return [];
  }

  private setChildElements(target: any, elements: any[]) {
    if (target == null) {
      return;
    }

    if ('submodelElements' in target) {
      target.submodelElements = elements;
      return;
    }

    target.value = elements;
  }

  private getElementCount(submodel: any) {
    return this.getChildElements(submodel).length;
  }

  private isIterable(value: any): value is Iterable<any> {
    return value != null && typeof value !== 'string' && typeof value[Symbol.iterator] === 'function';
  }

  private getModelTypeName(element: any): string {
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

  private isMultiLanguagePropertyElement(element: any, modelTypeLower: string): boolean {
    if (modelTypeLower === 'multilanguageproperty' || element instanceof aas.types.MultiLanguageProperty) {
      return true;
    }
    if (!Array.isArray(element?.value)) {
      return false;
    }
    return element.value.every(
      (entry: any) =>
        entry != null && typeof entry === 'object' && typeof entry.language === 'string' && 'text' in entry,
    );
  }

  private isPropertyElement(element: any, modelTypeLower: string): boolean {
    if (modelTypeLower === 'property' || element instanceof aas.types.Property) {
      return true;
    }

    if (this.isMultiLanguagePropertyElement(element, modelTypeLower) || this.isFileElement(element, modelTypeLower)) {
      return false;
    }

    if (this.getChildElements(element).length > 0) {
      return false;
    }

    if (element?.valueType != null) {
      return true;
    }

    return (
      Object.prototype.hasOwnProperty.call(element ?? {}, 'value') &&
      (element.value == null || ['string', 'number', 'boolean'].includes(typeof element.value))
    );
  }

  private isFileElement(element: any, modelTypeLower: string): boolean {
    return modelTypeLower === 'file' || element instanceof aas.types.File || typeof element?.contentType === 'string';
  }

  private isDocumentCollection(element: any) {
    return isDocumentationDocumentCollection(element);
  }

  private initializeHandoverDocuments() {
    const persistedDocuments = this.generatorService.getCurrentGeneratorDocumentItems(
      this.translate.currentLang || 'en',
    );
    this.handoverDocuments =
      persistedDocuments.length > 0
        ? persistedDocuments
        : this.extractHandoverDocuments(this.selectedHandoverModel, this.translate.currentLang || 'en');

    this.syncHandoverDocuments();
  }

  private extractHandoverDocuments(submodel: aas.types.Submodel | null, currentLanguage: string) {
    const documentHost = this.getDocumentHostElement(submodel);
    if (documentHost == null) {
      return [];
    }

    return this.getChildElements(documentHost)
      .filter((element) => this.isDocumentCollection(element))
      .map((element) => DocumentItem.fromHandoverSubmodelElement(element, currentLanguage))
      .filter((document) => this.isMeaningfulHandoverDocument(document));
  }

  private getDocumentHostElement(submodel: aas.types.Submodel | null) {
    return getDocumentationDocumentHost(submodel);
  }

  private isMeaningfulHandoverDocument(document: DocumentItem) {
    const primaryDocumentId = document.documentId[0];
    const primaryDocumentVersion = document.documentVersion[0];

    const candidates = [
      document.idShort,
      primaryDocumentId?.documentDomainId,
      primaryDocumentId?.valueId,
      primaryDocumentVersion?.documentVersionId,
      primaryDocumentVersion?.title,
      primaryDocumentVersion?.summary,
      primaryDocumentVersion?.keywords,
      this.getDocumentFileName(document),
    ];

    return candidates.some((value) => `${value ?? ''}`.trim() !== '');
  }

  private syncHandoverDocuments() {
    this.generatorService.syncDocumentationSubmodelDocuments(this.handoverDocuments, this.selectedHandoverModel);
  }

  private openDocumentDialog(document?: DocumentItem, index?: number) {
    this.ref = this.dialogService.open(HandoverdocumentationDocumentAddonComponent, {
      width: '75%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: true,
      header: this.translate.instant(index == null ? 'ADD_DOCUMENT' : 'EDIT'),
      closable: true,
      modal: true,
      data: {
        count: this.handoverDocuments.length,
        document,
      },
    });

    this.ref?.onClose.subscribe((documentItem: DocumentItem | null) => {
      if (documentItem == null) {
        return;
      }

      if (index == null) {
        this.handoverDocuments.push(documentItem);
      } else {
        this.handoverDocuments[index] = documentItem;
      }

      this.syncHandoverDocuments();
      this.onFieldChanged();
    });
  }

  private syncSelectedHandoverWorkState() {
    this.generatorService.syncEditedGeneratorSubmodel(this.selectedHandoverModel);
  }

  private createItems(fields: HandoverField[]) {
    const groups = new Map<string, BatteryEditorTreeItem<HandoverField>>();

    fields.forEach((field) => {
      const existing = groups.get(field.groupKey);
      if (existing != null) {
        existing.fields.push(field);
        existing.children.push(this.createFieldItem(field));
        return;
      }

      groups.set(field.groupKey, {
        key: field.groupKey,
        label: field.groupLabel,
        path: field.path.split(' / ').slice(0, -1).join(' / ') || field.groupLabel,
        description: field.groupDescription,
        kind: 'container',
        fields: [field],
        children: [this.createFieldItem(field)],
        icon: 'pi pi-folder',
      });
    });

    const items: BatteryEditorTreeItem<HandoverField>[] = [];
    if (this.selectedHandoverModel != null) {
      items.push({
        key: 'documents',
        label: this.translate.instant('DOCUMENTS'),
        path: this.translate.instant('DOCUMENTS'),
        description: this.translate.instant('BATTERY_PASSPORT_HANDOVER_DOCUMENTS_EXPL'),
        kind: 'special',
        fields: [],
        children: [],
        icon: 'pi pi-folder-open',
      });
    }

    return [...items, ...groups.values()];
  }

  private createFieldItem(field: HandoverField): BatteryEditorTreeItem<HandoverField> {
    return {
      key: createBatteryEditorTreeKey(field.keyPath),
      label: field.label,
      path: field.path,
      description: field.description,
      kind: 'field',
      fields: [field],
      children: [],
      element: field.element,
      icon: 'pi pi-file',
    };
  }

  private getGroupInfo(path: string[], groupElement: any) {
    const meaningfulSegments = path.slice(1, -1);
    const groupSegment = meaningfulSegments[0] ?? path[0] ?? 'General';

    return {
      key: groupSegment,
      label: this.formatLabel(groupSegment),
      description: this.getFieldDescription(groupElement),
    };
  }

  private formatLabel(value: string) {
    return formatBatteryEditorLabel(value);
  }

  private getLoadedConceptDescriptions() {
    return [this.generatorService.additionalV3ConceptDescriptions];
  }

  private getFieldDescription(element: any) {
    return resolveBatteryEditorDescriptionFromConceptDescriptions(
      element,
      this.getLoadedConceptDescriptions(),
      this.getPreferredLanguage(),
    );
  }

  getUnknownDebugJson() {
    const activeItem = this.activeItem;
    if (activeItem == null || activeItem.kind === 'special') {
      return null;
    }

    if (this.isUnknownLabel(activeItem.label)) {
      return stringifyBatteryEditorDebugValue(activeItem.fields[0]?.element ?? activeItem.element ?? null);
    }

    const unknownField = this.activeFields.find(
      (field) => this.isUnknownLabel(field.label) || this.isUnknownLabel(field.idShort),
    );
    if (unknownField == null) {
      return null;
    }

    return stringifyBatteryEditorDebugValue(unknownField.element);
  }

  private isUnknownLabel(value: string | null | undefined) {
    return `${value ?? ''}`.trim().toLowerCase() === 'unknown';
  }

  private getPreferredLanguage() {
    return this.translate?.currentLang || this.translate?.getDefaultLang?.() || 'en';
  }

  private getFlatItems() {
    return flattenBatteryEditorTreeItems(this.handoverItems);
  }

  private hasBatteryCarbonFootprintSubmodel() {
    return hasBatteryPassportSubmodel(this.generatorService.additionalV3Submodels, 'product-carbon-footprint');
  }
}
