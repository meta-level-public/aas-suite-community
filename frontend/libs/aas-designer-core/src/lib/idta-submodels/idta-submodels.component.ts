import { FilenameHelper } from '@aas/helpers';
import { Component, computed, effect, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PrimeTemplate, TreeNode } from '@openng/optimus-ui/api';
import { Splitter } from '@openng/optimus-ui/splitter';
import { IdtaService } from './idta.service';

import { TranslateModule } from '@ngx-translate/core';
import { MarkdownComponent, provideMarkdown } from 'ngx-markdown';
import { Tooltip } from '@openng/optimus-ui/tooltip';
import { SidebarTreeNavComponent } from '../general/sidebar-tree-nav/sidebar-tree-nav.component';
import { loadPrismLanguages } from '../general/prism/prism-loader';

// Load Prism (core + languages) for code highlighting in production builds
void loadPrismLanguages('json');

@Component({
  selector: 'aas-submodels',
  templateUrl: './idta-submodels.component.html',
  styleUrls: ['../../host.scss'],
  imports: [Splitter, PrimeTemplate, Tooltip, MarkdownComponent, TranslateModule, SidebarTreeNavComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [provideMarkdown()],
})
export class IdtaSubmodelsComponent implements OnInit {
  FilenameHelper = FilenameHelper;

  // Signals
  tree = signal<TreeNode[]>([]);
  selectedNode = signal<TreeNode | null>(null);
  loading = signal(true);
  fileData = signal<Blob | null>(null);
  fileUrl = signal<SafeResourceUrl | null>(null);
  mdText = signal<string>('');
  jsonData = signal<string>('');

  // Computed signals
  isMdLoaded = computed(() => !!this.mdText() && FilenameHelper.isMarkdown(this.selectedNode()?.label));
  isJsonLoaded = computed(() => !!this.jsonData() && FilenameHelper.isJson(this.selectedNode()?.label));
  isPdfLoaded = computed(() => !!this.fileUrl() && FilenameHelper.isPdf(this.selectedNode()?.label));

  constructor(
    private idtaService: IdtaService,
    private sanitizer: DomSanitizer,
  ) {
    // Effect to load file when selection changes
    effect(async () => {
      const node = this.selectedNode();

      // Reset state
      this.mdText.set('');
      this.jsonData.set('');
      this.fileUrl.set(null);
      this.fileData.set(null);

      // Check if node is selectable and is a file
      if (!node || !node.selectable) {
        return;
      }

      const isFile =
        FilenameHelper.isPdf(node.label) || FilenameHelper.isMarkdown(node.label) || FilenameHelper.isJson(node.label);

      if (!isFile) {
        return;
      }

      // Load file
      try {
        this.loading.set(true);
        const blob = await this.idtaService.getFile((node as any).fullPath);

        if (!blob) return;

        this.fileData.set(blob);

        if (FilenameHelper.isMarkdown(node.label)) {
          const text = await blob.text();
          this.mdText.set(text);
        } else if (FilenameHelper.isJson(node.label)) {
          const text = await blob.text();
          try {
            const parsed = JSON.parse(text);
            const formatted = JSON.stringify(parsed, null, 2);
            this.jsonData.set(formatted);
          } catch (e) {
            console.error(e);
            this.jsonData.set('Error: Invalid JSON format');
          }
        } else if (FilenameHelper.isPdf(node.label)) {
          const url = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob));
          this.fileUrl.set(url);
        }
      } catch (error) {
        console.error(error);
      } finally {
        this.loading.set(false);
      }
    });
  }

  async ngOnInit() {
    this.loading.set(true);
    try {
      const treeData = await this.idtaService.getTree();
      // Generate unique keys for all nodes
      this.generateKeys(treeData);
      // Make all file nodes selectable
      this.makeFileNodesSelectable(treeData);
      // Sort tree alphabetically
      this.sortTree(treeData);
      this.tree.set(treeData);
    } finally {
      this.loading.set(false);
    }
  }

  private generateKeys(nodes: TreeNode[], parentPath: string = '') {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      // Use fullPath if available, otherwise generate from parent path and label
      const fullPath = (node as any).fullPath || `${parentPath}/${node.label}`;
      node.key = fullPath;

      // Recursively process children
      if (node.children && node.children.length > 0) {
        this.generateKeys(node.children, fullPath);
      }
    }
  }

  private makeFileNodesSelectable(nodes: TreeNode[], parentLabel: string = '') {
    for (const node of nodes) {
      const isFile =
        node.label &&
        (FilenameHelper.isPdf(node.label) ||
          FilenameHelper.isMarkdown(node.label) ||
          FilenameHelper.isJson(node.label));

      if (isFile) {
        // This is a document file - make it selectable and mark as leaf
        node.selectable = true;
        node.leaf = true;
      } else {
        // This is a folder - not selectable
        node.selectable = false;
      }

      // Recursively process children
      if (node.children && node.children.length > 0) {
        this.makeFileNodesSelectable(node.children, node.label || parentLabel);
      }
    }
  }

  private sortTree(nodes: TreeNode[]) {
    // Sort current level alphabetically
    nodes.sort((a, b) => {
      const labelA = a.label?.toLowerCase() || '';
      const labelB = b.label?.toLowerCase() || '';
      return labelA.localeCompare(labelB);
    });

    // Recursively sort children
    for (const node of nodes) {
      if (node.children && node.children.length > 0) {
        this.sortTree(node.children);
      }
    }
  }

  get selectedNodeKey() {
    return this.selectedNode()?.key ?? null;
  }

  selectNode(node: TreeNode) {
    this.selectedNode.set(node);
  }
  expandAll() {
    const currentTree = this.tree();
    for (const node of currentTree) {
      this.expandRecursive(node, true);
    }
    this.tree.set([...currentTree]);
  }

  collapseAll() {
    const currentTree = this.tree();
    for (const node of currentTree) {
      this.expandRecursive(node, false);
    }
    this.tree.set([...currentTree]);
  }
  private expandRecursive(node: TreeNode, isExpand: boolean) {
    node.expanded = isExpand;
    if (node.children) {
      node.children.forEach((childNode: any) => {
        this.expandRecursive(childNode, isExpand);
      });
    }
  }
}
