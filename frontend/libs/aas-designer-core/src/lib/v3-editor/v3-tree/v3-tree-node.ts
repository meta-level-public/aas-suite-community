import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { ConceptDescriptionRoot, PackageMetadata, SupplementalFile } from '@aas/model';
import { TreeNode } from '@openng/optimus-ui/api';
import { v4 as uuid } from 'uuid';
import { EditorTypeOption } from '../model/editor-type-option';
import { V3TreeItem } from '../model/v3-tree-item';

/** Placeholder shown in the tree for a submodel reference whose submodel is not part of the environment. */
export interface MissingSubmodelPlaceholder {
  managedType: 'MissingSubmodel';
  modelType: { name: 'MissingSubmodel' };
  managedItem: 'MissingSubmodel';
  data: aas.types.Reference;
  editorType: EditorTypeOption.MissingSubmodel;
  label: string;
}

/** Everything a node of the V3 tree can carry as content. */
export type V3TreeContent =
  | aas.types.Class
  | PackageMetadata
  | ConceptDescriptionRoot
  | SupplementalFile
  | SupplementalFile[]
  | MissingSubmodelPlaceholder;

export type V3TreeNode = TreeNode<V3TreeItem<V3TreeContent>>;

/** Flattened, currently visible tree row used by the virtual scroll viewport. */
export type FlatTreeNode = {
  node: V3TreeNode;
  depth: number;
  parent: V3TreeNode | null;
};

export function isMissingSubmodelPlaceholder(value: unknown): value is MissingSubmodelPlaceholder {
  return (value as MissingSubmodelPlaceholder | null | undefined)?.managedType === 'MissingSubmodel';
}

/**
 * Creates a collapsed tree node (with a fresh id) for the given content below `parentNode`
 * and appends it to the children of the parent.
 */
export function appendChildTreeNode(
  parentNode: V3TreeNode,
  content: V3TreeContent,
  editorType: EditorTypeOption,
  label: string,
): { id: string; node: V3TreeNode } {
  const id = uuid();
  const data = new V3TreeItem<V3TreeContent>();
  data.content = content;
  data.id = id;
  data.editorType = editorType;
  data.parent = parentNode.data;

  const node: V3TreeNode = {
    label,
    data,
    children: [],
    parent: parentNode,
    key: id,
    expanded: false,
  };
  if (parentNode.children == null) {
    parentNode.children = [];
  }
  parentNode.children.push(node);
  return { id, node };
}
