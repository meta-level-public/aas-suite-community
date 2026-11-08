import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { SubmodelTemplate } from '@aas-designer-model';
import { IdGenerationUtil, InstanceHelper, TagHelper } from '@aas/helpers';
import { AasMetamodelVersion, ShellResult, SupplementalFile } from '@aas/model';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  signal,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { TreeNode } from '@openng/optimus-ui/api';
import { v4 as uuid } from 'uuid';
import { SnippetsCatalogComponent } from '../../catalog/snippets-catalog/snippets-catalog.component';
import { EditorTypeOption } from '../model/editor-type-option';
import { V3TreeItem } from '../model/v3-tree-item';
import { ElementInserter } from '../tools/element-inserter';
import { V3EditorService } from '../v3-editor.service';
import { V3TreeContextMenuComponent } from '../v3-tree-context-menu/v3-tree-context-menu.component';
import { V3TreeService } from './v3-tree.service';

import { NotificationService, PortalService } from '@aas/common-services';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Button } from '@openng/optimus-ui/button';
import { Dialog } from '@openng/optimus-ui/dialog';
import { FileUpload } from '@openng/optimus-ui/fileupload';
import { InputText } from '@openng/optimus-ui/inputtext';
import { Message } from '@openng/optimus-ui/message';
import { Tag } from '@openng/optimus-ui/tag';
import { Textarea } from '@openng/optimus-ui/textarea';
import { Tooltip } from '@openng/optimus-ui/tooltip';
import { isArray } from 'lodash-es';
import { ExtendedSearchComponent } from '../../general/extended-search/extended-search.component';
import { EclassSinglePropertyGeneratorComponent } from '../components/eclass-property-generator/single/eclass-single-property-generator.component';
import {
  appendChildTreeNode,
  FlatTreeNode,
  MissingSubmodelPlaceholder,
  V3TreeContent,
  V3TreeNode,
} from './v3-tree-node';
import { canReorderInParent, isDropAllowed, moveAcrossParents, reorderWithinParent } from './v3-tree-drag-drop';
import {
  deserializeSnippet,
  formatDeserializationError,
  JsonImportType,
  validateImportJson,
} from './v3-tree-json-import';
import { getNodeLabel, getTypeTag } from './v3-tree-labels';
import {
  buildVisibleFlatNodes,
  collectFilteredNodeIds,
  expandParents,
  findNodeById,
  findNodeByIdShortPath,
  findNodeRecursive,
  hasChildren,
  isNodeVisible,
  shouldRenderChildren,
  withExpandedState,
} from './v3-tree-navigation';

type Path = aas.verification.Path;
type V3TreeSelection = V3TreeNode | V3TreeNode[] | undefined | null;

@Component({
  selector: 'aas-v3-tree',
  templateUrl: './v3-tree.component.html',
  styleUrls: ['../../../host.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    Button,
    Tooltip,
    V3TreeContextMenuComponent,
    Tag,
    NgClass,
    Dialog,
    SnippetsCatalogComponent,
    ExtendedSearchComponent,
    FormsModule,
    Textarea,
    Message,
    FileUpload,
    Button,
    EclassSinglePropertyGeneratorComponent,
    InputText,
    DragDropModule,
    ScrollingModule,
    TranslateModule,
  ],
})
export class V3TreeComponent implements OnChanges, OnInit {
  @Input() loading: boolean = false;
  @Input() shellResult: ShellResult | undefined;
  @Input() submodelRootMode: boolean = false;

  @Output() selectedElementChanged: EventEmitter<V3TreeItem<V3TreeContent> | undefined> = new EventEmitter<
    V3TreeItem<V3TreeContent> | undefined
  >();

  allSubmodelsTreeNode: TreeNode<V3TreeItem<aas.types.Submodel>> | undefined;
  allFilesTreeNode: V3TreeNode | undefined;
  allConceptDescriptionsNode: V3TreeNode | undefined;

  selectedTreeNode: V3TreeSelection;
  copiedElement: V3TreeItem<V3TreeContent> | undefined;

  EditorTypeOption = EditorTypeOption;

