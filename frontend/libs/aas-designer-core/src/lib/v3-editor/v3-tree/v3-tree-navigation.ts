import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { FlatTreeNode, V3TreeNode } from './v3-tree-node';

/**
 * Pure helpers to search, filter, flatten and expand the V3 tree.
 */

export function hasChildren(node: V3TreeNode): boolean {
  return (node.children?.length ?? 0) > 0;
}

/**
 * Ids of all nodes whose label (or fallback label) contains the query, including all their ancestors.
 * Returns null for an empty query (no filter active).
 */
export function collectFilteredNodeIds(
  roots: V3TreeNode[],
  filterValue: string,
  getFallbackLabel: (node: V3TreeNode) => string,
): Set<string> | null {
  const query = filterValue.trim().toLowerCase();
  if (query === '') {
    return null;
  }

  const ids = new Set<string>();
  const collect = (node: V3TreeNode): boolean => {
    const ownLabel = (node.label ?? '').toString().toLowerCase();
    const fallbackLabel = (getFallbackLabel(node) ?? '').toString().toLowerCase();
    const ownMatch = ownLabel.includes(query) || fallbackLabel.includes(query);
    const childMatch = (node.children ?? []).some((child) => collect(child));
    const match = ownMatch || childMatch;
    if (match && node.data?.id != null) {
      ids.add(node.data.id);
    }
    return match;
  };
  roots.forEach((root) => collect(root));
  return ids;
}

export function isNodeVisible(node: V3TreeNode, filteredNodeIds: Set<string> | null): boolean {
  if (filteredNodeIds == null) return true;
  const id = node.data?.id;
  return id != null && filteredNodeIds.has(id);
}

/** While filtering all matching children are shown, otherwise only those of expanded nodes. */
export function shouldRenderChildren(node: V3TreeNode, filteredNodeIds: Set<string> | null): boolean {
  if (!hasChildren(node)) return false;
  if (filteredNodeIds != null) return true;
  return node.expanded === true;
}

/** Visible nodes in display order with their depth and parent (input of the virtual scroll list). */
export function buildVisibleFlatNodes(roots: V3TreeNode[], filteredNodeIds: Set<string> | null): FlatTreeNode[] {
  const visible: FlatTreeNode[] = [];
  const walk = (nodes: V3TreeNode[], depth: number, parent: V3TreeNode | null) => {
    for (const node of nodes) {
      if (!isNodeVisible(node, filteredNodeIds)) continue;
      visible.push({ node, depth, parent });
      if (shouldRenderChildren(node, filteredNodeIds) && node.children != null) {
        walk(node.children, depth + 1, node);
      }
    }
  };
  walk(roots, 0, null);
  return visible;
}

/** Depth-first search for the first node matching the predicate. */
export function findNodeRecursive(node: V3TreeNode, predicate: (node: V3TreeNode) => boolean): V3TreeNode | null {
  if (predicate(node)) return node;
  for (const child of node.children ?? []) {
    const found = findNodeRecursive(child, predicate);
    if (found != null) return found;
  }
  return null;
}

/** Node with the given id; if several roots contain a match, the one of the last root wins. */
export function findNodeById(roots: V3TreeNode[], id: string): V3TreeNode | null {
  let foundNode: V3TreeNode | null = null;
  roots.forEach((root) => {
    const node = findNodeRecursive(root, (n) => n.data?.id === id);
    if (node != null) {
      foundNode = node;
    }
  });
  return foundNode;
}

/** Expands the node and all of its ancestors. */
export function expandParents(node: V3TreeNode) {
  let current: V3TreeNode | undefined = node;
  while (current != null) {
    current.expanded = true;
    current = current.parent;
  }
}

/** Copy of the node (and all descendants) with the given expanded state. */
export function withExpandedState(node: V3TreeNode, expanded: boolean): V3TreeNode {
  return {
    ...node,
    expanded,
    children: node.children ? node.children.map((child) => withExpandedState(child, expanded)) : node.children,
  };
}

/** Follows a dot separated idShort path (e.g. `Collection.Property`) from the children of `root`. */
export function findNodeByIdShortPath(root: V3TreeNode | undefined, path: string): V3TreeNode | null {
  let foundNode: V3TreeNode | null = null;
  let remainingPath = path;
  while (remainingPath != null && remainingPath !== '') {
    const [idShort, ...rest] = remainingPath.split('.');
    const candidates: V3TreeNode[] | undefined = foundNode == null ? root?.children : foundNode.children;
    const node: V3TreeNode | undefined = candidates?.find(
      (n) => (n.data?.content as aas.types.IReferable | undefined)?.idShort === idShort,
    );
    if (node == null) {
      return null;
    }
    foundNode = node;
    remainingPath = rest.join('.');
  }
  return foundNode;
}
