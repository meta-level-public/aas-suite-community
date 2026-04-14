import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { SubmodelTemplate } from '@aas-designer-model';
import { ConceptDescriptionRoot, PackageMetadata, ShellResult } from '@aas/model';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MenuItem, TreeNode } from 'primeng/api';
import { Popover } from 'primeng/popover';
import { v4 as uuid } from 'uuid';
import { CMTypeOption } from '../model/cm-type-option';
import { EditorTypeOption } from '../model/editor-type-option';
import { V3TreeItem } from '../model/v3-tree-item';
import { ElementInserter } from '../tools/element-inserter';
import { V3EditorService } from '../v3-editor.service';
import { V3TreeService } from '../v3-tree/v3-tree.service';
type AssetAdministrationShell = aas.types.AssetAdministrationShell;
type Entity = aas.types.Entity;
type ISubmodelElement = aas.types.ISubmodelElement;
type Submodel = aas.types.Submodel;
type SubmodelElementCollection = aas.types.SubmodelElementCollection;
type SubmodelElementList = aas.types.SubmodelElementList;

import { AasConfirmationService, NotificationService, PortalService } from '@aas/common-services';
import { FilenameHelper, HandoverSemantics, InstanceHelper, SemanticIdHelper } from '@aas/helpers';
import { SupplementalFile } from '@aas/model';
import { Clipboard } from '@angular/cdk/clipboard';
import { saveAs } from 'file-saver-es';
import { cloneDeep } from 'lodash-es';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TieredMenu } from 'primeng/tieredmenu';
import {
  createDocumentationDocument,
  getDocumentationDocumentSemanticIdForHost,
  isDocumentationDocumentCollection,
} from '../../generator/generator-documentation.builder';
import { GeneratorService } from '../../generator/generator.service';
import { DocumentItem } from '../../generator/model/document-item';
import { CapabilityAddonComponent } from '../addons/capability-addon/capability-addon.component';
import { HandoverdocumentationDocumentAddonComponent } from '../addons/handoverdocumentation-document-addon/handoverdocumentation-document-addon.component';
import { ContactInformationAddonComponent } from '../components/contact-information-addon/contact-information-addon.component';
import { SearchSubmodelComponent } from '../components/search-submodel/search-submodel.component';
import { CMTransformOption } from '../model/cm-transform-option';
import { AddonResolver, AddonType } from './addon-resolver';
import { AvailableSubmodel } from './available-submodel';
import { V3InsertElementDialogComponent } from './dialogs/insert-element/v3-insert-element-dialog.component';
import { V3InsertSubmodelDialogComponent } from './dialogs/insert-submodel/v3-insert-submodel-dialog.component';
import { V3PasteQuestionDialogComponent } from './dialogs/paste-question/v3-paste-question-dialog.component';
import { V3SaveAsJsonDialogComponent } from './dialogs/save-as-json/v3-save-as-json-dialog.component';
import { V3SaveSnippetDialogComponent } from './dialogs/save-snippet/v3-save-snippet-dialog.component';
import { V3OptionalElementsFinder } from './v3-optional-elements-finder';

interface SnippetData {
  templateName: string;
  templateDescription: string;
  saveValue: boolean;
  templateData: string;
  elementType: string;
}
@Component({
  selector: 'aas-v3-tree-context-menu',
  templateUrl: './v3-tree-context-menu.component.html',
  imports: [
    ButtonModule,
    Popover,
    TieredMenu,
    V3SaveSnippetDialogComponent,
    V3SaveAsJsonDialogComponent,
    V3PasteQuestionDialogComponent,
    V3InsertElementDialogComponent,
    V3InsertSubmodelDialogComponent,
  ],
})
export class V3TreeContextMenuComponent {
  menuItems: MenuItem[] = [];
  @Input({ required: true }) node: TreeNode<V3TreeItem<any>> | undefined;
  @Input({ required: true }) shellResult: ShellResult | undefined;
  @Input({ required: true }) allSubmodelsNode: TreeNode<V3TreeItem<aas.types.Submodel>> | undefined;
  // @Input({ required: true }) shellRootNode: TreeNode<V3TreeItem<PackageMetadata>> | undefined;
  @Input({ required: true }) shellNode: TreeNode<V3TreeItem<aas.types.AssetAdministrationShell>> | undefined;
  @Input({ required: true }) conceptDescriptionsRootNode:
    | TreeNode<V3TreeItem<aas.types.ConceptDescription | ConceptDescriptionRoot>>
    | undefined;
  @Input({ required: true }) filesRootNode: TreeNode<V3TreeItem<SupplementalFile>> | undefined;
  @Input({ required: true }) copiedElement: V3TreeItem<any> | undefined;
  @Input({ required: true }) availableSubmodelTemplates: SubmodelTemplate[] = [];

  @Output() elementCopied: EventEmitter<V3TreeItem<any>> = new EventEmitter<V3TreeItem<any>>();
  @Output() showInsertSnippetDialog = new EventEmitter<{
    visibility: boolean;
    allowedTypes: string[];
    uuid: string;
    elementType: string;
    parentElement: TreeNode<V3TreeItem<any>> | undefined;
  }>();

  @Output() showInsertJsonDialog = new EventEmitter<'submodel' | 'element' | 'cd'>();
  @Output() showInsertFromEclassDialog = new EventEmitter<{ parentElement: TreeNode<V3TreeItem<any>> }>();

  saveSnippetDialogVisible: boolean = false;
  insertElementDialogVisible: boolean = false;
  insertSubmodelDialogVisible: boolean = false;
  snippet: SnippetData = {} as SnippetData;
  loading: boolean = false;
  saveAsJsonDialogVisible: boolean = false;
  saveAsJsonData: string = '';
  saveAsJsonFilename: string = '';
  pasteAsReferenceQuestionDialogVisible: boolean = false;

  // Signal-model bindings from dialogs (two-way)
  private _saveSnippetConfirmed: boolean | null = null;
  get saveSnippetConfirmed(): boolean | null {
    return this._saveSnippetConfirmed;
  }
  set saveSnippetConfirmed(val: boolean | null) {
    this._saveSnippetConfirmed = val;
    if (val === true) {
      this.saveSnippet();
      this._saveSnippetConfirmed = null;
      this.saveSnippetDialogVisible = false;
    } else if (val === false) {
      // Cancel
      this.saveSnippetDialogVisible = false;
      this._saveSnippetConfirmed = null;
    }
  }

  private _saveAsJsonAction: 'copy' | 'download' | 'cancel' | null = null;
  get saveAsJsonAction(): 'copy' | 'download' | 'cancel' | null {
    return this._saveAsJsonAction;
  }
  set saveAsJsonAction(val: 'copy' | 'download' | 'cancel' | null) {
    this._saveAsJsonAction = val;
    if (val === 'copy') {
      this.copyJsonToClipboard();
      this._saveAsJsonAction = null;
    } else if (val === 'download') {
      this.saveAsJson();
      this._saveAsJsonAction = null;
    } else if (val === 'cancel') {
      // dialog will close itself; just reset
      this._saveAsJsonAction = null;
    }
  }

  private _acceptedPasteAction: 'reference' | 'copy' | null = null;
  get acceptedPasteAction(): 'reference' | 'copy' | null {
    return this._acceptedPasteAction;
  }
  set acceptedPasteAction(val: 'reference' | 'copy' | null) {
    this._acceptedPasteAction = val;
    if (val === 'reference' || val === 'copy') {
      this.pasteElement(val);
      this.pasteAsReferenceQuestionDialogVisible = false;
      this._acceptedPasteAction = null;
    }
  }

  private _selectedElementToInsert: {
    label: string;
    translatedLabel: string;
    description: string;
    createElement: CMTypeOption;
  } | null = null;
  get selectedElementToInsert(): {
    label: string;
    translatedLabel: string;
    description: string;
    createElement: CMTypeOption;
  } | null {
    return this._selectedElementToInsert;
  }
  set selectedElementToInsert(
    val: { label: string; translatedLabel: string; description: string; createElement: CMTypeOption } | null,
  ) {
    this._selectedElementToInsert = val;
    if (val) {
      this.elementToInsertSelected(val);
      this._selectedElementToInsert = null;
    }
  }

  private _selectedSubmodelToInsert: AvailableSubmodel | null = null;
  get selectedSubmodelToInsert(): AvailableSubmodel | null {
    return this._selectedSubmodelToInsert;
  }
  set selectedSubmodelToInsert(val: AvailableSubmodel | null) {
    this._selectedSubmodelToInsert = val;
    if (val) {
      this.submodelToInsertSelected(val);
      this._selectedSubmodelToInsert = null;
    }
  }

  availableSubmodels: {
    label: string;
    id?: string;
    submodels: AvailableSubmodel[];
  }[] = [];
  availableElements: {
    label: string;
    translatedLabel: string;
    description: string;
    createElement: CMTypeOption;
  }[] = [];

  constructor(
    private translate: TranslateService,
    private confirmService: AasConfirmationService,
    private editorService: V3EditorService,
    private treeService: V3TreeService,
    private notificationService: NotificationService,

    private clipboard: Clipboard,
    private optionalElementsFinder: V3OptionalElementsFinder,
    private portalService: PortalService,
  ) {}