  SHELL_ROOT_INDEX = 0;
  CONCEPT_DESCRIPTIONS_INDEX = 1;
  availableSubmodelTemplates: SubmodelTemplate[] = [];
  insertSnippetDialogVisible: boolean = false;
  @ViewChild('snippetTable') snippetTable: SnippetsCatalogComponent | undefined;
  @ViewChild('cm') cm: V3TreeContextMenuComponent | undefined;
  @ViewChild(CdkVirtualScrollViewport) viewport: CdkVirtualScrollViewport | undefined;
  @ViewChild('jsonFileUpload') jsonFileUpload: FileUpload | undefined;
  shellNode: TreeNode<V3TreeItem<aas.types.AssetAdministrationShell>> | undefined;

  importJsonDialogVisible = false;
  plainJson: string = '';
  importType: JsonImportType = 'submodel';
  importFromEclassDialogVisible: boolean = false;
  targetNodeId: string = '';
  filterValue = '';
  private filteredNodeIds: Set<string> | null = null;
  draggedNode: V3TreeNode | null = null;

  translate = inject(TranslateService);

  jsonValid = signal(false);
  jsonValidationError = signal<string | null>(null);

  constructor(
    public treeService: V3TreeService,
    private editorService: V3EditorService,
    private notificationService: NotificationService,
    private portalService: PortalService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['shellResult'] != null) {
      this.initTree();
    }
  }

  async ngOnInit() {
    this.availableSubmodelTemplates = await this.editorService.getAvailableSubmodelTemplates();
  }

  private get treeData(): V3TreeNode[] {
    return this.treeService.aasTreeData;
  }

  /** Currently selected node of the tree service (the service also allows a multi selection). */
  private get serviceSelectedNode(): V3TreeNode {
    return this.treeService.selectedTreeNode as V3TreeNode;
  }

  initTree(): void {
    if (this.shellResult?.v3Shell != null && this.shellResult.v3Shell.assetAdministrationShells != null) {
      this.treeService.resetVisited();
      this.treeService.resetUndo();
      this.mapAasToTreeNode();
      const rootNode = this.treeData[0];
      this.treeService.selectedTreeNode = rootNode;
      this.selectedTreeNode = rootNode;
      this.selectedElementChanged.emit(rootNode.data);
      this.treeService.treeComponent = this;
      this.treeService.addVisitedNode(rootNode.data?.id ?? '');
      if (this.shellResult != null) {
        this.treeService.registerUndoStep(this.treeData, rootNode.data?.id ?? '');
      }
    }
  }

  mapAasToTreeNode() {
    if (this.shellResult == null) return;

    this.loading = true;
    this.treeService.aasTreeData = [];
    const environment = this.shellResult.v3Shell;

    const hasSingleShell = (environment?.assetAdministrationShells?.length ?? 0) === 1;
    const hasSingleSubmodel = (environment?.submodels?.length ?? 0) === 1;
    const useSubmodelRootMode = this.submodelRootMode && hasSingleShell && hasSingleSubmodel;

    for (const shell of environment?.assetAdministrationShells ?? []) {
      const shellNode = this.createShellNode(shell, environment!);

      if (useSubmodelRootMode) {
        const rootSubmodelNode = shellNode.children?.[0];
        if (rootSubmodelNode != null) {
          rootSubmodelNode.parent = undefined;
          rootSubmodelNode.expanded = true;
          this.treeData.push(rootSubmodelNode);
        }
      } else {
        this.treeData.push(shellNode as V3TreeNode);
      }
      this.shellNode = shellNode;
    }

    // concept description level
    const conceptDescriptionsRootNode = this.createRootNode(
      environment as aas.types.Environment,
      EditorTypeOption.ConceptDescriptions,
      'ConceptDescriptions',
      'conceptDescriptions',
    );
    for (const cd of environment?.conceptDescriptions ?? []) {
      conceptDescriptionsRootNode.children?.push(
        this.createLeafNode(cd, EditorTypeOption.ConceptDescription, cd.idShort ?? cd.id),
      );
      conceptDescriptionsRootNode.label = this.translate.instant(this.getNodeLabel(conceptDescriptionsRootNode) ?? '-');
    }
    this.treeData.push(conceptDescriptionsRootNode);
    this.allConceptDescriptionsNode = conceptDescriptionsRootNode;

    // node for the supplemental files
    const filesRootNode = this.createRootNode(
      this.shellResult.supplementalFiles,
      EditorTypeOption.SupplementalFiles,
      'SupplementalFiles',
      'supplementalFiles',
    );
    filesRootNode.data!.parent = null;
    filesRootNode.label = this.translate.instant(this.getNodeLabel(filesRootNode) ?? '-');
    this.allFilesTreeNode = filesRootNode;

    this.shellResult.supplementalFiles?.forEach((file) => {
      const fileNode = this.createLeafNode(file, EditorTypeOption.SupplementalFile, file.filename ?? 'File');
      fileNode.children = [];
      filesRootNode.children?.push(fileNode);
    });

    this.treeData.push(filesRootNode);

    this.loading = false;
  }

  private createShellNode(shell: aas.types.AssetAdministrationShell, environment: aas.types.Environment) {
    // find the referenced submodels, missing ones get a placeholder
    const submodelList: (aas.types.Submodel | MissingSubmodelPlaceholder)[] = [];
    for (const reference of shell.submodels ?? []) {
      const submodel = environment.submodels?.find(
        (s) => s.id === reference.keys.find((k) => k.type === aas.types.KeyTypes.Submodel)?.value,
      );
      submodelList.push(
        submodel ?? {
          managedType: 'MissingSubmodel',
          modelType: { name: 'MissingSubmodel' },
          managedItem: 'MissingSubmodel',
          data: reference,
          editorType: EditorTypeOption.MissingSubmodel,
          label: this.translate.instant('MISSING_SUBMODEL'),
        },
      );
    }

    const id = uuid();
    const aasData = new V3TreeItem<aas.types.AssetAdministrationShell>();
    aasData.content = shell;
    aasData.id = id;
    aasData.editorType = EditorTypeOption.AssetAdministrationShell;
    const shellNode: TreeNode<V3TreeItem<aas.types.AssetAdministrationShell>> = {
      label: 'tbd',
      data: aasData,
      children: [],
      key: id,
      expanded: true,
      draggable: false,
    };
    shellNode.children = this.buildSubmodelChildren(submodelList, shellNode as V3TreeNode) as TreeNode<
      V3TreeItem<aas.types.AssetAdministrationShell>
    >[];
    const key = shell.idShort == null || shell.idShort === '' ? shell.id : shell.idShort;
    shellNode.label = this.translate.instant(key);
    return shellNode;
  }

  /** Collapsed, not draggable root level node (concept descriptions, supplemental files). */
  private createRootNode(content: V3TreeContent, editorType: EditorTypeOption, label: string, key: string) {
    const data = new V3TreeItem<V3TreeContent>();
    data.content = content;
    data.id = uuid();
    data.editorType = editorType;
    const node: V3TreeNode = { label, data, children: [], key, expanded: false, draggable: false };
    return node;
  }

  /** Not draggable node without parent (concept description, supplemental file). */
  private createLeafNode(content: V3TreeContent, editorType: EditorTypeOption, label: string): V3TreeNode {
    const id = uuid();
    const data = new V3TreeItem<V3TreeContent>();
    data.content = content;
    data.id = id;
    data.editorType = editorType;
    data.parent = null;
    return { label, data, key: id, expanded: false, draggable: false };
  }

  buildSubmodelChildren(
    parentData: (aas.types.Class | MissingSubmodelPlaceholder)[] | null | undefined,
    parentNode: V3TreeNode,
  ): V3TreeNode[] {
    if (parentData == null) {
      return parentData as unknown as V3TreeNode[];
    }

    const children: V3TreeNode[] = [];
    let cnt = 0;
    parentData.forEach((element) => {
      let collectChildren: V3TreeNode[] = [];
      const id = uuid();
      const nodeData = new V3TreeItem<V3TreeContent>();
      nodeData.content = element;
      nodeData.id = id;
      nodeData.editorType = InstanceHelper.getInstanceName(element) as EditorTypeOption;
      nodeData.parent = parentNode.data;
      const referable = element as aas.types.IReferable & { id?: string };
      let elementLabel = referable?.idShort ?? referable?.id;
      if (parentNode.data?.content instanceof aas.types.SubmodelElementList) {
        nodeData.isParentSml = true;
        nodeData.smlIndex = cnt++;
        elementLabel = 'Element ' + nodeData.smlIndex;
      }
      const el: V3TreeNode = {
        label: elementLabel ?? undefined,
        data: nodeData,
        key: id,
        expanded: false,
        children: [],
        parent: parentNode,
      };
      el.label = this.translate.instant(this.getNodeLabel(el) ?? '-');

      // collect the child elements depending on the type
      if (element instanceof aas.types.Submodel) {
        el.draggable = false;
        if (element?.semanticId?.keys[0].value === 'AasDesignerChangelog') {
          this.treeService.aasDesignerChangelogSmNodeId = id;
        }
        collectChildren = this.buildSubmodelChildren(element?.submodelElements, el);
      }
      if (
        (element instanceof aas.types.SubmodelElementCollection || element instanceof aas.types.SubmodelElementList) &&
        element.value != null
      ) {
        collectChildren = this.buildSubmodelChildren(element.value, el);
      }
      if (element instanceof aas.types.Entity) {
        collectChildren = this.buildSubmodelChildren(element.statements, el);
      }
      if ((element as MissingSubmodelPlaceholder).editorType === EditorTypeOption.MissingSubmodel) {
        nodeData.editorType = EditorTypeOption.MissingSubmodel;
      }

      el.children = collectChildren;
      children.push(el);
    });

    return children;
  }

  selectTreeNode(treeNode: V3TreeNode | null | undefined, saveVisit: boolean = true): void {
    if (treeNode != null) {
      this.selectedTreeNode = treeNode;
      this.selectedElementChanged.emit(treeNode.data);
      if (saveVisit === true) {
        this.treeService.addVisitedNode(treeNode.data?.id as string);
      }
      this.scrollToSelectionPrimeNgDataTree(treeNode);
    }
  }

  get selectedNodeId() {
    return (this.treeService.selectedTreeNode as V3TreeNode | null)?.data?.id ?? '';
  }

  onNodeClicked(node: V3TreeNode) {
    this.treeService.selectedTreeNode = node;
    this.selectTreeNode(node);
  }

  toggleNode(node: V3TreeNode, event?: Event) {
    event?.stopPropagation();
    node.expanded = !node.expanded;
  }

  hasChildren(node: V3TreeNode) {
    return hasChildren(node);
  }

  trackByNodeId(_index: number, node: V3TreeNode) {
    return node.data?.id ?? node.key ?? _index;
  }

  onFilterChanged() {
    this.filteredNodeIds = collectFilteredNodeIds(this.treeData, this.filterValue, (node) => this.getNodeLabel(node));
  }

  isNodeVisible(node: V3TreeNode) {
    return isNodeVisible(node, this.filteredNodeIds);
  }

  shouldRenderChildren(node: V3TreeNode) {
    return shouldRenderChildren(node, this.filteredNodeIds);
  }

  buildVisibleFlatNodes(): FlatTreeNode[] {
    return buildVisibleFlatNodes(this.treeData, this.filteredNodeIds);
  }

  trackByFlatNodeId(_index: number, item: FlatTreeNode) {
    return item.node.data?.id ?? item.node.key ?? _index;
  }

  getNodeDomId(node: V3TreeNode) {
    return 'tree_' + (node.data?.id ?? node.key ?? 'unknown');
  }

  onTreeKeydown(event: KeyboardEvent) {
    const visible = this.buildVisibleFlatNodes().map((x) => x.node);
    if (visible.length === 0) return;

    const currentId = this.selectedNodeId;
    let index = visible.findIndex((n) => n.data?.id === currentId);
    if (index < 0) index = 0;
    const current = visible[index];

    switch (event.key) {
      case 'ArrowDown': {
        const next = visible[Math.min(index + 1, visible.length - 1)];
        if (next != null) this.onNodeClicked(next);
        event.preventDefault();
        break;
      }
      case 'ArrowUp': {
        const prev = visible[Math.max(index - 1, 0)];
        if (prev != null) this.onNodeClicked(prev);
        event.preventDefault();
        break;
      }
      case 'ArrowRight': {
        if (this.hasChildren(current) && current.expanded !== true) {
          current.expanded = true;
        } else if (this.hasChildren(current) && current.children != null) {
          const firstChild = current.children.find((n) => this.isNodeVisible(n));
          if (firstChild != null) this.onNodeClicked(firstChild);
        }
        event.preventDefault();
        break;
      }
      case 'ArrowLeft': {
        if (this.hasChildren(current) && current.expanded === true && this.filteredNodeIds == null) {
          current.expanded = false;
        } else if (current.parent != null) {
          this.onNodeClicked(current.parent);
        }
        event.preventDefault();
        break;
      }
      case 'Enter': {
        if (this.hasChildren(current)) {
          this.toggleNode(current);
        }
        event.preventDefault();
        break;
      }
    }
  }

  canReorderInParent(parentNode: V3TreeNode | null | undefined) {
    return canReorderInParent(parentNode);
  }

  isNodeDraggable(node: V3TreeNode) {
    return canReorderInParent(node.parent);
  }

  onDragStarted(node: V3TreeNode) {
    this.draggedNode = node;
  }

  onDragEnded() {
    this.draggedNode = null;
  }

  isDropAllowedForTarget(targetNode: V3TreeNode) {
    return isDropAllowed(this.draggedNode, targetNode);
  }

  isDropForbiddenForTarget(targetNode: V3TreeNode) {
    if (this.draggedNode == null) return false;
    if (this.draggedNode === targetNode) return false;
    return !this.isDropAllowedForTarget(targetNode);
  }

  onFlatNodeDrop(event: CdkDragDrop<FlatTreeNode[]>) {
    const flat = event.container.data;
    const dragged = flat[event.previousIndex];
    const target = flat[event.currentIndex];

    if (dragged == null || target == null) return;

    if (dragged.parent === target.parent) {
      const result = reorderWithinParent(
        dragged.parent,
        event.previousIndex,
        event.currentIndex,
        dragged.node,
        target.node,
      );
      if (result === 'moved') {
        this.treeService.registerFieldUndoStep();
        this.treeService.aasTreeData = [...this.treeData];
      } else if (result === 'not-allowed') {
        this.showMoveNotAllowed();
      }
      return;
    }

    const movedContent = moveAcrossParents(dragged.node, target.node);
    if (movedContent == null) {
      this.showMoveNotAllowed();
      return;
    }
    this.treeService.registerFieldUndoStep();
    this.refreshTree();
    setTimeout(() => this.treeService.selectNodeByElement(movedContent));
  }

  private showMoveNotAllowed() {
    this.notificationService.showMessageAlways('MOVE_NOT_ALLOWED', 'ERROR', 'error', false, 2000, null);
  }

  getNodeLabel(treeNode: V3TreeNode): string {
    return getNodeLabel(treeNode, this.translate.currentLang);
  }

  expandAll() {
    this.treeService.aasTreeData = this.treeData.map((node) => withExpandedState(node, true));
  }

  collapseAll() {
    this.treeService.aasTreeData = this.treeData.map((node) => withExpandedState(node, false));
  }

  getTypeTag(node: V3TreeNode) {
    return getTypeTag(node);
  }

  hasAasTypeTag(node: V3TreeNode) {
    return node.data?.content instanceof aas.types.AssetAdministrationShell;
  }

  getAasTypeTag(node: V3TreeNode) {
    const content = node.data?.content;
    return content instanceof aas.types.AssetAdministrationShell ? TagHelper.getAasTypeTag(content) : '';
  }

  getAasTypeTagSeverity(node: V3TreeNode) {
    const content = node.data?.content;
    return content instanceof aas.types.AssetAdministrationShell ? TagHelper.getAasTypeTagSeverity(content) : undefined;
  }

  isUnreferenced(_node: V3TreeNode) {
    return false;
  }

  isLocal(node: TreeNode) {
    if (node?.data?.modelType?.name === 'SupplementalFile') {
      return node.data.isLocal;
    }
    return false;
  }

  elementCopied(copiedElement: V3TreeItem<V3TreeContent>) {
    this.copiedElement = copiedElement;
  }

  addFileNode(file: SupplementalFile) {
    const id = uuid();
    const nodeData = new V3TreeItem<SupplementalFile>();
    nodeData.content = file;
    nodeData.id = id;
    nodeData.editorType = EditorTypeOption.SupplementalFile;
    nodeData.parent = null;
    const el: V3TreeNode = {
      label: this.translate.instant('NEW_FILE'),
      data: nodeData,
      key: id,
      expanded: false,
      children: [],
    };

    if (this.allFilesTreeNode != null) {
      if (this.allFilesTreeNode.children == null) this.allFilesTreeNode.children = [];
      this.allFilesTreeNode.children.push(el);
      this.allFilesTreeNode.expanded = true;
    }
  }

  deleteFileNode(file: SupplementalFile) {
    const children = this.allFilesTreeNode?.children;
    if (this.allFilesTreeNode != null && children != null) {
      const node = children.find((f) => {
        const content = f.data?.content as SupplementalFile | undefined;
        return content?.path === file.path && content?.isThumbnail === file.isThumbnail;
      });
      if (node != null) {
        children.splice(children.indexOf(node), 1);
      }
    }
    this.treeService.aasTreeData = [...this.treeData];
  }

  private getConceptDescriptionNode(cid: string) {
    return this.allConceptDescriptionsNode?.children?.find(
      (n) => (n.data?.content as aas.types.ConceptDescription | undefined)?.id === cid,
    );
  }

  selectConceptDescription(cid: string) {
    const node = this.getConceptDescriptionNode(cid);
    if (node != null && this.allConceptDescriptionsNode != null) {
      this.treeService.selectedTreeNode = node;
      this.allConceptDescriptionsNode.expanded = true;
      this.selectTreeNode(node);
    }
  }

  createAndSelectConceptDescription(cid: string) {
    this.addConceptDescriptionNode(new aas.types.ConceptDescription(cid));
    this.selectConceptDescription(cid);
    this.treeService.aasTreeData = [...this.treeData];
  }

  appendConceptDescription(cd: aas.types.ConceptDescription) {
    this.addConceptDescriptionNode(cd);
    this.treeService.aasTreeData = [...this.treeData];
  }

  /** Adds the concept description to the environment and a node for it to the concept descriptions node. */
  private addConceptDescriptionNode(cd: aas.types.ConceptDescription) {
    const rootNode = this.allConceptDescriptionsNode;
    const environment = rootNode?.data?.content as aas.types.Environment | undefined;
    if (rootNode == null || environment == null) return;

    if (environment.conceptDescriptions == null) {
      environment.conceptDescriptions = [];
    }
    environment.conceptDescriptions.push(cd);
    appendChildTreeNode(rootNode, cd, EditorTypeOption.ConceptDescription, cd?.idShort ?? cd.id);
  }

  deleteConceptDescriptionNode(cid: string) {
    if (this.allConceptDescriptionsNode?.children != null && this.getConceptDescriptionNode(cid) != null) {
      this.allConceptDescriptionsNode.children = this.allConceptDescriptionsNode.children.filter(
        (n) => (n.data?.content as aas.types.ConceptDescription | undefined)?.id !== cid,
      );
    }
    this.treeService.aasTreeData = [...this.treeData];
  }

  deleteSmNode(nodeId: string) {
    const deleteNode = this.findNodeById(nodeId);
    if (this.shellNode?.children != null) {
      this.shellNode.children = this.shellNode.children.filter((n) => n.data?.id !== nodeId);
    }
    if (deleteNode?.parent?.data?.id != null) this.selectById(deleteNode.parent.data.id);
    this.treeService.aasTreeData = [...this.treeData];
  }

  selectById(id: string, saveVisit: boolean = false) {
    const node = this.findNodeById(id);
    if (node != null) {
      this.treeService.selectedTreeNode = node;
      this.selectTreeNode(node, saveVisit);
      this.expandParents(node);
    }
  }

  private scrollToSelectionPrimeNgDataTree(selection: V3TreeNode | null) {
    if (this.treeData != null && selection != null) {
      const flat = this.buildVisibleFlatNodes();
      const index = flat.findIndex((x) => x.node.data?.id === selection.data?.id);
      if (index >= 0) {
        this.viewport?.scrollToIndex(index, 'smooth');
      }

      setTimeout(() => {
        const elem = document.getElementById('tree_' + selection.data?.id);
        if (elem != null && !this.isInViewport(elem)) {
          elem.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
        }
      });
    }
  }

  isInViewport(element: Element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  /** Typed loosely on purpose: callers of V3TreeService.findById access the content without narrowing. */
  findNodeById(id: string): TreeNode<V3TreeItem<any>> | null {
    return findNodeById(this.treeData, id);
  }

  findNodeByIdRecursive(node: V3TreeNode, id: string): V3TreeNode | null {
    return findNodeRecursive(node, (n) => n.data?.id === id);
  }

  selectNodeByElementIdShortPath(path: string) {
    const foundNode = findNodeByIdShortPath(this.treeData[this.SHELL_ROOT_INDEX], path);
    if (foundNode?.data?.id != null) {
      this.selectById(foundNode.data.id, true);
    }
  }

  applyState(tree: TreeNode[], _selectedId: string) {
    this.treeService.aasTreeData = tree;
    // trigger an update of the editor with the selected element
    this.selectById(_selectedId);
  }

  navigateToPath(path: Path) {
    if (this.shellResult == null) return;

    let x: V3TreeNode | null = null;
    let indx = path.segments.length - 1;

    if (path.toString().startsWith('.submodels') || path.toString().startsWith('.assetAdministrationShells')) {
      while (x == null && indx > 0) {
        const segment = path.segments[indx];
        const element = 'instance' in segment ? segment.instance : segment.sequence[segment.index];
        x = this.findNodeByElementRecursive(this.treeData[this.SHELL_ROOT_INDEX], element);
        indx--;
      }
    } else {
      while (x == null && indx > 0) {
        const segment = path.segments[indx];
        const element = 'instance' in segment ? segment.instance : undefined;
        x = this.findNodeByElementRecursive(this.treeData[this.CONCEPT_DESCRIPTIONS_INDEX], element);
        indx--;
        this.treeData[this.CONCEPT_DESCRIPTIONS_INDEX].expanded = true;
      }
    }
    if (x != null) {
      this.treeService.selectedTreeNode = x;
      this.selectTreeNode(x);
      this.expandParents(x);
    }
  }

  selectRoot() {
    this.treeService.selectedTreeNode = this.treeData[0];
    this.selectedElementChanged.emit(this.treeData[0].data);
  }

  findNodeByElementRecursive(node: V3TreeNode, element: unknown): V3TreeNode | null {
    return findNodeRecursive(node, (n) => n.data?.content === element);
  }

  expandParents(node: V3TreeNode) {
    expandParents(node);
  }

  showInsertSnippetDialog(data: {
    visibility: boolean;
    allowedTypes: string[];
    uuid: string;
    elementType: string;
    parentElement: V3TreeNode | undefined;
  }) {
    this.insertSnippetDialogVisible = data.visibility;
    if (data.visibility === true) {
      this.snippetTable?.getAllSnippets(AasMetamodelVersion.V3, data.allowedTypes);
      if (this.snippetTable != null) {
        this.snippetTable.uuid = data.uuid;
        this.snippetTable.elementType = data.elementType;
        this.snippetTable.parentElement = data.parentElement;
      }
    }
  }

  showInsertJsonDialog(event: { type: JsonImportType; node: V3TreeNode }) {
    this.treeService.selectedTreeNode = event.node;
    this.selectedTreeNode = event.node;
    this.importJsonDialogVisible = true;
    this.importType = event.type;
    this.plainJson = '';
  }

  showInsertFromEclassDialog(event: { parentElement: V3TreeNode }) {
    this.importFromEclassDialogVisible = true;
    this.targetNodeId = event.parentElement.data?.id ?? 'undefined';
  }

  insertSnippetFromDialog(event: {
    snippetId: number;
    uuid: string;
    elementType: string;
    parentElement: V3TreeNode;
    data?: string;
  }) {
    const element = deserializeSnippet(event.elementType, event.data);
    if (element instanceof aas.types.Submodel) {
      element.id = IdGenerationUtil.generateIri('submodel', this.portalService.iriPrefix);
      ElementInserter.insertSubmodel(element, this.treeService, this.shellResult);
    } else if (element != null && this.treeService.selectedTreeNode) {
      if (element instanceof aas.types.ConceptDescription) {
        ElementInserter.insertConceptDescription(element, this.treeService);
      } else {
        this.insertSme(element as aas.types.ISubmodelElement, event.parentElement.data!.editorType);
      }
    }
    this.insertSnippetDialogVisible = false;
  }

  insertSme(sme: aas.types.ISubmodelElement, parentType: EditorTypeOption) {
    switch (parentType) {
      case EditorTypeOption.SubmodelElementCollection:
      case EditorTypeOption.SubmodelElementList:
        ElementInserter.insertSubmodelElementToCollection(sme, this.treeService);
        break;
      case EditorTypeOption.Submodel:
        ElementInserter.insertSubmodelElementToSubmodel(sme, this.treeService);
        break;
    }
  }

  /** Rebuilds the children of the node from the given model elements (only if there are any) and expands it. */
  private rebuildChildren(
    node: V3TreeNode,
    elements: aas.types.ISubmodelElement[] | null | undefined,
    clearAlways: boolean = false,
  ) {
    if (clearAlways) node.children = [];
    if (elements != null) {
      node.children = this.buildSubmodelChildren(elements, node);
      node.expanded = true;
    }
  }

  refreshMarkingNodes() {
    const node = this.serviceSelectedNode;
    this.rebuildChildren(node, (node?.data?.content as aas.types.SubmodelElementCollection | undefined)?.value, true);
  }

  refreshSubmodelNodes() {
    const node = this.serviceSelectedNode;
    this.rebuildChildren(node, (node?.data?.content as aas.types.Submodel | undefined)?.submodelElements);
  }

  refreshChangelogNodes() {
    const node = this.treeService.findById(this.treeService.aasDesignerChangelogSmNodeId) as V3TreeNode | null;
    if (node != null) {
      node.children = this.buildSubmodelChildren(
        (node.data?.content as aas.types.Submodel | undefined)?.submodelElements,
        node,
      );
      node.expanded = true;
    }
  }

  selectParentNode() {
    this.treeService.selectNodeByElement(this.serviceSelectedNode.parent?.data?.content);
  }

  refreshEntityNodes() {
    const node = this.serviceSelectedNode;
    this.rebuildChildren(node, (node?.data?.content as aas.types.Entity | undefined)?.statements);
  }

  refreshSml() {
    const node = this.serviceSelectedNode;
    this.rebuildChildren(node, (node?.data?.content as aas.types.SubmodelElementList | undefined)?.value, true);
  }

  refreshTree() {
    this.initTree();
  }

  insertPlainJson() {
    const jsonable = JSON.parse(this.plainJson ?? '');
    if (this.importType === 'submodel') {
      const instanceOrError = aas.jsonization.submodelFromJsonable(jsonable);
      if (instanceOrError.value != null) {
        ElementInserter.insertSubmodel(instanceOrError.value, this.treeService, this.shellResult);
        this.closeImportDialogAndEmitSelection();
      } else {
        this.showImportError(instanceOrError.error);
      }
    }
    if (this.importType === 'element') {
      const instanceOrError = aas.jsonization.submodelElementFromJsonable(jsonable);
      if (instanceOrError.value != null && this.treeService.selectedTreeNode && !isArray(this.selectedTreeNode)) {
        const node = this.selectedTreeNode as V3TreeNode;
        this.insertSme(instanceOrError.value, node.data?.editorType as EditorTypeOption);
        this.importJsonDialogVisible = false;
        const insertedNode = node.children?.[node.children.length - 1];
        if (insertedNode != null) {
          this.onNodeClicked(insertedNode);
        } else {
          this.selectedElementChanged.emit((this.treeService.selectedTreeNode as V3TreeNode | null)?.data);
        }
      } else if (instanceOrError.value == null) {
        this.showImportError(instanceOrError.error);
      }
    }
    if (this.importType === 'cd') {
      const instanceOrError = aas.jsonization.conceptDescriptionFromJsonable(jsonable);
      if (instanceOrError.value != null) {
        ElementInserter.insertConceptDescription(instanceOrError.value, this.treeService);
        this.closeImportDialogAndEmitSelection();
      } else {
        this.showImportError(instanceOrError.error);
      }
    }
  }

  private closeImportDialogAndEmitSelection() {
    this.importJsonDialogVisible = false;
    this.selectedElementChanged.emit((this.treeService.selectedTreeNode as V3TreeNode | null)?.data);
  }

  private showImportError(error: aas.jsonization.DeserializationError | null) {
    if (error != null) {
      console.warn(formatDeserializationError(error));
    }
    this.notificationService.showMessageAlways(
      'ERROR_IMPORT_JSON',
      'ERROR',
      'error',
      true,
      10000,
      formatDeserializationError(error),
    );
  }

  setPlainJsonText(event: { files: File[] }) {
    const myReader: FileReader = new FileReader();

    myReader.onloadend = () => {
      this.plainJson = myReader.result as string;
      this.checkJsonValidity();
      this.jsonFileUpload?.clear();
    };

    myReader.readAsText(event.files[0]);
  }

  @HostListener('window:refreshEntityTreeNodes', ['$event'])
  async refreshEntityTreeNodes(_changesevent: Event) {
    this.refreshSubmodelNodes();
    this.refreshEntityNodes();
  }

  @HostListener('window:selectAndRefreshParentTreeNode', ['$event'])
  async refreshParentTreeNode(_changesevent: Event) {
    this.selectParentNode();
    this.refreshSubmodelNodes();
    this.refreshEntityNodes();
  }

  checkJsonValidity() {
    const result = validateImportJson(this.plainJson, this.importType);
    this.jsonValid.set(result.valid);
    this.jsonValidationError.set(result.valid ? null : result.error);
  }
}
