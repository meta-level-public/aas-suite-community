import {
  AssetInformation,
  Entity,
  ISubmodelElement,
  Key,
  KeyTypes,
  Reference,
  ReferenceTypes,
  RelationshipElement,
  Submodel,
} from '@aas-core-works/aas-core3.1-typescript/types';
import { AasConfirmationService, NotificationService } from '@aas/common-services';

import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  input,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  type SimpleChanges,
  ViewChild,
  ChangeDetectionStrategy,
} from '@angular/core';

import { Property } from '@aas/model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import type cytoscape from 'cytoscape';
import { ButtonModule } from '@openng/optimus-ui/button';
import { DialogService, DynamicDialogRef } from '@openng/optimus-ui/dynamicdialog';
import { TooltipModule } from '@openng/optimus-ui/tooltip';
import { v4 as guid } from 'uuid';
import { BomEntityDialogComponent } from './bom-entity-dialog/bom-entity-dialog.component';
import { InitBomAssistantComponent } from './init-bom-assistant/init-bom-assistant.component';
import { chooseBomOrientation } from './utils/bom-orientation.util';
import { entityHasLinkedAsset } from './utils/entity-asset-reference.util';

/** Below this zoom the node labels are hard to read; the diagram then grows in height instead. */
const READABLE_MIN_ZOOM = 0.75;
const MAX_CHART_HEIGHT_PX = 1600;
const LINKED_ASSET_MARKER = ' \u2197';
const ZOOM_STEP = 1.25;

// cytoscape (+ plugins, ~700 kB) is loaded on first render so the editor chunk does not carry it
let cytoscapeLoader: Promise<typeof cytoscape> | undefined;

function loadCytoscape(): Promise<typeof cytoscape> {
  cytoscapeLoader ??= Promise.all([
    import('cytoscape'),
    // @ts-expect-error package has no maintained type declarations
    import('cytoscape-dagre'),
    // @ts-expect-error package has no maintained type declarations
    import('cytoscape-svg'),
  ]).then(([cytoscapeModule, dagreModule, svgModule]) => {
    const lib = cytoscapeModule.default;
    lib.use(dagreModule.default as any);
    lib.use(svgModule.default as any);
    return lib;
  });
  return cytoscapeLoader;
}

@Component({
  selector: 'aas-bom-hierarchy-chart',
  imports: [TranslateModule, ButtonModule, TooltipModule],
  templateUrl: './bom-chart-mermaid.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./bom-chart-mermaid.component.scss'],
})
export class BomHierarchyChartComponent implements OnChanges, OnInit, AfterViewInit, OnDestroy {
  @Input({ required: true }) entryNode: Entity | undefined;
  @Input({ required: true }) apiUrl = '/api';
  @Input({ required: true }) editable: boolean = true;
  @Input({ required: true }) submodel: Submodel | undefined;
  @Input() showReinitializeAction = true;
  @Input() reinitializeRequestId = 0;
  @Output() requestReinitialize = new EventEmitter<void>();
  @Output() requestEditMode = new EventEmitter<void>();
  assetInformation = input.required<AssetInformation>();
  idShort = input.required<string>();

  @ViewChild('chartContainer') chartContainer: ElementRef<HTMLDivElement> | undefined;
  cdRef = inject(ChangeDetectorRef);

  dialogService = inject(DialogService);
  confirmService = inject(AasConfirmationService);
  notificationService = inject(NotificationService);
  translate = inject(TranslateService);
  ref: DynamicDialogRef | undefined | null;

  private cy: cytoscape.Core | undefined;
  private cytoscapeRenderToken = 0;
  private pendingRender = false;
  private lastTapItemId: string | null = null;
  private lastTapAt = 0;
  selectedItemId: string | null = null;
  selectedItemActionAnchor: { left: number; top: number } | null = null;
  selectedItemReparentHandleAnchor: { left: number; top: number } | null = null;
  reparentArmedItemId: string | null = null;
  private reparentHandleDragging = false;
  private currentDropTargetItemId: string | null = null;
  private lastHandledReinitializeRequestId = 0;

  graphItems: {
    id: string;
    entity: Entity;
    parentEntity: Entity | null;
    relationship: RelationshipElement | null;
  }[] = [];

  orientation: 'LR' | 'TB' = 'LR';
  /** Once the user switched the orientation, it is no longer chosen from the shape of the tree. */
  private orientationChosenByUser = false;
  maximized = false;
  theme: 'forest' | 'base' | 'neutral' = 'forest';
  private rootId: string | null = null;
  hasLinkedNodes = false;
  private childrenMap: Record<string, string[]> = {};

  chartVisible = false;

  ngOnInit(): void {
    // no-op
  }

