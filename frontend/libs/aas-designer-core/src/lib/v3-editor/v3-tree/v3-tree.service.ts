import {
  AssetAdministrationShell,
  ConceptDescription,
  Environment,
  Submodel,
} from '@aas-core-works/aas-core3.1-typescript/types';
import { SupplementalFile } from '@aas/model';
import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { cloneDeep } from 'lodash-es';
import { TreeNode } from '@openng/optimus-ui/api';
import { V3TreeItem } from '../model/v3-tree-item';
import { V3EditorComponent } from '../v3-editor/v3-editor.component';
import { V3TreeComponent } from './v3-tree.component';

@Injectable({
  providedIn: 'root',
})
export class V3TreeService {
  translate = inject(TranslateService);
  visitedNodes: string[] = [];
  currentIndex: number = 0;
  currentUndoIndex: number = 0;

  selectedTreeNode: TreeNode<V3TreeItem<any>> | TreeNode<V3TreeItem<any>>[] | undefined | null;
  aasTreeData: TreeNode<V3TreeItem<any>>[] = [];

  treeComponent: V3TreeComponent | undefined;
  editorComponent: V3EditorComponent | undefined;

  /**
   * Undo history. Each step holds tree AND model (the environment that gets saved) from one deep copy,
   * so that the copied tree nodes reference the copied model objects.
   */
  undoStack: { state: TreeNode[]; environment?: Environment | null; selectedId: string }[] = [];

  aasDesignerChangelogSmNodeId: string = '';

  addFileNode(file: SupplementalFile) {
    this.treeComponent?.addFileNode(file);
  }

  deleteFileNode(file: SupplementalFile) {
    this.treeComponent?.deleteFileNode(file);
  }

  selectConceptDescription(id: string) {
    this.treeComponent?.selectConceptDescription(id);
  }

  createAndSelectConceptDescription(id: string) {
    this.treeComponent?.createAndSelectConceptDescription(id);
  }

  deleteConceptDescriptionNode(id: string) {
    this.treeComponent?.deleteConceptDescriptionNode(id);
  }

  deleteSmNode(id: string) {
    this.treeComponent?.deleteSmNode(id);
  }

  addVisitedNode(id: string) {
    if (this.visitedNodes[this.visitedNodes.length - 1] !== id && id !== '') {
      this.visitedNodes = this.visitedNodes.slice(0, this.currentIndex + 1);
      this.visitedNodes.push(id);
      this.currentIndex = this.visitedNodes.length - 1;
    }
  }

  previousNode() {
    this.treeComponent?.selectById(this.visitedNodes[--this.currentIndex]);
  }

  nextNode() {
    this.treeComponent?.selectById(this.visitedNodes[++this.currentIndex]);
  }

  hasNextNode() {
    return this.currentIndex < this.visitedNodes.length - 1;
  }

  resetVisited() {
    this.currentIndex = 0;
    this.visitedNodes = [];
  }

  registerUndoStep(step: TreeNode[], selectedId: string) {
    if (selectedId !== '') {
      this.undoStack = this.undoStack.slice(0, this.currentUndoIndex + 1);
      this.undoStack.push({ ...this.snapshot(step), selectedId });
      this.currentUndoIndex = this.undoStack.length - 1;
    }
  }

  registerFieldUndoStep() {
    this.undoStack = this.undoStack.slice(0, this.currentUndoIndex + 1);

    if (this.selectedTreeNode != null)
      this.undoStack.push({
        ...this.snapshot(this.aasTreeData),
        selectedId: (this.selectedTreeNode as any).data.id,
      });
    this.currentUndoIndex = this.undoStack.length - 1;
  }

  /** Copies tree and model in one pass, so references between tree nodes and model objects are kept. */
  private snapshot(state: TreeNode[]): { state: TreeNode[]; environment?: Environment | null } {
    return cloneDeep({ state, environment: this.treeComponent?.shellResult?.v3Shell });
  }

  hasRedoStep() {
    return this.currentUndoIndex < this.undoStack.length - 1;
  }

  hasUndoStep() {
    return this.currentUndoIndex > 0;
  }

  undo() {
    this.currentUndoIndex--;
    const el = this.undoStack[this.currentUndoIndex];
    const nextel = this.undoStack[this.currentUndoIndex + 1];
    this.restore(el, nextel.selectedId);
  }

  redo() {
    this.currentUndoIndex++;
    const el = this.undoStack[this.currentUndoIndex];
    this.restore(el, el.selectedId);
  }

