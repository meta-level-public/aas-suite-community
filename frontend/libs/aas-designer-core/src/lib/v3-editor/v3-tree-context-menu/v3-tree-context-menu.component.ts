import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { SubmodelTemplate } from '@aas-designer-model';
import { AasConfirmationService, NotificationService, PortalService } from '@aas/common-services';
import { ConceptDescriptionRoot, PackageMetadata, ShellResult, SupplementalFile } from '@aas/model';
import { Clipboard } from '@angular/cdk/clipboard';
import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MenuItem, TreeNode } from '@openng/optimus-ui/api';
import { ButtonModule } from '@openng/optimus-ui/button';
import { DialogService, DynamicDialogRef } from '@openng/optimus-ui/dynamicdialog';
import { Popover } from '@openng/optimus-ui/popover';
import { TieredMenu } from '@openng/optimus-ui/tieredmenu';
import { saveAs } from 'file-saver-es';
import { cloneDeep } from 'lodash-es';
import { v4 as uuid } from 'uuid';
import { SearchSubmodelComponent } from '../components/search-submodel/search-submodel.component';
import { CMTransformOption } from '../model/cm-transform-option';
import { CMTypeOption } from '../model/cm-type-option';
import { EditorTypeOption } from '../model/editor-type-option';
import { V3TreeItem } from '../model/v3-tree-item';
import { ElementInserter } from '../tools/element-inserter';
import { V3EditorService } from '../v3-editor.service';
import { appendChildTreeNode, V3TreeNode } from '../v3-tree/v3-tree-node';
import { V3TreeService } from '../v3-tree/v3-tree.service';
import { AddonType } from './addon-resolver';
import { AvailableSubmodel } from './available-submodel';
import {
  AvailableElementItem,
  V3InsertElementDialogComponent,
} from './dialogs/insert-element/v3-insert-element-dialog.component';
import { V3InsertSubmodelDialogComponent } from './dialogs/insert-submodel/v3-insert-submodel-dialog.component';
import { V3PasteQuestionDialogComponent } from './dialogs/paste-question/v3-paste-question-dialog.component';
import { V3SaveAsJsonDialogComponent } from './dialogs/save-as-json/v3-save-as-json-dialog.component';
import { V3SaveSnippetDialogComponent } from './dialogs/save-snippet/v3-save-snippet-dialog.component';
import { buildAddonMenuItems, openAddonEditor } from './v3-addon-editor';
import { buildContextMenuModel } from './v3-context-menu-model';
import {
  getAllowedSnippetTypes,
  isCopyAllowedFor,
  isDeleteAllowedFor,
  isInsertAllowedFor,
  isPasteAllowedFor,
  isRemoveTemplateQualifiersAllowedFor,
  isSaveAsAllowedFor,
  isTransformAllowedFor,
} from './v3-context-menu-permissions';
import {
  replaceElementInParent,
  transformToMultiLanguageProperty,
  transformToProperty,
  transformToSubmodelElementCollection,
  transformToSubmodelElementList,
} from './v3-element-transformer';
import { AvailableSubmodelGroup, buildAvailableElements, buildAvailableSubmodelGroups } from './v3-insert-options';
import { V3OptionalElementsFinder } from './v3-optional-elements-finder';
import {
  buildCopiedIdShort,
  buildPastedIdShort,
  clearSubmodelElementValuesRecursive,
  createDefaultSubmodelElement,
  getCreateTypeForAasSubmodelElement,
  getEditorTypeForSubmodelElement,
  removeTemplateQualifiersRecursive,
} from './v3-submodel-element-utils';
import { buildTemplateElementItems, TemplateElementLoader } from './v3-template-element-items';
import { addElementToContent, InsertMode, removeElementFromContent } from './v3-tree-content-mutations';