  ngAfterViewInit(): void {
    if (this.pendingRender) {
      this.pendingRender = false;
      this.renderChart();
    }
  }

  ngOnDestroy(): void {
    this.destroyGraph();
  }

  async ngOnChanges(_changes: SimpleChanges) {
    if (this.reinitializeRequestId > this.lastHandledReinitializeRequestId) {
      this.lastHandledReinitializeRequestId = this.reinitializeRequestId;
      await this.reinitializeBom(true);
      return;
    }

    this.renderChart();
  }

  renderChart() {
    const resolvedEntryNode = this.getResolvedEntryNode();

    if (!resolvedEntryNode) {
      this.chartVisible = false;
      this.destroyGraph();
      this.cdRef.markForCheck();
      return;
    }

    this.chartVisible = true;
    this.cdRef.markForCheck();

    if (!this.chartContainer?.nativeElement) {
      if (!this.pendingRender) {
        this.pendingRender = true;
        queueMicrotask(() => {
          this.pendingRender = false;
          this.renderChart();
        });
      }
      return;
    }

    this.resetGraphModel();
    this.convertToGraphRecursive(resolvedEntryNode, null, null);
    void this.renderCytoscape();
    this.cdRef.markForCheck();
  }

  drawMermaid() {
    this.renderChart();
  }

  private resetGraphModel() {
    this.graphItems = [];
    this.childrenMap = {};
    this.rootId = null;
    this.selectedItemId = null;
    this.selectedItemActionAnchor = null;
    this.selectedItemReparentHandleAnchor = null;
    this.reparentArmedItemId = null;
  }

  private async renderCytoscape() {
    const renderToken = ++this.cytoscapeRenderToken;
    const cytoscape = await loadCytoscape();
    // a newer render or destroyGraph() happened while cytoscape was loading
    if (renderToken !== this.cytoscapeRenderToken) return;

    const container = this.chartContainer?.nativeElement;
    if (!container) return;

    this.destroyGraph();
    // fitAllNodes may have grown the container for the previous graph
    container.style.height = '';

    const elements = this.buildCytoscapeElements();
    if (!this.orientationChosenByUser) {
      this.orientation = chooseBomOrientation(this.rootId, this.childrenMap);
    }
    // Set here and not as a getter: renderChart() also runs during ngAfterViewInit
    this.hasLinkedNodes = elements.some((element) => element.classes?.includes('linked') === true);
    const { rootBg, rootBorder, rootText, internalBg, internalBorder, internalText, leafBg, leafBorder, leafText } =
      this.getThemePalette();
    // Same token as the legend; cytoscape draws on a canvas and needs the resolved value
    const linkedBorder =
      getComputedStyle(document.documentElement).getPropertyValue('--p-blue-600').trim() || '#2563eb';

    this.cy = cytoscape({
      container,
      elements,
      style: [
        {
          selector: 'node',
          style: {
            shape: 'round-rectangle',
            width: 'label',
            height: 42,
            padding: '14px',
            label: 'data(label)',
            'text-wrap': 'none',
            'font-size': 13,
            'font-family': 'Inter, "Segoe UI", Roboto, Arial, sans-serif',
            'text-valign': 'center',
            'text-halign': 'center',
          },
        },
        {
          selector: 'node.root',
          style: {
            'background-color': rootBg,
            'border-color': rootBorder,
            'border-width': 2,
            color: rootText,
          },
        },
        {
          selector: 'node.internal',
          style: {
            'background-color': internalBg,
            'border-color': internalBorder,
            'border-width': 1,
            color: internalText,
          },
        },
        {
          selector: 'node.leaf',
          style: {
            'background-color': leafBg,
            'border-color': leafBorder,
            'border-width': 1,
            color: leafText,
          },
        },
        {
          selector: 'node.linked',
          style: {
            'border-width': 3,
            'border-style': 'double',
            'border-color': linkedBorder,
          },
        },
        {
          selector: 'node.selected',
          style: {
            'border-width': 3,
            'border-color': '#db2777',
          },
        },
        {
          selector: 'node.drop-target',
          style: {
            'border-width': 3,
            'border-color': '#ec4899',
          },
        },
        {
          selector: 'edge',
          style: {
            width: 2,
            'curve-style': 'bezier',
            'target-arrow-shape': 'triangle',
            'arrow-scale': 1,
            'line-color': '#64748b',
            'target-arrow-color': '#64748b',
            'control-point-step-size': 60,
            label: 'data(label)',
            'font-size': 11,
            color: '#334155',
            'text-background-color': '#f8fafc',
            'text-background-opacity': 1,
            'text-background-shape': 'roundrectangle',
            'text-background-padding': '3px',
            'text-margin-y': -10,
            'text-margin-x': 0,
          },
        },
      ],
      layout: {
        name: 'dagre',
        padding: 20,
        animate: false,
        nodeDimensionsIncludeLabels: true,
        ranker: 'tight-tree',
        rankSep: 120,
        nodeSep: 80,
        edgeSep: 20,
        rankDir: this.orientation,
      } as any,
      minZoom: 0.2,
      maxZoom: 2.5,
      wheelSensitivity: 0.15,
    });

    this.cy.on('tap', 'node', (event: cytoscape.EventObject) => {
      const itemId = event.target.data('itemId') as string | undefined;
      if (!itemId) return;
      this.selectItem(itemId);

      const now = Date.now();
      if (this.lastTapItemId === itemId && now - this.lastTapAt <= 320) {
        this.openSelectedDetails();
        this.lastTapItemId = null;
        this.lastTapAt = 0;
        return;
      }
      this.lastTapItemId = itemId;
      this.lastTapAt = now;
    });
    this.cy.on('tap', (event: cytoscape.EventObject) => {
      if (event.target === this.cy) {
        this.clearSelection();
      }
    });
    this.cy.on('grab', 'node', () => {
      if (this.reparentHandleDragging) {
        return;
      }
      this.clearSelection();
    });
    this.cy.on('zoom pan resize', () => {
      this.updateSelectionAnchor();
    });

    this.fitAllNodes(container);
    this.cdRef.markForCheck();
  }