  /** Applies a fresh copy of the step, so that later edits do not change the stored history. */
  private restore(step: { state: TreeNode[]; environment?: Environment | null }, selectedId: string) {
    const copy = this.snapshotOf(step);
    this.treeComponent?.applyState(copy.state, selectedId, copy.environment);
  }

  private snapshotOf(step: { state: TreeNode[]; environment?: Environment | null }) {
    return cloneDeep({ state: step.state, environment: step.environment });
  }

  resetUndo() {
    this.currentUndoIndex = 0;
    this.undoStack = [];
  }

  jumpToError(path: any) {
    this.treeComponent?.navigateToPath(path);
  }

  buildChildTree(data: any, node: TreeNode<V3TreeItem<any>>) {
    if (data != null && this.treeComponent != null) {
      if (node.children == null) {
        node.children = [];
      }
      node.children.push(...this.treeComponent.buildSubmodelChildren(data, node));
      this.aasTreeData = [...this.aasTreeData];
    }
  }

  selectRoot() {
    this.treeComponent?.selectRoot();
  }

  selectById(id: string) {
    this.treeComponent?.selectById(id);
  }
  findById(id: string) {
    return this.treeComponent?.findNodeById(id);
  }

  refreshMarkingNodes() {
    this.treeComponent?.refreshMarkingNodes();
  }

  refreshSml() {
    this.treeComponent?.refreshSml();
  }

  refreshChangelogNodes() {
    this.treeComponent?.refreshChangelogNodes();
  }

  selectNodeByElement(element: any) {
    const found = this.treeComponent?.findNodeByElementRecursive(this.aasTreeData[0], element);
    if (found?.data?.id != null) this.selectById(found.data.id);
  }

  selectNodeByElementIdShortPath(idShortPath: string) {
    this.treeComponent?.selectNodeByElementIdShortPath(idShortPath);
  }

  getAssetInformation() {
    const res = this.getParentAasRecursive(this.selectedTreeNode as TreeNode<V3TreeItem<any>>);
    return (res?.data.content as AssetAdministrationShell)?.assetInformation;
  }

  getIdShort() {
    const res = this.getParentAasRecursive(this.selectedTreeNode as TreeNode<V3TreeItem<any>>);
    return (res?.data.content as AssetAdministrationShell)?.idShort;
  }

  getCurrentAasId() {
    const res = this.getParentAasRecursive(this.selectedTreeNode as TreeNode<V3TreeItem<any>>);
    return (res?.data.content as AssetAdministrationShell)?.id;
  }

  getParentAasRecursive(node: TreeNode<V3TreeItem<any>>): any {
    if (node?.data?.editorType === 'AssetAdministrationShell') return node;
    if (node?.parent == null) return null;
    else return this.getParentAasRecursive(node.parent);
  }
  /** Concept descriptions of the open environment (e.g. for value lists and units). */
  getConceptDescriptions(): ConceptDescription[] {
    return this.treeComponent?.shellResult?.v3Shell?.conceptDescriptions ?? [];
  }

  getCurrentSubmodel() {
    const res = this.getParentSubmodelRecursive(this.selectedTreeNode as TreeNode<V3TreeItem<any>>);
    return res?.data.content as Submodel;
  }

  getParentSubmodelRecursive(node: TreeNode<V3TreeItem<any>>): any {
    if (node?.data?.editorType === 'Submodel') return node;
    if (node?.parent == null) return null;
    else return this.getParentSubmodelRecursive(node.parent);
  }

  refreshWholeTree() {
    this.treeComponent?.refreshTree();
  }

  getCurrentIdShortPath() {
    const idShortArray: string[] = [];
    this.getCurrentIdShortPathRecurisive(this.selectedTreeNode as TreeNode<V3TreeItem<any>>, idShortArray);
    const idShortArrayReverse = idShortArray.reverse();
    return idShortArrayReverse.join('.');
  }

  getCurrentIdShortPathRecurisive(node: TreeNode<V3TreeItem<any>>, idShortArray: string[]): any {
    if (node?.data?.editorType === 'Submodel') return idShortArray;
    if (node?.parent == null) return idShortArray;
    else {
      idShortArray.push(node.data?.content.idShort);
      return this.getCurrentIdShortPathRecurisive(node.parent, idShortArray);
    }
  }

  hasChanged() {
    return this.editorComponent?.hasChanges();
  }

  appendConceptDescription(cd: ConceptDescription) {
    this.treeComponent?.appendConceptDescription(cd);
  }

  updateLabel(nodeId: string) {
    const node = this.findById(nodeId);
    if (node != null) {
      const key = this.treeComponent?.getNodeLabel(node);
      if (key != null && key !== '') {
        node.label = this.translate.instant(key);
      }
    }
  }
}
