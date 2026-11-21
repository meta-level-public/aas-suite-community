import { InjectionToken } from '@angular/core';
import { MenuItem } from '@openng/optimus-ui/api';
import type { V3TreeNode } from '../v3-tree/v3-tree-node';

/** Context passed to additional tree context menu entries (e.g. enterprise features). */
export interface V3TreeContextMenuContext {
  node: V3TreeNode | undefined;
  translate: (key: string) => string;
  hideMenu: () => void;
}

export type V3TreeContextMenuItemFactory = (context: V3TreeContextMenuContext) => MenuItem[];

/** Additional entries appended to the V3 tree context menu. Empty in the community edition. */
export const ADDITIONAL_V3_TREE_CONTEXT_MENU_ITEMS = new InjectionToken<V3TreeContextMenuItemFactory[]>(
  'ADDITIONAL_V3_TREE_CONTEXT_MENU_ITEMS',
  {
    providedIn: 'root',
    factory: () => [],
  },
);