  /**
   * Shows every node. If fitting would make the labels unreadable, the container grows in height first (up to a
   * limit); zooming in instead would push nodes out of view.
   */
  private fitAllNodes(container: HTMLElement) {
    if (!this.cy) return;

    this.cy.fit(undefined, 20);
    if (this.maximized || this.cy.zoom() >= READABLE_MIN_ZOOM) return;

    // Growing in height only helps up to the zoom the width allows
    const graph = this.cy.elements().boundingBox();
    const targetZoom = Math.min(READABLE_MIN_ZOOM, (container.clientWidth - 40) / graph.w);
    const neededHeight = Math.ceil(graph.h * targetZoom) + 40;
    if (neededHeight > container.clientHeight) {
      container.style.height = `${Math.min(neededHeight, MAX_CHART_HEIGHT_PX)}px`;
      this.cy.resize();
      this.cy.fit(undefined, 20);
    }
  }

  private buildCytoscapeElements(): cytoscape.ElementDefinition[] {
    const elements: cytoscape.ElementDefinition[] = [];
    const parentIds = new Set(Object.keys(this.childrenMap));

    for (const item of this.graphItems) {
      const isRoot = item.id === this.rootId;
      const isLeaf = !parentIds.has(item.id);
      const cssClass = isRoot ? 'root' : isLeaf ? 'leaf' : 'internal';
      // The root node is the asset of this AAS itself; only children link to other assets
      const isLinked = !isRoot && entityHasLinkedAsset(item.entity);
      elements.push({
        data: {
          id: item.id,
          itemId: item.id,
          label: `${item.entity.idShort ?? 'No idShort'}${this.getBulkCountLabel(item.entity)}${isLinked ? LINKED_ASSET_MARKER : ''}`,
        },
        classes: isLinked ? `${cssClass} linked` : cssClass,
      });

      if (item.parentEntity && item.relationship) {
        const parentItem = this.graphItems.find((candidate) => candidate.entity === item.parentEntity);
        if (parentItem) {
          elements.push({
            data: {
              id: `${parentItem.id}->${item.id}`,
              source: parentItem.id,
              target: item.id,
              label: this.getRelationshipLabel(item.relationship),
            },
          });
        }
      }
    }

    return elements;
  }

  private getThemePalette() {
    if (this.theme === 'neutral') {
      return {
        rootBg: '#334155',
        rootBorder: '#1e293b',
        rootText: '#f8fafc',
        internalBg: '#f1f5f9',
        internalBorder: '#94a3b8',
        internalText: '#1e293b',
        leafBg: '#e2e8f0',
        leafBorder: '#94a3b8',
        leafText: '#1e293b',
      };
    }

    if (this.theme === 'base') {
      return {
        rootBg: '#1d4ed8',
        rootBorder: '#1e40af',
        rootText: '#ffffff',
        internalBg: '#eef2ff',
        internalBorder: '#6366f1',
        internalText: '#1f2937',
        leafBg: '#ecfeff',
        leafBorder: '#06b6d4',
        leafText: '#164e63',
      };
    }

    return {
      rootBg: '#2563eb',
      rootBorder: '#1d4ed8',
      rootText: '#ffffff',
      internalBg: '#f1f5f9',
      internalBorder: '#64748b',
      internalText: '#1e293b',
      leafBg: '#ecfdf5',
      leafBorder: '#059669',
      leafText: '#065f46',
    };
  }