type ISubmodelElement = aas.types.ISubmodelElement;
type Submodel = aas.types.Submodel;

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
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    ButtonModule,
    TranslateModule,
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

  @Output() showInsertJsonDialog = new EventEmitter<{
    type: 'submodel' | 'element' | 'cd';
    node: TreeNode<V3TreeItem<any>>;
  }>();
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

  private _selectedElementToInsert: AvailableElementItem | null = null;
  get selectedElementToInsert(): AvailableElementItem | null {
    return this._selectedElementToInsert;
  }
  set selectedElementToInsert(val: AvailableElementItem | null) {
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

  availableSubmodels: AvailableSubmodelGroup[] = [];
  availableElements: AvailableElementItem[] = [];

  dialogService = inject(DialogService);
  ref: DynamicDialogRef | undefined | null;

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

  private readonly instant = (key: string): string => this.translate.instant(key);

  private get editorType(): EditorTypeOption | undefined {
    return this.node?.data?.editorType;
  }

  async onShowActions(event: Event, menu: Popover | TieredMenu) {
    event.stopPropagation();
    event.preventDefault();

    const optionalItems = await this.getOptionalItems(menu);
    const missingItems = await this.getMissingElements(menu);
    const addonItems = await this.getAddons(menu);

    this.menuItems = buildContextMenuModel(
      this.instant,
      {
        isInsertAllowed: (type) => this.isInsertAllowed(type),
        isTransformAllowed: (option) => this.isTransformAllowed(option),
        canInsertSmlChild: this.isInsertSmlElementAllowed(),
        canCopy: this.isCopyAllowed(),
        canPaste: this.isPasteAllowed(),
        canRemoveTemplateQualifiers: this.isRemoveTemplateQualifiersAllowed(),
        canDelete: this.isDeleteAllowed(),
        canSaveAs: this.isSaveAsAllowed(),
        optionalItems,
        missingItems,
        addonItems,
      },
      {
        hideMenu: () => menu.hide(),
        createShell: () => this.createElement(CMTypeOption.AssetAdministrationShell),
        openInsertSubmodelDialog: () => {
          this.initTemplates();
          this.insertSubmodelDialogVisible = true;
        },
        showReferrableSubmodels: () => this.showReferrableSubmodels(),
        openInsertElementDialog: () => {
          this.getAvailableElements();
          this.insertElementDialogVisible = true;
        },
        insertSmlChild: () => this.insertSubmodelElementlistChild(),
        openInsertSnippetDialog: () => this.openInsertSnippetDialog(),
        openInsertJsonDialog: (type) => this.showInsertJsonDialog.emit({ type, node: this.node! }),
        transform: (option) => this.transformElement(option),
        copy: () => this.copyElement(),
        paste: () => this.pasteElement(),
        removeTemplateQualifiers: () => this.removeTemplateQualifiers(),
        delete: () => this.deleteNode(),
        saveAsSnippet: () => this.openSaveSnippetDialog(),
        saveAsJson: () => this.openSaveAsJsonDialog(),
      },
    );

    menu.toggle(event);
  }

  private openInsertSnippetDialog() {
    if (this.node?.data != null) {
      this.showInsertSnippetDialog.emit({
        visibility: true,
        allowedTypes: this.getAllowedTypes(this.node.data.editorType),
        uuid: this.node.data.id,
        elementType: this.node.data.editorType,
        parentElement: this.node,
      });
    }
  }

  private openSaveSnippetDialog() {
    this.snippet = {} as SnippetData;
    if (this.node?.data?.content != null) {
      this.snippet.templateData = JSON.stringify(aas.jsonization.toJsonable(this.node.data.content), null, 2);
      this.snippet.elementType = this.node.data.editorType;
    }
    this.saveSnippetDialogVisible = true;
  }

  private openSaveAsJsonDialog() {
    if (this.node?.data?.content != null) {
      this.saveAsJsonFilename = this.node.data.content.idShort;
      this.saveAsJsonData = JSON.stringify(aas.jsonization.toJsonable(this.node.data.content), null, '\t');
      this.saveAsJsonDialogVisible = true;
    }
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

  private get currentLanguage(): string {
    return this.translate?.currentLang || 'en';
  }

  transformToProperty() {
    if (!this.node?.data) return;
    const property = transformToProperty(this.node.data.content, this.currentLanguage);
    this.applyTransformation(property, EditorTypeOption.Property);
  }

  transformToMultiLanguageProperty() {
    if (!this.node?.data) return;
    const mlp = transformToMultiLanguageProperty(this.node.data.content, this.currentLanguage);
    this.applyTransformation(mlp, EditorTypeOption.MultiLanguageProperty);
  }

  transformToSubmodelElementCollection() {
    if (!this.node?.data) return;
    const smc = transformToSubmodelElementCollection(this.node.data.content);
    this.applyTransformation(smc, EditorTypeOption.SubmodelElementCollection, smc.value);
  }

  transformToSubmodelElementList() {
    if (!this.node?.data) return;
    const sml = transformToSubmodelElementList(this.node.data.content);
    this.applyTransformation(sml, EditorTypeOption.SubmodelElementList, sml.value);
  }

  /** Replaces the node content by the transformed element in model and tree, children are rebuilt if given. */
  private applyTransformation(
    element: ISubmodelElement,
    editorType: EditorTypeOption,
    children?: ISubmodelElement[] | null,
  ) {
    const node = this.node;
    if (node?.data == null) return;

    const current = node.data.content;
    const parentContent = node.data.parent?.content;
    if (current && parentContent) {
      replaceElementInParent(parentContent, current, element);
    }
    node.data.content = element;
    node.data.editorType = editorType;
    node.children = [];
    if (children !== undefined) {
      this.treeService.buildChildTree(children, node);
    }
    this.treeService.aasTreeData = [...this.treeService.aasTreeData];
  }

  isTransformAllowed(transformOption: CMTransformOption): boolean {
    return isTransformAllowedFor(this.editorType, transformOption);
  }

  async insertSubmodelElementlistChild() {
    const list = this.node?.data?.content;
    const firstChild = list instanceof aas.types.SubmodelElementList ? list.value?.[0] : null;

    if (firstChild != null) {
      const childCopy = cloneDeep(firstChild);
      childCopy.idShort = buildCopiedIdShort(childCopy, list.value ?? []);

      const keepTemplateValues = await this.confirmService.confirm({
        message: this.translate.instant('KEEP_SML_TEMPLATE_VALUES_Q'),
      });

      if (keepTemplateValues !== true) {
        clearSubmodelElementValuesRecursive(childCopy);
      }

      this.insertElement(childCopy, getEditorTypeForSubmodelElement(childCopy));
      this.treeService.registerFieldUndoStep();
      return;
    }

    const createType = getCreateTypeForAasSubmodelElement(list?.typeValueListElement);
    if (createType != null) {
      this.createElement(createType);
    }

    this.treeService.registerFieldUndoStep();
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
      submodel.submodelElements?.reduce((count, element) => count + removeTemplateQualifiersRecursive(element), 0) ?? 0;

    if (removedQualifierCount > 0) {
      this.treeService.registerFieldUndoStep();
      this.treeService.aasTreeData = [...this.treeService.aasTreeData];
    }
  }

  isInsertSmlElementAllowed() {
    return this.editorType === EditorTypeOption.SubmodelElementList;
  }

  async getAddons(menu: Popover | TieredMenu) {
    return buildAddonMenuItems(this.node?.data?.content, this.instant, (addonType) => {
      this.showAddonEditor(addonType);
      menu.hide();
    });
  }

  showAddonEditor(addonType: AddonType) {
    const ref = openAddonEditor(
      {
        dialogService: this.dialogService,
        translate: this.instant,
        currentLanguage: this.portalService.currentLanguage,
        treeService: this.treeService,
        shellResult: this.shellResult,
        getNode: () => this.node,
        insertElement: (element, editorType, targetNode) =>
          targetNode != null
            ? this.insertElementInTargetNode(targetNode, element, editorType)
            : this.insertElement(element, editorType),
      },
      addonType,
    );
    if (ref !== undefined) {
      this.ref = ref;
    }
  }

  private insertElementInTargetNode(targetNode: V3TreeNode, element: ISubmodelElement, editorType: EditorTypeOption) {
    const previousNode = this.node;
    this.node = targetNode;
    this.insertElement(element, editorType);
    this.node = previousNode;
  }

  isInsertAllowed(sourceType: CMTypeOption) {
    return isInsertAllowedFor(this.editorType, sourceType);
  }

  isDeleteAllowed() {
    return isDeleteAllowedFor(this.editorType);
  }

  isRemoveTemplateQualifiersAllowed() {
    return isRemoveTemplateQualifiersAllowedFor(this.editorType, this.node?.data?.content);
  }

  isSaveAsAllowed() {
    return isSaveAsAllowedFor(this.editorType);
  }

  isCopyAllowed() {
    return isCopyAllowedFor(this.editorType);
  }

  getAllowedTypes(targetType: EditorTypeOption) {
    return getAllowedSnippetTypes(targetType);
  }

  isPasteAllowed() {
    return isPasteAllowedFor(this.editorType, this.copiedElement?.editorType);
  }

  initTemplates() {
    this.availableSubmodels = buildAvailableSubmodelGroups(this.availableSubmodelTemplates, this.instant);
  }

  createElement(type: CMTypeOption, id: string = '') {
    switch (type) {
      case CMTypeOption.ConceptDescription:
        this.insertConceptDescription();
        break;
      case CMTypeOption.Submodel:
        this.insertCustomSubmodel();
        break;
      case CMTypeOption.SubmodelTemplate:
        this.insertSubmodelTemplate(id);
        break;
      case CMTypeOption.RepoSubmodelTemplate:
        this.insertRepoSubmodelTemplate(id);
        break;
      case CMTypeOption.ContactInformation:
        this.insertContactInformationTemplate();
        break;
      default: {
        const created = createDefaultSubmodelElement(type);
        if (created == null) {
          throw new Error(` ${type} Not implemented yet`);
        }
        this.insertElement(created.element, created.editorType);
      }
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
      'https://admin-shell.io/idta/SubmodelTemplate/ContactInformation/1/0',
    );

    const node = this.node;
    if (node?.data?.content == null) return;

    if (node.data.content.value == null) {
      node.data.content.value = [];
    }

    for (const submodel of template.v3Submodels) {
      if (submodel.submodelElements == null) continue;
      const collection = submodel.submodelElements[0] as aas.types.SubmodelElementCollection;
      node.data.content.value.push(collection);

      // tree node for the collection
      const { id, node: contactNode } = appendChildTreeNode(
        node,
        collection,
        EditorTypeOption.Submodel,
        submodel?.idShort ?? submodel.id,
      );
      this.treeService.buildChildTree(collection.value, contactNode);
      setTimeout(() => this.treeService.selectById(id));
    }

    // append concept descriptions
    for (const conceptDescription of template.v3ConceptDescriptions) {
      if (this.shellResult?.v3Shell == null) break;
      if (this.shellResult.v3Shell.conceptDescriptions == null) {
        this.shellResult.v3Shell.conceptDescriptions = [];
      }
      this.shellResult.v3Shell.conceptDescriptions.push(conceptDescription);

      const id = uuid();
      const cdData = new V3TreeItem<aas.types.ConceptDescription>();
      cdData.content = conceptDescription;
      cdData.id = id;
      cdData.editorType = EditorTypeOption.Submodel;
      cdData.parent = node.data;
      const cdNode: TreeNode<V3TreeItem<aas.types.ConceptDescription>> = {
        label: conceptDescription?.idShort ?? conceptDescription.id,
        data: cdData,
        children: [],
        parent: node,
        key: id,
        expanded: false,
      };
      if (node.children == null) {
        node.children = [];
      }
      if (this.conceptDescriptionsRootNode != null && this.conceptDescriptionsRootNode.children == null)
        this.conceptDescriptionsRootNode.children = [];
      this.conceptDescriptionsRootNode?.children?.push(cdNode);
    }
  }

  insertCustomSubmodel() {
    const submodel = new aas.types.Submodel('newSubmodel');
    submodel.idShort = 'newSubmodel';
    this.appendSubmodelToShell(submodel, false);
  }

  insertSubmodelRef(submodel: Submodel) {
    this.appendSubmodelToShell(submodel, true);
  }

  /** References the submodel in the shell of the node, adds it to the environment and selects its new tree node. */
  private appendSubmodelToShell(submodel: Submodel, buildChildren: boolean) {
    const node = this.node;
    if (node?.data?.content == null) return;

    const shell = node.data.content;
    if (shell.submodelElements == null) {
      shell.submodelElements = [];
    }
    if (shell.submodels == null) {
      shell.submodels = [];
    }
    shell.submodels.push(
      new aas.types.Reference(aas.types.ReferenceTypes.ModelReference, [
        new aas.types.Key(aas.types.KeyTypes.Submodel, submodel.id),
      ]),
    );

    this.shellResult?.v3Shell?.submodels?.push(submodel);

    const { id, node: submodelNode } = appendChildTreeNode(
      node,
      submodel,
      EditorTypeOption.Submodel,
      submodel?.idShort ?? submodel.id,
    );
    if (buildChildren) {
      this.treeService.buildChildTree(submodel.submodelElements, submodelNode);
    }
    node.expanded = true;
    this.treeService.aasTreeData = [...this.treeService.aasTreeData];
    setTimeout(() => {
      this.treeService.editorComponent?.requestEditModeForNextSelection();
      this.treeService.selectById(id);
    });
  }

  insertConceptDescription() {
    const node = this.node;
    if (node?.data == null) return;

    if (node.data.content.conceptDescriptions == null) {
      node.data.content.conceptDescriptions = [];
    }
    const cd = new aas.types.ConceptDescription('empty');
    node.data.content.conceptDescriptions.push(cd);

    const { id } = appendChildTreeNode(node, cd, EditorTypeOption.ConceptDescription, cd?.idShort ?? cd.id);
    node.expanded = true;
    this.treeService.aasTreeData = [...this.treeService.aasTreeData];
    setTimeout(() => this.treeService.selectById(id));
  }

  insertElement(element: ISubmodelElement, editorType: EditorTypeOption, mode: InsertMode = null) {
    const node = this.node;
    if (node == null) return;

    this.addToContent(element, mode);

    const { id, node: elementNode } = appendChildTreeNode(node, element, editorType, element?.idShort ?? '??');
    const children = this.getChildElementsForTree(element, editorType);
    if (children !== undefined) {
      children.forEach((childElements) => this.treeService.buildChildTree(childElements, elementNode));
    } else {
      console.warn('Unsupported editor type for buildChildTree', editorType);
    }
    node.expanded = true;
    this.treeService.aasTreeData = [...this.treeService.aasTreeData];
    setTimeout(() => this.treeService.selectById(id));
  }

  /** Element lists the tree builds the children of a newly inserted node from (undefined: no children). */
  private getChildElementsForTree(element: aas.types.Class, editorType: EditorTypeOption): unknown[][] | undefined {
    switch (editorType) {
      case EditorTypeOption.SubmodelElementCollection:
        return [(element as aas.types.SubmodelElementCollection).value as unknown[]];
      case EditorTypeOption.SubmodelElementList:
        return [(element as aas.types.SubmodelElementList).value as unknown[]];
      case EditorTypeOption.Submodel:
        return [(element as Submodel).submodelElements as unknown[]];
      case EditorTypeOption.AssetAdministrationShell:
        return (
          (element as aas.types.AssetAdministrationShell).submodels?.map((smRef) => [
            this.shellResult?.v3Shell?.submodels?.find((s) => s.id === smRef.keys[0].value),
          ]) ?? []
        );
      case EditorTypeOption.Entity:
        return [(element as aas.types.Entity).statements as unknown[]];
      default:
        return undefined;
    }
  }

  addToContent(elem: aas.types.Class, mode: InsertMode = null) {
    if (this.node == null) return;
    addElementToContent(this.node.data?.content, elem, mode, this.shellResult);
  }

  removeFromContent() {
    if (this.node == null) return;
    removeElementFromContent(this.node.data?.parent?.content, this.node.data?.content);
  }

  removeConceptDescription() {
    if (this.node == null) return;

    const conceptDescriptions = (this.conceptDescriptionsRootNode?.data?.content as ConceptDescriptionRoot)
      ?.conceptDescriptions;
    const indx = conceptDescriptions?.indexOf(this.node.data?.content);
    if (indx != null && indx > -1) {
      conceptDescriptions?.splice(indx, 1);
    }
    // delete treeNode
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

      this.removeNodeFromParent();
    }
  }

  removeShell() {
    if (this.node != null && this.shellResult != null) {
      this.shellResult.v3Shell?.assetAdministrationShells?.splice(
        this.shellResult.v3Shell.assetAdministrationShells.indexOf(this.node.data?.content),
        1,
      );
      this.removeNodeFromParent();
    }
  }

  private removeNodeFromParent() {
    if (this.node == null) return;
    this.node.parent?.children?.splice(this.node.parent.children?.indexOf(this.node), 1);
    this.treeService?.selectById(this.node.parent?.data?.id ?? '');
  }

  async deleteNode() {
    if ((await this.confirmService.confirm({ message: this.translate.instant('DELETE_ELEMENT_Q') })) !== true) {
      return;
    }

    // find parent element for later selection
    const parent = this.node?.parent;
    let removed = true;
    switch (this.node?.data?.editorType) {
      case EditorTypeOption.AssetAdministrationShell:
        // remove entire shell
        this.removeShell();
        break;
      case EditorTypeOption.Submodel: {
        // delete the reference, ask whether the submodel itself remains in the repository
        const keepSubmodel = await this.confirmService.confirm({
          message: this.translate.instant('DELETE_SUBMODEL_REMAIN_IN_REPO'),
        });
        this.removeSubmodel(!!keepSubmodel);
        break;
      }
      case EditorTypeOption.ConceptDescription:
        this.removeConceptDescription();
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
          // delete data from parent content
          this.removeFromContent();
        } else {
          removed = false;
        }
        break;
      case EditorTypeOption.SupplementalFile:
        this.removeSupplementalFile();
        break;
      default:
        removed = false;
    }

    if (removed) {
      this.treeService.registerFieldUndoStep();
      this.treeService?.selectById(parent?.data?.id ?? '');
    }
    this.treeService.aasTreeData = [...this.treeService.aasTreeData];
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
        copy.idShort = buildPastedIdShort(copy, this.node.data.content);

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
    return this.getTemplateElementItems(
      menu,
      (path, submodelId, semanticId, content) =>
        this.optionalElementsFinder.getOptionalElements(path, submodelId, semanticId, content),
      false,
    );
  }

  async getMissingElements(menu: Popover | TieredMenu) {
    return this.getTemplateElementItems(
      menu,
      (path, submodelId, semanticId, content) =>
        this.optionalElementsFinder.getRequiredElements(path, submodelId, semanticId, content),
      true,
    );
  }

  /** Menu entries for the optional or required elements of the submodel template, see buildTemplateElementItems. */
  private getTemplateElementItems(
    menu: Popover | TieredMenu,
    loadElements: TemplateElementLoader,
    required: boolean,
  ): Promise<MenuItem[]> {
    return buildTemplateElementItems(this.node, {
      translate: this.instant,
      loadElements,
      loadContactInformationSubmodel: () => this.optionalElementsFinder.getContactInformationSm(),
      required,
      onSelect: (element, type) => {
        this.insertElement(element, type as EditorTypeOption);
        menu.hide();
      },
    });
  }

  getAvailableElements() {
    this.availableElements = buildAvailableElements((type) => this.isInsertAllowed(type), this.instant);
  }

  elementToInsertSelected(element: AvailableElementItem) {
    this.createElement(element.createElement);
    this.insertElementDialogVisible = false;
  }

  submodelToInsertSelected(element: AvailableSubmodel) {
    const createType = element.createElement as CMTypeOption;
    if (element.group === 'IDTA_SMT_REPO') {
      this.createElement(createType, element.smUrl);
    } else {
      this.createElement(createType, element.id.toString());
    }
    this.insertSubmodelDialogVisible = false;
  }

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