  async onShowActions(event: Event, menu: Popover | TieredMenu) {
    event.stopPropagation();
    event.preventDefault();

    this.menuItems = [
      {
        label: this.translate.instant('ADD'),
        icon: 'pi pi-plus',
        items: [
          {
            label: this.translate.instant('SHELLS'),
            icon: 'fa-solid fa-gear',
            command: (_event) => {
              menu.hide();
              this.createElement(CMTypeOption.AssetAdministrationShell);
            },
            visible: this.isInsertAllowed(CMTypeOption.AssetAdministrationShell),
          },
          {
            label: this.translate.instant('SUBMODELS'),
            icon: 'fa-solid fa-gear',
            command: async () => {
              this.initTemplates();
              this.insertSubmodelDialogVisible = true;
            },
            visible: this.isInsertAllowed(CMTypeOption.Submodel),
          },
          {
            label: this.translate.instant('SUBMODEL_REF'),
            icon: 'fa-solid fa-gear',
            command: async () => {
              this.showReferrableSubmodels();
            },
            visible: this.isInsertAllowed(CMTypeOption.Submodel),
          },
          {
            label: this.translate.instant('SUBMODEL_ELEMENTS'),
            icon: 'fa-solid fa-gears',

            command: () => {
              this.getAvailableElements();
              menu.hide();
              this.insertElementDialogVisible = true;
            },
            visible: this.isInsertAllowed(CMTypeOption.ElementGroup),
          },
          {
            label: this.translate.instant('ADD_CHILD_ELEMENT'),
            icon: 'fa-solid fa-gears',

            command: async () => {
              menu.hide();
              await this.insertSubmodelElementlistChild();
            },
            visible: this.isInsertSmlElementAllowed(),
          },
          {
            label: this.translate.instant('OPTIONAL_ELEMENTS'),
            icon: 'fa-solid fa-gear',
            items: [...(await this.getOptionalItems(menu))],
            visible: this.isInsertAllowed(CMTypeOption.OptionalElements),
          },
          {
            label: this.translate.instant('MISSING_ELEMENTS'),
            icon: 'fa-solid fa-gear',
            items: [...(await this.getMissingElements(menu))],
            visible: this.isInsertAllowed(CMTypeOption.OptionalElements),
          },
          {
            label: this.translate.instant('SNIPPETS'),
            icon: 'pi pi-file',
            visible: this.isInsertAllowed(CMTypeOption.SnippetGroup),
            command: () => {
              menu.hide();
              if (this.node?.data != null) {
                const allowedTypes = this.getAllowedTypes(this.node.data.editorType);
                this.showInsertSnippetDialog.emit({
                  visibility: true,
                  allowedTypes: allowedTypes,
                  uuid: this.node?.data?.id,
                  elementType: this.node?.data?.editorType,
                  parentElement: this.node,
                });
              }
            },
          },
          {
            label: this.translate.instant('FROM_ADDON'),
            icon: 'pi pi-book',
            items: [...(await this.getAddons(menu))],
            visible: this.isInsertAllowed(CMTypeOption.Addon),
          },

          {
            label: this.translate.instant('SM_FROM_JSON'),
            icon: 'fa-solid fa-code',
            command: () => {
              menu.hide();
              this.showInsertJsonDialog.emit('submodel');
            },
            visible: this.isInsertAllowed(CMTypeOption.SMFromJson),
          },
          {
            label: this.translate.instant('EL_FROM_JSON'),
            icon: 'fa-solid fa-code',
            command: () => {
              menu.hide();
              this.showInsertJsonDialog.emit('element');
            },
            visible: this.isInsertAllowed(CMTypeOption.ElFromJson),
          },
          {
            label: this.translate.instant('FROM_JSON'),
            icon: 'fa-solid fa-code',
            command: () => {
              menu.hide();
              this.showInsertJsonDialog.emit('cd');
            },
            visible: this.isInsertAllowed(CMTypeOption.CdFromJson),
          },
          // {
          //   label: this.translate.instant('FROM_ECLASS'),
          //   icon: 'pi pi-sign-in',
          //   command: () => {
          //     menu.hide();
          //     if (this.node != null) this.showInsertFromEclassDialog.emit({ parentElement: this.node });
          //   },
          //   visible: this.isInsertAllowed(CMTypeOption.Property),
          // },
        ],
        visible: this.isInsertAllowed(CMTypeOption.AddGroup) || this.isInsertSmlElementAllowed(),
      },
      {
        separator: true,
      },
      {
        label: this.translate.instant('TRANSFORM'),
        icon: 'pi pi-arrow-right-arrow-left',
        items: [
          {
            label: this.translate.instant('TRANSFORM_TO_PROPERTY'),
            command: (_event) => {
              this.transformElement(CMTransformOption.TO_PROPERTY);
              menu.hide();
            },
            visible: this.isTransformAllowed(CMTransformOption.TO_PROPERTY),
          },
          {
            label: this.translate.instant('TRANSFORM_TO_MLP'),
            command: (_event) => {
              this.transformElement(CMTransformOption.TO_MULTILANGUAGE_PROPERTY);
              menu.hide();
            },
            visible: this.isTransformAllowed(CMTransformOption.TO_MULTILANGUAGE_PROPERTY),
          },
          {
            label: this.translate.instant('TRANSFORM_TO_SML'),
            command: (_event) => {
              this.transformElement(CMTransformOption.TO_SUBMODEL_ELEMENT_LIST);
              menu.hide();
            },
            visible: this.isTransformAllowed(CMTransformOption.TO_SUBMODEL_ELEMENT_LIST),
          },
          {
            label: this.translate.instant('TRANSFORM_TO_SMC'),
            command: (_event) => {
              this.transformElement(CMTransformOption.TO_SUBMODEL_ELEMENT_COLLECTION);
              menu.hide();
            },
            visible: this.isTransformAllowed(CMTransformOption.TO_SUBMODEL_ELEMENT_COLLECTION),
          },
        ],
      },
      {
        separator: true,
      },
      {
        label: this.translate.instant('COPY'),
        icon: 'fa-solid fa-copy',
        command: (_event) => {
          menu.hide();
          this.copyElement();
        },
        visible: this.isCopyAllowed(),
      },
      {
        label: this.translate.instant('PASTE'),
        icon: 'fa-solid fa-paste',
        command: (_event) => {
          menu.hide();
          this.pasteElement();
        },
        visible: this.isPasteAllowed(),
      },
      {
        label: this.translate.instant('REMOVE_TEMPLATE_QUALIFIERS'),
        icon: 'pi pi-eraser',
        command: async (_event) => {
          menu.hide();
          await this.removeTemplateQualifiers();
        },
        visible: this.isRemoveTemplateQualifiersAllowed(),
      },
      {
        label: this.translate.instant('DELETE'),
        icon: 'pi pi-trash',
        command: (_event) => {
          menu.hide();
          this.deleteNode();
        },
        visible: this.isDeleteAllowed(),
      },
      {
        label: this.translate.instant('SAVE_AS'),
        icon: 'pi pi-sign-out',
        items: [
          {
            label: this.translate.instant('SAVE_AS_SNIPPET'),
            icon: 'pi pi-file',
            command: (_event) => {
              menu.hide();
              this.snippet = {} as SnippetData;
              if (this.node?.data?.content != null) {
                this.snippet.templateData = JSON.stringify(aas.jsonization.toJsonable(this.node.data.content), null, 2);
                this.snippet.elementType = this.node.data.editorType;
              }
              this.saveSnippetDialogVisible = true;
            },
            visible: this.isSaveAsAllowed(),
          },
          {
            label: this.translate.instant('SAVE_AS_JSON'),
            icon: 'pi pi-download',
            command: (_event) => {
              menu.hide();
              if (this.node?.data?.content != null) {
                this.saveAsJsonFilename = this.node.data.content.idShort;
                this.saveAsJsonData = JSON.stringify(aas.jsonization.toJsonable(this.node?.data?.content), null, '\t');
                this.saveAsJsonDialogVisible = true;
              }
            },
            visible: this.isSaveAsAllowed(),
          },
        ],
        visible: this.isSaveAsAllowed(),
      },
    ];

    menu.toggle(event);
  }

  transformElement(transformOption: CMTransformOption) {
    switch (transformOption) {
      case CMTransformOption.TO_PROPERTY:
        this.transformToProperty();
        break;
      case CMTransformOption.TO_MULTILANGUAGE_PROPERTY:
        this.transformToMultiLanguageProperty();
        break;
      case CMTransformOption.TO_SUBMODEL_ELEMENT_LIST:
        this.transformToSubmodelElementList();
        break;
      case CMTransformOption.TO_SUBMODEL_ELEMENT_COLLECTION:
        this.transformToSubmodelElementCollection();
        break;
    }
  }

  transformToProperty() {
    if (!this.node?.data) return;

    const mlp = this.node.data.content as unknown as aas.types.MultiLanguageProperty;

    // Build a Property from the MLP, preserving metadata
    const property = new aas.types.Property(aas.types.DataTypeDefXsd.String, null, null, mlp.idShort);
    property.displayName = mlp.displayName;
    property.description = mlp.description;
    property.semanticId = mlp.semanticId;
    property.supplementalSemanticIds = mlp.supplementalSemanticIds;
    property.qualifiers = mlp.qualifiers;
    property.embeddedDataSpecifications = mlp.embeddedDataSpecifications;
    property.valueId = mlp.valueId;

    // Use current language if available; otherwise, first entry
    const lang = this.translate?.currentLang || 'en';
    const fromCurrentLang = mlp.value?.find((v) => v.language === lang)?.text;
    property.value = fromCurrentLang ?? mlp.value?.[0]?.text ?? null;

    // Replace in parent container and update node
    this.replaceElementInParent(property);
    this.node.data.content = property;
    this.node.data.editorType = EditorTypeOption.Property;
    // Properties have no children
    if (this.node) this.node.children = [];
    this.treeService.aasTreeData = [...this.treeService.aasTreeData];
  }

  transformToMultiLanguageProperty() {
    if (!this.node?.data) return;

    const property = this.node.data.content as unknown as aas.types.Property;

    // Transform Property into MultilanguageProperty, preserving metadata
    const mlp = new aas.types.MultiLanguageProperty();
    mlp.idShort = property.idShort;
    mlp.displayName = property.displayName;
    mlp.description = property.description;
    mlp.semanticId = property.semanticId;
    mlp.supplementalSemanticIds = property.supplementalSemanticIds;
    mlp.qualifiers = property.qualifiers;
    mlp.embeddedDataSpecifications = property.embeddedDataSpecifications;
    mlp.valueId = property.valueId ?? null;

    if (property.value != null && property.value !== undefined) {
      const text = String(property.value);
      const lang = this.translate?.currentLang || 'en';
      mlp.value = [new aas.types.LangStringTextType(lang, text)];
    } else {
      mlp.value = null;
    }

    this.replaceElementInParent(mlp);
    this.node.data.content = mlp;
    this.node.data.editorType = EditorTypeOption.MultiLanguageProperty;
    // MLP has no children
    if (this.node) this.node.children = [];
    this.treeService.aasTreeData = [...this.treeService.aasTreeData];
  }

  transformToSubmodelElementCollection() {
    if (!this.node?.data) return;

    const sml = this.node.data.content as unknown as aas.types.SubmodelElementList;

    // Build a SubmodelElementCollection from the list, keep metadata and child elements
    const smc = new aas.types.SubmodelElementCollection();
    smc.idShort = sml.idShort;
    smc.displayName = sml.displayName;
    smc.description = sml.description;
    smc.semanticId = sml.semanticId;
    smc.supplementalSemanticIds = sml.supplementalSemanticIds;
    smc.qualifiers = sml.qualifiers;
    smc.embeddedDataSpecifications = sml.embeddedDataSpecifications;
    smc.value = sml.value;

    // Replace in underlying model and update node
    this.replaceElementInParent(smc);
    this.node.data.content = smc;
    this.node.data.editorType = EditorTypeOption.SubmodelElementCollection;
    // Rebuild children for SMC
    const node = this.node!;
    node.children = [];
    this.treeService.buildChildTree(smc.value, node);
    this.treeService.aasTreeData = [...this.treeService.aasTreeData];
  }

  // Replace current node's content instance inside its parent container (submodelElements/value/statements)
  private replaceElementInParent(newElement: any) {
    const current = this.node?.data?.content;
    const parentContent = this.node?.data?.parent?.content;
    if (!current || !parentContent) return;

    if (parentContent instanceof aas.types.Submodel) {
      const arr = parentContent.submodelElements;
      if (arr) {
        const idx = arr.indexOf(current);
        if (idx > -1) arr[idx] = newElement;
      }
    } else if (parentContent instanceof aas.types.SubmodelElementCollection) {
      const arr = parentContent.value;
      if (arr) {
        const idx = arr.indexOf(current);
        if (idx > -1) arr[idx] = newElement;
      }
    } else if (parentContent instanceof aas.types.SubmodelElementList) {
      const arr = parentContent.value;
      if (arr) {
        const idx = arr.indexOf(current);
        if (idx > -1) arr[idx] = newElement;
      }
    } else if (parentContent instanceof aas.types.Entity) {
      const arr = parentContent.statements;
      if (arr) {
        const idx = arr.indexOf(current);
        if (idx > -1) arr[idx] = newElement;
      }
    }
  }

