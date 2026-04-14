import { AssetAdministrationShell, ConceptDescription, Submodel } from '@aas-core-works/aas-core3.1-typescript/types';
import { SupplementalFile } from '@aas/model';
import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { cloneDeep } from 'lodash-es';
import { TreeNode } from 'primeng/api';
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

  undoStack: { state: TreeNode[]; selectedId: string }[] = [];

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
    // TODO: check if this is needed
    // if (
    //   this.undoStack.length === 0 ||
    //   JSON.stringify(this.undoStack[this.undoStack.length - 1]) !== JSON.stringify(step)
    // ) {
    if (selectedId !== '') {
      this.undoStack = this.undoStack.slice(0, this.currentUndoIndex + 1);
      this.undoStack.push({ state: cloneDeep(step), selectedId });
      this.currentUndoIndex = this.undoStack.length - 1;
    }
    // }
  }

  registerFieldUndoStep() {
    this.undoStack = this.undoStack.slice(0, this.currentUndoIndex + 1);

    if (this.selectedTreeNode != null)
      this.undoStack.push({ state: cloneDeep(this.aasTreeData), selectedId: (this.selectedTreeNode as any).data.id });
    this.currentUndoIndex = this.undoStack.length - 1;
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
    this.treeComponent?.applyState(el.state, nextel.selectedId);
  }

  redo() {
    this.currentUndoIndex++;
    const el = this.undoStack[this.currentUndoIndex];
    this.treeComponent?.applyState(el.state, el.selectedId);
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
      node.children?.push(...this.treeComponent.buildSubmodelChildren(data, node));
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
