import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TreeNode } from 'primeng/api';
import { Button } from 'primeng/button';
import { FileSelectEvent } from 'primeng/fileupload';
import { SidebarTreeNavComponent } from '../../general/sidebar-tree-nav/sidebar-tree-nav.component';
import {
  BatteryEditorTreeItem,
  createBatteryEditorEnumOptions,
  createBatteryEditorTreeKey,
  findBatteryEditorTreeItemByKey,
  flattenBatteryEditorTreeItems,
  getBatteryEditorChildElements,
  getBatteryEditorElementDisplayName,
  getBatteryEditorModelTypeName,
  getBatteryEditorTreeItemIndexLabel,
  getFirstBatteryEditorTreeItem,
  isBatteryEditorBlobElement,
  isBatteryEditorContainerElement,
  isBatteryEditorFileElement,
  isBatteryEditorMultiLanguagePropertyElement,
  isBatteryEditorPropertyElement,
  isBatteryEditorRangeElement,
  isBatteryEditorReferenceElement,
  mapBatteryEditorTreeItemsToNodes,
  resolveBatteryEditorDescriptionFromConceptDescriptions,
  shouldRenderBatteryEditorUnsupported,
  stringifyBatteryEditorDebugValue,
} from '../battery-editor-field-utils';
import { BatteryEditorSharedFieldComponent } from '../battery-editor-shared-field/battery-editor-shared-field.component';
import {
  getBatteryPassportAdditionalSubmodels,
  getBatteryPassportTemplateKey,
  hasBatteryPassportSubmodel,
} from '../battery-passport-template-registry';
import { GeneratorFilePreviewState } from '../generator-file-preview.utils';
import {
  buildGeneratorFileUploadCardState,
  getGeneratorDisplayedContentType,
  getGeneratorDisplayedFileName,
  getGeneratorStoredFileReference,
  hasGeneratorFileSelection,
} from '../generator-file-upload-card-state.utils';
import {
  GeneratorFileUploadCardComponent,
  type GeneratorFileUploadCardState,
} from '../generator-file-upload-card/generator-file-upload-card.component';
import { GeneratorPageShellComponent } from '../generator-page-shell/generator-page-shell.component';
import { GeneratorService } from '../generator.service';

type FieldType = 'Property' | 'MultiLanguageProperty' | 'File' | 'Range' | 'ReferenceElement' | 'Blob' | 'Unsupported';

interface TechnicalDataField {
  idShort: string;
  label: string;
  path: string;
  description: string;
  keyPath: string[];
  fileKey: string;
  type: FieldType;
  element: any;
  modelTypeName: string;
  groupKey: string;
  groupLabel: string;
}

@Component({
  selector: 'aas-battery-technical-data',
  templateUrl: './battery-technical-data.component.html',
  styleUrl: './battery-technical-data.component.scss',
  host: {
    class: 'flex flex-col flex-1',
  },
  imports: [
    Button,
    TranslateModule,
    GeneratorFileUploadCardComponent,
    BatteryEditorSharedFieldComponent,
    GeneratorPageShellComponent,
    SidebarTreeNavComponent,
  ],
})
export class BatteryTechnicalDataComponent implements OnInit, OnDestroy {
  technicalDataItems: BatteryEditorTreeItem<TechnicalDataField>[] = [];
  technicalDataNodes: TreeNode<BatteryEditorTreeItem<TechnicalDataField>>[] = [];
  activeItemKey: string | null = null;
  referenceTypeOptions = createBatteryEditorEnumOptions(
    aas.types.ReferenceTypes as unknown as Record<string, string | number>,
  );
  keyTypeOptions = createBatteryEditorEnumOptions(aas.types.KeyTypes as unknown as Record<string, string | number>);
  private readonly filePreviewState = new GeneratorFilePreviewState();

  constructor(
    private router: Router,
    public generatorService: GeneratorService,
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

    this.technicalDataItems = this.getTechnicalDataItems();
    this.technicalDataNodes = mapBatteryEditorTreeItemsToNodes(this.technicalDataItems);
    this.activeItemKey = getFirstBatteryEditorTreeItem(this.technicalDataItems)?.key ?? null;
    void Promise.all(
      this.technicalDataFields.filter((field) => field.type === 'File').map((field) => this.syncFilePreview(field)),
    );
  }

  ngOnDestroy() {
    this.filePreviewState.clearAll();
  }

  get technicalDataModels() {
    return this.generatorService.additionalV3Submodels.filter(
      (submodel) => getBatteryPassportTemplateKey(submodel) === 'technical-data',
    );
  }

  get selectedTechnicalDataModel() {
    const models = this.technicalDataModels;
    if (models.length === 0) {
      return null;
    }

    const ranked = [...models].sort((a, b) => this.getElementCount(b) - this.getElementCount(a));
    return ranked[0];
  }

  get technicalDataSemanticId() {
    return `${this.selectedTechnicalDataModel?.semanticId?.keys?.[0]?.value ?? ''}`.trim();
  }

