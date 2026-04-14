import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { NotificationService, PortalService } from '@aas/common-services';
import { FilenameHelper, SemanticIdHelper } from '@aas/helpers';
import { ShellResult, SupplementalFile } from '@aas/model';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PrimeTemplate, TreeNode } from 'primeng/api';
import { Button } from 'primeng/button';
import { Divider } from 'primeng/divider';
import { FileSelectEvent } from 'primeng/fileupload';
import { Message } from 'primeng/message';
import { Select } from 'primeng/select';
import { Info } from '../../../general/model/info-item';
import { SidebarTreeNavComponent } from '../../../general/sidebar-tree-nav/sidebar-tree-nav.component';
import {
  BatteryEditorTreeItem,
  createBatteryEditorEnumOptions,
  createBatteryEditorTreeKey,
  findBatteryEditorTreeItemByKey,
  flattenBatteryEditorTreeItems,
  formatBatteryEditorLabel,
  getBatteryEditorChildElements,
  getBatteryEditorElementDisplayName,
  getBatteryEditorModelTypeName,
  getBatteryEditorTreeItemIndexLabel,
  getFirstBatteryEditorTreeItem,
  isBatteryEditorBlobElement,
  isBatteryEditorFileElement,
  isBatteryEditorMultiLanguagePropertyElement,
  isBatteryEditorPropertyElement,
  isBatteryEditorRangeElement,
  isBatteryEditorReferenceElement,
  mapBatteryEditorTreeItemsToNodes,
  resolveBatteryEditorDescriptionFromConceptDescriptions,
  shouldRenderBatteryEditorUnsupported,
  stringifyBatteryEditorDebugValue,
} from '../../../generator/battery-editor-field-utils';
import { BatteryEditorSharedFieldComponent } from '../../../generator/battery-editor-shared-field/battery-editor-shared-field.component';
import { GeneratorFilePreviewState } from '../../../generator/generator-file-preview.utils';
import {
  buildGeneratorFileUploadCardState,
  getGeneratorDisplayedContentType,
  getGeneratorDisplayedFileName,
  getGeneratorStoredFileReference,
  hasGeneratorFileSelection,
} from '../../../generator/generator-file-upload-card-state.utils';
import {
  GeneratorFileUploadCardComponent,
  type GeneratorFileUploadCardState,
} from '../../../generator/generator-file-upload-card/generator-file-upload-card.component';
import { GeneratorPageShellComponent } from '../../../generator/generator-page-shell/generator-page-shell.component';
import { GeneratorService } from '../../../generator/generator.service';
import { HerstellerAdresse } from '../../../generator/model/hersteller-adresse';
import { V3MarkingsEditorComponent } from '../../../v3-editor/components/v3-markings-editor/v3-markings-editor.component';
import { V3TreeItem } from '../../../v3-editor/model/v3-tree-item';
import { MultilanguagePropertyComponent } from '../../structural-elements/multilanguage-property/multilanguage-property.component';

type NameplateFieldType =
  | 'Property'
  | 'MultiLanguageProperty'
  | 'File'
  | 'Range'
  | 'ReferenceElement'
  | 'Blob'
  | 'Unsupported'
  | 'AddressSelection'
  | 'Markings';

interface NameplateField {
  idShort: string;
  path: string;
  description: string;
  keyPath: string[];
  fileKey: string;
  type: NameplateFieldType;
  element: any;
  modelTypeName: string;
  label: string;
  focusTarget: string | null;
  children?: NameplateField[];
}

const NAMEPLATE_ADDRESS_FIELD_ID_SHORTS = new Set([
  'Company',
  'Name',
  'Street',
  'StreetName',
  'Zipcode',
  'ZipCode',
  'Zip',
  'CityTown',
  'City',
  'StateCounty',
  'State',
  'NationalCode',
  'CountryCode',
  'Country',
]);

@Component({
  selector: 'aas-nameplate',
  templateUrl: './nameplate.component.html',
  styleUrl: './nameplate.component.scss',
  host: {
    class: 'flex flex-col flex-1',
  },
  imports: [
    PrimeTemplate,
    Message,
    Button,
    Select,
    FormsModule,
    Divider,
    MultilanguagePropertyComponent,
    V3MarkingsEditorComponent,
    GeneratorFileUploadCardComponent,
    BatteryEditorSharedFieldComponent,
    TranslateModule,
    GeneratorPageShellComponent,
    SidebarTreeNavComponent,
  ],
})
export class NameplateComponent implements OnInit, OnDestroy {
  @Input() embedded: boolean = false;

  editorFields: NameplateField[] = [];
  navItems: BatteryEditorTreeItem<NameplateField>[] = [];
  navNodes: TreeNode<BatteryEditorTreeItem<NameplateField>>[] = [];
  activeItemKey: string | null = null;
  info = Info;
  loading = false;