  private destroyGraph() {
    this.cytoscapeRenderToken++;
    if (this.cy) {
      this.cy.destroy();
      this.cy = undefined;
    }
  }

  private convertToGraphRecursive(
    entryNode: Entity,
    parentGuid: string | null,
    relationship: RelationshipElement | null,
  ) {
    const parentEntity = this.graphItems.find((item) => item.id === parentGuid)?.entity ?? null;
    const item = { id: guid(), entity: entryNode, relationship, parentEntity };
    this.graphItems.push(item);

    if (!this.rootId) this.rootId = item.id;
    if (parentGuid) {
      if (!this.childrenMap[parentGuid]) this.childrenMap[parentGuid] = [];
      this.childrenMap[parentGuid].push(item.id);
    }

    for (const sme of entryNode.statements ?? []) {
      if (!(sme instanceof RelationshipElement) || !sme.second) continue;

      const node = this.findElement(sme.second, entryNode.statements ?? [], sme.second.keys.length - 1);
      if (node) {
        this.convertToGraphRecursive(node, item.id, sme);
      }
    }
  }

  private getRelationshipLabel(relationship: RelationshipElement | null) {
    switch (relationship?.semanticId?.keys?.[0].value) {
      case 'https://admin-shell.io/idta/HierarchicalStructures/IsPartOf/1/0':
        return 'isPartOf';
      case 'https://admin-shell.io/idta/HierarchicalStructures/HasPart/1/0':
        return 'hasPart';
      case 'https://admin-shell.io/idta/HierarchicalStructures/SameAs/1/0':
        return 'sameAs';
      default:
        return '';
    }
  }

  findElement(elementToFind: Reference, submodelElement: ISubmodelElement[], index = 1): Entity | null {
    let found: any = null;
    if (index < elementToFind.keys.length && index > 0) {
      found = submodelElement.find((el) => el.idShort === elementToFind.keys[index].value);
      index++;
      if (!found) return null;
      if (index < elementToFind.keys.length) {
        found = this.findElement(elementToFind, found.statements ?? [], index);
      }
    }
    return found;
  }

  private getBulkCountLabel(entity: Entity | undefined) {
    const val = (entity?.statements?.find((s) => this.isBulkCount(s)) as unknown as Property)?.value;
    return val ? ` (x${val})` : '';
  }

  isBulkCount(entity: ISubmodelElement) {
    return this.hasSemanticId(entity, 'https://admin-shell.io/idta/HierarchicalStructures/BulkCount/1/0');
  }

  hasSemanticId(sme: ISubmodelElement | undefined, semanticId: string) {
    return sme?.semanticId?.keys.find((k) => k.value.startsWith(semanticId)) != null;
  }

  async openEntityDetailsDialog(itemId: string) {
    this.openEntityDialog(itemId, undefined);
  }

  openSelectedDetails() {
    if (!this.selectedItemId) return;
    this.openEntityDialog(this.selectedItemId, 'details');
  }

  openSelectedAddChild() {
    if (!this.selectedItemId || !this.editable) return;
    if (!this.canAddChildOnSelectedItem) return;
    this.openEntityDialog(this.selectedItemId, 'add-child');
  }

  openSelectedLinkedAas() {
    if (!this.selectedItemId || !this.selectedItemHasLinkedAsset) return;
    this.openEntityDialog(this.selectedItemId, 'aas-search');
  }

  get selectedItemHasLinkedAsset() {
    const item = this.selectedItem;
    return item != null && item.id !== this.rootId && entityHasLinkedAsset(item.entity);
  }

  openSelectedRemove() {
    if (!this.selectedItemId || !this.canRemoveSelectedItem) return;
    this.openEntityDialog(this.selectedItemId, 'remove');
  }

  private openEntityDialog(itemId: string, initialMode: 'details' | 'add-child' | 'remove' | 'aas-search' | undefined) {
    const graphItem = this.graphItems.find((item) => item.id === itemId);
    if (!graphItem) return;
    const refreshEmitter = new EventEmitter();

    this.ref = this.dialogService.open(BomEntityDialogComponent, {
      header: graphItem?.entity.idShort ?? 'Entity',
      data: {
        entity: graphItem?.entity,
        parentEntity: graphItem?.parentEntity,
        relationship: graphItem?.relationship,
        apiUrl: this.apiUrl,
        editable: this.editable,
        submodel: this.submodel,
        refreshEmitter,
        assetInformation: this.assetInformation(),
        initialMode,
      },
      draggable: true,
      modal: true,
      width: '75vw',
    });

    const subscription = refreshEmitter.subscribe(() => {
      this.renderChart();
    });

    this.ref?.onClose.subscribe(() => {
      this.renderChart();
      const refreshEvent = new CustomEvent('refreshEntityTreeNodes');
      window.dispatchEvent(refreshEvent);
      subscription.unsubscribe();
    });
  }