  get additionalDbpModels() {
    return getBatteryPassportAdditionalSubmodels(this.generatorService.additionalV3Submodels);
  }

  get technicalDataFields() {
    return flattenBatteryEditorTreeItems(this.technicalDataItems)
      .filter((item) => item.kind === 'field')
      .flatMap((item) => item.fields);
  }

  get activeItem() {
    return (
      findBatteryEditorTreeItemByKey(this.technicalDataItems, this.activeItemKey) ??
      getFirstBatteryEditorTreeItem(this.technicalDataItems)
    );
  }

  get activeFields() {
    const activeItem = this.activeItem;
    if (activeItem == null) {
      return [];
    }

    return activeItem.kind === 'field' ? activeItem.fields.slice(0, 1) : activeItem.fields;
  }

  get activeGroup() {
    return this.activeItem;
  }

  get technicalDataGroups() {
    return this.technicalDataItems.map((item) => ({
      key: item.key,
      label: item.label,
      description: item.description,
      fields: item.kind === 'field' ? item.fields.slice(0, 1) : item.fields,
    }));
  }

  get activeStepLabel() {
    return getBatteryEditorTreeItemIndexLabel(this.technicalDataItems, this.activeItem?.key) || '1';
  }

  prevPage() {
    this.generatorService.navigateToPreviousGeneratorFlowStep(this.router, 'technical-data', [
      'generator',
      'nameplate',
    ]);
  }

  nextPage() {
    this.generatorService.batteryTechnicalDataEdited = true;
    this.generatorService.navigateToNextGeneratorFlowStep(this.router, 'technical-data', [
      'generator',
      'battery-handover',
    ]);
  }

  onFieldChanged() {
    this.generatorService.batteryTechnicalDataEdited = true;
  }

  onFileSelected(field: TechnicalDataField, event: FileSelectEvent) {
    const file = event.files[0];
    if (file == null) {
      return;
    }

    this.generatorService.setDppUploadedFile(field.fileKey, file);
    field.element.contentType = file.type || 'application/octet-stream';
    void this.syncFilePreview(field);
    this.onFieldChanged();
  }

  removeFileSelection(field: TechnicalDataField) {
    this.generatorService.removeDppUploadedFile(field.fileKey);
    field.element.value = null;
    field.element.contentType = null;
    this.filePreviewState.clearPreview(field.fileKey);
    this.onFieldChanged();
  }

  hasFileSelection(field: TechnicalDataField) {
    return hasGeneratorFileSelection(this.getUploadedFile(field), this.getStoredFileReference(field));
  }

  getDisplayedFileName(field: TechnicalDataField) {
    return getGeneratorDisplayedFileName(this.getUploadedFile(field), field.element?.value);
  }

  getDisplayedContentType(field: TechnicalDataField) {
    return getGeneratorDisplayedContentType(this.getUploadedFile(field), field.element?.contentType);
  }

  getFilePreviewUrl(field: TechnicalDataField) {
    return this.filePreviewState.getPreviewUrl(field.fileKey);
  }

  hasFilePreviewFallback(field: TechnicalDataField) {
    return this.filePreviewState.hasPreviewFallback(field.fileKey);
  }