  selectedHersteller: HerstellerAdresse | undefined | null = null;
  herstellerCandidates: HerstellerAdresse[] = [];
  markingsShellResult: ShellResult | undefined;
  referenceTypeOptions = createBatteryEditorEnumOptions(
    aas.types.ReferenceTypes as unknown as Record<string, string | number>,
  );
  keyTypeOptions = createBatteryEditorEnumOptions(aas.types.KeyTypes as unknown as Record<string, string | number>);
  private readonly filePreviewState = new GeneratorFilePreviewState();
  private cachedMarkingsElement: aas.types.SubmodelElementCollection | aas.types.SubmodelElementList | null = null;
  private cachedMarkingsTreeItem: V3TreeItem<
    aas.types.SubmodelElementCollection | aas.types.SubmodelElementList
  > | null = null;

  @Output() nameplateComplete: EventEmitter<boolean> = new EventEmitter();

  constructor(
    private router: Router,
    public generatorService: GeneratorService,
    private translate: TranslateService,
    private notificationService: NotificationService,
  ) {}

  get id() {
    return this.generatorService.currentId;
  }

  get activeField() {
    return this.activeItem?.fields[0] ?? null;
  }

  get activeItem() {
    return (
      findBatteryEditorTreeItemByKey(this.navItems, this.activeItemKey) ?? getFirstBatteryEditorTreeItem(this.navItems)
    );
  }

  get items() {
    return this.editorFields;
  }

  get currentConceptDescriptions() {
    if (typeof this.generatorService.getCurrentGeneratorConceptDescriptions === 'function') {
      return this.generatorService.getCurrentGeneratorConceptDescriptions();
    }

    return this.generatorService.additionalV3ConceptDescriptions ?? [];
  }

  get currentMarkingsTreeItem() {
    const markingsElement = this.activeField?.type === 'Markings' ? this.activeField.element : null;
    if (markingsElement == null) {
      this.cachedMarkingsElement = null;
      this.cachedMarkingsTreeItem = null;
      return null;
    }

    if (this.cachedMarkingsElement !== markingsElement || this.cachedMarkingsTreeItem == null) {
      const markingsTreeItem = new V3TreeItem<aas.types.SubmodelElementCollection | aas.types.SubmodelElementList>();
      markingsTreeItem.content = markingsElement;
      this.cachedMarkingsElement = markingsElement;
      this.cachedMarkingsTreeItem = markingsTreeItem;
    }

    return this.cachedMarkingsTreeItem;
  }

  get nameplateSemanticId() {
    return `${this.getCurrentNameplateRaw()?.semanticId?.keys?.[0]?.value ?? ''}`.trim();
  }

  get currentNameplateSubmodelIdentifier() {
    return `${this.getCurrentNameplateRaw()?.id ?? ''}`;
  }

  get showSerialNumber() {
    return this.generatorService.showStandardGeneratorSerialNumber;
  }

  get showManufacturingDate() {
    return this.generatorService.showStandardGeneratorManufacturingDate;
  }

  get activeStepPosition() {
    const flatItems = flattenBatteryEditorTreeItems(this.navItems);
    const currentIndex = flatItems.findIndex((item) => item.key === this.activeItem?.key);
    return Math.min(currentIndex === -1 ? 0 : currentIndex, Math.max(flatItems.length - 1, 0));
  }

  get activeStepLabel() {
    return getBatteryEditorTreeItemIndexLabel(this.navItems, this.activeItem?.key) || '1';
  }

  async ngOnInit() {
    const nameplateRaw = this.getCurrentNameplateRaw();

    if (nameplateRaw == null) {
      await this.router.navigate(['generator', 'generator-start']);
      return;
    }

    this.loading = true;
    this.markingsShellResult = this.createMarkingsShellResult(nameplateRaw);

    try {
      if (typeof this.generatorService.ensureNameplateContactInformationLoaded === 'function') {
        await this.generatorService.ensureNameplateContactInformationLoaded(nameplateRaw);
      }

      const groupedFields = this.groupAddressFields(this.getNameplateFields(nameplateRaw));
      const orderedFields = this.orderEditorFields(groupedFields).filter((field) => this.shouldIncludeField(field));
      this.syncNameplateWorkState();

      this.editorFields = orderedFields;
      this.navItems = this.createNavItems(orderedFields);
      this.navNodes = mapBatteryEditorTreeItemsToNodes(this.navItems);
      this.activeItemKey = getFirstBatteryEditorTreeItem(this.navItems)?.key ?? null;
      await Promise.all(
        this.editorFields.filter((field) => field.type === 'File').map((field) => this.syncFilePreview(field)),
      );

      this.herstellerCandidates =
        typeof this.generatorService.getAdressen === 'function' ? await this.generatorService.getAdressen() : [];
    } finally {
      this.loading = false;
    }
  }

