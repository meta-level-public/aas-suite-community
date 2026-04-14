import { NgClass } from '@angular/common';
import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TreeNode } from 'primeng/api';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';

type VisibleNode = {
  depth: number;
  hasChildren: boolean;
  indexLabel: string;
  node: TreeNode;
};

@Component({
  selector: 'aas-sidebar-tree-nav',
  templateUrl: './sidebar-tree-nav.component.html',
  styleUrls: ['./sidebar-tree-nav.component.scss'],
  imports: [NgClass, TranslateModule, InputText, IconField, InputIcon],
})
export class SidebarTreeNavComponent {
  items = input<TreeNode[]>([]);
  selectedKey = input<string | null>(null);
  placeholder = input<string>('SEARCH');
  appearance = input<'default' | 'step-list'>('default');
  showFilter = input(true);
  nodeSelected = output<TreeNode>();

  private readonly translateService = inject(TranslateService);
  private readonly treeVersion = signal(0);

  filterQuery = signal('');

  constructor() {
    effect(() => {
      const selectedKey = this.selectedKey();

      if (selectedKey == null || selectedKey === '') {
        return;
      }

      const expansionResult = this.expandPathToSelectedKey(this.items(), selectedKey);

      if (expansionResult.changed) {
        this.treeVersion.update((value) => value + 1);
      }
    });
  }

  visibleNodes = computed(() => {
    this.treeVersion();
    return this.flattenNodes(this.items(), this.normalizedFilter());
  });

  setFilter(value: string) {
    this.filterQuery.set(value);
  }

  isStepListAppearance() {
    return this.appearance() === 'step-list';
  }

  isActive(node: TreeNode) {
    return node.key != null && node.key === this.selectedKey();
  }

  isDisabled(node: TreeNode) {
    return node.data?.disabled === true;
  }

  getDisplayLabel(node: TreeNode) {
    return this.translateService.instant(node.label ?? '');
  }

  getDescription(node: TreeNode) {
    const rawDescription = `${node.data?.description ?? ''}`.trim();
    const description =
      node.data?.descriptionTranslate === true ? this.translateService.instant(rawDescription) : rawDescription;
    const label = `${node.data?.label ?? node.label ?? ''}`.trim();

    if (description === '' || description === label) {
      return null;
    }

    return description;
  }

  onNodeClick(node: TreeNode) {
    if (this.isDisabled(node)) {
      return;
    }

    const hasChildren = !!node.children?.length;
    const selectable = node.selectable !== false;

    if (!selectable && hasChildren) {
      this.toggleNode(node);
      return;
    }

    this.nodeSelected.emit(node);
  }

  toggleNode(node: TreeNode) {
    node.expanded = !node.expanded;
    this.treeVersion.update((value) => value + 1);
  }

  private normalizedFilter() {
    return this.filterQuery().trim().toLowerCase();
  }

  private expandPathToSelectedKey(nodes: TreeNode[], selectedKey: string): { changed: boolean; matches: boolean } {
    let hasChanges = false;
    let hasMatch = false;

    for (const node of nodes) {
      const childNodes = node.children ?? [];
      const isMatch = node.key === selectedKey;
      const childResult = childNodes.length > 0 ? this.expandPathToSelectedKey(childNodes, selectedKey) : null;
      const isMatchInChildren = childResult?.matches === true;

      if (childResult?.changed === true) {
        hasChanges = true;
      }

      if (!isMatch && !isMatchInChildren) {
        continue;
      }

      hasMatch = true;

      if (childNodes.length > 0 && node.expanded !== true) {
        node.expanded = true;
        hasChanges = true;
      }
    }

    return { changed: hasChanges, matches: hasMatch };
  }

  private flattenNodes(
    nodes: TreeNode[],
    filterQuery: string,
    depth: number = 0,
    indexPath: number[] = [],
  ): VisibleNode[] {
    const visibleNodes: VisibleNode[] = [];

    nodes.forEach((node, index) => {
      const hasChildren = !!node.children?.length;
      const nextIndexPath = [...indexPath, index + 1];
      const children = hasChildren ? this.flattenNodes(node.children ?? [], filterQuery, depth + 1, nextIndexPath) : [];
      const labelMatches = filterQuery.length === 0 || this.getDisplayLabel(node).toLowerCase().includes(filterQuery);
      const isVisible = filterQuery.length === 0 ? true : labelMatches || children.length > 0;

      if (!isVisible) {
        return;
      }

      visibleNodes.push({ node, depth, hasChildren, indexLabel: nextIndexPath.join('.') });

      const shouldShowChildren = filterQuery.length > 0 || node.expanded === true;
      if (hasChildren && shouldShowChildren) {
        visibleNodes.push(...children);
      }
    });

    return visibleNodes;
  }
}
