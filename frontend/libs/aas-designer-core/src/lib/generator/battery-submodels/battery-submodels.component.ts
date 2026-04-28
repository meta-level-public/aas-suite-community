import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  classifyBatteryPassportSubmodel,
  getBatteryPassportAdditionalSubmodels,
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

interface BatterySubmodelField {
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

interface BatterySubmodelEditorModel {
  submodel: any;
  items: BatteryEditorTreeItem<BatterySubmodelField>[];
  nodes: TreeNode<BatteryEditorTreeItem<BatterySubmodelField>>[];
  groups: Array<{
    key: string;
    label: string;
    description: string;
    fields: BatterySubmodelField[];
  }>;
}

@Component({
  selector: 'aas-battery-submodels',
  templateUrl: './battery-submodels.component.html',
  styleUrl: './battery-submodels.component.scss',
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
export class BatterySubmodelsComponent implements OnInit, OnDestroy {
  editorModels: BatterySubmodelEditorModel[] = [];
  activeSubmodelIndex: number = 0;
  activeItemKey: string | null = null;
  referenceTypeOptions = createBatteryEditorEnumOptions(
    aas.types.ReferenceTypes as unknown as Record<string, string | number>,
  );
  keyTypeOptions = createBatteryEditorEnumOptions(aas.types.KeyTypes as unknown as Record<string, string | number>);
  private readonly filePreviewState = new GeneratorFilePreviewState();

  constructor(
    private route: ActivatedRoute,
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

    this.editorModels = this.additionalDbpModels.map((submodel) => {
      const items = this.getSubmodelItems(submodel);

      return {
        submodel,
        items,
        nodes: mapBatteryEditorTreeItemsToNodes(items),
        groups: items.map((item) => ({
          key: item.key,
          label: item.label,
          description: item.description,
          fields: item.kind === 'field' ? item.fields.slice(0, 1) : item.fields,
        })),
      };
    });

    if (this.editorModels.length === 0) {
      this.router.navigate(['generator', 'confirmation']);
      return;
    }

    this.route.paramMap.subscribe((params) => {
      const param = params.get('submodelIndex');
      const nextIndex = Number.parseInt(param ?? '0', 10);
      if (!Number.isFinite(nextIndex) || nextIndex < 0 || nextIndex >= this.editorModels.length) {
        this.router.navigate(['generator', 'battery-submodels', 0]);
        return;
      }

      this.activeSubmodelIndex = nextIndex;
      this.resetActiveItem();
      void Promise.all(
        this.activeModel?.groups
          .flatMap((group) => group.fields)
          .filter((field) => field.type === 'File')
          .map((field) => this.syncFilePreview(field)) ?? [],
      );
    });
  }

  ngOnDestroy() {
    this.filePreviewState.clearAll();
  }

  get additionalDbpModels() {
    return getBatteryPassportAdditionalSubmodels(this.generatorService.additionalV3Submodels);
  }

  get activeModel() {
    return this.editorModels[this.activeSubmodelIndex] ?? null;
  }

  get activeItem() {
    const activeModel = this.activeModel;
    if (activeModel == null) {
      return null;
    }

    return (
      findBatteryEditorTreeItemByKey(activeModel.items, this.activeItemKey) ??
      getFirstBatteryEditorTreeItem(activeModel.items)
    );
  }

  get activeFields() {
    const activeItem = this.activeItem;
    if (activeItem == null) {
      return [];
    }

    return activeItem.kind === 'field' ? activeItem.fields.slice(0, 1) : activeItem.fields;
  }

  get activeStepLabel() {
    return getBatteryEditorTreeItemIndexLabel(this.activeModel?.items ?? [], this.activeItem?.key) || '1';
  }

  get activeModelTitleKey() {
    return (
      classifyBatteryPassportSubmodel(this.activeModel?.submodel)?.displayKey ?? 'BATTERY_PASSPORT_ADDITIONAL_MODELS'
    );
  }

  get activeModelSemanticId() {
    return `${this.activeModel?.submodel?.semanticId?.keys?.[0]?.value ?? ''}`.trim();
  }

  get activeModelDescription() {
    const description = this.resolveLangString(this.activeModel?.submodel?.description);
    if (description !== '') {
      return description;
    }

    return this.translate.instant('BATTERY_PASSPORT_ADDITIONAL_MODELS_EXPL');
  }

  get currentFlowStepId() {
    return `battery-submodels:${this.activeSubmodelIndex}`;
  }

  prevPage() {
    this.generatorService.navigateToPreviousGeneratorFlowStep(this.router, this.currentFlowStepId, [
      'generator',
      'battery-handover',
    ]);
  }

  nextPage() {
    this.generatorService.navigateToNextGeneratorFlowStep(this.router, this.currentFlowStepId, [
      'generator',
      'confirmation',
    ]);
  }

  nextStep() {
    const flatItems = this.getFlatItems();
    if (flatItems.length === 0) {
      this.nextPage();
      return;
    }

    const currentItem = this.activeItem;
    const currentIndex = flatItems.findIndex((item) => item.key === currentItem?.key);
    if (currentIndex !== -1 && currentIndex < flatItems.length - 1) {
      // Wenn das aktive Element ein Container (Collection) ist, zum nächsten Geschwisterelement springen,
      // nicht zum ersten Kind.
      if (currentItem?.kind === 'container') {
        const containerKeyPrefix = currentItem.key + '__';
        const nextSiblingIndex = flatItems.findIndex(
          (item, i) => i > currentIndex && !item.key.startsWith(containerKeyPrefix),
        );
        if (nextSiblingIndex !== -1) {
          this.activeItemKey = flatItems[nextSiblingIndex].key;
          return;
        }
      } else {
        this.activeItemKey = flatItems[currentIndex + 1].key;
        return;
      }
    }

    this.generatorService.navigateToNextGeneratorFlowStep(this.router, this.currentFlowStepId, [
      'generator',
      'confirmation',
    ]);
  }

  prevStep() {
    const flatItems = this.getFlatItems();
    const currentIndex = flatItems.findIndex((item) => item.key === this.activeItem?.key);

    if (currentIndex > 0) {
      this.activeItemKey = flatItems[currentIndex - 1].key;
      return;
    }

    this.generatorService.navigateToPreviousGeneratorFlowStep(this.router, this.currentFlowStepId, [
      'generator',
      'battery-handover',
    ]);
  }

  getNextLabel() {
    return 'NEXT';
  }

  selectNode(node: TreeNode<BatteryEditorTreeItem<BatterySubmodelField>>) {
    this.activeItemKey = `${node.key ?? ''}` || null;
  }

  onFieldChanged() {
    this.generatorService.batteryTechnicalDataEdited = true;
  }

  onFileSelected(field: BatterySubmodelField, event: FileSelectEvent) {
    const file = event.files[0];
    if (file == null) {
      return;
    }

    this.generatorService.setDppUploadedFile(field.fileKey, file);
    field.element.contentType = file.type || 'application/octet-stream';
    void this.syncFilePreview(field);
    this.onFieldChanged();
  }

  removeFileSelection(field: BatterySubmodelField) {
    this.generatorService.removeDppUploadedFile(field.fileKey);
    field.element.value = null;
    field.element.contentType = null;
    this.filePreviewState.clearPreview(field.fileKey);
    this.onFieldChanged();
  }

  private getUploadedFile(field: BatterySubmodelField) {
    return this.generatorService.getDppUploadedFile(field.fileKey);
  }

  private async syncFilePreview(field: BatterySubmodelField) {
    await this.filePreviewState.syncPreview(field.fileKey, this.getUploadedFile(field)?.file ?? null);
  }

  hasFileSelection(field: BatterySubmodelField) {
    return hasGeneratorFileSelection(this.getUploadedFile(field), this.getStoredFileReference(field));
  }

  getDisplayedFileName(field: BatterySubmodelField) {
    return getGeneratorDisplayedFileName(this.getUploadedFile(field), field.element?.value);
  }

  getDisplayedContentType(field: BatterySubmodelField) {
    return getGeneratorDisplayedContentType(this.getUploadedFile(field), field.element?.contentType);
  }

  getFilePreviewUrl(field: BatterySubmodelField) {
    return this.filePreviewState.getPreviewUrl(field.fileKey);
  }

  hasFilePreviewFallback(field: BatterySubmodelField) {
    return this.filePreviewState.hasPreviewFallback(field.fileKey);
  }

  getFileUploadCardState(field: BatterySubmodelField): GeneratorFileUploadCardState {
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

  getStoredFileReference(field: BatterySubmodelField) {
    return getGeneratorStoredFileReference(field.element?.value);
  }

  private hasBatteryCarbonFootprintSubmodel() {
    return hasBatteryPassportSubmodel(this.generatorService.additionalV3Submodels, 'product-carbon-footprint');
  }

  private resolveLangString(values: any[] | null | undefined) {
    const entries = (values ?? []).filter((entry) => entry != null && `${entry.text ?? ''}`.trim() !== '');
    if (entries.length === 0) {
      return '';
    }

    const currentLanguage = this.getPreferredLanguage().toLowerCase();
    const baseLanguage = currentLanguage.split('-')[0];

    const exactMatch = entries.find((entry) => `${entry.language ?? ''}`.toLowerCase() === currentLanguage);
    if (exactMatch != null) {
      return `${exactMatch.text ?? ''}`.trim();
    }

    const baseMatch = entries.find((entry) => `${entry.language ?? ''}`.toLowerCase().split('-')[0] === baseLanguage);
    if (baseMatch != null) {
      return `${baseMatch.text ?? ''}`.trim();
    }

    const englishMatch = entries.find((entry) => `${entry.language ?? ''}`.toLowerCase().split('-')[0] === 'en');
    if (englishMatch != null) {
      return `${englishMatch.text ?? ''}`.trim();
    }

    return `${entries[0]?.text ?? ''}`.trim();
  }

  private getSubmodelItems(submodel: any) {
    return this.walkElements(submodel, this.getChildElements(submodel), [submodel.idShort ?? 'Submodel'], []);
  }

  private walkElements(
    submodel: any,
    elements: any[],
    parentPath: string[],
    parentKeyPath: string[],
  ): BatteryEditorTreeItem<BatterySubmodelField>[] {
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
            element,
            idShort,
            label,
            modelTypeName,
            nextPath,
            nextKeyPath,
            'MultiLanguageProperty',
          ),
        ];
      }

      if (this.isPropertyElement(element, modelTypeLower)) {
        return [
          this.createFieldItem(submodel, element, idShort, label, modelTypeName, nextPath, nextKeyPath, 'Property'),
        ];
      }

      if (this.isFileElement(element, modelTypeLower)) {
        return [this.createFieldItem(submodel, element, idShort, label, modelTypeName, nextPath, nextKeyPath, 'File')];
      }

      if (this.isRangeElement(element, modelTypeLower)) {
        return [this.createFieldItem(submodel, element, idShort, label, modelTypeName, nextPath, nextKeyPath, 'Range')];
      }

      if (this.isReferenceElement(element, modelTypeLower)) {
        return [
          this.createFieldItem(
            submodel,
            element,
            idShort,
            label,
            modelTypeName,
            nextPath,
            nextKeyPath,
            'ReferenceElement',
          ),
        ];
      }

      if (this.isBlobElement(element, modelTypeLower)) {
        return [this.createFieldItem(submodel, element, idShort, label, modelTypeName, nextPath, nextKeyPath, 'Blob')];
      }

      if (children.length > 0 || isBatteryEditorContainerElement(element, modelTypeLower)) {
        const childItems = this.walkElements(submodel, children, nextPath, nextKeyPath);
        if (childItems.length === 0) {
          return [];
        }

        return [
          {
            key: createBatteryEditorTreeKey(nextKeyPath),
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
          this.createFieldItem(submodel, element, idShort, label, modelTypeName, nextPath, nextKeyPath, 'Unsupported'),
        ];
      }

      return [];
    });
  }