  ngOnDestroy() {
    this.filePreviewState.clearAll();
  }

  private hasElementWithSemanticId(elements: any[], semanticId: string): boolean {
    return elements.some((element) => {
      if (SemanticIdHelper.hasSemanticId(element, semanticId)) {
        return true;
      }

      const children = this.getChildElements(element);
      return children.length > 0 && this.hasElementWithSemanticId(children, semanticId);
    });
  }

  private groupAddressFields(fields: NameplateField[]) {
    const addressFields = fields.filter((field) => field.type === 'AddressSelection');
    const addressField = addressFields[0];

    if (addressField == null) {
      return fields;
    }

    const addressDetailFields = fields.filter((field) => this.isAddressDetailField(field));
    const mergedAddressFields = [
      ...(addressField.children ?? []),
      ...addressFields.flatMap((field) => field.children ?? []),
      ...addressDetailFields,
    ];

    addressField.children = this.orderAddressFields(this.deduplicateAddressFields(mergedAddressFields));

    return fields.filter(
      (field) => !this.isAddressDetailField(field) && (field.type !== 'AddressSelection' || field === addressField),
    );
  }

  private orderAddressFields(fields: NameplateField[]) {
    const order = [
      'Company',
      'Name',
      'Street',
      'StreetName',
      'Zipcode',
      'ZipCode',
      'Zip',
      'CityTown',
      'City',
      'StateCounty',
      'State',
      'NationalCode',
      'CountryCode',
      'Country',
    ];

    return [...fields].sort((left, right) => {
      const leftIndex = order.findIndex((idShort) => idShort === left.idShort);
      const rightIndex = order.findIndex((idShort) => idShort === right.idShort);
      const normalizedLeftIndex = leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex;
      const normalizedRightIndex = rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex;

      if (normalizedLeftIndex !== normalizedRightIndex) {
        return normalizedLeftIndex - normalizedRightIndex;
      }

      return left.label.localeCompare(right.label);
    });
  }

  private deduplicateAddressFields(fields: NameplateField[]) {
    const deduplicatedFields = new Map<string, NameplateField>();

    for (const field of fields) {
      const key = field.fileKey || `${field.idShort}:${field.path}`;
      if (!deduplicatedFields.has(key)) {
        deduplicatedFields.set(key, field);
      }
    }

    return Array.from(deduplicatedFields.values());
  }

  private isAddressDetailField(field: NameplateField) {
    return field.type !== 'AddressSelection' && NAMEPLATE_ADDRESS_FIELD_ID_SHORTS.has(field.idShort);
  }

  private getNameplateFields(submodel: aas.types.Submodel) {
    const fields: NameplateField[] = [];
    this.walkElements(submodel, this.getChildElements(submodel), fields, [submodel.idShort ?? 'Nameplate'], []);
    return fields;
  }

  private walkElements(
    submodel: aas.types.Submodel,
    elements: any[],
    fields: NameplateField[],
    parentPath: string[],
    parentKeyPath: string[],
  ) {
    elements.forEach((element, index) => {
      const modelTypeName = this.getModelTypeName(element);
      const idShort =
        `${element?.idShort ?? ''}`.trim() ||
        getBatteryEditorElementDisplayName(element, this.getPreferredLanguage(), modelTypeName, index);
      const modelTypeLower = modelTypeName.toLowerCase();
      const nextPath = [...parentPath, idShort];
      const nextKeyPath = [...parentKeyPath, `${idShort}[${index}]`];
      const children = this.getChildElements(element);

      if (this.isAddressSelectionElement(element)) {
        fields.push(
          this.createField(submodel, element, modelTypeName, nextPath, nextKeyPath, 'AddressSelection', {
            label: this.translate.instant('ADDRESS'),
            focusTarget: 'herstellerSelect',
            children: this.collectNestedFields(submodel, children, nextPath, nextKeyPath),
          }),
        );
        return;
      }

      if (this.isMarkingsElement(element)) {
        fields.push(
          this.createField(submodel, element, modelTypeName, nextPath, nextKeyPath, 'Markings', {
            label: this.translate.instant('KENNZEICHEN'),
          }),
        );
        return;
      }

      if (this.isPropertyElement(element, modelTypeLower)) {
        fields.push(this.createField(submodel, element, modelTypeName, nextPath, nextKeyPath, 'Property'));
      } else if (this.isMultiLanguagePropertyElement(element, modelTypeLower)) {
        if (element.value == null) {
          element.value = [new aas.types.LangStringTextType('en', '')];
        }

        fields.push(this.createField(submodel, element, modelTypeName, nextPath, nextKeyPath, 'MultiLanguageProperty'));
      } else if (this.isFileElement(element, modelTypeLower)) {
        fields.push(this.createField(submodel, element, modelTypeName, nextPath, nextKeyPath, 'File'));
      } else if (this.isRangeElement(element, modelTypeLower)) {
        fields.push(this.createField(submodel, element, modelTypeName, nextPath, nextKeyPath, 'Range'));
      } else if (this.isReferenceElement(element, modelTypeLower)) {
        fields.push(this.createField(submodel, element, modelTypeName, nextPath, nextKeyPath, 'ReferenceElement'));
      } else if (this.isBlobElement(element, modelTypeLower)) {
        fields.push(this.createField(submodel, element, modelTypeName, nextPath, nextKeyPath, 'Blob'));
      } else if (children.length === 0 && this.shouldRenderUnsupported(element, modelTypeLower)) {
        fields.push(this.createField(submodel, element, modelTypeName, nextPath, nextKeyPath, 'Unsupported'));
      }

      if (children.length > 0) {
        this.walkElements(submodel, children, fields, nextPath, nextKeyPath);
      }
    });
  }