  transformToSubmodelElementList() {
    if (!this.node?.data) return;

    const smc = this.node?.data?.content as unknown as aas.types.SubmodelElementCollection;
    const firstSmcElement = smc.value?.[0];
    const typeOfFirstElement = this.getTypeOf(firstSmcElement);

    const sml = new aas.types.SubmodelElementList(typeOfFirstElement);
    // copy metadata
    sml.idShort = smc.idShort;
    sml.displayName = smc.displayName;
    sml.description = smc.description;
    sml.semanticId = smc.semanticId;
    sml.supplementalSemanticIds = smc.supplementalSemanticIds;
    sml.qualifiers = smc.qualifiers;
    sml.embeddedDataSpecifications = smc.embeddedDataSpecifications;
    // defaults
    sml.orderRelevant = false;
    sml.semanticIdListElement = null;
    sml.valueTypeListElement = null;
    // carry over children
    sml.value = smc.value;

    // Replace in model and update node
    this.replaceElementInParent(sml);
    this.node.data.content = sml;
    this.node.data.editorType = EditorTypeOption.SubmodelElementList;
    // Rebuild children for SML
    const node = this.node!;
    node.children = [];
    this.treeService.buildChildTree(sml.value, node);
    this.treeService.aasTreeData = [...this.treeService.aasTreeData];
  }

  getTypeOf(sme: ISubmodelElement | undefined) {
    if (sme instanceof aas.types.Property) return aas.types.AasSubmodelElements.Property;
    if (sme instanceof aas.types.MultiLanguageProperty) return aas.types.AasSubmodelElements.MultiLanguageProperty;
    if (sme instanceof aas.types.File) return aas.types.AasSubmodelElements.File;
    if (sme instanceof aas.types.Blob) return aas.types.AasSubmodelElements.Blob;
    if (sme instanceof aas.types.Capability) return aas.types.AasSubmodelElements.Capability;
    if (sme instanceof aas.types.ReferenceElement) return aas.types.AasSubmodelElements.ReferenceElement;
    if (sme instanceof aas.types.Operation) return aas.types.AasSubmodelElements.Operation;
    if (sme instanceof aas.types.Entity) return aas.types.AasSubmodelElements.Entity;
    if (sme instanceof aas.types.Range) return aas.types.AasSubmodelElements.Range;
    if (sme instanceof aas.types.RelationshipElement) return aas.types.AasSubmodelElements.RelationshipElement;
    if (sme instanceof aas.types.SubmodelElementCollection)
      return aas.types.AasSubmodelElements.SubmodelElementCollection;
    if (sme instanceof aas.types.SubmodelElementList) return aas.types.AasSubmodelElements.SubmodelElementList;
    return aas.types.AasSubmodelElements.Property;
  }

  isTransformAllowed(transformOption: CMTransformOption): boolean | undefined {
    if (this.node?.data != null) {
      switch (this.node.data.editorType) {
        case EditorTypeOption.SubmodelElementCollection:
          if (transformOption === CMTransformOption.TO_SUBMODEL_ELEMENT_LIST) {
            return true;
          }
          break;
        case EditorTypeOption.SubmodelElementList:
          if (transformOption === CMTransformOption.TO_SUBMODEL_ELEMENT_COLLECTION) {
            return true;
          }
          break;
        case EditorTypeOption.Property:
          if (transformOption === CMTransformOption.TO_MULTILANGUAGE_PROPERTY) {
            return true;
          }
          break;
        case EditorTypeOption.MultiLanguageProperty:
          if (transformOption === CMTransformOption.TO_PROPERTY) {
            return true;
          }
          break;
      }
    }
    return false;
  }

  async insertSubmodelElementlistChild() {
    const list = this.node?.data?.content;
    const firstChild = list instanceof aas.types.SubmodelElementList ? list.value?.[0] : null;

    if (firstChild != null) {
      const childCopy = cloneDeep(firstChild);
      childCopy.idShort = this.buildCopiedSmlChildIdShort(childCopy, list.value ?? []);

      const keepTemplateValues = await this.confirmService.confirm({
        message: this.translate.instant('KEEP_SML_TEMPLATE_VALUES_Q'),
      });

      if (keepTemplateValues !== true) {
        this.clearSubmodelElementValuesRecursive(childCopy);
      }

      this.insertElement(childCopy, this.getEditorTypeForSubmodelElement(childCopy));
      this.treeService.registerFieldUndoStep();
      return;
    }

    const childType = list?.typeValueListElement;
    switch (childType) {
      case aas.types.AasSubmodelElements.Property:
        this.createElement(CMTypeOption.Property);
        break;
      case aas.types.AasSubmodelElements.File:
        this.createElement(CMTypeOption.File);
        break;
      case aas.types.AasSubmodelElements.Blob:
        this.createElement(CMTypeOption.Blob);
        break;
      case aas.types.AasSubmodelElements.Capability:
        this.createElement(CMTypeOption.Capability);
        break;
      case aas.types.AasSubmodelElements.ReferenceElement:
        this.createElement(CMTypeOption.ReferenceElement);
        break;
      case aas.types.AasSubmodelElements.Operation:
        this.createElement(CMTypeOption.Operation);
        break;
      case aas.types.AasSubmodelElements.Entity:
        this.createElement(CMTypeOption.Entity);
        break;
      case aas.types.AasSubmodelElements.Range:
        this.createElement(CMTypeOption.Range);
        break;
      case aas.types.AasSubmodelElements.MultiLanguageProperty:
        this.createElement(CMTypeOption.MultiLanguageProperty);
        break;
      case aas.types.AasSubmodelElements.RelationshipElement:
        this.createElement(CMTypeOption.RelationshipElement);
        break;
      case aas.types.AasSubmodelElements.SubmodelElementCollection:
        this.createElement(CMTypeOption.SubmodelElementCollection);
        break;
      case aas.types.AasSubmodelElements.SubmodelElementList:
        this.createElement(CMTypeOption.SubmodelElementList);
        break;
    }

    this.treeService.registerFieldUndoStep();
  }

  private getEditorTypeForSubmodelElement(element: ISubmodelElement): EditorTypeOption {
    if (element instanceof aas.types.Property) return EditorTypeOption.Property;
    if (element instanceof aas.types.MultiLanguageProperty) return EditorTypeOption.MultiLanguageProperty;
    if (element instanceof aas.types.File) return EditorTypeOption.File;
    if (element instanceof aas.types.Blob) return EditorTypeOption.Blob;
    if (element instanceof aas.types.Capability) return EditorTypeOption.Capability;
    if (element instanceof aas.types.ReferenceElement) return EditorTypeOption.ReferenceElement;
    if (element instanceof aas.types.Operation) return EditorTypeOption.Operation;
    if (element instanceof aas.types.Entity) return EditorTypeOption.Entity;
    if (element instanceof aas.types.Range) return EditorTypeOption.Range;
    if (element instanceof aas.types.RelationshipElement) return EditorTypeOption.RelationshipElement;
    if (element instanceof aas.types.SubmodelElementCollection) return EditorTypeOption.SubmodelElementCollection;
    if (element instanceof aas.types.SubmodelElementList) return EditorTypeOption.SubmodelElementList;

    return EditorTypeOption.Property;
  }

  private buildCopiedSmlChildIdShort(element: ISubmodelElement, siblings: ISubmodelElement[]): string {
    const typeName = aas.types.AasSubmodelElements[this.getTypeOf(element)] ?? 'Element';
    const baseIdShort = element.idShort?.trim() || `new${typeName}`;
    const siblingIdShorts = new Set(
      siblings.map((sibling) => sibling.idShort).filter((idShort): idShort is string => !!idShort),
    );

    let candidate = `copy_of_${baseIdShort}`;
    let suffix = 1;

    while (siblingIdShorts.has(candidate)) {
      candidate = `copy_of_${baseIdShort}_${suffix}`;
      suffix++;
    }

    return candidate;
  }

  private clearSubmodelElementValuesRecursive(element: ISubmodelElement): void {
    if (element instanceof aas.types.Property) {
      element.value = null;
      return;
    }

    if (element instanceof aas.types.MultiLanguageProperty) {
      element.value = null;
      return;
    }

    if (element instanceof aas.types.Range) {
      element.min = null;
      element.max = null;
      return;
    }

    if (element instanceof aas.types.ReferenceElement) {
      element.value = null;
      return;
    }

    if (element instanceof aas.types.File) {
      element.value = null;
      return;
    }

    if (element instanceof aas.types.Blob) {
      element.value = null;
      return;
    }

    if (element instanceof aas.types.RelationshipElement) {
      element.first = null;
      element.second = null;
      return;
    }

    if (element instanceof aas.types.SubmodelElementCollection) {
      element.value?.forEach((child) => this.clearSubmodelElementValuesRecursive(child));
      return;
    }

    if (element instanceof aas.types.SubmodelElementList) {
      element.value?.forEach((child) => this.clearSubmodelElementValuesRecursive(child));
      return;
    }

    if (element instanceof aas.types.Entity) {
      element.statements?.forEach((child) => this.clearSubmodelElementValuesRecursive(child));
      return;
    }

    if (element instanceof aas.types.Operation) {
      element.inputVariables?.forEach((variable) => this.clearSubmodelElementValuesRecursive(variable.value));
      element.outputVariables?.forEach((variable) => this.clearSubmodelElementValuesRecursive(variable.value));
      element.inoutputVariables?.forEach((variable) => this.clearSubmodelElementValuesRecursive(variable.value));
    }
  }

  async removeTemplateQualifiers() {
    const submodel = this.node?.data?.content;
    if (!(submodel instanceof aas.types.Submodel)) {
      return;
    }

    const confirmed = await this.confirmService.confirm({
      message: this.translate.instant('REMOVE_TEMPLATE_QUALIFIERS_Q'),
    });

    if (confirmed !== true) {
      return;
    }

    const removedQualifierCount =
      submodel.submodelElements?.reduce(
        (count, element) => count + this.removeTemplateQualifiersRecursive(element),
        0,
      ) ?? 0;

    if (removedQualifierCount > 0) {
      this.treeService.registerFieldUndoStep();
      this.treeService.aasTreeData = [...this.treeService.aasTreeData];
    }
  }

  private removeTemplateQualifiersRecursive(element: ISubmodelElement): number {
    let removedQualifierCount = this.removeTemplateQualifiersFromElement(element);

    if (element instanceof aas.types.SubmodelElementCollection) {
      removedQualifierCount +=
        element.value?.reduce((count, child) => count + this.removeTemplateQualifiersRecursive(child), 0) ?? 0;
    }

    if (element instanceof aas.types.SubmodelElementList) {
      removedQualifierCount +=
        element.value?.reduce((count, child) => count + this.removeTemplateQualifiersRecursive(child), 0) ?? 0;
    }

    if (element instanceof aas.types.Entity) {
      removedQualifierCount +=
        element.statements?.reduce((count, child) => count + this.removeTemplateQualifiersRecursive(child), 0) ?? 0;
    }

    if (element instanceof aas.types.Operation) {
      removedQualifierCount +=
        element.inputVariables?.reduce(
          (count, variable) => count + this.removeTemplateQualifiersRecursive(variable.value),
          0,
        ) ?? 0;
      removedQualifierCount +=
        element.outputVariables?.reduce(
          (count, variable) => count + this.removeTemplateQualifiersRecursive(variable.value),
          0,
        ) ?? 0;
      removedQualifierCount +=
        element.inoutputVariables?.reduce(
          (count, variable) => count + this.removeTemplateQualifiersRecursive(variable.value),
          0,
        ) ?? 0;
    }

    return removedQualifierCount;
  }

  private removeTemplateQualifiersFromElement(element: ISubmodelElement): number {
    if (element.qualifiers == null) {
      return 0;
    }

    const filteredQualifiers = element.qualifiers.filter(
      (qualifier) => qualifier.kind !== aas.types.QualifierKind.TemplateQualifier,
    );
    const removedQualifierCount = element.qualifiers.length - filteredQualifiers.length;

    element.qualifiers = filteredQualifiers.length > 0 ? filteredQualifiers : null;

    return removedQualifierCount;
  }