  private selectItem(itemId: string) {
    if (this.reparentArmedItemId && this.reparentArmedItemId !== itemId) {
      this.reparentArmedItemId = null;
    }
    this.selectedItemId = itemId;
    this.cy?.nodes().removeClass('selected');
    this.cy?.getElementById(itemId).addClass('selected');
    this.updateSelectionAnchor();
    this.cdRef.markForCheck();
  }

  clearSelection() {
    this.selectedItemId = null;
    this.selectedItemActionAnchor = null;
    this.selectedItemReparentHandleAnchor = null;
    this.reparentArmedItemId = null;
    this.clearDropTargetHighlight();
    this.cy?.nodes().removeClass('selected');
    this.cdRef.markForCheck();
  }

  get selectedItem() {
    if (!this.selectedItemId) return null;
    return this.graphItems.find((item) => item.id === this.selectedItemId) ?? null;
  }

  get selectedItemLabel() {
    return this.selectedItem?.entity.idShort ?? '';
  }

  get modeLabel() {
    return this.editable ? this.translate.instant('EDIT') : this.translate.instant('VIEW');
  }

  get canAddChildOnSelectedItem() {
    if (!this.editable || !this.selectedItem) {
      return false;
    }

    const archeType = this.getArcheType();
    const isRoot = this.selectedItem.parentEntity == null;
    const statementCount = this.selectedItem.entity.statements?.length ?? 0;

    return (
      archeType === 'Full' ||
      archeType == null ||
      (archeType === 'OneDown' && isRoot) ||
      (archeType === 'OneUp' && isRoot && statementCount === 0)
    );
  }

  get addChildDisabledHint() {
    if (!this.selectedItem || this.canAddChildOnSelectedItem) {
      return null;
    }

    const archeType = this.getArcheType();
    const isRoot = this.selectedItem.parentEntity == null;
    const statementCount = this.selectedItem.entity.statements?.length ?? 0;

    if (archeType === 'OneDown' && !isRoot) {
      return this.translate.instant('BOM_ADD_CHILD_HINT_ONEDOWN_ROOT_ONLY');
    }

    if (archeType === 'OneUp') {
      if (!isRoot) {
        return this.translate.instant('BOM_ADD_CHILD_HINT_ONEUP_ROOT_ONLY');
      }
      if (statementCount > 0) {
        return this.translate.instant('BOM_ADD_CHILD_HINT_ONEUP_SINGLE_CHILD');
      }
    }

    return this.translate.instant('BOM_ADD_CHILD_HINT_NOT_ALLOWED');
  }

  get canRemoveSelectedItem() {
    return this.editable && !!this.selectedItem && this.selectedItem.parentEntity != null;
  }

  get removeDisabledHint() {
    if (!this.selectedItem || this.canRemoveSelectedItem) {
      return null;
    }

    if (this.selectedItem.parentEntity == null) {
      return this.translate.instant('BOM_REMOVE_HINT_ENTRYNODE_ONLY_REINIT');
    }

    return this.translate.instant('BOM_REMOVE_HINT_NOT_ALLOWED');
  }

  get isReparentArmedForSelected() {
    return this.selectedItemId != null && this.reparentArmedItemId === this.selectedItemId;
  }

  armReparentForSelected(event?: MouseEvent) {
    if (!this.editable || !this.selectedItemId) {
      return;
    }

    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    this.reparentArmedItemId = this.selectedItemId;
    this.reparentHandleDragging = true;
    this.cdRef.markForCheck();
  }

  @HostListener('window:mousemove', ['$event'])
  onWindowMouseMove(event: MouseEvent) {
    if (!this.reparentHandleDragging || !this.reparentArmedItemId || !this.cy || !this.chartContainer?.nativeElement) {
      return;
    }

    const node = this.cy.getElementById(this.reparentArmedItemId);
    if (node.empty()) {
      return;
    }

    const rect = this.chartContainer.nativeElement.getBoundingClientRect();
    const renderedX = event.clientX - rect.left;
    const renderedY = event.clientY - rect.top;
    const zoom = this.cy.zoom();
    const pan = this.cy.pan();
    const modelX = (renderedX - pan.x) / zoom;
    const modelY = (renderedY - pan.y) / zoom;

    node.position({ x: modelX, y: modelY });
    this.updateDropTargetHighlight(node);
    this.updateSelectionAnchor();
  }

  @HostListener('window:mouseup')
  onWindowMouseUp() {
    if (!this.reparentHandleDragging || !this.reparentArmedItemId || !this.cy) {
      return;
    }

    const node = this.cy.getElementById(this.reparentArmedItemId);
    this.reparentHandleDragging = false;
    if (!node.empty()) {
      this.tryReparentDroppedNode(node);
      return;
    }

    this.reparentArmedItemId = null;
    this.clearDropTargetHighlight();
  }

