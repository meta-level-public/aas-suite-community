import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { NotificationService } from '@aas/common-services';
import { Clipboard } from '@angular/cdk/clipboard';
import { Component, computed, inject, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { TreeNode } from 'primeng/api';
import { Button } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Panel } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { Tooltip } from 'primeng/tooltip';
import { TreeTable, TreeTableModule } from 'primeng/treetable';
import {
  AidDataPoint,
  AidInterface,
  AidSecurityScheme,
  countDataPoints,
  countForms,
  parseAssetInterfaces,
} from './aid-parser';

type InterfaceView = AidInterface & {
  nodes: TreeNode<AidDataPoint>[];
  formDataPoints: AidDataPoint[];
};

@Component({
  selector: 'aas-asset-interfaces-description-viewer',
  templateUrl: './asset-interfaces-description-viewer.component.html',
  styleUrls: ['./asset-interfaces-description-viewer.component.css'],
  imports: [
    Button,
    IconField,
    InputGroup,
    InputGroupAddon,
    InputIcon,
    InputText,
    Panel,
    TableModule,
    Tag,
    Tooltip,
    TranslateModule,
    TreeTableModule,
  ],
})
export class AssetInterfacesDescriptionViewerComponent {
  submodel = input.required<aas.types.Submodel>();

  private clipboard = inject(Clipboard);
  private notificationService = inject(NotificationService);

  interfaces = computed<InterfaceView[]>(() =>
    parseAssetInterfaces(this.submodel()).map((item) => ({
      ...item,
      nodes: this.toTreeNodes(item.dataPoints, true),
      formDataPoints: this.withForms(item.dataPoints),
    })),
  );

  summary = computed(() => {
    const interfaces = this.interfaces();
    return {
      interfaces: interfaces.length,
      dataPoints: interfaces.reduce((sum, item) => sum + countDataPoints(item.dataPoints), 0),
      endpoints: interfaces.reduce((sum, item) => sum + countForms(item.dataPoints), 0),
      securitySchemes: interfaces.reduce((sum, item) => sum + item.securitySchemes.length, 0),
    };
  });

  isNoSecurity(scheme: AidSecurityScheme) {
    return scheme.scheme.toLowerCase() === 'nosec';
  }

  isWebUrl(url: string) {
    return /^https?:\/\//i.test(url);
  }

  copy(text: string) {
    this.clipboard.copy(text);
    this.notificationService.showMessageAlways('COPIED', 'SUCCESS', 'success', false);
  }

  // While searching all nodes are expanded so that nested matches are visible
  search(table: TreeTable, nodes: TreeNode<AidDataPoint>[], query: string) {
    this.setExpanded(nodes, query.trim() !== '', true);
    table.filterGlobal(query, 'contains');
  }

  private setExpanded(nodes: TreeNode<AidDataPoint>[], expandAll: boolean, isRoot: boolean) {
    for (const node of nodes) {
      node.expanded = expandAll || isRoot;
      this.setExpanded(node.children ?? [], expandAll, false);
    }
  }

  private toTreeNodes(dataPoints: AidDataPoint[], expanded: boolean): TreeNode<AidDataPoint>[] {
    return dataPoints.map((point) => ({
      key: point.id,
      data: point,
      expanded,
      leaf: point.children.length === 0,
      children: this.toTreeNodes(point.children, false),
    }));
  }

  private withForms(dataPoints: AidDataPoint[]): AidDataPoint[] {
    return dataPoints.flatMap((point) => [...(point.form != null ? [point] : []), ...this.withForms(point.children)]);
  }
}
