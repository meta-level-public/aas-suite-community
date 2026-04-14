import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { SubmodelTemplate } from '@aas-designer-model';
import { IdGenerationUtil, InstanceHelper, TagHelper } from '@aas/helpers';
import { AasMetamodelVersion, PackageMetadata, ShellResult, SupplementalFile } from '@aas/model';
import {
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
import { TreeNode } from 'primeng/api';
import { v4 as uuid } from 'uuid';
import { SnippetsCatalogComponent } from '../../catalog/snippets-catalog/snippets-catalog.component';
import { CMTypeOption } from '../model/cm-type-option';
import { EditorTypeOption } from '../model/editor-type-option';
import { V3TreeItem } from '../model/v3-tree-item';
import { ElementInserter } from '../tools/element-inserter';
import { V3EditorService } from '../v3-editor.service';
import { V3TreeContextMenuComponent } from '../v3-tree-context-menu/v3-tree-context-menu.component';
import { V3TreeService } from './v3-tree.service';
type Path = aas.jsonization.Path;

import { ConceptDescription } from '@aas-core-works/aas-core3.1-typescript/types';
import { NotificationService, PortalService } from '@aas/common-services';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { isArray } from 'lodash-es';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { FileUpload } from 'primeng/fileupload';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Tag } from 'primeng/tag';
import { Textarea } from 'primeng/textarea';
import { Tooltip } from 'primeng/tooltip';
import { ExtendedSearchComponent } from '../../general/extended-search/extended-search.component';
import { EclassSinglePropertyGeneratorComponent } from '../components/eclass-property-generator/single/eclass-single-property-generator.component';

type FlatTreeNode = {
  node: TreeNode<V3TreeItem<any>>;
  depth: number;
  parent: TreeNode<V3TreeItem<any>> | null;
};

