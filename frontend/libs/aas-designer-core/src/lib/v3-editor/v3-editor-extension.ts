// Lightweight public API for extensions of the V3 editor (e.g. enterprise features such as AASsi).
// Keep this entry point free of heavy runtime imports: it is loaded at app start.
export * from './model/editor-type-option';
export type { V3TreeItem } from './model/v3-tree-item';
export * from './v3-tree-context-menu/v3-tree-context-menu-extension';
export type { V3TreeNode } from './v3-tree/v3-tree-node';
export * from './tools/template-example-values';
export * from './tools/template-qualifiers';