  isInsertSmlElementAllowed() {
    return this.node?.data?.editorType === EditorTypeOption.SubmodelElementList;
  }

  async getAddons(menu: Popover | TieredMenu) {
    const addonElements: MenuItem[] = [];
    try {
      if (this.node?.data != null) {
        AddonResolver.getAddons(this.node.data.content).forEach((el) => {
          switch (el) {
            case AddonType.ADDON_HANDOVERDOCUMENTATION_DOCUMENT:
              {
                addonElements.push({
                  label: this.translate.instant('DOCUMENT'),
                  data: el,
                  command: () => {
                    this.showAddonEditor(el);
                    menu.hide();
                  },
                });
              }
              break;
            case AddonType.CONTACT_INFORMATION:
              {
                addonElements.push({
                  label: this.translate.instant('CONTACT_INFORMATION'),
                  data: el,
                  command: () => {
                    this.showAddonEditor(el);
                    menu.hide();
                  },
                });
              }
              break;
            case AddonType.ADDON_CAPABILITY:
              {
                addonElements.push({
                  label: this.translate.instant('CAPABILITY'),
                  data: el,
                  command: () => {
                    this.showAddonEditor(el);
                    menu.hide();
                  },
                });
              }
              break;
          }
        });

        if (addonElements.length === 0) {
          addonElements.push({ label: this.translate.instant('NOTHING_AVAILABLE') });
        }

        return addonElements;
      }
    } catch {
      // ignorieren
    }
    return [{ label: this.translate.instant('NOTHING_AVAILABLE') }];
  }

  generatorService = inject(GeneratorService);
  showAddonEditor(addonType: AddonType) {
    switch (addonType) {
      case AddonType.ADDON_HANDOVERDOCUMENTATION_DOCUMENT:
        {
          const docs = this.node?.data?.content.submodelElements.filter((el: any) =>
            isDocumentationDocumentCollection(el),
          );
          const documentList = this.node?.data?.content?.submodelElements?.find(
            (el: any) =>
              el instanceof aas.types.SubmodelElementList &&
              SemanticIdHelper.hasSemanticId(el, HandoverSemantics.CONTAINER_V2),
          ) as aas.types.SubmodelElementList | undefined;
          const count = docs?.length ?? 0;
          this.ref = this.dialogService.open(HandoverdocumentationDocumentAddonComponent, {
            width: '75%',
            contentStyle: { overflow: 'auto' },
            baseZIndex: 10000,
            maximizable: true,
            header: this.translate.instant('ADD_DOCUMENT'),
            closable: true,
            modal: true,
            data: { count },
          });

          this.ref?.onClose.subscribe((documentItem: DocumentItem) => {
            if (documentItem != null) {
              const requiredSemanticIds: string[] = [];
              const doc = createDocumentationDocument(
                count,
                requiredSemanticIds,
                documentItem,
                this.portalService.currentLanguage,
                documentList != null ? getDocumentationDocumentSemanticIdForHost(documentList) : undefined,
              );

              if (documentList != null) {
                documentList.typeValueListElement = aas.types.AasSubmodelElements.SubmodelElementCollection;
                if (documentList.value == null) {
                  documentList.value = [];
                }
                documentList.value.push(doc);
                this.treeService.refreshWholeTree();
              } else {
                this.insertElement(doc, EditorTypeOption.SubmodelElementCollection);
              }
              const numberOfDocuments = this.node?.data?.content.submodelElements.find(
                (el: any) => SemanticIdHelper.hasSemanticId(el, '0173-1#02-ABH990#001') === true,
              );
              if (numberOfDocuments != null) {
                numberOfDocuments.value = (count + 1).toString();
              }
              if (documentItem.file != null) {
                const sanitizedFilename = FilenameHelper.sanitizeFilename(documentItem.file?.name ?? 'newFile');
                // Dokument in die Files übertragen
                const newSupplFile: SupplementalFile = {
                  path: sanitizedFilename,
                  filename: sanitizedFilename,
                  fileApiUrl: '',
                  fileUrl: null,
                  fileResourceUrl: URL.createObjectURL(documentItem.file),
                  contentType: FilenameHelper.getContentType(documentItem.file),
                  file: documentItem.file,
                  isLoaded: true,
                  isLoading: false,
                  isLocal: true,
                  fileData: documentItem.file,
                  id: null,
                  isThumbnail: false,
                };
                this.shellResult?.supplementalFiles.push(newSupplFile);

                this.shellResult?.addedFiles.push(newSupplFile);
                this.treeService.addFileNode(newSupplFile);
              }
            }
          });
        }
        break;
      case AddonType.CONTACT_INFORMATION:
        {
          this.ref = this.dialogService.open(ContactInformationAddonComponent, {
            width: '75%',
            contentStyle: { overflow: 'auto' },
            baseZIndex: 10000,
            maximizable: true,
            header: this.translate.instant('ADD_CONTACT_INFORMATION'),
            closable: true,
            modal: true,
          });

          this.ref?.onClose.subscribe((contactInfoItem: SubmodelElementCollection) => {
            if (contactInfoItem != null) {
              const _requiredSemanticIds: string[] = [];
              // const contactInfo = this.generatorService.createContactInformation(count, requiredSemanticIds, documentItem);
              // alle zurückgelieferten Elemente einfügen
              contactInfoItem.value?.forEach((element) => {
                if (element instanceof aas.types.SubmodelElementCollection) {
                  this.insertElement(element, EditorTypeOption.SubmodelElementCollection);
                }
                if (element instanceof aas.types.Property) {
                  this.insertElement(element, EditorTypeOption.Property);
                }
                if (element instanceof aas.types.MultiLanguageProperty) {
                  this.insertElement(element, EditorTypeOption.MultiLanguageProperty);
                }
              });
            }
          });
        }
        break;
      case AddonType.ADDON_CAPABILITY:
        {
          const targetNode = this.ensureCapabilitySetNode();
          if (targetNode == null) {
            return;
          }

          const count = this.countCapabilityContainers(targetNode);
          this.ref = this.dialogService.open(CapabilityAddonComponent, {
            width: '75%',
            contentStyle: { overflow: 'auto' },
            baseZIndex: 10000,
            maximizable: true,
            header: this.translate.instant('ADD_CAPABILITY'),
            closable: true,
            modal: true,
            data: {
              count,
              currentLanguage: this.portalService.currentLanguage,
              currentSubmodelId: this.getCurrentSubmodelId(),
              availableCapabilityRefs: this.collectAvailableCapabilityRefs(targetNode),
            },
          });

          this.ref?.onClose.subscribe((capabilityContainer: aas.types.SubmodelElementCollection | null) => {
            if (capabilityContainer != null) {
              this.insertElementInTargetNode(
                targetNode,
                capabilityContainer,
                EditorTypeOption.SubmodelElementCollection,
              );
            }
          });
        }
        break;
    }
  }

  private insertElementInTargetNode(
    targetNode: TreeNode<V3TreeItem<any>>,
    element: aas.types.ISubmodelElement,
    editorType: EditorTypeOption,
  ) {
    const previousNode = this.node;
    this.node = targetNode;
    this.insertElement(element, editorType);
    this.node = previousNode;
  }

  private countCapabilityContainers(targetNode: TreeNode<V3TreeItem<any>>): number {
    const content = targetNode.data?.content;
    if (!(content instanceof aas.types.SubmodelElementCollection)) {
      return 0;
    }
    const elements = content.value ?? [];
    return elements.filter((el) =>
      SemanticIdHelper.hasSemanticId(el, 'https://admin-shell.io/idta/CapabilityDescription/CapabilityContainer/1/0'),
    ).length;
  }

  private collectAvailableCapabilityRefs(targetNode: TreeNode<V3TreeItem<any>>): string[] {
    const content = targetNode.data?.content;
    if (!(content instanceof aas.types.SubmodelElementCollection)) {
      return [];
    }
    const refs: string[] = [];
    for (const element of content.value ?? []) {
      if (!(element instanceof aas.types.SubmodelElementCollection)) {
        continue;
      }
      if (
        !SemanticIdHelper.hasSemanticId(
          element,
          'https://admin-shell.io/idta/CapabilityDescription/CapabilityContainer/1/0',
        )
      ) {
        continue;
      }
      const capabilityElement = element.value?.find((child) =>
        SemanticIdHelper.hasSemanticId(child, 'https://admin-shell.io/idta/CapabilityDescription/Capability/1/0'),
      );
      const idShort = capabilityElement?.idShort?.trim();
      if (idShort != null && idShort !== '') {
        refs.push(idShort);
      }
    }
    return refs;
  }