  private collectNestedFields(
    submodel: aas.types.Submodel,
    elements: any[],
    parentPath: string[],
    parentKeyPath: string[],
  ) {
    const nestedFields: NameplateField[] = [];
    this.walkElements(submodel, elements, nestedFields, parentPath, parentKeyPath);
    return nestedFields.flatMap((field) => {
      if (field.type === 'Markings') {
        return [];
      }

      if (field.type === 'AddressSelection') {
        return field.children ?? [];
      }

      return [field];
    });
  }

  private createField(
    submodel: aas.types.Submodel,
    element: any,
    modelTypeName: string,
    path: string[],
    keyPath: string[],
    type: NameplateFieldType,
    options?: Partial<Pick<NameplateField, 'label' | 'focusTarget' | 'children'>>,
  ): NameplateField {
    const idShort =
      `${element?.idShort ?? ''}`.trim() ||
      getBatteryEditorElementDisplayName(element, this.getPreferredLanguage(), modelTypeName);
    const safeFieldId = path.join('_').replace(/[^a-zA-Z0-9_-]+/g, '_');

    return {
      idShort,
      path: path.join(' / '),
      description: this.getFieldDescription(element),
      keyPath,
      fileKey: this.generatorService.buildDppFileKey(submodel, keyPath),
      type,
      element,
      modelTypeName,
      label: options?.label ?? this.getFieldLabel(element, idShort),
      focusTarget: options?.focusTarget ?? this.getDefaultFocusTarget(type, safeFieldId),
      children: options?.children,
    };
  }

  private orderEditorFields(fields: NameplateField[]) {
    return [...fields].sort((left, right) => this.getFieldSortWeight(left) - this.getFieldSortWeight(right));
  }

  private createNavItems(fields: NameplateField[]): BatteryEditorTreeItem<NameplateField>[] {
    return fields.map((field) => ({
      key: createBatteryEditorTreeKey(field.keyPath),
      label: field.label,
      path: field.path,
      description: field.description,
      kind: (field.children?.length ?? 0) > 0 ? 'container' : 'field',
      fields: [field],
      children: this.createNavItems(field.children ?? []),
      element: field.element,
      icon: (field.children?.length ?? 0) > 0 ? 'pi pi-folder' : 'pi pi-file',
    }));
  }

  private getFieldSortWeight(field: NameplateField) {
    if (field.type === 'AddressSelection') {
      return -10;
    }

    if (field.type === 'Markings') {
      return 10;
    }

    return 0;
  }

  private shouldIncludeField(field: NameplateField) {
    if (field.idShort === 'SerialNumber' && !this.showSerialNumber) {
      return false;
    }

    if (field.idShort === 'YearOfConstruction' && !this.showManufacturingDate) {
      return false;
    }

    return true;
  }

  private getFieldLabel(element: any, idShort: string) {
    const displayName = getBatteryEditorElementDisplayName(
      element,
      this.getPreferredLanguage(),
      element?.modelType?.name,
    );
    if (displayName !== '' && displayName !== idShort) {
      return displayName;
    }

    const knownLabels: Record<string, string> = {
      ManufacturerName: 'MANUFACTURER',
      ManufacturerProductRoot: 'PRODUCT_ROOT',
      ManufacturerProductFamily: 'PRODUCT_FAMILY',
      ManufacturerProductDesignation: 'MANUFACTURER_PRODUCT_DESIGNATION',
      SerialNumber: 'SERIAL_NUMBER',
      YearOfConstruction: 'YEAR_OF_CONSTRUCTION',
      AddressInformation: 'ADDRESS',
      ContactInformation: 'ADDRESS',
      Markings: 'KENNZEICHEN',
    };

    const labelKey = knownLabels[idShort];
    return labelKey != null ? this.translate.instant(labelKey) : formatBatteryEditorLabel(idShort);
  }

