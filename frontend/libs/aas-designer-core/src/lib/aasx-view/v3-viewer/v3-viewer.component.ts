import { LanguageService, SseNotificationService } from '@aas/aas-designer-shared';
import { AasViewerStandaloneComponent } from '@aas/aas-viewer-standalone';
import { buildShellsListRoute, NotificationService, PortalService } from '@aas/common-services';
import { AasInfrastructureClient, AasViewerClient, AvailableInfastructure, ViewerDescriptor } from '@aas/webapi-client';
import { Component, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { lastValueFrom, Subscription } from 'rxjs';
import { AasSharedDataService } from '../../asset-administration-shell-tree/services/aas-shared-data.service';
import { AasxExportComponent } from '../../general/aasx-export/aasx-export.component';
import { ShellResult } from '../../generator/model/shell-result';
import { PcnChangeInfo } from '../../pcn/pcn-changes/pcn-change-info';
import { PcnChangesComponent } from '../../pcn/pcn-changes/pcn-changes.component';
import { V3EditorService } from '../../v3-editor/v3-editor.service';

@Component({
  selector: 'aas-v3-viewer',
  templateUrl: './v3-viewer.component.html',
  host: { class: 'flex flex-col flex-1' },
  imports: [Button, AasViewerStandaloneComponent, AasxExportComponent, TranslateModule],
})
export class V3ViewerComponent implements OnInit, OnDestroy {
  loading: boolean = false;
  // shellResult: ShellResult | undefined;
  displayProgressDialog: boolean = false;
  preparing: boolean = false;
  downloadProgress: number = 0;
  shellResult: ShellResult | undefined;
  shellOptions: { label: string; value: string }[] = [];
  selectedShellId: string = '';
  PortalService = PortalService;
  @ViewChild('exportComponent') exportComponent: AasxExportComponent | undefined;

  viewerClient = inject(AasViewerClient);
  infrastructureClient = inject(AasInfrastructureClient);
  descriptor = signal<ViewerDescriptor | null>(null);
  infrastructureReady = signal(false);
  subscriptions: Subscription[] = [];
  sseNotificationService = inject(SseNotificationService);
  notificationService = inject(NotificationService);

  ref: DynamicDialogRef | undefined | null;

  dialogService = inject(DialogService);
  translate = inject(TranslateService);

  constructor(
    protected aasSharedDataService: AasSharedDataService,
    private route: ActivatedRoute,
    private v3EditorService: V3EditorService,
    private router: Router,
    private portalService: PortalService,
    public languageService: LanguageService,
  ) {}

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }
  async ngOnInit() {
    const canUseRequestedInfrastructure = await this.applyInfrastructureFromRoute();
    this.infrastructureReady.set(canUseRequestedInfrastructure);
    if (!canUseRequestedInfrastructure) {
      return;
    }

    this.isEditable.set(!PortalService.getCurrentAasInfrastructureSetting()?.isReadonly);

    try {
      this.loading = true;

      const descriptor = await lastValueFrom(this.viewerClient.aasViewer_GetViewerDescriptor(this.aasId));
      this.descriptor.set(descriptor);

      this.aasSharedDataService.copyPasteClipboardItem = null;
    } finally {
      this.loading = false;
    }

    this.subscriptions.push(
      this.sseNotificationService.productChangeNotificationReceived.subscribe(async (message) => {
        const currentInfraId = PortalService.getCurrentAasInfrastructureSetting()?.id;
        if (message.aasIdentifier === this.aasId && currentInfraId === message.infrastructureId) {
          const content = JSON.parse(message.content).submodel as PcnChangeInfo;
          // eslint-disable-next-line no-console
          console.log('PCN_UPDATE_RECEIVED', content);
          this.ref = this.dialogService.open(PcnChangesComponent, {
            width: '50%',
            contentStyle: { overflow: 'auto' },
            baseZIndex: 10000,
            maximizable: false,
            header: this.translate.instant('PCN_UPDATE_RECEIVED'),
            data: {
              changeData: content,
            },
            closable: true,
          });
        }
      }),
    );
  }

  get aasId() {
    return this.route.snapshot.params['aasId'] ?? '';
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
      this.aasSharedDataService.copyPasteClipboardItem = null;
      this.portalService.saveCurrentInfrastructureSetting(selected);
    }

    return true;
  }

  isEditable = signal(false);

  goToEditMode() {
    this.router.navigate(PortalService.buildRepoEditRoute(this.aasId));
  }

  async download() {
    this.exportComponent?.startExport(this.aasId, '');
  }

  back() {
    history.back();
  }
}
