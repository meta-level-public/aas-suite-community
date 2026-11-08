import { EditorTypeOption } from '../model/editor-type-option';
import { V3TreeItem } from '../model/v3-tree-item';
import { V3TreeContent, V3TreeNode } from './v3-tree-node';

/** Test helper: creates a tree node and links it with its parent (data and node level). */
export function createTestNode(
  id: string,
  content: V3TreeContent | undefined,
  editorType: EditorTypeOption,
  parent?: V3TreeNode,
  label?: string,
): V3TreeNode {
  const data = new V3TreeItem<V3TreeContent>();
  data.id = id;
  data.content = content;
  data.editorType = editorType;
  data.parent = parent?.data;
  const node: V3TreeNode = { key: id, label: label ?? id, data, children: [], parent };
  parent?.children?.push(node);
  return node;
}