@Component({
  selector: 'aas-v3-tree',
  templateUrl: './v3-tree.component.html',
  styleUrls: ['../../../host.scss'],
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

  @Output() selectedElementChanged: EventEmitter<V3TreeItem<any> | undefined> = new EventEmitter<
    V3TreeItem<any> | undefined
  >();

  allSubmodelsTreeNode: TreeNode<V3TreeItem<any>> | undefined;
  allFilesTreeNode: TreeNode<V3TreeItem<any>> | undefined;
  allConceptDescriptionsNode: TreeNode<V3TreeItem<any>> | undefined;

  selectedTreeNode: any;
  copiedElement: V3TreeItem<any> | undefined;

  EditorTypeOption = EditorTypeOption;

  SHELL_ROOT_INDEX = 0;
  CONCEPT_DESCRIPTIONS_INDEX = 1;
  availableSubmodelTemplates: SubmodelTemplate[] = [];
  insertSnippetDialogVisible: boolean = false;
  @ViewChild('snippetTable') snippetTable: SnippetsCatalogComponent | undefined;
  @ViewChild('cm') cm: V3TreeContextMenuComponent | undefined;
  @ViewChild(CdkVirtualScrollViewport) viewport: CdkVirtualScrollViewport | undefined;
  // shellRootNode: TreeNode<V3TreeItem<PackageMetadata>> | undefined;
  shellNode: TreeNode<V3TreeItem<aas.types.AssetAdministrationShell>> | undefined;

  importJsonDialogVisible = false;
  plainJson: string = '';
  importType: 'submodel' | 'element' | 'cd' = 'submodel';
  importFromEclassDialogVisible: boolean = false;
  targetNodeId: string = '';
  filterValue = '';
  private filteredNodeIds: Set<string> | null = null;
  draggedNode: TreeNode<V3TreeItem<any>> | null = null;

  translate = inject(TranslateService);

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

  initTree(): void {
    if (this.shellResult?.v3Shell != null && this.shellResult.v3Shell.assetAdministrationShells != null) {
      this.treeService.resetVisited();
      this.treeService.resetUndo();
      this.mapAasToTreeNode();
      this.treeService.selectedTreeNode = this.treeService.aasTreeData[0];
      this.selectedTreeNode = this.treeService.selectedTreeNode;
      this.selectedElementChanged.emit(this.treeService.selectedTreeNode.data);
      this.treeService.treeComponent = this;
      this.treeService.addVisitedNode(this.treeService.selectedTreeNode.data?.id ?? '');
      if (this.shellResult != null) {
        this.treeService.registerUndoStep(
          this.treeService.aasTreeData,
          this.treeService.selectedTreeNode.data?.id ?? '',
        );
      }
    }
  }

  mapAasToTreeNode() {
    if (this.shellResult != null) {
      this.loading = true;
      this.treeService.aasTreeData = [];

      if (this.shellResult?.v3Shell != null && this.shellResult.v3Shell.assetAdministrationShells != null) {
        for (const shell of this.shellResult.v3Shell.assetAdministrationShells) {
          // vorhandene Shells finden
          const submodelList = [];
          if (shell.submodels != null) {
            for (const element of shell.submodels) {
              const submodelElement = this.shellResult.v3Shell?.submodels?.find(
                (s) => s.id === element.keys.find((k) => k.type === aas.types.KeyTypes.Submodel)?.value,
              );
              if (submodelElement != null) {
                submodelList.push(submodelElement);
              } else {
                submodelList.push({
                  managedType: 'MissingSubmodel',
                  modelType: { name: 'MissingSubmodel' },
                  managedItem: 'MissingSubmodel',
                  data: element,
                  editorType: EditorTypeOption.MissingSubmodel,
                  label: this.translate.instant('MISSING_SUBMODEL'),
                });
              }
            }
          }

          const id = uuid();
          const aasData = new V3TreeItem<aas.types.AssetAdministrationShell>();
          aasData.content = shell;
          aasData.id = id;
          aasData.editorType = EditorTypeOption.AssetAdministrationShell;
          // aasData.parent = this.shellRootNode.data; // gibt keine env mehr
          const shellNode: TreeNode<V3TreeItem<aas.types.AssetAdministrationShell>> = {
            label: 'tbd',
            data: aasData,
            children: [],
            // parent: this.shellRootNode, // gibt keine env mehr
            key: id,
            expanded: true,
            draggable: false,
          };
          shellNode.children = this.buildSubmodelChildren(submodelList, shellNode);
          // shellNodes.push(shellNode);
          let key = aasData.content.idShort;
          if (key == null || key === '') {
            key = aasData.content.id;
          }

          shellNode.label = this.translate.instant(key);

          this.treeService.aasTreeData.push(shellNode);
          this.shellNode = shellNode;
        }
      }

      // conceptDescription ebene einfügen
      const cdsData = new V3TreeItem<any>();
      cdsData.content = this.shellResult.v3Shell;
      cdsData.id = uuid();
      cdsData.editorType = EditorTypeOption.ConceptDescriptions;
      // cdsData.parent = this.shellRootNode.data;
      const conceptDescriptionsRootNode: TreeNode<V3TreeItem<any>> = {
        label: 'ConceptDescriptions',
        data: cdsData,
        children: [],
        key: 'conceptDescriptions',
        expanded: false,
        draggable: false,
      };

      for (const cd of this.shellResult?.v3Shell?.conceptDescriptions ?? []) {
        const id = uuid();
        const cdData = new V3TreeItem<aas.types.ConceptDescription>();
        cdData.content = cd;
        cdData.id = id;
        cdData.editorType = EditorTypeOption.ConceptDescription;
        cdData.parent = null;
        conceptDescriptionsRootNode.children?.push({
          label: cd.idShort ?? cd.id,
          data: cdData,
          key: id,
          expanded: false,
          draggable: false,
        });
        conceptDescriptionsRootNode.label = this.translate.instant(
          this.getNodeLabel(conceptDescriptionsRootNode) ?? '-',
        );
      }

      this.treeService.aasTreeData.push(conceptDescriptionsRootNode);
      this.allConceptDescriptionsNode = conceptDescriptionsRootNode;

      // knoten für Files anhängen
      // conceptDescription ebene einfügen
      // todo: prüfen ob man hier statt any echte typen nutzen kann
      const filesNodeData = new V3TreeItem<any>();
      filesNodeData.content = this.shellResult.supplementalFiles;
      filesNodeData.id = uuid();
      filesNodeData.editorType = EditorTypeOption.SupplementalFiles;
      filesNodeData.parent = null;
      const filesRootNode: TreeNode<V3TreeItem<any>> = {
        label: 'SupplementalFiles',
        data: filesNodeData,
        children: [],
        key: 'supplementalFiles',
        expanded: false,
        draggable: false,
      };
      filesRootNode.label = this.translate.instant(this.getNodeLabel(filesRootNode) ?? '-');

      this.allFilesTreeNode = filesRootNode;

      this.shellResult.supplementalFiles?.forEach((file) => {
        const id = uuid();
        const nodeData = new V3TreeItem<SupplementalFile>();
        nodeData.content = file;
        nodeData.id = id;
        nodeData.editorType = EditorTypeOption.SupplementalFile;
        nodeData.parent = null;
        const el: TreeNode<V3TreeItem<any>> = {
          label: file.filename ?? 'File',
          data: nodeData,
          key: id,
          expanded: false,
          draggable: false,
          children: [],
        };
        filesRootNode.children?.push(el);
      });

      // if (this.extendedMode)
      this.treeService.aasTreeData.push(filesRootNode);

      this.loading = false;
    }
  }
  buildSubmodelChildren(parentData: any, parentNode: TreeNode<V3TreeItem<any>>): any[] {
    if (parentData == null) {
      return parentData;
    }

    // todo: typisierung prüfen
    const children: TreeNode<V3TreeItem<any>>[] = [];

    let cnt = 0;
    parentData.forEach((element: any) => {
      let collectChildren: TreeNode<V3TreeItem<any>>[] = [];
      //Aufbau der Grundstruktur
      const id = uuid();
      const nodeData = new V3TreeItem<any>();
      nodeData.content = element;
      nodeData.id = id;
      nodeData.editorType = InstanceHelper.getInstanceName(element);
      nodeData.parent = parentNode.data;
      let elementLabel = element?.idShort ?? element?.id;
      if (parentNode.data?.content instanceof aas.types.SubmodelElementList) {
        elementLabel = 'Element ' + cnt++;
        nodeData.isParentSml = true;
      }
      const el: TreeNode<V3TreeItem<any>> = {
        label: elementLabel,
        data: nodeData,
        key: id,
        expanded: false,
        children: [],
        parent: parentNode,
      };
      el.label = this.translate.instant(this.getNodeLabel(el) ?? '-');

      // Auf einzelne Typen prüfen und entsprechend die Kindelemente "sammeln".
      if (element instanceof aas.types.Submodel) {
        el.draggable = false;
        if (element?.semanticId?.keys[0].value === 'AasDesignerChangelog') {
          this.treeService.aasDesignerChangelogSmNodeId = id;
        }

        collectChildren = this.buildSubmodelChildren(element?.submodelElements, el);
      }

      if (element instanceof aas.types.SubmodelElementCollection) {
        if (element.value != null) collectChildren = this.buildSubmodelChildren(element.value, el);
      }

      if (element instanceof aas.types.SubmodelElementList) {
        // zeigen wir nicht mehr an! - müssen wir doch, aber es muss ein neues Label erzeugt werden und die Markierung gesett sein, dass keine ID-Short enthalten ist ...
        if (element.value != null) collectChildren = this.buildSubmodelChildren(element.value, el);
      }

      if (element instanceof aas.types.Entity) {
        collectChildren = this.buildSubmodelChildren(element.statements, el);
      }

      if (element.editorType === EditorTypeOption.MissingSubmodel) {
        // irgendwie anzeigen, dass das Teilmodell fehlt
        // node korrigieren
        nodeData.editorType = EditorTypeOption.MissingSubmodel;
      }

      // Kind-Elemente zuweisen
      el.children = collectChildren;
      children.push(el);
    });

    return children;
  }

  selectTreeNode(treeNode: any, saveVisit: boolean = true): void {
    if (treeNode != null) {
      this.selectedTreeNode = treeNode;
      this.selectedElementChanged.emit(treeNode.data);
      if (saveVisit === true) {
        this.treeService.addVisitedNode(treeNode.data.id);
      }
      this.scrollToSelectionPrimeNgDataTree(treeNode);
    } else {
      // this.selectedElementChanged.emit(undefined);
      // this.selectedTreeNode = this.treeService.selectedTreeNode;
    }
  }

  get selectedNodeId() {
    return ((this.treeService.selectedTreeNode as TreeNode<V3TreeItem<any>> | null)?.data?.id ?? '') as string;
  }

  onNodeClicked(node: TreeNode<V3TreeItem<any>>) {
    this.treeService.selectedTreeNode = node;
    this.selectTreeNode(node);
  }

  toggleNode(node: TreeNode<V3TreeItem<any>>, event?: Event) {
    event?.stopPropagation();
    node.expanded = !node.expanded;
  }

  hasChildren(node: TreeNode<V3TreeItem<any>>) {
    return (node.children?.length ?? 0) > 0;
  }

  trackByNodeId(_index: number, node: TreeNode<V3TreeItem<any>>) {
    return node.data?.id ?? node.key ?? _index;
  }

  onFilterChanged() {
    const query = this.filterValue.trim().toLowerCase();
    if (query === '') {
      this.filteredNodeIds = null;
      return;
    }

    const ids = new Set<string>();
    this.treeService.aasTreeData.forEach((root) => this.collectFilterMatches(root, query, ids));
    this.filteredNodeIds = ids;
  }

  private collectFilterMatches(node: TreeNode<V3TreeItem<any>>, query: string, ids: Set<string>): boolean {
    const ownLabel = (node.label ?? '').toString().toLowerCase();
    const fallbackLabel = (this.getNodeLabel(node) ?? '').toString().toLowerCase();
    const ownMatch = ownLabel.includes(query) || fallbackLabel.includes(query);
    const childMatch = (node.children ?? []).some((child) => this.collectFilterMatches(child, query, ids));
    const match = ownMatch || childMatch;
    if (match && node.data?.id != null) {
      ids.add(node.data.id);
    }
    return match;
  }

  isNodeVisible(node: TreeNode<V3TreeItem<any>>) {
    if (this.filteredNodeIds == null) return true;
    const id = node.data?.id;
    return id != null && this.filteredNodeIds.has(id);
  }

  shouldRenderChildren(node: TreeNode<V3TreeItem<any>>) {
    if (!this.hasChildren(node)) return false;
    if (this.filteredNodeIds != null) return true;
    return node.expanded === true;
  }

  private getVisibleNodes(): TreeNode<V3TreeItem<any>>[] {
    return this.buildVisibleFlatNodes().map((x) => x.node);
  }

  buildVisibleFlatNodes(): FlatTreeNode[] {
    const visible: FlatTreeNode[] = [];
    const walk = (nodes: TreeNode<V3TreeItem<any>>[], depth: number, parent: TreeNode<V3TreeItem<any>> | null) => {
      for (const node of nodes) {
        if (!this.isNodeVisible(node)) continue;
        visible.push({ node, depth, parent });
        if (this.shouldRenderChildren(node) && node.children != null) {
          walk(node.children as TreeNode<V3TreeItem<any>>[], depth + 1, node);
        }
      }
    };
    walk(this.treeService.aasTreeData as TreeNode<V3TreeItem<any>>[], 0, null);
    return visible;
  }

  trackByFlatNodeId(_index: number, item: FlatTreeNode) {
    return item.node.data?.id ?? item.node.key ?? _index;
  }

  getNodeDomId(node: TreeNode<V3TreeItem<any>>) {
    return 'tree_' + (node.data?.id ?? node.key ?? 'unknown');
  }

  onTreeKeydown(event: KeyboardEvent) {
    const visible = this.getVisibleNodes();
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
          const firstChild = (current.children as TreeNode<V3TreeItem<any>>[]).find((n) => this.isNodeVisible(n));
          if (firstChild != null) this.onNodeClicked(firstChild);
        }
        event.preventDefault();
        break;
      }
      case 'ArrowLeft': {
        if (this.hasChildren(current) && current.expanded === true && this.filteredNodeIds == null) {
          current.expanded = false;
        } else if (current.parent != null) {
          this.onNodeClicked(current.parent as TreeNode<V3TreeItem<any>>);
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

  canReorderInParent(parentNode: TreeNode<V3TreeItem<any>> | null | undefined) {
    if (parentNode?.data == null) return false;
    if (parentNode.data.content instanceof aas.types.Submodel) return true;
    if (parentNode.data.content instanceof aas.types.SubmodelElementCollection) return true;
    if (parentNode.data.content instanceof aas.types.SubmodelElementList) return true;
    if (parentNode.data.editorType === EditorTypeOption.ConceptDescriptions) return true;
    return false;
  }

  isNodeDraggable(node: TreeNode<V3TreeItem<any>>) {
    return this.canReorderInParent(node.parent);
  }

  onDragStarted(node: TreeNode<V3TreeItem<any>>) {
    this.draggedNode = node;
  }

  onDragEnded() {
    this.draggedNode = null;
  }

  isDropAllowedForTarget(targetNode: TreeNode<V3TreeItem<any>>) {
    if (this.draggedNode == null) return false;
    if (this.draggedNode === targetNode) return false;

    const draggedContent = this.draggedNode.data?.content;
    if (draggedContent == null) return false;

    if (this.draggedNode.parent === targetNode.parent) return true;
    return this.resolveTargetParentForDrop(targetNode, draggedContent) != null;
  }

  isDropForbiddenForTarget(targetNode: TreeNode<V3TreeItem<any>>) {
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
      this.reorderWithinParent(dragged.parent, event.previousIndex, event.currentIndex, dragged.node, target.node);
      return;
    }

    if (this.moveAcrossParents(dragged.node, target.node) === false) {
      this.notificationService.showMessageAlways('MOVE_NOT_ALLOWED', 'ERROR', 'error', false, 2000, null);
    }
  }

  private moveAcrossParents(draggedNode: TreeNode<V3TreeItem<any>>, targetNode: TreeNode<V3TreeItem<any>>) {
    const draggedContent = draggedNode.data?.content;
    const sourceParent = draggedNode.parent as TreeNode<V3TreeItem<any>> | null;
    if (draggedContent == null || sourceParent?.data?.content == null) {
      return false;
    }

    const sourceArray = this.getNodeContentArray(sourceParent);
    if (sourceArray == null) {
      return false;
    }

    const targetParent = this.resolveTargetParentForDrop(targetNode, draggedContent);
    if (targetParent?.data?.content == null) {
      return false;
    }

    const targetArray = this.getNodeContentArray(targetParent);
    if (targetArray == null) {
      return false;
    }

    const sourceIndex = sourceArray.indexOf(draggedContent);
    if (sourceIndex < 0) {
      return false;
    }

    sourceArray.splice(sourceIndex, 1);
    targetArray.push(draggedContent);

    this.treeService.registerFieldUndoStep();
    this.refreshTree();
    setTimeout(() => this.treeService.selectNodeByElement(draggedContent));
    return true;
  }

  private resolveTargetParentForDrop(
    targetNode: TreeNode<V3TreeItem<any>>,
    draggedContent: any,
  ): TreeNode<V3TreeItem<any>> | null {
    if (this.canAcceptAsParent(targetNode, draggedContent)) {
      return targetNode;
    }

    const parent = targetNode.parent as TreeNode<V3TreeItem<any>> | null;
    if (parent != null && this.canAcceptAsParent(parent, draggedContent)) {
      return parent;
    }
    return null;
  }

  private canAcceptAsParent(parentNode: TreeNode<V3TreeItem<any>>, draggedContent: any) {
    if (parentNode?.data == null) return false;

    if (
      parentNode.data.content instanceof aas.types.Submodel ||
      parentNode.data.content instanceof aas.types.SubmodelElementCollection ||
      parentNode.data.content instanceof aas.types.SubmodelElementList
    ) {
      return this.isSubmodelElementValue(draggedContent);
    }

    if (parentNode.data.editorType === EditorTypeOption.ConceptDescriptions) {
      return draggedContent instanceof aas.types.ConceptDescription;
    }

    return false;
  }

  private isSubmodelElementValue(value: any): value is aas.types.ISubmodelElement {
    return value instanceof aas.types.Class && aas.types.asSubmodelElement(value) != null;
  }

  private getNodeContentArray(parentNode: TreeNode<V3TreeItem<any>>) {
    const content = parentNode.data?.content;
    if (content == null) return null;

    if (content instanceof aas.types.Submodel) {
      if (content.submodelElements == null) content.submodelElements = [];
      return content.submodelElements;
    }
    if (content instanceof aas.types.SubmodelElementCollection) {
      if (content.value == null) content.value = [];
      return content.value;
    }
    if (content instanceof aas.types.SubmodelElementList) {
      if (content.value == null) content.value = [];
      return content.value;
    }
    if (parentNode.data?.editorType === EditorTypeOption.ConceptDescriptions) {
      if (content.conceptDescriptions == null) content.conceptDescriptions = [];
      return content.conceptDescriptions;
    }

    return null;
  }

  private reorderWithinParent(
    parentNode: TreeNode<V3TreeItem<any>> | null | undefined,
    previousIndex: number,
    currentIndex: number,
    draggedNode?: TreeNode<V3TreeItem<any>>,
    targetNode?: TreeNode<V3TreeItem<any>>,
  ) {
    if (!this.canReorderInParent(parentNode)) {
      this.notificationService.showMessageAlways('MOVE_NOT_ALLOWED', 'ERROR', 'error', false, 2000, null);
      return;
    }

    if (previousIndex === currentIndex) {
      return;
    }

    const parentContent = parentNode?.data?.content;
    if (parentContent == null) {
      this.notificationService.showMessageAlways('MOVE_NOT_ALLOWED', 'ERROR', 'error', false, 2000, null);
      return;
    }

    let fromIndex = previousIndex;
    let toIndex = currentIndex;

    if (parentContent instanceof aas.types.Submodel) {
      if (parentContent.submodelElements == null) parentContent.submodelElements = [];
      if (draggedNode != null && targetNode != null) {
        fromIndex = parentContent.submodelElements.indexOf(draggedNode.data?.content);
        toIndex = parentContent.submodelElements.indexOf(targetNode.data?.content);
      }
      moveItemInArray(parentContent.submodelElements, fromIndex, toIndex);
    } else if (parentContent instanceof aas.types.SubmodelElementCollection) {
      if (parentContent.value == null) parentContent.value = [];
      if (draggedNode != null && targetNode != null) {
        fromIndex = parentContent.value.indexOf(draggedNode.data?.content);
        toIndex = parentContent.value.indexOf(targetNode.data?.content);
      }
      moveItemInArray(parentContent.value, fromIndex, toIndex);
    } else if (parentContent instanceof aas.types.SubmodelElementList) {
      if (parentContent.value == null) parentContent.value = [];
      if (draggedNode != null && targetNode != null) {
        fromIndex = parentContent.value.indexOf(draggedNode.data?.content);
        toIndex = parentContent.value.indexOf(targetNode.data?.content);
      }
      moveItemInArray(parentContent.value, fromIndex, toIndex);
    } else if (parentNode?.data?.editorType === EditorTypeOption.ConceptDescriptions) {
      if (parentContent.conceptDescriptions == null) parentContent.conceptDescriptions = [];
      if (draggedNode != null && targetNode != null) {
        fromIndex = parentContent.conceptDescriptions.indexOf(draggedNode.data?.content);
        toIndex = parentContent.conceptDescriptions.indexOf(targetNode.data?.content);
      }
      moveItemInArray(parentContent.conceptDescriptions, fromIndex, toIndex);
    } else {
      this.notificationService.showMessageAlways('MOVE_NOT_ALLOWED', 'ERROR', 'error', false, 2000, null);
      return;
    }

    this.treeService.registerFieldUndoStep();
    this.treeService.aasTreeData = [...this.treeService.aasTreeData];
  }

  getNodeLabel(treeNode: TreeNode<V3TreeItem<any>>): string {
    if (treeNode.data?.isParentSml) {
      return treeNode.label ?? '<not set>';
    }
    let label = treeNode.data?.treeLabel ?? treeNode.label ?? '';
    if (treeNode.data?.content?.kind === aas.types.ModellingKind.Template) {
      label = '<T> ' + label;
    }
    if (treeNode.data?.content.managedType === 'MissingSubmodel') {
      label = 'MISSING_SUBMODEL';
    }
    return label.length > 0 ? label : 'undefined';
  }

  expandAll() {
    const updatedData = this.treeService.aasTreeData.map((node) => this.expandRecursive(node, true));
    this.treeService.aasTreeData = updatedData;
  }

  collapseAll() {
    const updatedData = this.treeService.aasTreeData.map((node) => this.expandRecursive(node, false));
    this.treeService.aasTreeData = updatedData;
  }

  private expandRecursive(node: TreeNode, isExpand: boolean): TreeNode {
    return {
      ...node,
      expanded: isExpand,
      children: node.children ? node.children.map((child) => this.expandRecursive(child, isExpand)) : node.children,
    };
  }

  getTypeTag(node: TreeNode<V3TreeItem<any>>) {
    let tagType = '?';

    if (node.data?.content instanceof aas.types.MultiLanguageProperty) tagType = 'MLP';
    else if (node.data?.content instanceof aas.types.Property) tagType = 'Prop';
    else if (
      node.data?.content instanceof aas.types.Submodel ||
      node.data?.editorType === EditorTypeOption.MissingSubmodel
    )
      tagType = 'SM';
    else if (node.data?.content instanceof aas.types.ReferenceElement) tagType = 'Ref';
    else if (node.data?.content instanceof aas.types.File) tagType = 'File';
    else if (node.data?.content instanceof aas.types.Blob) tagType = 'Blob';
    else if (node.data?.content instanceof aas.types.SubmodelElementCollection) tagType = 'SMC';
    else if (node.data?.content instanceof aas.types.SubmodelElementList) tagType = 'SML';
    else if (node.data?.content instanceof aas.types.Operation) tagType = 'Opr';
    else if (node.data?.content instanceof aas.types.Capability) tagType = 'Cap';
    else if (node.data?.content instanceof aas.types.AssetAdministrationShell) tagType = 'AAS';
    else if (node.data?.content instanceof aas.types.Entity) tagType = 'Ent';
    else if (node.data?.content instanceof aas.types.BasicEventElement) tagType = 'Evt';
    else if (node.data?.content instanceof aas.types.RelationshipElement) tagType = 'Rel';
    else if (node.data?.content instanceof aas.types.Range) tagType = 'Range';
    else if (node.data?.content instanceof aas.types.ConceptDescription) tagType = 'CD';
    else if (node.data?.editorType === EditorTypeOption.SupplementalFile) tagType = 'F';
    else if (
      node.data?.editorType === EditorTypeOption.AssetAdministrationShells ||
      node.data?.editorType === EditorTypeOption.Assets ||
      node.data?.editorType === EditorTypeOption.AllSubmodels ||
      node.data?.editorType === EditorTypeOption.ConceptDescriptions ||
      node.data?.editorType === EditorTypeOption.SupplementalFiles
    )
      tagType = 'Env';

    return tagType;
  }

  hasAasTypeTag(node: TreeNode<V3TreeItem<any>>) {
    return node.data?.content != null && node.data?.content instanceof aas.types.AssetAdministrationShell;
  }

  getAasTypeTag(node: TreeNode<V3TreeItem<any>>) {
    if (node.data?.content instanceof aas.types.AssetAdministrationShell) {
      return TagHelper.getAasTypeTag(node.data?.content as aas.types.AssetAdministrationShell);
    }
    return '';
  }

  getAasTypeTagSeverity(node: TreeNode<V3TreeItem<any>>) {
    if (node.data?.content instanceof aas.types.AssetAdministrationShell) {
      return TagHelper.getAasTypeTagSeverity(node.data?.content as aas.types.AssetAdministrationShell);
    }
    return undefined;
  }

  isUnreferenced(_node: TreeNode<V3TreeItem<any>>) {
    // let found = false;
    // if (node.data?.content instanceof aas.types.Submodel) {
    //   if (this.shellResult != null) {
    //     const submodelElement = this.shellResult.v3Shell?.submodels?.find((s) => s.id === node.data?.content?.id);
    //     if (submodelElement != null) found = true;
    //   }
    // } else {
    //   // nur bei Teilmodellen interessant
    //   found = true;
    // }
    // return !found;
    return false;
  }

  isLocal(node: TreeNode) {
    const modelType = node?.data?.modelType?.name;

    if (modelType === 'SupplementalFile') {
      return node.data.isLocal;
    }

    return false;
  }

  elementCopied(copiedElement: V3TreeItem<any>) {
    this.copiedElement = copiedElement;
  }

  addFileNode(file: SupplementalFile) {
    const id = uuid();
    const nodeData = new V3TreeItem<SupplementalFile>();
    nodeData.content = file;
    nodeData.id = id;
    nodeData.editorType = EditorTypeOption.SupplementalFile;
    nodeData.parent = null;
    const el: TreeNode<V3TreeItem<any>> = {
      label: 'New File',
      data: nodeData,
      key: id,
      expanded: false,
      children: [],
    };

    if (this.allFilesTreeNode != null) {
      if (this.allFilesTreeNode.children == null) this.allFilesTreeNode.children = [];
      this.allFilesTreeNode?.children.push(el);
      this.allFilesTreeNode.expanded = true;
    }
  }

  deleteFileNode(file: SupplementalFile) {
    if (this.allFilesTreeNode?.children != null) {
      const node = this.allFilesTreeNode?.children?.find(
        (f) => f.data?.content.path === file.path && f.data?.content.isThumbnail === file.isThumbnail,
      );
      if (node != null) {
        const indx = this.allFilesTreeNode.children.indexOf(node);
        this.allFilesTreeNode.children.splice(indx, 1);
      }
    }
    this.treeService.aasTreeData = [...this.treeService.aasTreeData];
  }

  selectConceptDescription(cid: string) {
    if (this.allConceptDescriptionsNode?.children != null) {
      const node = this.allConceptDescriptionsNode?.children?.find((n) => n.data?.content.id === cid);
      if (node != null) {
        this.treeService.selectedTreeNode = node;
        this.allConceptDescriptionsNode.expanded = true;
        this.selectTreeNode(node);
      }
    }
  }

  createAndSelectConceptDescription(cid: string) {
    if (this.allConceptDescriptionsNode?.data?.content != null) {
      if (this.allConceptDescriptionsNode.data.content.conceptDescriptions == null) {
        this.allConceptDescriptionsNode.data.content.conceptDescriptions = [];
      }
      const cd = new aas.types.ConceptDescription(cid);
      this.allConceptDescriptionsNode.data.content.conceptDescriptions.push(cd);
      const id = uuid();
      // treenode erzeugen
      const cdData = new V3TreeItem<aas.types.ConceptDescription>();

      cdData.content = cd;
      cdData.id = id;
      cdData.editorType = EditorTypeOption.ConceptDescription;
      cdData.parent = this.allConceptDescriptionsNode.data;

      const cdNode: TreeNode<V3TreeItem<aas.types.ConceptDescription> | V3TreeItem<PackageMetadata>> = {
        label: cd?.idShort ?? cd.id,
        data: cdData,
        children: [],
        parent: this.allConceptDescriptionsNode,
        key: id,
        expanded: false,
      };
      if (this.allConceptDescriptionsNode.children == null) {
        this.allConceptDescriptionsNode.children = [];
      }
      this.allConceptDescriptionsNode.children.push(cdNode);
    }
    this.selectConceptDescription(cid);
    this.treeService.aasTreeData = [...this.treeService.aasTreeData];
  }

  appendConceptDescription(cd: ConceptDescription) {
    if (this.allConceptDescriptionsNode?.data?.content != null) {
      if (this.allConceptDescriptionsNode.data.content.conceptDescriptions == null) {
        this.allConceptDescriptionsNode.data.content.conceptDescriptions = [];
      }
      this.allConceptDescriptionsNode.data.content.conceptDescriptions.push(cd);
      const id = uuid();
      // treenode erzeugen
      const cdData = new V3TreeItem<aas.types.ConceptDescription>();

      cdData.content = cd;
      cdData.id = id;
      cdData.editorType = EditorTypeOption.ConceptDescription;
      cdData.parent = this.allConceptDescriptionsNode.data;

      const cdNode: TreeNode<V3TreeItem<aas.types.ConceptDescription> | V3TreeItem<PackageMetadata>> = {
        label: cd?.idShort ?? cd.id,
        data: cdData,
        children: [],
        parent: this.allConceptDescriptionsNode,
        key: id,
        expanded: false,
      };
      if (this.allConceptDescriptionsNode.children == null) {
        this.allConceptDescriptionsNode.children = [];
      }
      this.allConceptDescriptionsNode.children.push(cdNode);
    }
    this.treeService.aasTreeData = [...this.treeService.aasTreeData];
  }

  deleteConceptDescriptionNode(cid: string) {
    if (this.allConceptDescriptionsNode?.children != null) {
      const node = this.allConceptDescriptionsNode?.children?.find((n) => n.data?.content.id === cid);
      if (node != null) {
        this.allConceptDescriptionsNode.children = this.allConceptDescriptionsNode.children.filter(
          (n) => n.data?.content.id !== cid,
        );
      }
    }
    this.treeService.aasTreeData = [...this.treeService.aasTreeData];
  }

  deleteSmNode(nodeId: string) {
    // if (this.shellRootNode?.children != null) {
    // über alle shells laufen und die id suchen
    const deleteNode = this.findNodeById(nodeId);
    // for (const shell of this.shellRootNode.children) {
    if (this.shellNode?.children != null) {
      this.shellNode.children = this.shellNode.children.filter((n) => n.data?.id !== nodeId);
    }
    // }
    if (deleteNode?.parent?.data?.id != null) this.selectById(deleteNode.parent.data.id);
    this.treeService.aasTreeData = [...this.treeService.aasTreeData];

    // }
  }

  selectById(id: string, saveVisit: boolean = false) {
    const node = this.findNodeById(id);
    if (node != null) {
      this.treeService.selectedTreeNode = node;
      this.selectTreeNode(node, saveVisit);
      this.expandParents(node);
    }
  }

  private scrollToSelectionPrimeNgDataTree(selection: TreeNode<V3TreeItem<any>> | null) {
    if (this.treeService.aasTreeData != null && selection != null) {
      const flat = this.buildVisibleFlatNodes();
      const index = flat.findIndex((x) => x.node.data?.id === selection.data?.id);
      if (index >= 0) {
        this.viewport?.scrollToIndex(index, 'smooth');
      }

      // const index = tree?.value.indexOf(selection);

      setTimeout(() => {
        const elem = document.getElementById('tree_' + selection.data?.id);
        if (elem != null && !this.isInViewport(elem)) {
          elem.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
        }
      });
    }
  }

  isInViewport(element: any) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  findNodeById(id: string): TreeNode<V3TreeItem<any>> | null {
    let foundNode = null;
    this.treeService.aasTreeData.forEach((treeNode) => {
      const node = this.findNodeByIdRecursive(treeNode, id);
      if (node != null) {
        foundNode = node;
      }
    });
    return foundNode;
  }

  findNodeByIdRecursive(node: TreeNode<V3TreeItem<any>>, id: string): TreeNode<V3TreeItem<any>> | null {
    if (node.data?.id === id) return node;
    if (node.children != null) {
      for (const child of node.children) {
        const found = this.findNodeByIdRecursive(child, id);
        if (found != null) return found;
      }
    }
    return null;
  }

  selectNodeByElementIdShortPath(path: string) {
    let foundNode: TreeNode<V3TreeItem<any>> | null = null;

    while (path != null && path !== '') {
      const splittedPath = path.split('.');
      const reversedSplittedPath = splittedPath.reverse();
      const currentElementToFind = reversedSplittedPath.pop();

      let node: TreeNode | undefined = undefined;
      if (foundNode == null) {
        node = this.treeService.aasTreeData[this.SHELL_ROOT_INDEX].children?.find(
          (n) => n.data?.content?.idShort === currentElementToFind,
        );
      } else {
        node = foundNode.children?.find((n) => n.data?.content?.idShort === currentElementToFind);
      }
      if (node != null) {
        // nächste ebene suchen
        foundNode = node;
        path = reversedSplittedPath.reverse().join('.');
      } else {
        foundNode = null;
        break;
      }
    }
    if (foundNode?.data?.id != null) {
      this.selectById(foundNode.data.id, true);
    }
  }

  applyState(tree: any, _selectedId: string) {
    this.treeService.aasTreeData = tree;
    // aktualisieren des Editors mit dem selektierten Element triggern
    // this.selectById((this.treeService.selectedTreeNode as any).data.id);
    this.selectById(_selectedId);
    // if (this.treeService.selectedTreeNode != null) {
    //   this.selectedElementChanged.emit((this.treeService.selectedTreeNode as any).data);
    // }
  }

  navigateToPath(path: Path) {
    if (this.shellResult != null) {
      let x: any = null;
      let indx = path.segments.length - 1;
      let element: any = null;

      if (path.toString().startsWith('.submodels') || path.toString().startsWith('.assetAdministrationShells')) {
        while (x == null && indx > 0) {
          element = (path as any).segments[indx].instance;
          if (
            element == null &&
            (path as any).segments[indx].index != null &&
            (path as any).segments[indx].sequence != null
          ) {
            element = (path as any).segments[indx].sequence[(path as any).segments[indx].index];
          }
          x = this.findNodeByElementRecursive(this.treeService.aasTreeData[this.SHELL_ROOT_INDEX], element);

          indx--;
        }
      } else {
        while (x == null && indx > 0) {
          element = (path as any).segments[indx].instance;
          x = this.findNodeByElementRecursive(this.treeService.aasTreeData[this.CONCEPT_DESCRIPTIONS_INDEX], element);

          indx--;
          this.treeService.aasTreeData[this.CONCEPT_DESCRIPTIONS_INDEX].expanded = true;
        }
      }
      if (x != null) {
        this.treeService.selectedTreeNode = x;
        this.selectTreeNode(x);
        this.expandParents(x);
      }
    }
  }

  selectRoot() {
    this.treeService.selectedTreeNode = this.treeService.aasTreeData[0];
    this.selectedElementChanged.emit(this.treeService.selectedTreeNode.data);
  }

  findNodeByElementRecursive(node: TreeNode<V3TreeItem<any>>, element: any): TreeNode<V3TreeItem<any>> | null {
    if (node.data?.content === element) return node;
    if (node.children != null) {
      for (const child of node.children) {
        const found = this.findNodeByElementRecursive(child, element);
        if (found != null) return found;
      }
    }
    return null;
  }

  expandParents(node: TreeNode<V3TreeItem<any>>) {
    node.expanded = true;
    if (node.parent != null) {
      this.expandParents(node.parent);
    }
  }
  showInsertSnippetDialog(data: {
    visibility: boolean;
    allowedTypes: string[];
    uuid: string;
    elementType: string;
    parentElement: any;
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

  showInsertJsonDialog(type: 'submodel' | 'element' | 'cd') {
    this.importJsonDialogVisible = true;
    this.importType = type;
    this.plainJson = '';
  }

  showInsertFromEclassDialog(event: { parentElement: TreeNode<V3TreeItem<any>> }) {
    this.importFromEclassDialogVisible = true;
    this.targetNodeId = event.parentElement.data?.id ?? 'undefined';
  }

  insertSnippetFromDialog(event: {
    snippetId: number;
    uuid: string;
    elementType: string;
    parentElement: any;
    data?: string;
  }) {
    switch (event.elementType) {
      case 'Submodel':
        {
          const instanceOrErrorPlain = aas.jsonization.submodelFromJsonable(JSON.parse(event.data ?? ''));
          if (instanceOrErrorPlain.value != null) {
            const sm = instanceOrErrorPlain.value;
            sm.id = IdGenerationUtil.generateIri('submodel', this.portalService.iriPrefix);
            ElementInserter.insertSubmodel(sm, this.treeService, this.shellResult);
          }
        }
        break;
      case 'Property':
        {
          const instanceOrErrorPlain = aas.jsonization.propertyFromJsonable(JSON.parse(event.data ?? ''));
          if (instanceOrErrorPlain.value != null && this.treeService.selectedTreeNode) {
            this.insertSme(instanceOrErrorPlain.value, event.parentElement.data.editorType);
          }
        }
        break;
      case 'Range':
        {
          const instanceOrErrorPlain = aas.jsonization.rangeFromJsonable(JSON.parse(event.data ?? ''));
          if (instanceOrErrorPlain.value != null && this.treeService.selectedTreeNode) {
            if (instanceOrErrorPlain.value != null && this.treeService.selectedTreeNode) {
              this.insertSme(instanceOrErrorPlain.value, event.parentElement.data.editorType);
            }
          }
        }
        break;
      case 'File':
        {
          const instanceOrErrorPlain = aas.jsonization.fileFromJsonable(JSON.parse(event.data ?? ''));
          if (instanceOrErrorPlain.value != null && this.treeService.selectedTreeNode) {
            if (instanceOrErrorPlain.value != null && this.treeService.selectedTreeNode) {
              this.insertSme(instanceOrErrorPlain.value, event.parentElement.data.editorType);
            }
          }
        }
        break;
      case 'MultiLanguageProperty':
        {
          const instanceOrErrorPlain = aas.jsonization.multiLanguagePropertyFromJsonable(JSON.parse(event.data ?? ''));
          if (instanceOrErrorPlain.value != null && this.treeService.selectedTreeNode) {
            if (instanceOrErrorPlain.value != null && this.treeService.selectedTreeNode) {
              this.insertSme(instanceOrErrorPlain.value, event.parentElement.data.editorType);
            }
          }
        }
        break;
      case 'Operation':
        {
          const instanceOrErrorPlain = aas.jsonization.operationFromJsonable(JSON.parse(event.data ?? ''));
          if (instanceOrErrorPlain.value != null && this.treeService.selectedTreeNode) {
            if (instanceOrErrorPlain.value != null && this.treeService.selectedTreeNode) {
              this.insertSme(instanceOrErrorPlain.value, event.parentElement.data.editorType);
            }
          }
        }
        break;
      case 'Reference':
        {
          const instanceOrErrorPlain = aas.jsonization.referenceElementFromJsonable(JSON.parse(event.data ?? ''));
          if (instanceOrErrorPlain.value != null && this.treeService.selectedTreeNode) {
            if (instanceOrErrorPlain.value != null && this.treeService.selectedTreeNode) {
              this.insertSme(instanceOrErrorPlain.value, event.parentElement.data.editorType);
            }
          }
        }
        break;
      case 'SubmodelElementCollection':
        {
          const instanceOrErrorPlain = aas.jsonization.submodelElementCollectionFromJsonable(
            JSON.parse(event.data ?? ''),
          );
          if (instanceOrErrorPlain.value != null && this.treeService.selectedTreeNode) {
            if (instanceOrErrorPlain.value != null && this.treeService.selectedTreeNode) {
              this.insertSme(instanceOrErrorPlain.value, event.parentElement.data.editorType);
            }
          }
        }
        break;
      case 'SubmodelElementList':
        {
          const instanceOrErrorPlain = aas.jsonization.submodelElementListFromJsonable(JSON.parse(event.data ?? ''));
          if (instanceOrErrorPlain.value != null && this.treeService.selectedTreeNode) {
            if (instanceOrErrorPlain.value != null && this.treeService.selectedTreeNode) {
              this.insertSme(instanceOrErrorPlain.value, event.parentElement.data.editorType);
            }
          }
        }
        break;
      case 'ConceptDescription':
        {
          const instanceOrErrorPlain = aas.jsonization.conceptDescriptionFromJsonable(JSON.parse(event.data ?? ''));
          if (instanceOrErrorPlain.value != null && this.treeService.selectedTreeNode) {
            if (instanceOrErrorPlain.value != null && this.treeService.selectedTreeNode) {
              ElementInserter.insertConceptDescription(instanceOrErrorPlain.value, this.treeService);
            }
          }
        }
        break;
      default:
        throw new Error('Unknown element type' + event.elementType);
    }
    this.insertSnippetDialogVisible = false;
  }

  insertSme(sme: any, parentType: CMTypeOption) {
    switch (parentType) {
      case CMTypeOption.SubmodelElementCollection:
        ElementInserter.insertSubmodelElementToCollection(sme, this.treeService);
        break;
      case CMTypeOption.SubmodelElementList:
        ElementInserter.insertSubmodelElementToCollection(sme, this.treeService);
        break;
      case CMTypeOption.Submodel:
        ElementInserter.insertSubmodelElementToSubmodel(sme, this.treeService);
        break;
    }
  }

  refreshMarkingNodes() {
    (this.treeService.selectedTreeNode as TreeNode<V3TreeItem<any>>).children = [];
    if (
      (this.treeService.selectedTreeNode as TreeNode<V3TreeItem<aas.types.SubmodelElementCollection>>)?.data?.content
        ?.value != null
    ) {
      (this.treeService.selectedTreeNode as TreeNode<V3TreeItem<any>>).children = this.buildSubmodelChildren(
        (this.treeService.selectedTreeNode as TreeNode<V3TreeItem<aas.types.SubmodelElementCollection>>).data?.content
          ?.value,
        this.treeService.selectedTreeNode as TreeNode<V3TreeItem<any>>,
      );
      (this.treeService.selectedTreeNode as TreeNode<V3TreeItem<any>>).expanded = true;
    }
  }
  refreshSubmodelNodes() {
    if (
      (this.treeService.selectedTreeNode as TreeNode<V3TreeItem<aas.types.Submodel>>)?.data?.content
        ?.submodelElements != null
    ) {
      (this.treeService.selectedTreeNode as TreeNode<V3TreeItem<any>>).children = [];
      (this.treeService.selectedTreeNode as TreeNode<V3TreeItem<any>>).children = this.buildSubmodelChildren(
        (this.treeService.selectedTreeNode as TreeNode<V3TreeItem<aas.types.Submodel>>).data?.content?.submodelElements,
        this.treeService.selectedTreeNode as TreeNode<V3TreeItem<any>>,
      );
      (this.treeService.selectedTreeNode as TreeNode<V3TreeItem<any>>).expanded = true;
    }
  }

  refreshChangelogNodes() {
    const node = this.treeService.findById(this.treeService.aasDesignerChangelogSmNodeId);

    if (node != null) {
      (node as TreeNode<V3TreeItem<any>>).children = [];
      (node as TreeNode<V3TreeItem<any>>).children = this.buildSubmodelChildren(
        (node as TreeNode<V3TreeItem<aas.types.Submodel>>).data?.content?.submodelElements,
        node as TreeNode<V3TreeItem<any>>,
      );
      (node as TreeNode<V3TreeItem<any>>).expanded = true;
    }
  }

  selectParentNode() {
    this.treeService.selectNodeByElement(
      (this.treeService.selectedTreeNode as TreeNode<V3TreeItem<any>>).parent?.data?.content,
    );
  }

  refreshEntityNodes() {
    if (
      (this.treeService.selectedTreeNode as TreeNode<V3TreeItem<aas.types.Entity>>)?.data?.content?.statements != null
    ) {
      (this.treeService.selectedTreeNode as TreeNode<V3TreeItem<any>>).children = [];
      (this.treeService.selectedTreeNode as TreeNode<V3TreeItem<any>>).children = this.buildSubmodelChildren(
        (this.treeService.selectedTreeNode as TreeNode<V3TreeItem<aas.types.Entity>>).data?.content?.statements,
        this.treeService.selectedTreeNode as TreeNode<V3TreeItem<any>>,
      );
      (this.treeService.selectedTreeNode as TreeNode<V3TreeItem<any>>).expanded = true;
    }
  }

  refreshSml() {
    (this.treeService.selectedTreeNode as TreeNode<V3TreeItem<any>>).children = [];
    if (
      (this.treeService.selectedTreeNode as TreeNode<V3TreeItem<aas.types.SubmodelElementList>>)?.data?.content
        ?.value != null
    ) {
      (this.treeService.selectedTreeNode as TreeNode<V3TreeItem<any>>).children = this.buildSubmodelChildren(
        (this.treeService.selectedTreeNode as TreeNode<V3TreeItem<aas.types.SubmodelElementList>>).data?.content?.value,
        this.treeService.selectedTreeNode as TreeNode<V3TreeItem<any>>,
      );
      (this.treeService.selectedTreeNode as TreeNode<V3TreeItem<any>>).expanded = true;
    }
  }

  refreshTree() {
    this.initTree();
  }

  insertPlainJson() {
    if (this.importType === 'submodel') {
      const instanceOrErrorPlain = aas.jsonization.submodelFromJsonable(JSON.parse(this.plainJson ?? ''));
      if (instanceOrErrorPlain.value != null) {
        ElementInserter.insertSubmodel(instanceOrErrorPlain.value, this.treeService, this.shellResult);
        this.importJsonDialogVisible = false;
      } else if (instanceOrErrorPlain.value == null) {
        if (instanceOrErrorPlain.error != null) {
          // eslint-disable-next-line no-console
          console.log(
            'De-serialization failed: ' +
              `${instanceOrErrorPlain.error.path}: ` +
              `${instanceOrErrorPlain.error.message}`,
          );
        }
        this.notificationService.showMessageAlways(
          'ERROR_IMPORT_JSON',
          'ERROR',
          'error',
          true,
          10000,
          'De-serialization failed: ' +
            `${instanceOrErrorPlain.error?.path}: ` +
            `${instanceOrErrorPlain.error?.message}`,
        );
      }
    }
    if (this.importType === 'element') {
      const instanceOrErrorPlain = aas.jsonization.submodelElementFromJsonable(JSON.parse(this.plainJson ?? ''));
      if (instanceOrErrorPlain.value != null && this.treeService.selectedTreeNode && !isArray(this.selectedTreeNode)) {
        const node = this.selectedTreeNode as TreeNode<V3TreeItem<any>>;
        switch (node.data?.editorType) {
          case EditorTypeOption.SubmodelElementCollection:
            ElementInserter.insertSubmodelElementToCollection(instanceOrErrorPlain.value, this.treeService);
            break;
          case EditorTypeOption.SubmodelElementList:
            ElementInserter.insertSubmodelElementToCollection(instanceOrErrorPlain.value, this.treeService);
            break;
          case EditorTypeOption.Submodel:
            ElementInserter.insertSubmodelElementToSubmodel(instanceOrErrorPlain.value, this.treeService);
            break;
        }
        this.importJsonDialogVisible = false;
      } else if (instanceOrErrorPlain.value == null) {
        if (instanceOrErrorPlain.error != null) {
          // eslint-disable-next-line no-console
          console.log(
            'De-serialization failed: ' +
              `${instanceOrErrorPlain.error.path}: ` +
              `${instanceOrErrorPlain.error.message}`,
          );
        }
        this.notificationService.showMessageAlways(
          'ERROR_IMPORT_JSON',
          'ERROR',
          'error',
          true,
          10000,
          'De-serialization failed: ' +
            `${instanceOrErrorPlain.error?.path}: ` +
            `${instanceOrErrorPlain.error?.message}`,
        );
      }
    }
    if (this.importType === 'cd') {
      const instanceOrErrorPlain = aas.jsonization.conceptDescriptionFromJsonable(JSON.parse(this.plainJson ?? ''));
      if (instanceOrErrorPlain.value != null) {
        ElementInserter.insertConceptDescription(instanceOrErrorPlain.value, this.treeService);
        this.importJsonDialogVisible = false;
      } else if (instanceOrErrorPlain.value == null) {
        if (instanceOrErrorPlain.error != null) {
          // eslint-disable-next-line no-console
          console.log(
            'De-serialization failed: ' +
              `${instanceOrErrorPlain.error.path}: ` +
              `${instanceOrErrorPlain.error.message}`,
          );
        }
        this.notificationService.showMessageAlways(
          'ERROR_IMPORT_JSON',
          'ERROR',
          'error',
          true,
          10000,
          'De-serialization failed: ' +
            `${instanceOrErrorPlain.error?.path}: ` +
            `${instanceOrErrorPlain.error?.message}`,
        );
      }
    }
  }

  setPlainJsonText(event: { files: File[] }) {
    const myReader: FileReader = new FileReader();

    myReader.onloadend = (_e) => {
      // you can perform an action with readed data here
      this.plainJson = myReader.result as string;
      this.checkJsonValidity();
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

  jsonValid = signal(false);

  checkJsonValidity() {
    let valid = true;

    if (this.importType === 'submodel') {
      try {
        const instanceOrErrorPlain = aas.jsonization.conceptDescriptionFromJsonable(JSON.parse(this.plainJson ?? ''));
        if (instanceOrErrorPlain.error != null) {
          valid = false;
        }
      } catch {
        valid = false;
      }
    } else if (this.importType === 'element') {
      try {
        const instanceOrErrorPlain = aas.jsonization.submodelElementFromJsonable(JSON.parse(this.plainJson ?? ''));
        if (instanceOrErrorPlain.error != null) {
          valid = false;
        }
      } catch {
        valid = false;
      }
    }

    this.jsonValid.set(valid);
  }
}