  getFileUploadCardState(field: TechnicalDataField): GeneratorFileUploadCardState {
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

  getStoredFileReference(field: TechnicalDataField) {
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

  selectNode(node: TreeNode<BatteryEditorTreeItem<TechnicalDataField>>) {
    this.activeItemKey = `${node.key ?? ''}` || null;
  }

  private hasBatteryCarbonFootprintSubmodel() {
    return hasBatteryPassportSubmodel(this.generatorService.additionalV3Submodels, 'product-carbon-footprint');
  }

  private getTechnicalDataItems(): BatteryEditorTreeItem<TechnicalDataField>[] {
    for (const technicalDataModel of this.technicalDataModels) {
      const elements = this.getChildElements(technicalDataModel);
      if (elements.length === 0) {
        continue;
      }

      const items = this.walkElements(technicalDataModel, elements, [], []);
      if (items.length > 0) {
        return items;
      }
    }

    return [];
  }

  private walkElements(
    submodel: any,
    elements: any[],
    parentPath: string[],
    parentKeyPath: string[],
  ): BatteryEditorTreeItem<TechnicalDataField>[] {
    return elements.flatMap((element, index) => {
      if (element == null) {
        return [];
      }

      const rawIdShort = `${element?.idShort ?? ''}`.trim();
      const modelTypeName = this.getModelTypeName(element);
      const label = getBatteryEditorElementDisplayName(element, this.getPreferredLanguage(), modelTypeName, index);
      const idShort = rawIdShort || label;
      const modelTypeLower = modelTypeName.toLowerCase();
      const nextPath = [...parentPath, label];
      const nextKeyPath = [...parentKeyPath, `${idShort}[${index}]`];
      const children = this.getChildElements(element);

      if (this.isMultiLanguagePropertyElement(element, modelTypeLower)) {
        if (element.value == null) {
          element.value = [{ language: 'en', text: '' }];
        }

        return [
          this.createFieldItem(
            submodel,
            idShort,
            label,
            nextPath,
            nextKeyPath,
            'MultiLanguageProperty',
            element,
            modelTypeName,
          ),
        ];
      }

      if (this.isPropertyElement(element, modelTypeLower)) {
        return [
          this.createFieldItem(submodel, idShort, label, nextPath, nextKeyPath, 'Property', element, modelTypeName),
        ];
      }

      if (this.isFileElement(element, modelTypeLower)) {
        return [this.createFieldItem(submodel, idShort, label, nextPath, nextKeyPath, 'File', element, modelTypeName)];
      }

      if (this.isRangeElement(element, modelTypeLower)) {
        return [this.createFieldItem(submodel, idShort, label, nextPath, nextKeyPath, 'Range', element, modelTypeName)];
      }

      if (this.isReferenceElement(element, modelTypeLower)) {
        return [
          this.createFieldItem(
            submodel,
            idShort,
            label,
            nextPath,
            nextKeyPath,
            'ReferenceElement',
            element,
            modelTypeName,
          ),
        ];
      }

      if (this.isBlobElement(element, modelTypeLower)) {
        return [this.createFieldItem(submodel, idShort, label, nextPath, nextKeyPath, 'Blob', element, modelTypeName)];
      }

      if (children.length > 0 || isBatteryEditorContainerElement(element, modelTypeLower)) {
        const childItems = this.walkElements(submodel, children, nextPath, nextKeyPath);
        if (childItems.length === 0) {
          return [];
        }

        return [
          {
            key: createBatteryEditorTreeKey(nextPath),
            label,
            path: nextPath.join(' / '),
            description: this.getFieldDescription(element),
            kind: 'container',
            fields: childItems.filter((item) => item.kind === 'field').flatMap((item) => item.fields),
            children: childItems,
            element,
            icon: 'pi pi-folder',
          },
        ];
      }

      if (this.shouldRenderUnsupported(element, modelTypeLower)) {
        return [
          this.createFieldItem(submodel, idShort, label, nextPath, nextKeyPath, 'Unsupported', element, modelTypeName),
        ];
      }

      return [];
    });
  }

  private createFieldItem(
    submodel: any,
    idShort: string,
    label: string,
    path: string[],
    keyPath: string[],
    type: FieldType,
    element: any,
    modelTypeName: string,
  ): BatteryEditorTreeItem<TechnicalDataField> {
    const field: TechnicalDataField = {
      idShort,
      label,
      path: path.join(' / '),
      description: this.getFieldDescription(element),
      keyPath,
      fileKey: this.generatorService.buildDppFileKey(submodel, keyPath),
      type,
      element,
      modelTypeName,
      groupKey: createBatteryEditorTreeKey(path),
      groupLabel: label,
    };

    return {
      key: createBatteryEditorTreeKey(path),
      label,
      path: field.path,
      description: field.description,
      kind: 'field',
      fields: [field],
      children: [],
      element,
      icon: 'pi pi-file',
    };
  }

  private getChildElements(element: any): any[] {
    return getBatteryEditorChildElements(element);
  }

  private getModelTypeName(element: any): string {
    return getBatteryEditorModelTypeName(element);
  }

  private getElementCount(submodel: any): number {
    return this.getChildElements(submodel).length;
  }

  private isMultiLanguagePropertyElement(element: any, modelTypeLower: string): boolean {
    return isBatteryEditorMultiLanguagePropertyElement(element, modelTypeLower);
  }

  private isPropertyElement(element: any, modelTypeLower: string): boolean {
    return isBatteryEditorPropertyElement(element, modelTypeLower, {
      supportsFileElement: true,
      supportsBlobElement: true,
    });
  }

  private isFileElement(element: any, modelTypeLower: string): boolean {
    return isBatteryEditorFileElement(element, modelTypeLower);
  }

  private isBlobElement(element: any, modelTypeLower: string): boolean {
    return isBatteryEditorBlobElement(element, modelTypeLower);
  }

  private isRangeElement(element: any, modelTypeLower: string): boolean {
    return isBatteryEditorRangeElement(element, modelTypeLower);
  }

  private isReferenceElement(element: any, modelTypeLower: string): boolean {
    return isBatteryEditorReferenceElement(element, modelTypeLower);
  }

  private shouldRenderUnsupported(element: any, modelTypeLower: string): boolean {
    return shouldRenderBatteryEditorUnsupported(element, modelTypeLower, {
      supportsFileElement: true,
      supportsBlobElement: true,
    });
  }

  private getUploadedFile(field: TechnicalDataField) {
    return this.generatorService.getDppUploadedFile(field.fileKey);
  }

  private async syncFilePreview(field: TechnicalDataField) {
    await this.filePreviewState.syncPreview(field.fileKey, this.getUploadedFile(field)?.file ?? null);
  }

  private getLoadedConceptDescriptions() {
    return [this.generatorService.getCurrentGeneratorConceptDescriptions()];
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
    if (activeItem == null) {
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
    return flattenBatteryEditorTreeItems(this.technicalDataItems);
  }
}