  private ensureCapabilitySetNode(): TreeNode<V3TreeItem<any>> | null {
    if (this.node?.data?.content == null) {
      return null;
    }

    if (
      this.node.data.content instanceof aas.types.SubmodelElementCollection &&
      SemanticIdHelper.hasSemanticId(
        this.node.data.content,
        'https://admin-shell.io/idta/CapabilityDescription/CapabilitySet/1/0',
      )
    ) {
      return this.node as TreeNode<V3TreeItem<any>>;
    }

    if (
      this.node.data.content instanceof aas.types.Submodel &&
      SemanticIdHelper.hasSemanticId(
        this.node.data.content,
        'https://admin-shell.io/idta/SubmodelTemplate/CapabilityDescription/1/0',
      )
    ) {
      const existingNode = this.node.children?.find(
        (child) =>
          child.data?.content instanceof aas.types.SubmodelElementCollection &&
          SemanticIdHelper.hasSemanticId(
            child.data.content,
            'https://admin-shell.io/idta/CapabilityDescription/CapabilitySet/1/0',
          ),
      );
      if (existingNode != null) {
        return existingNode as TreeNode<V3TreeItem<any>>;
      }

      const capabilitySet = new aas.types.SubmodelElementCollection(null, null, 'CapabilitySet');
      capabilitySet.semanticId = new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
        new aas.types.Key(
          aas.types.KeyTypes.GlobalReference,
          'https://admin-shell.io/idta/CapabilityDescription/CapabilitySet/1/0',
        ),
      ]);
      capabilitySet.value = [];
      this.insertElement(capabilitySet, EditorTypeOption.SubmodelElementCollection);
      const createdNode = this.node.children?.find((child) => child.data?.content === capabilitySet);
      return (createdNode as TreeNode<V3TreeItem<any>> | undefined) ?? null;
    }

    return null;
  }

  private getCurrentSubmodelId(): string {
    let currentNode: V3TreeItem<any> | undefined = this.node?.data;
    while (currentNode != null) {
      if (currentNode.content instanceof aas.types.Submodel) {
        return currentNode.content.id ?? '';
      }
      currentNode = currentNode.parent ?? undefined;
    }
    return '';
  }

  isInsertAllowed(sourceType: CMTypeOption) {
    if (this.node?.data != null) {
      switch (this.node.data.editorType) {
        case EditorTypeOption.AssetAdministrationShell:
          return (
            sourceType === CMTypeOption.Submodel ||
            sourceType === CMTypeOption.SnippetGroup ||
            sourceType === CMTypeOption.AddGroup ||
            sourceType === CMTypeOption.SMFromJson ||
            sourceType === CMTypeOption.Addon
          );
        case EditorTypeOption.Submodel:
        case EditorTypeOption.SubmodelElementCollection:
        case EditorTypeOption.Entity:
          // case EditorTypeOption.SubmodelElementList:
          return (
            sourceType === CMTypeOption.SubmodelElementCollection ||
            sourceType === CMTypeOption.SubmodelElementList ||
            sourceType === CMTypeOption.File ||
            sourceType === CMTypeOption.Blob ||
            sourceType === CMTypeOption.Property ||
            sourceType === CMTypeOption.Operation ||
            sourceType === CMTypeOption.Range ||
            sourceType === CMTypeOption.Entity ||
            sourceType === CMTypeOption.ReferenceElement ||
            sourceType === CMTypeOption.MultiLanguageProperty ||
            sourceType === CMTypeOption.RelationshipElement ||
            sourceType === CMTypeOption.ElementGroup ||
            sourceType === CMTypeOption.SnippetGroup ||
            sourceType === CMTypeOption.ContactInformation ||
            sourceType === CMTypeOption.AddGroup ||
            sourceType === CMTypeOption.OptionalElements ||
            sourceType === CMTypeOption.ElFromJson ||
            sourceType === CMTypeOption.Addon
          );
        case EditorTypeOption.AssetAdministrationShells:
          return (
            sourceType === CMTypeOption.AssetAdministrationShell ||
            // sourceType === CMTypeOption.SnippetGroup ||
            sourceType === CMTypeOption.AddGroup ||
            sourceType === CMTypeOption.Addon
          );
        case EditorTypeOption.Assets:
          return (
            sourceType === CMTypeOption.Asset ||
            sourceType === CMTypeOption.SnippetGroup ||
            sourceType === CMTypeOption.ElementGroup ||
            sourceType === CMTypeOption.AddGroup ||
            sourceType === CMTypeOption.Addon
          );
        case EditorTypeOption.ConceptDescriptions:
          return (
            sourceType === CMTypeOption.ConceptDescription ||
            sourceType === CMTypeOption.SnippetGroup ||
            sourceType === CMTypeOption.ElementGroup ||
            sourceType === CMTypeOption.AddGroup ||
            sourceType === CMTypeOption.CdFromJson
          );
      }
    }
    return false;
  }

  isDeleteAllowed() {
    if (this.node?.data != null) {
      switch (this.node.data.editorType) {
        case EditorTypeOption.AssetAdministrationShell:
        case EditorTypeOption.Submodel:
        case EditorTypeOption.SubmodelElementCollection:
        case EditorTypeOption.SubmodelElementList:
        case EditorTypeOption.Entity:
        case EditorTypeOption.ConceptDescription:
        case EditorTypeOption.Property:
        case EditorTypeOption.MultiLanguageProperty:
        case EditorTypeOption.RelationshipElement:
        case EditorTypeOption.Operation:
        case EditorTypeOption.Range:
        case EditorTypeOption.ReferenceElement:
        case EditorTypeOption.File:
        case EditorTypeOption.Blob:
        case EditorTypeOption.Capability:
        case EditorTypeOption.SupplementalFile:
          return true;
      }
    }
    return false;
  }

  isRemoveTemplateQualifiersAllowed() {
    if (this.node?.data?.editorType !== EditorTypeOption.Submodel) {
      return false;
    }

    return (
      this.node.data.content instanceof aas.types.Submodel &&
      this.node.data.content.kind !== aas.types.ModellingKind.Template
    );
  }

  isSaveAsAllowed() {
    if (this.node?.data != null) {
      switch (this.node.data.editorType) {
        // case EditorTypeOption.AssetAdministrationShell: // aktuell unterbinden, hier muss ein gutes konzept her, auch die referenz zu speichern
        case EditorTypeOption.Submodel:
        case EditorTypeOption.SubmodelElementCollection:
        case EditorTypeOption.SubmodelElementList:
        case EditorTypeOption.Entity:
        case EditorTypeOption.ConceptDescription:
        case EditorTypeOption.Property:
        case EditorTypeOption.MultiLanguageProperty:
        case EditorTypeOption.RelationshipElement:
        case EditorTypeOption.Operation:
        case EditorTypeOption.Range:
        case EditorTypeOption.ReferenceElement:
        case EditorTypeOption.File:
        case EditorTypeOption.Blob:
        case EditorTypeOption.Capability:
          return true;
      }
    }
    return false;
  }

  isCopyAllowed() {
    if (this.node?.data != null) {
      switch (this.node.data.editorType) {
        case EditorTypeOption.AssetAdministrationShell:
        case EditorTypeOption.Submodel:
        case EditorTypeOption.SubmodelElementCollection:
        case EditorTypeOption.SubmodelElementList:
        case EditorTypeOption.Entity:
        case EditorTypeOption.ConceptDescription:
        case EditorTypeOption.Property:
        case EditorTypeOption.MultiLanguageProperty:
        case EditorTypeOption.RelationshipElement:
        case EditorTypeOption.Operation:
        case EditorTypeOption.Range:
        case EditorTypeOption.ReferenceElement:
        case EditorTypeOption.File:
        case EditorTypeOption.Blob:
        case EditorTypeOption.Capability:
          return true;
      }
    }
    return false;
  }

  getAllowedTypes(targetType: EditorTypeOption) {
    switch (targetType) {
      case EditorTypeOption.AssetAdministrationShell:
        return [EditorTypeOption.Submodel];
      case EditorTypeOption.Submodel:
      case EditorTypeOption.SubmodelElementCollection:
      case EditorTypeOption.Entity:
        return [
          EditorTypeOption.SubmodelElementCollection,
          EditorTypeOption.File,
          EditorTypeOption.Property,
          EditorTypeOption.Operation,
          EditorTypeOption.Entity,
          EditorTypeOption.ReferenceElement,
          EditorTypeOption.MultiLanguageProperty,
          EditorTypeOption.RelationshipElement,
          EditorTypeOption.ContactInformation,
        ];
      case EditorTypeOption.AssetAdministrationShells:
        return [EditorTypeOption.AssetAdministrationShell];
      case EditorTypeOption.ConceptDescriptions:
        return [EditorTypeOption.ConceptDescription];
      default:
        return [];
    }
  }

  isPasteAllowed() {
    if (this.node?.data != null && this.copiedElement != null) {
      switch (this.node.data.editorType) {
        case EditorTypeOption.AssetAdministrationShells:
          return this.copiedElement.editorType === EditorTypeOption.AssetAdministrationShell;
        case EditorTypeOption.AssetAdministrationShell:
          return this.copiedElement.editorType === EditorTypeOption.Submodel;
        case EditorTypeOption.Submodel:
        case EditorTypeOption.SubmodelElementCollection:
        case EditorTypeOption.SubmodelElementList:
        case EditorTypeOption.Entity:
          return (
            this.copiedElement.editorType === EditorTypeOption.SubmodelElementCollection ||
            this.copiedElement.editorType === EditorTypeOption.SubmodelElementList ||
            this.copiedElement.editorType === EditorTypeOption.Entity ||
            this.copiedElement.editorType === EditorTypeOption.File ||
            this.copiedElement.editorType === EditorTypeOption.Property ||
            this.copiedElement.editorType === EditorTypeOption.Operation ||
            this.copiedElement.editorType === EditorTypeOption.ReferenceElement ||
            this.copiedElement.editorType === EditorTypeOption.MultiLanguageProperty ||
            this.copiedElement.editorType === EditorTypeOption.RelationshipElement
          );
        case EditorTypeOption.ConceptDescriptions:
          return this.copiedElement.editorType === EditorTypeOption.ConceptDescription;
      }
    }
    return false;
  }

  initTemplates() {
    this.availableSubmodels = [];

    this.availableSubmodels.push({
      label: this.translate.instant('OTHER'),
      submodels: [
        {
          label: 'CUSTOM',
          submodelVersion: '',
          translatedLabel: this.translate.instant('CUSTOM'),
          description: 'CUSTOM_DESC',
          createElement: CMTypeOption.Submodel,
          group: 'OTHER',
          id: 0,
        },
      ],
    });

    const submodelsIdta: AvailableSubmodel[] = [];
    this.availableSubmodels.push({
      label: 'integrierte Vorlagen',
      submodels: submodelsIdta,
    });

    for (const tpl of this.availableSubmodelTemplates.filter((t) => t.group === 'IDTA' || t.group === '')) {
      submodelsIdta.push({
        label: tpl.label,
        submodelVersion: tpl.submodelVersion,
        translatedLabel: this.translate.instant(tpl.label),
        description: tpl.label + '_DESC',
        createElement: CMTypeOption.SubmodelTemplate,
        group: tpl.group,
        id: tpl.id ?? 0,
      });
    }
    submodelsIdta.sort((a, b) => a.label.localeCompare(b.label));

    this.availableSubmodels.push({
      label: 'IDTA (live from Repo)',
      id: 'IdtaSmtRepo',
      submodels: [],
    });
  }

  createElement(type: CMTypeOption, id: string = '') {
    switch (type) {
      case CMTypeOption.ConceptDescription:
        {
          this.insertConceptDescription();
        }
        break;
      case CMTypeOption.Submodel:
        {
          this.insertCustomSubmodel();
        }
        break;
      case CMTypeOption.SubmodelTemplate:
        {
          this.insertSubmodelTemplate(id);
        }
        break;
      case CMTypeOption.RepoSubmodelTemplate:
        {
          this.insertRepoSubmodelTemplate(id);
        }
        break;
      case CMTypeOption.ContactInformation:
        {
          this.insertContactInformationTemplate();
        }
        break;
      case CMTypeOption.Property:
        {
          const prop = new aas.types.Property(aas.types.DataTypeDefXsd.String);
          prop.idShort = 'newProperty';
          this.insertElement(prop, EditorTypeOption.Property);
        }
        break;
      case CMTypeOption.MultiLanguageProperty:
        {
          const prop = new aas.types.MultiLanguageProperty();
          prop.idShort = 'newMultilanguageProperty';
          this.insertElement(prop, EditorTypeOption.MultiLanguageProperty);
        }
        break;
      case CMTypeOption.SubmodelElementCollection:
        {
          const prop = new aas.types.SubmodelElementCollection();
          prop.idShort = 'newSubmodelElementCollection';
          this.insertElement(prop, EditorTypeOption.SubmodelElementCollection);
        }
        break;
      case CMTypeOption.SubmodelElementList:
        {
          // erstmal mit property anlegen, kann der Benutzer später ändern
          const prop = new aas.types.SubmodelElementList(aas.types.AasSubmodelElements.Property);
          prop.idShort = 'newSubmodelElementList';
          this.insertElement(prop, EditorTypeOption.SubmodelElementList);
        }
        break;
      case CMTypeOption.File:
        {
          const prop = new aas.types.File();
          prop.contentType = 'application/unknown';
          prop.idShort = 'newFile';
          this.insertElement(prop, EditorTypeOption.File);
        }
        break;
      case CMTypeOption.Operation:
        {
          const prop = new aas.types.Operation();
          prop.idShort = 'newOperation';
          this.insertElement(prop, EditorTypeOption.Operation);
        }
        break;
      case CMTypeOption.Entity:
        {
          const prop = new aas.types.Entity();
          prop.entityType = aas.types.EntityType.SelfManagedEntity;
          prop.idShort = 'newEntity';
          this.insertElement(prop, EditorTypeOption.Entity);
        }
        break;
      case CMTypeOption.Range:
        {
          const prop = new aas.types.Range(aas.types.DataTypeDefXsd.String);
          prop.idShort = 'newRange';
          this.insertElement(prop, EditorTypeOption.Range);
        }
        break;
      case CMTypeOption.ReferenceElement:
        {
          const prop = new aas.types.ReferenceElement();
          prop.idShort = 'newReferenceElement';
          this.insertElement(prop, EditorTypeOption.ReferenceElement);
        }
        break;
      case CMTypeOption.RelationshipElement:
        {
          const prop = new aas.types.RelationshipElement();
          prop.first = new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, []);
          prop.second = new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, []);
          prop.idShort = 'newRelationshipElement';
          this.insertElement(prop, EditorTypeOption.RelationshipElement);
        }
        break;
      case CMTypeOption.Blob:
        {
          const prop = new aas.types.Blob();
          prop.contentType = '';
          prop.idShort = 'newBlob';
          this.insertElement(prop, EditorTypeOption.Blob);
        }
        break;
      case CMTypeOption.Capability:
        {
          const prop = new aas.types.Capability();
          prop.idShort = 'newCapability';
          this.insertElement(prop, EditorTypeOption.Capability);
        }
        break;
      default:
        throw new Error(` ${type} Not implemented yet`);
    }
    this.treeService.aasTreeData = [...this.treeService.aasTreeData];
  }

  async insertSubmodelTemplate(templateId: string) {
    const template = await this.editorService.getTemplate(+templateId);

    if (this.conceptDescriptionsRootNode != null)
      ElementInserter.insertSubmodelTemplate(
        this.node as TreeNode,
        template,
        this.treeService,
        this.conceptDescriptionsRootNode,
        this.shellResult,
        this.portalService.iriPrefix,
      );
  }

  async insertRepoSubmodelTemplate(templateUrl: string) {
    const knownConceptDescriptionIds =
      this.shellResult?.v3Shell?.conceptDescriptions
        ?.map((conceptDescription) => conceptDescription.id)
        .filter((conceptDescriptionId) => conceptDescriptionId != null && conceptDescriptionId !== '') ?? [];
    const template = await this.editorService.getRepoSubmodelTemplate(templateUrl, knownConceptDescriptionIds);

    if (this.conceptDescriptionsRootNode != null)
      ElementInserter.insertSubmodelTemplate(
        this.node as TreeNode,
        template,
        this.treeService,
        this.conceptDescriptionsRootNode,
        this.shellResult,
        this.portalService.iriPrefix,
      );
  }

  async insertContactInformationTemplate() {
    const template = await this.editorService.getTemplateByName(
      'contactInformations',
      // 'https://admin-shell.io/zvei/nameplate/1/0/ContactInformations',
      'https://admin-shell.io/idta/SubmodelTemplate/ContactInformation/1/0',
    );

    if (this.node != null) {
      if (this.node.data?.content != null) {
        if (this.node.data.content.value == null) {
          this.node.data.content.value = [];
        }

        for (const submodel of template.v3Submodels) {
          if (submodel.submodelElements == null) continue;
          this.node.data.content.value.push(submodel.submodelElements[0]);

          const id = uuid();
          // treenode erzeugen für Collection
          const propNodeData = new V3TreeItem<aas.types.SubmodelElementCollection>();
          propNodeData.content = submodel.submodelElements[0] as SubmodelElementCollection;
          propNodeData.id = id;
          propNodeData.editorType = EditorTypeOption.Submodel;
          propNodeData.parent = this.node.data;
          const coontactNode: TreeNode<V3TreeItem<aas.types.SubmodelElementCollection>> = {
            label: submodel?.idShort ?? submodel.id,
            data: propNodeData,
            children: [],
            parent: this.node,
            key: id,
            expanded: false,
          };
          if (this.node.children == null) {
            this.node.children = [];
          }
          this.node.children.push(coontactNode);
          this.treeService.buildChildTree(
            (submodel.submodelElements[0] as aas.types.SubmodelElementCollection).value,
            coontactNode,
          );
          setTimeout(() => this.treeService.selectById(id));
        }
        // konzeptbeschreibungen anhängen

        for (const conceptDescription of template.v3ConceptDescriptions) {
          if (this.shellResult?.v3Shell == null) break;
          if (this.shellResult.v3Shell.conceptDescriptions == null) {
            this.shellResult.v3Shell.conceptDescriptions = [];
          }
          this.shellResult.v3Shell.conceptDescriptions.push(conceptDescription);

          const id = uuid();
          // treenode erzeugen für Submodel(ref)
          const propNodeData = new V3TreeItem<aas.types.ConceptDescription>();
          propNodeData.content = conceptDescription;
          propNodeData.id = id;
          propNodeData.editorType = EditorTypeOption.Submodel;
          propNodeData.parent = this.node.data;
          const shellNode: TreeNode<V3TreeItem<aas.types.ConceptDescription>> = {
            label: conceptDescription?.idShort ?? conceptDescription.id,
            data: propNodeData,
            children: [],
            parent: this.node,
            key: id,
            expanded: false,
          };
          if (this.node.children == null) {
            this.node.children = [];
          }
          if (this.conceptDescriptionsRootNode != null && this.conceptDescriptionsRootNode.children == null)
            this.conceptDescriptionsRootNode.children = [];
          this.conceptDescriptionsRootNode?.children?.push(shellNode);
        }
      }
    }
  }

  insertCustomSubmodel() {
    if (this.node != null) {
      // && this.allSubmodelsNode != null) {
      if (this.node.data?.content != null) {
        if (this.node.data.content.submodelElements == null) {
          this.node.data.content.submodelElements = [];
        }
        const submodel = new aas.types.Submodel('newSubmodel');
        submodel.idShort = 'newSubmodel';

        const submodelRef = new aas.types.Reference(aas.types.ReferenceTypes.ModelReference, [
          new aas.types.Key(aas.types.KeyTypes.Submodel, submodel.id),
        ]);
        if (this.node.data.content.submodels == null) {
          this.node.data.content.submodels = [];
        }
        this.node.data.content.submodels.push(submodelRef);

        this.shellResult?.v3Shell?.submodels?.push(submodel);

        const id = uuid();
        // treenode erzeugen für Submodel(ref)
        const propNodeData = new V3TreeItem<aas.types.Submodel>();
        propNodeData.content = submodel;
        propNodeData.id = id;
        propNodeData.editorType = EditorTypeOption.Submodel;
        propNodeData.parent = this.node.data;
        const shellNode: TreeNode<V3TreeItem<aas.types.Submodel>> = {
          label: submodel?.idShort ?? submodel.id,
          data: propNodeData,
          children: [],
          parent: this.node,
          key: id,
          expanded: false,
        };
        if (this.node.children == null) {
          this.node.children = [];
        }
        this.node.children.push(shellNode);
        this.node.expanded = true;
        this.treeService.aasTreeData = [...this.treeService.aasTreeData];
        setTimeout(() => {
          this.treeService.editorComponent?.requestEditModeForNextSelection();
          this.treeService.selectById(id);
        });
      }
    }
  }

  insertSubmodelRef(submodel: Submodel) {
    if (this.node != null) {
      // && this.allSubmodelsNode != null) {
      if (this.node.data?.content != null) {
        if (this.node.data.content.submodelElements == null) {
          this.node.data.content.submodelElements = [];
        }

        const submodelRef = new aas.types.Reference(aas.types.ReferenceTypes.ModelReference, [
          new aas.types.Key(aas.types.KeyTypes.Submodel, submodel.id),
        ]);
        if (this.node.data.content.submodels == null) {
          this.node.data.content.submodels = [];
        }
        this.node.data.content.submodels.push(submodelRef);

        this.shellResult?.v3Shell?.submodels?.push(submodel);

        const id = uuid();
        // treenode erzeugen für Submodel(ref)
        const propNodeData = new V3TreeItem<aas.types.Submodel>();
        propNodeData.content = submodel;
        propNodeData.id = id;
        propNodeData.editorType = EditorTypeOption.Submodel;
        propNodeData.parent = this.node.data;
        const shellNode: TreeNode<V3TreeItem<aas.types.Submodel>> = {
          label: submodel?.idShort ?? submodel.id,
          data: propNodeData,
          children: [],
          parent: this.node,
          key: id,
          expanded: false,
        };
        if (this.node.children == null) {
          this.node.children = [];
        }
        this.node.children.push(shellNode);
        this.treeService.buildChildTree(submodel.submodelElements, shellNode);
        this.node.expanded = true;
        this.treeService.aasTreeData = [...this.treeService.aasTreeData];
        setTimeout(() => {
          this.treeService.editorComponent?.requestEditModeForNextSelection();
          this.treeService.selectById(id);
        });
      }
    }
  }

  insertConceptDescription() {
    if (this.node != null) {
      if (this.node.data != null) {
        if (this.node.data.content.conceptDescriptions == null) {
          this.node.data.content.conceptDescriptions = [];
        }
        const cd = new aas.types.ConceptDescription('empty');
        this.node.data.content.conceptDescriptions.push(cd);
        const id = uuid();
        // treenode erzeugen
        const cdData = new V3TreeItem<aas.types.ConceptDescription>();

        cdData.content = cd;
        cdData.id = id;
        cdData.editorType = EditorTypeOption.ConceptDescription;
        cdData.parent = this.node.data;

        const cdNode: TreeNode<V3TreeItem<aas.types.ConceptDescription> | V3TreeItem<PackageMetadata>> = {
          label: cd?.idShort ?? cd.id,
          data: cdData,
          children: [],
          parent: this.node,
          key: id,
          expanded: false,
        };
        if (this.node.children == null) {
          this.node.children = [];
        }
        this.node.children.push(cdNode);
        this.node.expanded = true;
        this.treeService.aasTreeData = [...this.treeService.aasTreeData];
        setTimeout(() => this.treeService.selectById(id));
      }
    }
  }

  insertElement(
    element: aas.types.ISubmodelElement,
    editorType: EditorTypeOption,
    mode: 'copy' | 'reference' | null = null,
  ) {
    if (this.node != null) {
      this.addToContent(element, mode);

      const id = uuid();
      const propNodeData = new V3TreeItem<any>();
      propNodeData.content = element;
      propNodeData.id = id;
      propNodeData.editorType = editorType;
      propNodeData.parent = this.node.data;

      const propNode: TreeNode<V3TreeItem<any>> = {
        label: element?.idShort ?? '??',
        data: propNodeData,
        children: [],
        parent: this.node,
        key: id,
        expanded: false,
      };
      if (this.node.children == null) {
        this.node.children = [];
      }
      this.node.children.push(propNode);
      switch (editorType) {
        case EditorTypeOption.SubmodelElementCollection:
          this.treeService.buildChildTree((propNode.data?.content as SubmodelElementCollection).value, propNode);
          break;
        case EditorTypeOption.SubmodelElementList:
          this.treeService.buildChildTree((propNode.data?.content as SubmodelElementList).value, propNode);
          break;
        case EditorTypeOption.Submodel:
          this.treeService.buildChildTree((propNode.data?.content as Submodel).submodelElements, propNode);
          break;
        case EditorTypeOption.AssetAdministrationShell:
          {
            const currentAas = propNode.data?.content as AssetAdministrationShell;
            currentAas.submodels?.forEach((smRef) => {
              const sm = this.shellResult?.v3Shell?.submodels?.find((s) => s.id === smRef.keys[0].value);
              this.treeService.buildChildTree([sm], propNode);
            });
          }
          break;
        case EditorTypeOption.Entity:
          this.treeService.buildChildTree((propNode.data?.content as Entity).statements, propNode);
          break;
        default:
          // eslint-disable-next-line no-console
          console.log('Unsupported editor type for buildChildTree', editorType);
      }
      this.node.expanded = true;
      this.treeService.aasTreeData = [...this.treeService.aasTreeData];
      setTimeout(() => this.treeService.selectById(id));
    }
  }

  addToContent(elem: any, mode: 'copy' | 'reference' | null = null) {
    if (this.node == null) return;

    if (this.node.data?.content instanceof PackageMetadata) {
      if (mode === 'copy') {
        const shell = elem as aas.types.AssetAdministrationShell;
        const smRefs: aas.types.Reference[] = [];
        shell.submodels?.forEach((smRef) => {
          const sm = this.shellResult?.v3Shell?.submodels?.find((s) => s.id === smRef.keys[0].value);
          const smCopy = cloneDeep(sm);
          if (smCopy != null) {
            smCopy.id = uuid();
            this.shellResult?.v3Shell?.submodels?.push(smCopy);
            const submodelRef = new aas.types.Reference(aas.types.ReferenceTypes.ModelReference, [
              new aas.types.Key(aas.types.KeyTypes.Submodel, smCopy.id),
            ]);
            smRefs.push(submodelRef);
          }
        });
        shell.submodels = smRefs;
        this.node.data.content.fullData?.assetAdministrationShells?.push(shell);
      } else {
        this.node.data.content.fullData?.assetAdministrationShells?.push(elem);
      }
    }
    if (this.node.data?.content instanceof aas.types.AssetAdministrationShell) {
      if (this.node.data?.content?.submodels == null) {
        this.node.data.content.submodels = [];
      }
      if (mode === 'copy') {
        const id = uuid();
        const submodelRef = new aas.types.Reference(aas.types.ReferenceTypes.ModelReference, [
          new aas.types.Key(aas.types.KeyTypes.Submodel, id),
        ]);
        this.node.data.content.submodels.push(submodelRef);
        (elem as any).id = id;
        this.shellResult?.v3Shell?.submodels?.push(elem);
      } else {
        const submodelRef = new aas.types.Reference(aas.types.ReferenceTypes.ModelReference, [
          new aas.types.Key(aas.types.KeyTypes.Submodel, (elem as any).id),
        ]);
        this.node.data.content.submodels.push(submodelRef);
      }
    }
    if (this.node.data?.content instanceof aas.types.Submodel) {
      if (this.node.data?.content?.submodelElements == null) {
        this.node.data.content.submodelElements = [];
      }
      this.node.data.content.submodelElements.push(elem);
    }
    if (this.node.data?.content instanceof aas.types.SubmodelElementCollection) {
      if (this.node.data?.content.value == null) {
        this.node.data.content.value = [];
      }
      this.node.data.content.value.push(elem);
    }
    if (this.node.data?.content instanceof aas.types.SubmodelElementList) {
      if (this.node.data?.content.value == null) {
        this.node.data.content.value = [];
      }
      this.node.data.content.value.push(elem);
    }
    if (this.node.data?.content instanceof aas.types.Entity) {
      if (this.node.data?.content.statements == null) {
        this.node.data.content.statements = [];
      }
      this.node.data.content.statements.push(elem);
    }
  }

  removeFromContent() {
    if (this.node == null) return;

    if (this.node.data?.parent?.content instanceof aas.types.Submodel) {
      const indx = this.node.data.parent.content.submodelElements?.indexOf(this.node.data.content);
      if (indx != null && indx > -1) {
        this.node.data.parent.content.submodelElements?.splice(indx, 1);
      }
    }
    if (this.node.data?.parent?.content instanceof aas.types.SubmodelElementCollection) {
      const indx = this.node.data.parent.content.value?.indexOf(this.node.data.content);
      if (indx != null && indx > -1) {
        this.node.data.parent.content.value?.splice(indx, 1);
      }
    }
    if (this.node.data?.parent?.content instanceof aas.types.SubmodelElementList) {
      const indx = this.node.data.parent.content.value?.indexOf(this.node.data.content);
      if (indx != null && indx > -1) {
        this.node.data.parent.content.value?.splice(indx, 1);
      }
    }
    if (this.node.data?.parent?.content instanceof aas.types.Entity) {
      const indx = this.node.data.parent.content.statements?.indexOf(this.node.data.content);
      if (indx != null && indx > -1) {
        this.node.data.parent.content.statements?.splice(indx, 1);
      }
    }
  }

  removeConceptDescription() {
    if (this.node == null) return;

    const indx = (
      this.conceptDescriptionsRootNode?.data?.content as ConceptDescriptionRoot
    )?.conceptDescriptions?.indexOf(this.node.data?.content);
    if (indx != null && indx > -1) {
      (this.conceptDescriptionsRootNode?.data?.content as ConceptDescriptionRoot)?.conceptDescriptions?.splice(indx, 1);
    }
    // treeNode löschen
    this.conceptDescriptionsRootNode?.children?.splice(
      this.conceptDescriptionsRootNode?.children?.indexOf(this.node),
      1,
    );
  }

  removeSubmodel(keepSm: boolean) {
    if (this.node != null && this.shellResult != null) {
      this.shellResult.v3Shell?.assetAdministrationShells?.forEach((s) => {
        s.submodels?.forEach((sm) => {
          const smRef = sm.keys.find((k) => k.value === this.node?.data?.content.id);
          if (smRef != null) {
            s.submodels?.splice(s.submodels.indexOf(sm), 1);
          }
        });
      });

      this.shellResult.deletedSubmodels.push(this.node.data?.content.id);

      if (!keepSm) {
        const indx = this.shellResult.v3Shell?.submodels?.indexOf(this.node.data?.content);
        if (indx != null && indx > -1) {
          this.shellResult.v3Shell?.submodels?.splice(indx, 1);
        }
      }

      // treeNode löschen
      this.node.parent?.children?.splice(this.node.parent.children?.indexOf(this.node), 1);
      this.treeService?.selectById(this.node.parent?.data?.id ?? '');
    }
  }

  removeShell() {
    if (this.node != null && this.shellResult != null) {
      this.shellResult.v3Shell?.assetAdministrationShells?.splice(
        this.shellResult.v3Shell.assetAdministrationShells.indexOf(this.node.data?.content),
        1,
      );
      this.node.parent?.children?.splice(this.node.parent.children?.indexOf(this.node), 1);
      this.treeService?.selectById(this.node.parent?.data?.id ?? '');
    }
  }

  async deleteNode() {
    if ((await this.confirmService.confirm({ message: this.translate.instant('DELETE_ELEMENT_Q') })) === true) {
      // parent element suchen zum späteren selektieren
      const parent = this.node?.parent;
      switch (this.node?.data?.editorType) {
        case EditorTypeOption.AssetAdministrationShell:
          // ganze shell entfernen
          this.removeShell();
          this.treeService.registerFieldUndoStep();
          this.treeService?.selectById(parent?.data?.id ?? '');

          break;
        case EditorTypeOption.Submodel:
          // referenz und teilmodell löschen
          // TODO: Nutzer fragen, ob nur die Referenz oder auch das SM gelöscht werden soll!

          if (
            await this.confirmService.confirm({ message: this.translate.instant('DELETE_SUBMODEL_REMAIN_IN_REPO') })
          ) {
            this.removeSubmodel(true);
            this.treeService.registerFieldUndoStep();
            this.treeService?.selectById(parent?.data?.id ?? '');
          } else {
            this.removeSubmodel(false);
            this.treeService.registerFieldUndoStep();
            this.treeService?.selectById(parent?.data?.id ?? '');
          }
          break;
        case EditorTypeOption.ConceptDescription:
          // konzeptbeschreibung finden und löschen
          this.removeConceptDescription();
          this.treeService.registerFieldUndoStep();
          this.treeService?.selectById(parent?.data?.id ?? '');

          break;
        case EditorTypeOption.Property:
        case EditorTypeOption.Blob:
        case EditorTypeOption.File:
        case EditorTypeOption.SubmodelElementCollection:
        case EditorTypeOption.SubmodelElementList:
        case EditorTypeOption.Operation:
        case EditorTypeOption.Capability:
        case EditorTypeOption.Entity:
        case EditorTypeOption.ReferenceElement:
        case EditorTypeOption.RelationshipElement:
        case EditorTypeOption.MultiLanguageProperty:
        case EditorTypeOption.Range:
          if (this.node.parent?.children != null) {
            this.node.parent.children = this.node.parent.children.filter((x) => x !== this.node);
            // daten aus parent content löschen
            this.removeFromContent();
            this.treeService.registerFieldUndoStep();
            this.treeService?.selectById(parent?.data?.id ?? '');
          }
          break;
        case EditorTypeOption.SupplementalFile:
          // ganze shell entfernen
          this.removeSupplementalFile();
          this.treeService.registerFieldUndoStep();
          this.treeService?.selectById(parent?.data?.id ?? '');
          break;
      }
      this.treeService.aasTreeData = [...this.treeService.aasTreeData];
    }
  }

  removeSupplementalFile() {
    if (this.node != null) {
      if (!(this.node.data?.content as SupplementalFile).isLocal) {
        this.shellResult?.deletedFiles.push(this.node?.data?.content);
      }
      this.filesRootNode?.children?.splice(this.filesRootNode.children?.indexOf(this.node), 1);
    }
    this.treeService.aasTreeData = [...this.treeService.aasTreeData];
  }

  copyElement() {
    this.elementCopied.emit(this.node?.data);
  }

  pasteElement(mode: 'copy' | 'reference' | null = null) {
    if (this.node?.data != null && this.copiedElement != null) {
      if (this.node.data.content instanceof PackageMetadata && mode == null) {
        this.pasteAsReferenceQuestionDialogVisible = true;
      } else {
        const copy = cloneDeep(this.copiedElement.content);
        copy.idShort = 'copy_of_' + copy.idShort;

        this.insertElement(copy, this.copiedElement.editorType, mode ?? 'copy');
        this.treeService.registerFieldUndoStep();
      }
    }
    this.treeService.aasTreeData = [...this.treeService.aasTreeData];
  }

  async saveSnippet() {
    try {
      this.loading = true;

      const res = await this.editorService.saveSnippetItem(
        this.snippet.templateName,
        this.snippet.templateDescription,
        this.snippet.templateData,
        this.snippet.elementType,
      );
      if (res === true) {
        this.notificationService.showMessageAlways('ADDED_SNIPPET_SUCCESSFULLY', 'SUCCESS', 'success', false);
      } else {
        this.notificationService.showMessageAlways('SNIPPET_COULD_NOT_BE_CREATED', 'ERROR', 'error', true);
      }
      this.saveSnippetDialogVisible = false;
    } finally {
      this.loading = false;
    }
  }

  copyJsonToClipboard() {
    this.clipboard.copy(this.saveAsJsonData);
    this.notificationService.showMessageAlways('LINK_COPIED', 'SUCCESS', 'success', false);
  }

  saveAsJson() {
    const blob = new Blob([this.saveAsJsonData], {
      type: 'application/octet-stream',
    });
    let filename = '';
    if (this.saveAsJsonFilename == null || this.saveAsJsonFilename === '') {
      filename = 'export.json';
    } else {
      filename = this.saveAsJsonFilename.endsWith('.json')
        ? this.saveAsJsonFilename
        : this.saveAsJsonFilename + '.json';
    }

    saveAs(blob, filename);
  }

  async getOptionalItems(menu: Popover | TieredMenu) {
    try {
      if (this.node != null) {
        const path = this.createPath(this.node, '');
        const submodelId = this.getSubmodelId(this.node);
        const semanticId = this.getSemanticId(this.node);
        const el = await this.optionalElementsFinder.getOptionalElements(
          path,
          submodelId,
          semanticId,
          this.node.data?.content,
        );

        // check if this is adressInformation and can have contactInformationValues
        if (
          this.node.data?.content instanceof aas.types.SubmodelElementCollection &&
          this.node.data?.content.semanticId?.keys?.find(
            (k) => k.value === 'https://admin-shell.io/zvei/nameplate/1/0/ContactInformations/AddressInformation',
          )
        ) {
          // Elemente für Kontaktinformationen hinzufügen
          const smRes = await this.optionalElementsFinder.getContactInformationSm();
          // eslint-disable-next-line no-console
          console.log('Loaded contact information template', smRes);

          smRes.v3Submodels?.[0]?.submodelElements?.forEach((smColl) => {
            if (
              smColl instanceof aas.types.SubmodelElementCollection &&
              SemanticIdHelper.hasSemanticId(
                smColl,
                'https://admin-shell.io/zvei/nameplate/1/0/ContactInformations/ContactInformation',
              )
            ) {
              // TODO: check if already exists

              smColl.value?.forEach((smEl) => {
                if (
                  !SemanticIdHelper.hasSemanticId(smEl, '0173-1#02-AAO128#002') &&
                  !SemanticIdHelper.hasSemanticId(smEl, '0173-1#02-AAO129#002') &&
                  !SemanticIdHelper.hasSemanticId(smEl, '0173-1#02-AAO132#002') &&
                  !SemanticIdHelper.hasSemanticId(smEl, '0173-1#02-AAO134#002')
                ) {
                  if (this.node?.data?.content instanceof aas.types.SubmodelElementCollection) {
                    const exists = this.node.data.content.value?.find((v) => v.idShort === smEl.idShort);
                    if (!exists)
                      el.push({
                        label: smEl.idShort,
                        data: smEl,
                        type: InstanceHelper.getInstanceName(smEl),
                      });
                  }
                }
              });
            }
          });
        }

        el.forEach(
          (e) =>
            (e.command = (_event: any) => {
              this.insertElement(e.data, e.type);
              menu.hide();
            }),
        );

        if (el.length === 0) {
          el.push({ label: this.translate.instant('NOTHING_AVAILABLE') });
        }

        return el;
      }
    } catch {
      // ignorieren
    }
    return [{ label: this.translate.instant('NOTHING_AVAILABLE') }];
  }

  async getMissingElements(menu: Popover | TieredMenu) {
    try {
      if (this.node != null) {
        const path = this.createPath(this.node, '');
        const submodelId = this.getSubmodelId(this.node);
        const semanticId = this.getSemanticId(this.node);
        const el = await this.optionalElementsFinder.getRequiredElements(
          path,
          submodelId,
          semanticId,
          this.node.data?.content,
        );

        // check if this is adressInformation and can have contactInformationValues
        if (
          this.node.data?.content instanceof aas.types.SubmodelElementCollection &&
          this.node.data?.content.semanticId?.keys?.find(
            (k) => k.value === 'https://admin-shell.io/zvei/nameplate/1/0/ContactInformations/AddressInformation',
          )
        ) {
          // Elemente für Kontaktinformationen hinzufügen
          const smRes = await this.optionalElementsFinder.getContactInformationSm();
          // eslint-disable-next-line no-console
          console.log('Loaded contact information template', smRes);

          smRes.v3Submodels?.[0]?.submodelElements?.forEach((smColl) => {
            if (
              smColl instanceof aas.types.SubmodelElementCollection &&
              SemanticIdHelper.hasSemanticId(
                smColl,
                'https://admin-shell.io/zvei/nameplate/1/0/ContactInformations/ContactInformation',
              )
            ) {
              // TODO: check if already exists
              smColl.value?.forEach((smEl) => {
                if (
                  SemanticIdHelper.hasSemanticId(smEl, '0173-1#02-AAO128#002') ||
                  SemanticIdHelper.hasSemanticId(smEl, '0173-1#02-AAO129#002') ||
                  SemanticIdHelper.hasSemanticId(smEl, '0173-1#02-AAO132#002') ||
                  SemanticIdHelper.hasSemanticId(smEl, '0173-1#02-AAO134#002')
                ) {
                  if (this.node?.data?.content instanceof aas.types.SubmodelElementCollection) {
                    const exists = this.node.data.content.value?.find((v) => v.idShort === smEl.idShort);
                    if (!exists) {
                      el.push({
                        label: smEl.idShort,
                        data: smEl,
                        type: InstanceHelper.getInstanceName(smEl),
                      });
                    }
                  }
                }
              });
            }
          });
        }

        el.forEach(
          (e) =>
            (e.command = (_event: any) => {
              this.insertElement(e.data, e.type);
              menu.hide();
            }),
        );

        if (el.length === 0) {
          el.push({ label: this.translate.instant('NOTHING_AVAILABLE') });
        }

        return el;
      }
    } catch {
      // ignorieren
    }
    return [{ label: this.translate.instant('NOTHING_AVAILABLE') }];
  }

  createPath(node: TreeNode, path: string): string {
    if (node.parent == null) return path;
    else {
      let part = '';

      part = this.getPathPart(node);
      return this.createPath(node.parent, part + path);
    }
  }

  getSubmodelId(node: TreeNode): string {
    if (node.data.editorType === 'Submodel') return node.data.content.idShort;
    else {
      if (node.parent != null) return this.getSubmodelId(node.parent);
      else return '';
    }
  }

  getSemanticId(node: TreeNode): string {
    if (node.data.editorType === 'Submodel')
      return (
        node.data.content.semanticId?.keys?.find(
          (k: any) => k.type === aas.types.KeyTypes.ConceptDescription || k.type === aas.types.KeyTypes.GlobalReference,
        )?.value ?? ''
      );
    else {
      if (node.parent != null) return this.getSemanticId(node.parent);
      else return '';
    }
  }

  getPathPart(node: TreeNode<V3TreeItem<any>>) {
    let part = '';
    const parentType = this.getParentType(node);
    switch (node.data?.editorType) {
      case 'Submodel':
        part = '$';
        break;
      case 'SubmodelElementCollection':
        part = `.${parentType}[?(@.idShort=="${node.data.content.idShort}")]`;
        break;
      case 'SubmodelElementList':
        part = `.${parentType}[?(@.idShort=="${node.data.content.idShort}")]`;
        break;
      case 'Entity':
        part = `.${parentType}[?(@.idShort=="${node.data.content.idShort}")]`;
        break;
    }

    return part;
  }

  getParentType(node: TreeNode<V3TreeItem<any>>) {
    let type = '';
    switch (node.parent?.data?.editorType) {
      case 'Submodel':
        type = 'submodelElements';
        break;
      case 'SubmodelElementCollection':
        type = 'value';
        break;
      case 'Entity':
        type = 'statements';
        break;
    }

    return type;
  }

  getAvailableElements() {
    this.availableElements = [];
    const el = [];

    if (this.isInsertAllowed(CMTypeOption.Property)) {
      el.push({
        label: 'PROPERTY',
        translatedLabel: this.translate.instant('PROPERTY'),
        description: 'PROPERTY_DESC',
        createElement: CMTypeOption.Property,
      });
    }

    if (this.isInsertAllowed(CMTypeOption.MultiLanguageProperty)) {
      el.push({
        label: 'MLP',
        translatedLabel: this.translate.instant('MLP'),
        description: 'PROPERTY_DESC',
        createElement: CMTypeOption.MultiLanguageProperty,
      });
    }

    if (this.isInsertAllowed(CMTypeOption.SubmodelElementCollection)) {
      el.push({
        label: 'SMC',
        translatedLabel: this.translate.instant('SMC'),
        description: 'SMC_DESC',
        createElement: CMTypeOption.SubmodelElementCollection,
      });
    }

    if (this.isInsertAllowed(CMTypeOption.SubmodelElementList)) {
      el.push({
        label: 'SML',
        translatedLabel: this.translate.instant('SML'),
        description: 'SML_DESC',
        createElement: CMTypeOption.SubmodelElementList,
      });
    }

    if (this.isInsertAllowed(CMTypeOption.File)) {
      el.push({
        label: 'FILE',
        translatedLabel: this.translate.instant('FILE'),
        description: 'FILE_DESC',
        createElement: CMTypeOption.File,
      });
    }

    if (this.isInsertAllowed(CMTypeOption.Blob)) {
      el.push({
        label: 'BLOB',
        translatedLabel: this.translate.instant('BLOB'),
        description: 'BLOB_DESC',
        createElement: CMTypeOption.Blob,
      });
    }

    if (this.isInsertAllowed(CMTypeOption.Operation)) {
      el.push({
        label: 'OPR',
        translatedLabel: this.translate.instant('OPR'),
        description: 'OPR_DESC',
        createElement: CMTypeOption.Operation,
      });
    }

    if (this.isInsertAllowed(CMTypeOption.ReferenceElement)) {
      el.push({
        label: 'REF',
        translatedLabel: this.translate.instant('REF'),
        description: 'REF_DESC',
        createElement: CMTypeOption.ReferenceElement,
      });
    }

    if (this.isInsertAllowed(CMTypeOption.Entity)) {
      el.push({
        label: 'ENTITY',
        translatedLabel: this.translate.instant('ENTITY'),
        description: 'ENTITYDESC',
        createElement: CMTypeOption.Entity,
      });
    }

    if (this.isInsertAllowed(CMTypeOption.RelationshipElement)) {
      el.push({
        label: 'RELATIONSHIP_ELEMENT',
        translatedLabel: this.translate.instant('RELATIONSHIP_ELEMENT'),
        description: 'RELATIONSHIP_ELEMENT_DESC',
        createElement: CMTypeOption.RelationshipElement,
      });
    }

    if (this.isInsertAllowed(CMTypeOption.Range)) {
      el.push({
        label: 'RANGE',
        translatedLabel: this.translate.instant('RANGE'),
        description: 'RANGE_DESC',
        createElement: CMTypeOption.Range,
      });
    }

    if (this.isInsertAllowed(CMTypeOption.ContactInformation)) {
      el.push({
        label: 'CONTACT_INFORMATION',
        translatedLabel: this.translate.instant('CONTACT_INFORMATION'),
        description: 'CONTACT_INFORMATION_DESC',
        createElement: CMTypeOption.ContactInformation,
      });
    }

    if (this.isInsertAllowed(CMTypeOption.ConceptDescription)) {
      el.push({
        label: 'CONCEPT_DESCRIPTION',
        translatedLabel: this.translate.instant('CONCEPT_DESCRIPTION'),
        description: 'CONCEPT_DESCRIPTION_DESC',
        createElement: CMTypeOption.ConceptDescription,
      });
    }

    el.sort((a, b) => a.label.localeCompare(b.translatedLabel));

    this.availableElements = el;
  }

  elementToInsertSelected(element: {
    label: string;
    translatedLabel: string;
    description: string;
    createElement: CMTypeOption;
  }) {
    this.createElement(element.createElement);
    this.insertElementDialogVisible = false;
  }

  submodelToInsertSelected(element: AvailableSubmodel) {
    if (element.group === 'IDTA_SMT_REPO') {
      this.createElement(element.createElement as any, element.smUrl);
    } else {
      this.createElement(element.createElement as any, element.id.toString());
    }
    this.insertSubmodelDialogVisible = false;
  }

  getEventValue(event: any): string {
    return event.target.value;
  }

  dialogService = inject(DialogService);
  ref: DynamicDialogRef | undefined | null;

  showReferrableSubmodels() {
    this.ref = this.dialogService.open(SearchSubmodelComponent, {
      width: '50%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: true,
      header: this.translate.instant('SELECT_SUBMODEL'),
      closable: true,
    });

    this.ref?.onClose.subscribe((sm: Submodel) => {
      if (sm != null) {
        this.insertSubmodelRef(sm);
      }
    });
  }
}
