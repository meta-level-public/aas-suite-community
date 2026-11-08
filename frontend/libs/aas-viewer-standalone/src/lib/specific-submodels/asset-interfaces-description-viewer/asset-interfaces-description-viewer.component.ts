import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { NotificationService } from '@aas/common-services';
import { Clipboard } from '@angular/cdk/clipboard';
import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, input, ChangeDetectionStrategy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { TreeNode } from '@openng/optimus-ui/api';
import { Button } from '@openng/optimus-ui/button';
import { IconField } from '@openng/optimus-ui/iconfield';
import { InputGroup } from '@openng/optimus-ui/inputgroup';
import { InputGroupAddon } from '@openng/optimus-ui/inputgroupaddon';
import { InputIcon } from '@openng/optimus-ui/inputicon';
import { InputText } from '@openng/optimus-ui/inputtext';
import { Panel } from '@openng/optimus-ui/panel';
import { TableModule } from '@openng/optimus-ui/table';
import { Tag } from '@openng/optimus-ui/tag';
import { Tooltip } from '@openng/optimus-ui/tooltip';
import { TreeTable, TreeTableModule } from '@openng/optimus-ui/treetable';
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
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    NgTemplateOutlet,
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
