import { Entity } from '@aas-core-works/aas-core3.1-typescript/types';

import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MenuItem, TreeNode } from 'primeng/api';
import { OrganizationChartModule } from 'primeng/organizationchart';
import { SpeedDialModule } from 'primeng/speeddial';

@Component({
  selector: 'aas-bom-chart',
  imports: [OrganizationChartModule, SpeedDialModule],
  templateUrl: './bom-chart.component.html',
})
export class BomChartComponent implements OnChanges, OnInit {
  @Input({ required: true }) entryNode: Entity | undefined;
  @Input({ required: true }) apiUrl = '/api';

  data: TreeNode[] = [];
  items: MenuItem[] = [];

  ngOnChanges(_changes: SimpleChanges) {
    if (this.entryNode) {
      this.data = [];
      this.data = this.convertToTreeNodeRecursive(this.entryNode);
    }
  }

  ngOnInit(): void {
    this.items = [
      {
        icon: 'pi pi-plus',
        command: () => {},
      },
      {
        icon: 'pi pi-pencil',
        command: () => {},
      },
      {
        icon: 'pi pi-trash',
        command: () => {},
      },
      {
        icon: 'pi pi-external-link',
        command: () => {},
      },
    ];
  }
  convertToTreeNodeRecursive(entryNode: Entity): TreeNode<any>[] {
    const treeNode: TreeNode[] = [];
    const node: TreeNode = {
      label: entryNode.idShort ?? 'No idShort',
      data: entryNode,
      children: [],
    };
    if (entryNode.statements) {
      entryNode.statements.forEach((statement) => {
        if (statement instanceof Entity) node.children?.push(...this.convertToTreeNodeRecursive(statement));
      });
    }
    treeNode.push(node);
    return treeNode;
  }
}