  requestSwitchToEditMode() {
    this.requestEditMode.emit();
  }

  private getArcheType(): 'Full' | 'OneDown' | 'OneUp' | null {
    const value = this.submodel?.submodelElements?.find((sme) =>
      this.hasSemanticId(sme, 'https://admin-shell.io/idta/HierarchicalStructures/ArcheType/1/0'),
    ) as Property | undefined;
    const normalized = value?.value?.trim() ?? '';
    if (normalized === 'Full' || normalized === 'OneDown' || normalized === 'OneUp') {
      return normalized;
    }
    return null;
  }

  private updateSelectionAnchor() {
    if (!this.selectedItemId || !this.cy || !this.chartContainer?.nativeElement) {
      this.selectedItemActionAnchor = null;
      return;
    }

    const node = this.cy.getElementById(this.selectedItemId);
    if (node.empty()) {
      this.selectedItemActionAnchor = null;
      return;
    }

    const pos = node.renderedPosition();
    const box = node.renderedBoundingBox({ includeLabels: true });
    const containerWidth = this.chartContainer.nativeElement.clientWidth;
    const preferredLeft = pos.x + box.w / 2 + 18;
    const left = Math.max(8, Math.min(preferredLeft, containerWidth - 360));
    const aboveNodeTop = pos.y - box.h / 2 - 52;
    const top = aboveNodeTop > 8 ? aboveNodeTop : pos.y + box.h / 2 + 10;
    const handleLeft = Math.max(8, Math.min(box.x2 - 8, containerWidth - 18));
    const handleTop = Math.max(8, box.y1 - 8);

    this.selectedItemActionAnchor = { left, top };
    this.selectedItemReparentHandleAnchor = { left: handleLeft, top: handleTop };
    this.cdRef.markForCheck();
  }

  private tryReparentDroppedNode(draggedNode: cytoscape.NodeSingular) {
    const draggedItemId = draggedNode.data('itemId') as string | undefined;
    if (!draggedItemId) {
      this.reparentArmedItemId = null;
      this.renderChart();
      return;
    }

    const draggedItem = this.graphItems.find((item) => item.id === draggedItemId);
    if (!draggedItem || draggedItem.parentEntity == null || draggedItem.relationship == null) {
      this.notificationService.showMessageAlways('BOM_REPARENT_ROOT_BLOCKED', 'WARNING', 'warn', false);
      this.reparentArmedItemId = null;
      this.renderChart();
      return;
    }

    const dropTarget = this.findDropTargetForNode(draggedNode);
    if (!dropTarget) {
      this.reparentArmedItemId = null;
      this.clearDropTargetHighlight();
      this.renderChart();
      return;
    }

    const targetItemId = dropTarget.data('itemId') as string | undefined;
    if (!targetItemId || targetItemId === draggedItemId) {
      this.reparentArmedItemId = null;
      this.clearDropTargetHighlight();
      this.renderChart();
      return;
    }

    if (this.isDescendantOf(targetItemId, draggedItemId)) {
      this.notificationService.showMessageAlways('BOM_REPARENT_CYCLE_BLOCKED', 'WARNING', 'warn', false);
      this.reparentArmedItemId = null;
      this.clearDropTargetHighlight();
      this.renderChart();
      return;
    }

    const targetItem = this.graphItems.find((item) => item.id === targetItemId);
    if (!targetItem) {
      this.reparentArmedItemId = null;
      this.clearDropTargetHighlight();
      this.renderChart();
      return;
    }

    if (!this.canAttachToTarget(targetItemId, draggedItemId)) {
      this.notificationService.showMessageAlways('BOM_REPARENT_NOT_ALLOWED_FOR_ARCHETYPE', 'WARNING', 'warn', false);
      this.reparentArmedItemId = null;
      this.clearDropTargetHighlight();
      this.renderChart();
      return;
    }

    const duplicateOnTarget = (targetItem.entity.statements ?? []).some(
      (sme) =>
        sme instanceof Entity &&
        sme !== draggedItem.entity &&
        (sme.idShort?.trim() ?? '') === (draggedItem.entity.idShort?.trim() ?? ''),
    );
    if (duplicateOnTarget) {
      this.notificationService.showMessageAlways('ID_SHORT_ALREADY_EXISTS_ON_LEVEL', 'WARNING', 'warn', false);
      this.reparentArmedItemId = null;
      this.clearDropTargetHighlight();
      this.renderChart();
      return;
    }

    const sourceStatements = draggedItem.parentEntity.statements ?? [];
    draggedItem.parentEntity.statements = sourceStatements.filter(
      (sme) => sme !== draggedItem.entity && sme !== draggedItem.relationship,
    );

    if (!targetItem.entity.statements) {
      targetItem.entity.statements = [];
    }
    targetItem.entity.statements.push(draggedItem.entity);
    targetItem.entity.statements.push(draggedItem.relationship);

    this.rebuildRelationshipModelReferences();

    const refreshEvent = new CustomEvent('refreshEntityTreeNodes');
    window.dispatchEvent(refreshEvent);
    this.notificationService.showMessageAlways('BOM_REPARENT_SUCCESS', 'SUCCESS', 'success', false);
    this.reparentArmedItemId = null;
    this.clearDropTargetHighlight();
    this.renderChart();
  }