  hasUnknownDebugInfo() {
    return this.getUnknownDebugJson() != null;
  }

  getUnknownDebugJson() {
    const activeField = this.activeField;
    if (activeField == null) {
      return null;
    }

    const hasUnknownLabel = this.isUnknownLabel(activeField.label) || this.isUnknownLabel(activeField.idShort);
    if (!hasUnknownLabel) {
      return null;
    }

    return stringifyBatteryEditorDebugValue(activeField.element);
  }

  private isUnknownLabel(value: string | null | undefined) {
    return `${value ?? ''}`.trim().toLowerCase() === 'unknown';
  }

  private getPreferredLanguage() {
    return this.translate?.currentLang || this.translate?.getDefaultLang?.() || 'en';
  }

  private getLoadedConceptDescriptions() {
    return [this.currentConceptDescriptions, this.generatorService.additionalV3ConceptDescriptions];
  }

  private getFieldDescription(element: any) {
    return resolveBatteryEditorDescriptionFromConceptDescriptions(
      element,
      this.getLoadedConceptDescriptions(),
      this.getPreferredLanguage(),
      this.getConceptDescriptionIdShortFallbacks(element),
    );
  }

  private getConceptDescriptionIdShortFallbacks(element: any) {
    const idShort = `${element?.idShort ?? ''}`.trim();
    if (idShort === '') {
      return [];
    }

    const aliases: Record<string, string[]> = {
      ZipCode: ['Zipcode', 'Zip'],
      Zipcode: ['ZipCode', 'Zip'],
      Zip: ['Zipcode', 'ZipCode'],
      City: ['CityTown'],
      CityTown: ['City'],
      State: ['StateCounty'],
      StateCounty: ['State'],
      Country: ['CountryCode', 'NationalCode'],
      CountryCode: ['Country', 'NationalCode'],
      NationalCode: ['Country', 'CountryCode'],
    };

    return [idShort, ...(aliases[idShort] ?? [])];
  }

  private getDefaultFocusTarget(type: NameplateFieldType, fieldId: string) {
    if (type !== 'Property' && type !== 'MultiLanguageProperty') {
      return null;
    }

    return fieldId;
  }

  private getChildElements(element: any): any[] {
    return getBatteryEditorChildElements(element);
  }

  private getModelTypeName(element: any): string {
    return getBatteryEditorModelTypeName(element);
  }

  private isPropertyElement(element: any, modelTypeLower: string): boolean {
    return isBatteryEditorPropertyElement(element, modelTypeLower, {
      supportsFileElement: true,
      supportsBlobElement: true,
    });
  }

