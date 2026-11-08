import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { EditorTypeOption } from '../model/editor-type-option';
import { V3TreeContent, V3TreeNode } from './v3-tree-node';

/**
 * Pure drag & drop rules of the V3 tree: which nodes may be reordered or moved, and the
 * corresponding changes of the underlying AAS model.
 */

type MovableElement = aas.types.ISubmodelElement | aas.types.ConceptDescription;

function isConceptDescriptionsNode(node: V3TreeNode | null | undefined) {
  return node?.data?.editorType === EditorTypeOption.ConceptDescriptions;
}

function isSubmodelElementContainer(
  content: unknown,
): content is aas.types.Submodel | aas.types.SubmodelElementCollection | aas.types.SubmodelElementList {
  return (
    content instanceof aas.types.Submodel ||
    content instanceof aas.types.SubmodelElementCollection ||
    content instanceof aas.types.SubmodelElementList
  );
}

/** Children of submodels, collections, lists and the concept descriptions node can be reordered. */
export function canReorderInParent(parentNode: V3TreeNode | null | undefined): boolean {
  if (parentNode?.data == null) return false;
  return isSubmodelElementContainer(parentNode.data.content) || isConceptDescriptionsNode(parentNode);
}

export function isSubmodelElementValue(value: unknown): value is aas.types.ISubmodelElement {
  return value instanceof aas.types.Class && aas.types.asSubmodelElement(value) != null;
}

/** Whether `parentNode` may contain the dragged content as child. */
export function canAcceptAsParent(parentNode: V3TreeNode | null | undefined, draggedContent: unknown): boolean {
  if (parentNode?.data == null) return false;

  if (isSubmodelElementContainer(parentNode.data.content)) {
    return isSubmodelElementValue(draggedContent);
  }

  if (isConceptDescriptionsNode(parentNode)) {
    return draggedContent instanceof aas.types.ConceptDescription;
  }

  return false;
}

/** The drop target itself if it can take the content, otherwise its parent, otherwise null. */
export function resolveTargetParentForDrop(targetNode: V3TreeNode, draggedContent: unknown): V3TreeNode | null {
  if (canAcceptAsParent(targetNode, draggedContent)) {
    return targetNode;
  }

  const parent = targetNode.parent ?? null;
  if (parent != null && canAcceptAsParent(parent, draggedContent)) {
    return parent;
  }
  return null;
}

/** Whether the dragged node may be dropped on the target node (same parent or an accepting parent). */
export function isDropAllowed(draggedNode: V3TreeNode | null, targetNode: V3TreeNode): boolean {
  if (draggedNode == null || draggedNode === targetNode) return false;

  const draggedContent = draggedNode.data?.content;
  if (draggedContent == null) return false;

  if (draggedNode.parent === targetNode.parent) return true;
  return resolveTargetParentForDrop(targetNode, draggedContent) != null;
}

/** Model array that holds the children of the node (created if missing), null if the node has none. */
export function getNodeContentArray(parentNode: V3TreeNode | null | undefined): MovableElement[] | null {
  const content: V3TreeContent | undefined = parentNode?.data?.content;
  if (content == null) return null;

  if (content instanceof aas.types.Submodel) {
    if (content.submodelElements == null) content.submodelElements = [];
    return content.submodelElements;
  }
  if (content instanceof aas.types.SubmodelElementCollection || content instanceof aas.types.SubmodelElementList) {
    if (content.value == null) content.value = [];
    return content.value;
  }
  if (isConceptDescriptionsNode(parentNode)) {
    const environment = content as aas.types.Environment;
    if (environment.conceptDescriptions == null) environment.conceptDescriptions = [];
    return environment.conceptDescriptions;
  }

  return null;
}

export type ReorderResult = 'moved' | 'unchanged' | 'not-allowed';

/**
 * Moves a child inside its parent. If dragged and target node are given, their model positions are used
 * (the flat indices of the virtual scroll list differ from the positions in the model).
 */
export function reorderWithinParent(
  parentNode: V3TreeNode | null | undefined,
  previousIndex: number,
  currentIndex: number,
  draggedNode?: V3TreeNode,
  targetNode?: V3TreeNode,
): ReorderResult {
  if (!canReorderInParent(parentNode)) return 'not-allowed';
  if (previousIndex === currentIndex) return 'unchanged';

  const children = getNodeContentArray(parentNode);
  if (children == null) return 'not-allowed';

  let fromIndex = previousIndex;
  let toIndex = currentIndex;
  if (draggedNode != null && targetNode != null) {
    fromIndex = children.indexOf(draggedNode.data?.content as MovableElement);
    toIndex = children.indexOf(targetNode.data?.content as MovableElement);
  }
  moveItemInArray(children, fromIndex, toIndex);
  return 'moved';
}

/**
 * Moves the content of the dragged node to the end of the parent that accepts it (target or its parent).
 * Returns the moved content or null if the move is not possible.
 */
export function moveAcrossParents(draggedNode: V3TreeNode, targetNode: V3TreeNode): MovableElement | null {
  const draggedContent = draggedNode.data?.content as MovableElement | undefined;
  const sourceParent = draggedNode.parent ?? null;
  if (draggedContent == null || sourceParent?.data?.content == null) {
    return null;
  }

  const sourceArray = getNodeContentArray(sourceParent);
  if (sourceArray == null) {
    return null;
  }

  const targetParent = resolveTargetParentForDrop(targetNode, draggedContent);
  if (targetParent?.data?.content == null) {
    return null;
  }

  const targetArray = getNodeContentArray(targetParent);
  if (targetArray == null) {
    return null;
  }

  const sourceIndex = sourceArray.indexOf(draggedContent);
  if (sourceIndex < 0) {
    return null;
  }

  sourceArray.splice(sourceIndex, 1);
  targetArray.push(draggedContent);
  return draggedContent;
}