  private createFieldItem(
    submodel: any,
    element: any,
    idShort: string,
    label: string,
    modelTypeName: string,
    path: string[],
    keyPath: string[],
    type: FieldType,
  ): BatteryEditorTreeItem<BatterySubmodelField> {
    const field: BatterySubmodelField = {
      idShort,
      label,
      path: path.join(' / '),
      description: this.getFieldDescription(element),
      keyPath,
      fileKey: this.generatorService.buildDppFileKey(submodel, keyPath),
      type,
      element,
      modelTypeName,
      groupKey: createBatteryEditorTreeKey(keyPath),
      groupLabel: label,
    };

    return {
      key: createBatteryEditorTreeKey(keyPath),
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

  private isMultiLanguagePropertyElement(element: any, modelTypeLower: string): boolean {
    return isBatteryEditorMultiLanguagePropertyElement(element, modelTypeLower);
  }

  private isPropertyElement(element: any, modelTypeLower: string): boolean {
    return isBatteryEditorPropertyElement(element, modelTypeLower, {
      supportsFileElement: true,
      supportsBlobElement: true,
    });
  }

  private isBlobElement(element: any, modelTypeLower: string): boolean {
    return isBatteryEditorBlobElement(element, modelTypeLower);
  }

  private isFileElement(element: any, modelTypeLower: string): boolean {
    return isBatteryEditorFileElement(element, modelTypeLower);
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
    return flattenBatteryEditorTreeItems(this.activeModel?.items ?? []);
  }

  private resetActiveItem() {
    this.activeItemKey = getFirstBatteryEditorTreeItem(this.activeModel?.items ?? [])?.key ?? null;
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
}
