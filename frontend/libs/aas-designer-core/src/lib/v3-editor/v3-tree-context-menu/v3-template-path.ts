import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { TreeNode } from '@openng/optimus-ui/api';
import { EditorTypeOption } from '../model/editor-type-option';
import { V3TreeItem } from '../model/v3-tree-item';

/**
 * Pure helpers that locate a tree node inside its submodel template:
 * JSONPath of the node, idShort and semantic id of the enclosing submodel.
 */

type TemplateTreeNode = TreeNode<V3TreeItem<unknown>>;

function getIdShort(node: TemplateTreeNode): string | null | undefined {
  return (node.data?.content as aas.types.IReferable | undefined)?.idShort;
}

/** Name of the child array in the parent element (`submodelElements`, `value` or `statements`). */
export function getParentChildArrayName(node: TemplateTreeNode): string {
  switch (node.parent?.data?.editorType) {
    case EditorTypeOption.Submodel:
      return 'submodelElements';
    case EditorTypeOption.SubmodelElementCollection:
      return 'value';
    case EditorTypeOption.Entity:
      return 'statements';
    default:
      return '';
  }
}

/** JSONPath segment of a single node (`$` for the submodel, a filter by idShort for containers). */
export function getPathPart(node: TemplateTreeNode): string {
  switch (node.data?.editorType) {
    case EditorTypeOption.Submodel:
      return '$';
    case EditorTypeOption.SubmodelElementCollection:
    case EditorTypeOption.SubmodelElementList:
    case EditorTypeOption.Entity:
      return `.${getParentChildArrayName(node)}[?(@.idShort=="${getIdShort(node)}")]`;
    default:
      return '';
  }
}

/** JSONPath from the root of the tree down to the node, `path` is appended at the end. */
export function createTemplatePath(node: TemplateTreeNode, path: string): string {
  if (node.parent == null) return path;
  return createTemplatePath(node.parent, getPathPart(node) + path);
}

function findSubmodelNode(node: TemplateTreeNode | undefined): TemplateTreeNode | undefined {
  let current = node;
  while (current != null) {
    if (current.data?.editorType === EditorTypeOption.Submodel) return current;
    current = current.parent;
  }
  return undefined;
}

/** idShort of the submodel that contains the node ('' if there is none). */
export function getSubmodelIdShort(node: TemplateTreeNode): string {
  const submodelNode = findSubmodelNode(node);
  return submodelNode != null ? (getIdShort(submodelNode) as string) : '';
}

/** First global or concept description semantic id of the submodel that contains the node ('' if none). */
export function getSubmodelSemanticId(node: TemplateTreeNode): string {
  const submodel = findSubmodelNode(node)?.data?.content as aas.types.Submodel | undefined;
  return (
    submodel?.semanticId?.keys?.find(
      (k) => k.type === aas.types.KeyTypes.ConceptDescription || k.type === aas.types.KeyTypes.GlobalReference,
    )?.value ?? ''
  );
}

/** Id of the submodel the given tree item belongs to (walks up the parents of the items). */
export function getSubmodelIdOfItem(item: V3TreeItem<unknown> | null | undefined): string {
  let current = item;
  while (current != null) {
    if (current.content instanceof aas.types.Submodel) {
      return current.content.id ?? '';
    }
    current = current.parent;
  }
  return '';
}