  private findDropTargetForNode(draggedNode: cytoscape.NodeSingular): cytoscape.NodeSingular | null {
    if (!this.cy) {
      return null;
    }

    const center = draggedNode.renderedPosition();
    const nodes = this.cy.nodes().filter((n) => n.id() !== draggedNode.id());
    let best: cytoscape.NodeSingular | null = null;
    let bestDist = Number.POSITIVE_INFINITY;

    nodes.forEach((node) => {
      const bb = node.renderedBoundingBox({ includeLabels: true });
      const inside = center.x >= bb.x1 && center.x <= bb.x2 && center.y >= bb.y1 && center.y <= bb.y2;
      if (!inside) return;
      const c = node.renderedPosition();
      const dist = Math.hypot(c.x - center.x, c.y - center.y);
      if (dist < bestDist) {
        bestDist = dist;
        best = node;
      }
    });

    return best;
  }

  private updateDropTargetHighlight(draggedNode: cytoscape.NodeSingular) {
    if (!this.cy) return;

    const dropTarget = this.findDropTargetForNode(draggedNode);
    const nextId = (dropTarget?.data('itemId') as string | undefined) ?? null;

    if (nextId === this.currentDropTargetItemId) {
      return;
    }

    this.cy.nodes().removeClass('drop-target');
    this.currentDropTargetItemId = nextId;

    if (nextId) {
      this.cy.getElementById(nextId).addClass('drop-target');
    }
  }

  private clearDropTargetHighlight() {
    if (!this.cy) return;
    this.currentDropTargetItemId = null;
    this.cy.nodes().removeClass('drop-target');
  }

  private isDescendantOf(candidateId: string, ancestorId: string) {
    const stack = [...(this.childrenMap[ancestorId] ?? [])];
    while (stack.length > 0) {
      const current = stack.pop()!;
      if (current === candidateId) {
        return true;
      }
      stack.push(...(this.childrenMap[current] ?? []));
    }
    return false;
  }

  private canAttachToTarget(targetItemId: string, movingItemId: string) {
    const targetItem = this.graphItems.find((item) => item.id === targetItemId);
    if (!targetItem) return false;

    const archeType = this.getArcheType();
    const isRoot = targetItem.parentEntity == null;
    const currentChildren = (targetItem.entity.statements ?? []).filter(
      (sme) => sme instanceof RelationshipElement && (sme.second?.keys?.length ?? 0) > 0,
    );
    const movingAlreadyChild = this.childrenMap[targetItemId]?.includes(movingItemId) ?? false;
    const countAfter = movingAlreadyChild ? currentChildren.length : currentChildren.length + 1;

    if (archeType === 'OneDown') {
      return isRoot;
    }

    if (archeType === 'OneUp') {
      return isRoot && countAfter <= 1;
    }

    return true;
  }

  private rebuildRelationshipModelReferences() {
    if (!this.entryNode || !this.submodel?.id) {
      return;
    }

    const rootPath = [
      new Key(KeyTypes.Submodel, this.submodel.id),
      new Key(KeyTypes.Entity, this.entryNode.idShort ?? 'EntryNode'),
    ];
    this.rebuildRelationshipModelReferencesRecursive(this.entryNode, rootPath);
  }

  private rebuildRelationshipModelReferencesRecursive(currentEntity: Entity, currentPath: Key[]) {
    const statements = currentEntity.statements ?? [];
    const hierarchyRelations = statements.filter(
      (sme): sme is RelationshipElement =>
        sme instanceof RelationshipElement &&
        (this.hasSemanticId(sme, 'https://admin-shell.io/idta/HierarchicalStructures/HasPart/1/0') ||
          this.hasSemanticId(sme, 'https://admin-shell.io/idta/HierarchicalStructures/IsPartOf/1/0')),
    );

    for (const rel of hierarchyRelations) {
      if (!rel.second) {
        continue;
      }
      const childEntity = this.findElement(rel.second, statements, rel.second.keys.length - 1);
      if (!childEntity) {
        continue;
      }

      const childPath = [...currentPath, new Key(KeyTypes.Entity, childEntity.idShort ?? '')];
      rel.first = new Reference(ReferenceTypes.ModelReference, [...currentPath]);
      rel.second = new Reference(ReferenceTypes.ModelReference, childPath);

      this.rebuildRelationshipModelReferencesRecursive(childEntity, childPath);
    }
  }