  private isMultiLanguagePropertyElement(element: any, modelTypeLower: string): boolean {
    return isBatteryEditorMultiLanguagePropertyElement(element, modelTypeLower);
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

  private isBlobElement(element: any, modelTypeLower: string): boolean {
    return isBatteryEditorBlobElement(element, modelTypeLower);
  }

  private shouldRenderUnsupported(element: any, modelTypeLower: string): boolean {
    return shouldRenderBatteryEditorUnsupported(element, modelTypeLower, {
      supportsFileElement: true,
      supportsBlobElement: true,
    });
  }

  private isAddressSelectionElement(element: any) {
    return (
      SemanticIdHelper.hasSemanticId(
        element,
        'https://admin-shell.io/zvei/nameplate/1/0/ContactInformations/AddressInformation',
      ) ||
      SemanticIdHelper.hasSemanticId(
        element,
        'https://admin-shell.io/zvei/nameplate/1/0/ContactInformations/ContactInformation',
      )
    );
  }

  private isMarkingsElement(element: any) {
    return (
      element?.idShort === 'Markings' ||
      SemanticIdHelper.hasSemanticId(element, '0173-1#01-AGZ673#001') ||
      SemanticIdHelper.hasSemanticId(element, '0112/2///61360_7#AAS006#001')
    );
  }

  applyManufacturer() {
    if (this.getCurrentNameplateRaw() == null || this.selectedHersteller == null) {
      return;
    }

    this.applyManufacturerToRawNameplate();
    this.syncNameplateWorkState();
  }

  private applyManufacturerToRawNameplate() {
    this.setRawElementValuesFromLookup(
      this.findRawNameplateElements(['Company', 'Name']),
      this.selectedHersteller?.nameMlpKeyValues,
      this.selectedHersteller?.name,
    );
    this.setRawElementValuesFromLookup(
      this.findRawNameplateElements(['Street', 'StreetName']),
      this.selectedHersteller?.strasseMlpKeyValues,
      this.selectedHersteller?.strasse,
    );
    this.setRawElementValuesFromLookup(
      this.findRawNameplateElements(['Zipcode', 'ZipCode', 'Zip']),
      undefined,
      this.selectedHersteller?.plz,
    );
    this.setRawElementValuesFromLookup(
      this.findRawNameplateElements(['StateCounty', 'State']),
      this.selectedHersteller?.bundeslandMlpKeyValues,
      this.selectedHersteller?.bundesland,
    );
    this.setRawElementValuesFromLookup(
      this.findRawNameplateElements(['NationalCode', 'CountryCode', 'Country']),
      undefined,
      this.selectedHersteller?.laenderCode,
    );
    this.setRawElementValuesFromLookup(
      this.findRawNameplateElements(['CityTown', 'City']),
      this.selectedHersteller?.ortMlpKeyValues,
      this.selectedHersteller?.ort,
    );
    this.setRawElementValuesFromLookup(
      this.findRawNameplateElements(['ManufacturerName']),
      this.selectedHersteller?.nameMlpKeyValues,
      this.selectedHersteller?.name,
    );
  }

  private findRawNameplateElements(idShortAliases: string[]) {
    const matches = new Set<any>();
    this.collectEditorFieldElementsByIdShortAliases(this.editorFields, idShortAliases, matches);

    const rootElements = this.getCurrentNameplateRaw()?.submodelElements ?? [];
    this.collectElementsByIdShortAliases(rootElements, idShortAliases, matches);

    return Array.from(matches);
  }

  private getCurrentNameplateRaw() {
    return this.generatorService.getCurrentGeneratorNameplateSubmodel();
  }

  private createMarkingsShellResult(nameplateRaw: aas.types.Submodel) {
    const shellResult = new ShellResult();
    shellResult.id = typeof this.generatorService.currentId === 'number' ? this.generatorService.currentId : 0;
    shellResult.supplementalFiles = this.collectMarkingSupplementalFiles(nameplateRaw);
    return shellResult;
  }

  private collectMarkingSupplementalFiles(nameplateRaw: aas.types.Submodel): SupplementalFile[] {
    return this.getMarkingCollections(nameplateRaw)
      .map((marking) => this.createMarkingSupplementalFile(marking))
      .filter((supplementalFile): supplementalFile is SupplementalFile => supplementalFile != null);
  }

  private createMarkingSupplementalFile(marking: aas.types.SubmodelElementCollection): SupplementalFile | null {
    const markingFile = this.getMarkingFileElement(marking);
    const rawPath = `${markingFile?.value ?? ''}`.trim();
    if (rawPath === '') {
      return null;
    }

    const displayPath = FilenameHelper.replaceFileUri(rawPath) ?? rawPath;
    const localFile =
      typeof this.generatorService.getCurrentGeneratorFile === 'function'
        ? this.generatorService.getCurrentGeneratorFile(rawPath)
        : null;

    return {
      path: displayPath,
      filename:
        displayPath
          .split('/')
          .filter((segment) => segment !== '')
          .at(-1) ?? displayPath,
      fileApiUrl: '',
      contentType: `${markingFile?.contentType ?? localFile?.type ?? ''}`,
      isThumbnail: false,
      file: (localFile ?? undefined) as any,
      isLoaded: false,
      isLoading: false,
      isLocal: localFile != null,
      fileUrl: null,
      fileData: null,
      id: null,
    };
  }

  private getMarkingCollections(nameplateRaw: aas.types.Submodel) {
    const markingsElement = (nameplateRaw.submodelElements ?? []).find((element: aas.types.ISubmodelElement) =>
      this.isMarkingsElement(element),
    );
    const markingsValue = (
      markingsElement as aas.types.SubmodelElementCollection | aas.types.SubmodelElementList | null
    )?.value;

    return Array.isArray(markingsValue)
      ? markingsValue.filter(
          (element): element is aas.types.SubmodelElementCollection =>
            element instanceof aas.types.SubmodelElementCollection,
        )
      : [];
  }

  private getMarkingFileElement(marking: aas.types.SubmodelElementCollection) {
    return (marking.value ?? []).find(
      (element): element is aas.types.File =>
        element instanceof aas.types.File &&
        (SemanticIdHelper.hasSemanticId(
          element,
          'https://admin-shell.io/zvei/nameplate/2/0/Nameplate/Markings/Marking/MarkingFile',
        ) ||
          SemanticIdHelper.hasSemanticId(element, '0112/2///61987#ABO100#002')),
    );
  }

  private collectEditorFieldElementsByIdShortAliases(
    fields: NameplateField[],
    idShortAliases: string[],
    matches: Set<any>,
  ) {
    fields.forEach((field) => {
      if (idShortAliases.includes(`${field.element?.idShort ?? ''}`)) {
        matches.add(field.element);
      }

      if ((field.children?.length ?? 0) > 0) {
        this.collectEditorFieldElementsByIdShortAliases(field.children ?? [], idShortAliases, matches);
      }
    });
  }

  private collectElementsByIdShortAliases(elements: any[], idShortAliases: string[], matches: Set<any>) {
    for (const element of elements) {
      if (idShortAliases.includes(`${element?.idShort ?? ''}`)) {
        matches.add(element);
      }

      const children = this.getChildElements(element);
      if (children.length === 0) {
        continue;
      }

      this.collectElementsByIdShortAliases(children, idShortAliases, matches);
    }
  }

  private setRawElementValuesFromLookup(
    elements: any[],
    lookupValues: Array<{ language: string; text: string }> | undefined,
    fallback: string | null | undefined,
  ) {
    const normalizedValues = this.normalizeLookupValues(lookupValues, fallback);

    elements.forEach((element) => {
      this.setRawElementValueFromLookup(element, normalizedValues, fallback);
    });
  }

  private setRawElementValueFromLookup(
    element: any,
    normalizedValues: Array<{ language: string; text: string }>,
    fallback: string | null | undefined,
  ) {
    if (element == null) {
      return;
    }

    const modelTypeName = this.getModelTypeName(element).toLowerCase();

    if (modelTypeName === 'multilanguageproperty' || this.hasLanguageTextValueArray(element)) {
      element.value = normalizedValues.map((entry) => new aas.types.LangStringTextType(entry.language, entry.text));
      return;
    }

    if (modelTypeName === 'property') {
      element.value =
        normalizedValues.find((entry) => entry.language === 'de')?.text ??
        normalizedValues.find((entry) => entry.language === 'en')?.text ??
        normalizedValues[0]?.text ??
        `${fallback ?? ''}`.trim();
    }
  }

  private hasLanguageTextValueArray(element: any) {
    return Array.isArray(element?.value) && element.value.every((entry: any) => 'language' in entry && 'text' in entry);
  }

  private setValueFromLookup(
    entries: Array<{ language: string; text: string }> | null | undefined,
    lookupValues: Array<{ language: string; text: string }> | undefined,
    fallback: string | null | undefined,
  ): Array<{ language: string; text: string }> {
    const normalizedValues = this.normalizeLookupValues(lookupValues, fallback);
    if (entries == null) {
      return normalizedValues;
    }

    entries.splice(0, entries.length, ...normalizedValues);
    return entries;
  }

  private setBilingualValue(
    entries: Array<{ language: string; text: string }> | null | undefined,
    text: string | null | undefined,
  ): Array<{ language: string; text: string }> {
    const normalizedEntries = entries ?? [];
    this.setLocalizedValue(normalizedEntries, 'de', text ?? '');
    this.setLocalizedValue(normalizedEntries, 'en', text ?? '');
    return normalizedEntries;
  }

  private normalizeLookupValues(
    lookupValues: Array<{ language: string; text: string }> | undefined,
    fallback: string | null | undefined,
  ) {
    const normalizedValues = (lookupValues ?? [])
      .filter((entry) => `${entry?.text ?? ''}`.trim() !== '')
      .map((entry) => ({
        language: `${entry.language ?? ''}`.trim().toLowerCase(),
        text: `${entry.text ?? ''}`.trim(),
      }))
      .filter((entry) => entry.language !== '');

    const sourceText =
      normalizedValues.find((entry) => entry.language === 'de')?.text ??
      normalizedValues.find((entry) => entry.language === 'en')?.text ??
      normalizedValues[0]?.text ??
      `${fallback ?? ''}`.trim();

    const result = [...normalizedValues];

    if (sourceText !== '' && !result.some((entry) => entry.language === 'de')) {
      result.unshift({ language: 'de', text: sourceText });
    }

    if (sourceText !== '' && !result.some((entry) => entry.language === 'en')) {
      result.splice(result.some((entry) => entry.language === 'de') ? 1 : 0, 0, {
        language: 'en',
        text: sourceText,
      });
    }

    return result;
  }

  private setLocalizedValue(entries: Array<{ language: string; text: string }>, language: string, text: string) {
    const existingEntry = entries.find((entry) => entry.language === language);

    if (existingEntry != null) {
      existingEntry.text = text;
      return;
    }

    entries.push({ language, text });
  }

  selectStep(index: number) {
    const item = flattenBatteryEditorTreeItems(this.navItems)[index];
    if (item == null) {
      return;
    }

    this.activeItemKey = item.key;
    this.focusByActiveIndex();
  }

  async saveShell() {
    if (this.embedded) {
      return;
    }

    try {
      this.loading = true;
      const res = await this.generatorService.saveShell();

      this.notificationService.showMessageAlways('VWS_SAVED', 'SUCCESS', 'success', false);
      await this.router.navigate(PortalService.buildRepoEditRoute(res.aasId ?? ''));
    } catch (error) {
      this.notificationService.showMessageAlways(
        this.generatorService.getSaveShellErrorMessage(error),
        'ERROR',
        'error',
        true,
      );
    } finally {
      this.loading = false;
    }
  }

  next(focusFieldId: string = '') {
    const flatItems = flattenBatteryEditorTreeItems(this.navItems);
    const currentIndex = flatItems.findIndex((item) => item.key === this.activeItem?.key);

    if (currentIndex !== -1 && currentIndex < flatItems.length - 1) {
      this.activeItemKey = flatItems[currentIndex + 1].key;
      if (focusFieldId !== '') {
        setTimeout(() => document.getElementById(focusFieldId)?.focus());
      }
    } else if (this.embedded) {
      this.nameplateComplete.next(true);
    } else {
      this.generatorService.navigateToNextGeneratorFlowStep(this.router, 'nameplate', ['generator', 'document']);
    }

    this.focusByActiveIndex();
  }

  focusByActiveIndex() {
    const focusTarget = this.activeField?.focusTarget;
    if (focusTarget != null) {
      setTimeout(() => document.getElementById(focusTarget)?.focus());
    }
  }

  prev() {
    const flatItems = flattenBatteryEditorTreeItems(this.navItems);
    const currentIndex = flatItems.findIndex((item) => item.key === this.activeItem?.key);

    if (currentIndex > 0) {
      this.activeItemKey = flatItems[currentIndex - 1].key;
    } else {
      this.generatorService.navigateToPreviousGeneratorFlowStep(this.router, 'nameplate', [
        'generator',
        'asset-metadata',
      ]);
    }

    this.focusByActiveIndex();
  }

  selectNode(node: TreeNode<BatteryEditorTreeItem<NameplateField>>) {
    this.activeItemKey = `${node.key ?? ''}` || null;
    this.focusByActiveIndex();
  }

  onFieldChanged(_field: NameplateField) {
    if (this.getCurrentNameplateRaw() == null) {
      return;
    }

    this.syncNameplateWorkState();
  }

  onFileSelected(field: NameplateField, event: FileSelectEvent) {
    const file = event.files[0];
    if (file == null) {
      return;
    }

    this.generatorService.setDppUploadedFile(field.fileKey, file);
    const uploadedFile = this.generatorService.getDppUploadedFile(field.fileKey);
    field.element.value = uploadedFile != null ? `file:${uploadedFile.embeddedPath}` : field.element.value;
    field.element.contentType = file.type || 'application/octet-stream';
    this.syncNameplateWorkState();
    void this.syncFilePreview(field);
  }

  removeFileSelection(field: NameplateField) {
    this.generatorService.removeDppUploadedFile(field.fileKey);
    field.element.value = null;
    field.element.contentType = null;
    this.syncNameplateWorkState();
    this.filePreviewState.clearPreview(field.fileKey);
  }

  hasFileSelection(field: NameplateField) {
    return hasGeneratorFileSelection(this.getUploadedFile(field), this.getStoredFileReference(field));
  }

  getDisplayedFileName(field: NameplateField) {
    return getGeneratorDisplayedFileName(this.getUploadedFile(field), field.element?.value);
  }

  getDisplayedContentType(field: NameplateField) {
    return getGeneratorDisplayedContentType(this.getUploadedFile(field), field.element?.contentType);
  }

  getFilePreviewUrl(field: NameplateField) {
    return this.filePreviewState.getPreviewUrl(field.fileKey);
  }

  hasFilePreviewFallback(field: NameplateField) {
    return this.filePreviewState.hasPreviewFallback(field.fileKey);
  }

  getFileUploadCardState(field: NameplateField): GeneratorFileUploadCardState {
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

  getStoredFileReference(field: NameplateField) {
    return getGeneratorStoredFileReference(field.element?.value);
  }

  getFieldDomId(field: NameplateField) {
    return field.focusTarget ?? field.path.replace(/[^a-zA-Z0-9_-]+/g, '_');
  }

  private getUploadedFile(field: NameplateField) {
    return this.generatorService.getDppUploadedFile(field.fileKey);
  }

  private async syncFilePreview(field: NameplateField) {
    await this.filePreviewState.syncPreview(field.fileKey, this.getUploadedFile(field)?.file ?? null);
  }

  get isNonConform() {
    return false;
  }

  get canTryConvert() {
    return false;
  }

  getLabel() {
    const itemCount = flattenBatteryEditorTreeItems(this.navItems).length;

    if (this.activeStepPosition < itemCount - 1 || this.embedded === false || this.embedded === undefined) {
      return 'NEXT';
    }

    return 'FINISH';
  }

  private syncNameplateWorkState() {
    const nameplate = this.getCurrentNameplateRaw();
    this.generatorService.syncEditedGeneratorSubmodel(nameplate);
  }
}
