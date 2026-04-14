import { DirtyCheckable } from '@aas-designer-model';
import { ActiveComponentsService } from '@aas/aas-designer-shared';
import { buildShellsListRoute, NotificationService, PortalService } from '@aas/common-services';
import { ShellResult } from '@aas/model';
import { AasInfrastructureClient, AvailableInfastructure } from '@aas/webapi-client';
import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PrimeTemplate, TreeNode } from 'primeng/api';
import { Splitter } from 'primeng/splitter';
import { lastValueFrom, Subscription } from 'rxjs';
import { V3TreeItem } from '../model/v3-tree-item';
import { V3EditorService } from '../v3-editor.service';
import { V3EditorComponent } from '../v3-editor/v3-editor.component';

import { Skeleton } from 'primeng/skeleton';
import { V3TreeComponent } from '../v3-tree/v3-tree.component';

@Component({
  selector: 'aas-editor-start',
  templateUrl: './editor-start.component.html',
  styleUrls: ['../../../host.scss'],
  imports: [Splitter, PrimeTemplate, Skeleton, V3TreeComponent, V3EditorComponent],
})
export class EditorStartComponent extends DirtyCheckable implements OnDestroy, OnInit {
  @ViewChild(V3EditorComponent) v3EditorComponent: V3EditorComponent | undefined;
  loading: boolean = false;
  subscriptions: Subscription[] = [];
  shellResult: ShellResult | undefined;

  selectedElement: V3TreeItem<any> | undefined;

  allSubmodelsNode: TreeNode<V3TreeItem<any>> | undefined;

  infrastructureClient = inject(AasInfrastructureClient);
  notificationService = inject(NotificationService);
  router = inject(Router);
  portalService = inject(PortalService);

  PortalService = PortalService;

  constructor(
    private route: ActivatedRoute,
    private activeComponentService: ActiveComponentsService,
    private v3EditorService: V3EditorService,
  ) {
    super();
    activeComponentService.register(this);
  }
  ngOnDestroy(): void {
    this.activeComponentService.unregister(this);
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  ngOnInit() {
    this.route.params.subscribe((_routeParams) => {
      this.loadData();
    });
  }

  async loadData() {
    try {
      this.loading = true;
      const canUseRequestedInfrastructure = await this.applyInfrastructureFromRoute();
      if (!canUseRequestedInfrastructure) {
        return;
      }
      this.shellResult = await this.v3EditorService.getDataByAasIdentifier(this.aasId);
    } catch (_error) {
      this.notificationService.showMessageAlways('ERROR_LOADING_AAS', 'ERROR', 'error');
      this.router.navigate(buildShellsListRoute());
    } finally {
      this.loading = false;
    }
  }

  get aasId() {
    return this.route.snapshot.params['aasId'];
  }

  get routeInfrastructureId(): number | null {
    const raw = this.route.snapshot.params['infrastructureId'];
    if (raw == null) {
      return null;
    }

    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private async applyInfrastructureFromRoute(): Promise<boolean> {
    const requestedInfrastructureId = this.routeInfrastructureId;
    if (requestedInfrastructureId == null || requestedInfrastructureId < 0) {
      return true;
    }

    const available = await lastValueFrom(this.infrastructureClient.aasInfrastructure_GetAvailableInfrastructures());
    const selected = available.find((item: AvailableInfastructure) => item.id === requestedInfrastructureId);
    if (!selected) {
      this.notificationService.showMessageAlways('ERROR_LOADING_AAS_INFRASTRUCTURE_ACCESS', 'ERROR', 'error');
      this.router.navigate(buildShellsListRoute());
      return false;
    }

    if (PortalService.getCurrentAasInfrastructureSetting()?.id !== selected.id) {
      this.portalService.saveCurrentInfrastructureSetting(selected);
    }

    return true;
  }

  selectElement(element: V3TreeItem<any> | undefined) {
    this.selectedElement = element;
  }
  selectAllSubmodelsNode(element: TreeNode<V3TreeItem<any>>) {
    this.allSubmodelsNode = element;
  }

  override isDirty() {
    if (this.v3EditorComponent != null) {
      return this.v3EditorComponent.hasChanges();
    }
    return false;
  }

  handleAction(action: 'reset') {
    switch (action) {
      case 'reset':
        this.loadData();
    }
  }
}