  exportSvg() {
    const svgContent = (this.cy as any)?.svg?.({ full: true, scale: 1 });
    if (typeof svgContent === 'string' && svgContent.length > 0) {
      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'bom-diagram.svg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return;
    }

    // Fallback for environments where the SVG extension is unavailable.
    const dataUrl = this.cy?.png({ full: true, scale: 2, bg: '#ffffff' });
    if (!dataUrl) return;

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'bom-diagram.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  get isInitialized() {
    return this.getResolvedEntryNode() != null;
  }

  get isEntryNodeOnly() {
    const resolvedEntryNode = this.getResolvedEntryNode();
    if (!resolvedEntryNode) return false;
    return this.getChildRelationshipCount(resolvedEntryNode) === 0;
  }

  private getChildRelationshipCount(entryNode: Entity) {
    return entryNode.statements?.filter((sme) => sme instanceof RelationshipElement && sme.second != null).length ?? 0;
  }

  async reinitializeBom(skipConfirm = false) {
    if (!skipConfirm) {
      const confirmed = await this.confirmService.confirm({
        message: this.translate.instant('BOM_REINITIALIZE_CONFIRM'),
      });

      if (!confirmed) {
        return;
      }
    }

    this.createRootEntity(true);
  }

  onReinitializeAction() {
    if (this.editable) {
      this.reinitializeBom();
      return;
    }

    this.requestReinitialize.emit();
  }

  @HostListener('window:refreshEntityTreeNodes')
  onRefreshEntityTreeNodes() {
    this.renderChart();
  }

  createRootEntity(reinitialize = false) {
    this.ref = this.dialogService.open(InitBomAssistantComponent, {
      header: this.translate.instant('CREATE_BOM'),
      width: '90vw',
      modal: true,
      closable: true,
      closeOnEscape: true,
      dismissableMask: true,
      breakpoints: {
        '1200px': '75vw',
        '640px': '90vw',
      },
      data: {
        submodel: this.submodel,
        apiUrl: this.apiUrl,
        assetInformation: this.assetInformation(),
        idShort: this.idShort(),
        reinitialize,
      },
      draggable: true,
    });

    this.ref?.onClose.subscribe(() => {
      this.renderChart();
    });
  }

  toggleOrientation() {
    this.orientation = this.orientation === 'LR' ? 'TB' : 'LR';
    this.orientationChosenByUser = true;
    this.renderChart();
  }

  zoomIn() {
    this.zoomBy(ZOOM_STEP);
  }

  zoomOut() {
    this.zoomBy(1 / ZOOM_STEP);
  }

  showAllNodes() {
    this.cy?.fit(undefined, 20);
  }

  /** Shows the diagram over the whole window; dialogs still open above it. */
  toggleMaximized() {
    this.maximized = !this.maximized;
    this.cdRef.markForCheck();
    // Re-fit once the container has its new size
    requestAnimationFrame(() => {
      const container = this.chartContainer?.nativeElement;
      if (!this.cy || !container) return;
      container.style.height = '';
      this.cy.resize();
      this.fitAllNodes(container);
      this.updateSelectionAnchor();
    });
  }

  @HostListener('document:keydown.escape')
  exitMaximized() {
    // Escape first closes an open dialog (entity details, viewer), only then the maximized diagram
    if (this.maximized && document.querySelector('.p-dialog-mask') == null) {
      this.toggleMaximized();
    }
  }

  private zoomBy(factor: number) {
    if (!this.cy) return;
    this.cy.zoom({
      level: this.cy.zoom() * factor,
      renderedPosition: { x: this.cy.width() / 2, y: this.cy.height() / 2 },
    });
  }

  cycleTheme() {
    const order: (typeof this.theme)[] = ['forest', 'base', 'neutral'];
    const idx = order.indexOf(this.theme);
    this.theme = order[(idx + 1) % order.length];
    this.renderChart();
  }

  private getResolvedEntryNode() {
    const submodelEntryNode = this.submodel?.submodelElements?.find((sme) => {
      if (!(sme instanceof Entity)) {
        return false;
      }

      return sme.semanticId?.keys.some(
        (key) =>
          key.value === 'https://admin-shell.io/idta/HierarchicalStructures/EntryNode/1/0' ||
          key.value === 'https://admin-shell.io/idta/HierarchicalStructures/EntryNode/1/1',
      );
    });

    return (submodelEntryNode as Entity | undefined) ?? this.entryNode;
  }
}
