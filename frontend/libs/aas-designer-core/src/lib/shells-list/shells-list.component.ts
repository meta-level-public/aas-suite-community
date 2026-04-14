import { NotificationService } from '@aas/common-services';
import { TagHelper } from '@aas/helpers';
import { Clipboard, ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { Component, inject, model, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { saveAs } from 'file-saver-es';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { TooltipModule } from 'primeng/tooltip';
import { lastValueFrom } from 'rxjs';

import { ADDITIONAL_SHELL_MENU_ITEMS } from '@aas-designer-model';
import { HelpLabelComponent, WaitDialogComponent } from '@aas/common-components';
import { AccessService, PortalService } from '@aas/common-services';
import {
  AasInfrastructureClient,
  AssetKind,
  AvailableInfastructure,
  CreateInstanceRequest,
  CreateSharedLink,
  ShellListDto,
  ShellListVm,
  ShellsClient,
  TransferShellResponse,
} from '@aas/webapi-client';
import { SelectModule } from 'primeng/select';
import { AasxExportComponent } from '../general/aasx-export/aasx-export.component';
import { PcnRegisterSubscriptionComponent } from '../pcn/pcn-register-subscription/pcn-register-subscription.component';
import { ViewerSetupCodeComponent } from '../viewer-setup-code/viewer-setup-code.component';
import { CreateInstanceComponent } from './create-instance/create-instance.component';
import { CreateSharedLinkComponent } from './create-shared-link/create-shared-link.component';
import { ObserveVisibilityDirective } from './observe-visibility.directive';
import { ShellThumbnailCellComponent } from './shell-thumbnail-cell.component';
import { ShellsListActions } from './shells-list.actions';
import {
  Column,
  readShellsListPageSize,
  SHELLS_LIST_COLUMNS,
  SHELLS_LIST_DEFAULT_COLUMNS,
  SHELLS_LIST_PAGE_OPTIONS,
  writeShellsListPageSize,
} from './shells-list.config';
import { ShellsListStore } from './shells-list.store';
import { ShellSearchOpenResult, ShellsSearchComponent } from './shells-search/shells-search.component';
import { UploadAasDialogComponent } from './upload-aas-dialog/upload-aas-dialog.component';
@Component({
  selector: 'aas-shells-list',
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    TableModule,
    TooltipModule,
    TieredMenuModule,
    ButtonModule,
    TagModule,
    InputTextModule,
    UploadAasDialogComponent,
    AasxExportComponent,
    SkeletonModule,
    ClipboardModule,
    InputGroupAddonModule,
    InputGroupModule,
    MultiSelectModule,
    ChipModule,
    HelpLabelComponent,
    SelectModule,
    ObserveVisibilityDirective,
    ShellThumbnailCellComponent,
  ],
  templateUrl: './shells-list.component.html',
  styleUrls: ['../../host.scss', './shells-list.component.scss'],
  providers: [ShellsListStore, ShellsListActions],
})
export class ShellsListComponent implements OnInit, OnDestroy {
  private actions = inject(ShellsListActions);
  private store = inject(ShellsListStore);
  shells = this.store.shells;
  shellsClient = inject(ShellsClient);
  translate = inject(TranslateService);
  router = inject(Router);
  notificationService = inject(NotificationService);
  accessService = inject(AccessService);
  additionalShellMenuItems = inject(ADDITIONAL_SHELL_MENU_ITEMS);

  globalAssetId = model('');

  loading = signal(false);

  @ViewChild('uploadAasDialogComponent') uploadAasDialogComponent: UploadAasDialogComponent | undefined;
  importType = model<'aasx' | 'json'>('aasx');
  @ViewChild('exportComponent') exportDialogComponent: AasxExportComponent | undefined;

  splitButtonItems: MenuItem[] = [];
  menuItems: MenuItem[] = [];

  cursor: string | undefined;
  selectedColumns = model<Column[]>([]);
  availableColumns = signal<Column[]>([]);

  filterAasIdShort = model('');
  filterAssetId = model('');
  filterAssetKind = model('');
  selectedShells = model<ShellListDto[] | undefined>(undefined);
  firstPage = signal(true);
  pageOptions = SHELLS_LIST_PAGE_OPTIONS;
  pageSize = model(10);
  searchResultActive = signal(false);

  availableRepositories = signal<AvailableInfastructure[]>([]);
  selectedRepository = model<AvailableInfastructure | null>(null);

  infrastructureClient = inject(AasInfrastructureClient);
  PortalService = PortalService;
  portalService = inject(PortalService);

  async ngOnInit() {
    this.loading.set(true);
    try {
      this.availableColumns.set(SHELLS_LIST_COLUMNS);
      this.selectedColumns.set(SHELLS_LIST_DEFAULT_COLUMNS);
      this.pageSize.set(readShellsListPageSize());
      await this.initAvailableRepositories();
      await this.loadFirstPage();
      this.initSplitButtonItems();
    } finally {
      this.loading.set(false);
    }
  }

  fetchDataIfRequired() {
    void this.store.refreshVisibleColumnData(this.selectedColumnFields());
  }

  async initAvailableRepositories() {
    const res = await lastValueFrom(this.infrastructureClient.aasInfrastructure_GetAvailableInfrastructures());
    this.availableRepositories.set(res);

    const selectedRepo = PortalService.getCurrentAasInfrastructureSetting();
    const foundRepo = this.availableRepositories().find((r) => r.id === selectedRepo?.id);
    if (foundRepo) {
      this.selectedRepository.set(foundRepo);
    } else {
      // internes auswählen
      const internalRepo = this.availableRepositories().find((r) => r.isInternal);
      if (internalRepo) {
        this.selectedRepository.set(internalRepo);
        this.portalService.saveCurrentInfrastructureSetting(internalRepo);
      } else {
        // das erstbeste nehmen
        this.selectedRepository.set(this.availableRepositories()[0]);
        this.portalService.saveCurrentInfrastructureSetting(this.availableRepositories()[0]);
      }
    }
  }

  initSplitButtonItems() {
    this.splitButtonItems = [
      {
        label: this.translate.instant('UPLOAD_AASX'),
        command: () => {
          this.importType.set('aasx');
          this.uploadAasDialogComponent?.show();
        },
      },
      {
        label: this.translate.instant('UPLOAD_JSON'),
        command: () => {
          this.importType.set('json');
          this.uploadAasDialogComponent?.show();
        },
      },
      {
        label: this.translate.instant('EMPTY_AAS'),
        command: () => {
          this.createNewAas();
        },
      },
      {
        label: this.translate.instant('USE_ASSISTANT'),
        routerLink: ['/generator'],
      },
    ];
  }

  async onShowActions(shell: ShellListDto) {
    const currentInfrastructure = PortalService.getCurrentAasInfrastructureSetting();
    const transferTargets = this.getTransferTargets(shell);
    this.menuItems = this.buildShellMenu(shell, !currentInfrastructure?.isReadonly, transferTargets);
  }

  onRowClick(_event: MouseEvent, shell: ShellListDto) {
    // Check if readonly infrastructure
    const currentInfrastructure = PortalService.getCurrentAasInfrastructureSetting();

    // If readonly, navigate to view instead of edit
    if (currentInfrastructure?.isReadonly) {
      if (shell.id) {
        this.router.navigate(PortalService.buildViewerRoute(shell.id));
      }
    } else {
      this.router.navigate(PortalService.buildRepoEditRoute(shell.id ?? ''));
    }
  }

  getTransferTargets(shellDto: ShellListDto) {
    const targets = this.availableRepositories()
      .filter((r) => r.id !== this.selectedRepository()?.id && !r.isReadonly)
      .map((repo) => {
        return {
          label: repo.name,
          command: () => {
            if (repo.id != null && shellDto.id != null) this.transferShell(repo.id, shellDto.id);
          },
        } as MenuItem;
      });

    return targets;
  }

  private buildShellMenu(shell: ShellListDto, canEdit: boolean, transferTargets: MenuItem[]): MenuItem[] {
    return [
      this.createMenuAction('VIEW', 'pi pi-eye', () => this.openViewer(shell.id), true),
      this.createMenuAction('EDIT', 'pi pi-pencil', () => this.openEditor(shell.id), canEdit),
      this.createMenuAction('DELETE', 'pi pi-trash', () => this.deleteShellById(shell.id), canEdit),
      { separator: true },
      {
        label: this.translate.instant('IMPORT_INTO'),
        icon: 'pi pi-arrow-right-arrow-left',
        items: transferTargets,
        visible: transferTargets.length > 0,
      },
      {
        label: this.translate.instant('ADVANCED'),
        icon: 'pi pi-folder-open',
        items: [
          ...this.getAdditionalShellMenuItems(shell, 'advanced'),
          this.createMenuAction(
            'OPEN_REGISTRY_CORRECTION',
            'pi pi-wrench',
            () => this.openRegistryCorrection(shell.id),
            canEdit,
          ),
          this.createMenuAction('DUPLICATE', 'pi pi-copy', () => this.duplicateShellById(shell.id), canEdit),
          this.createMenuAction(
            'CREATE_INSTANCE',
            'pi pi-box',
            () => this.createInstanceByShell(shell),
            canEdit && shell.assetKind === AssetKind.Type,
          ),
        ],
      },
      {
        label: this.translate.instant('EXPORT'),
        icon: 'pi pi-file-export',
        items: [
          this.createMenuAction('EXPORT_AASX', 'pi pi-download', () => this.downloadShell(shell), true),
          this.createMenuAction('EXPORT_JSON', 'pi pi-download', () => this.downloadJsonByShell(shell), true),
        ],
      },
      this.createMenuAction('CREATE_SHARE_LINK', 'pi pi-share-alt', () => this.createSharedLinkById(shell.id), true),
    ];
  }

  private buildBulkMenu(canEdit: boolean): MenuItem[] {
    return [
      this.createMenuAction('DELETE', 'pi pi-trash', () => this.deleteBulkIfSelected(), canEdit),
      this.createMenuAction('DOWNLOAD', 'pi pi-download', () => this.downloadBulkIfSelected(), true),
    ];
  }

  private createMenuAction(label: string, icon: string, command: () => void, visible: boolean): MenuItem {
    return {
      label: this.translate.instant(label),
      icon,
      command,
      visible,
    };
  }

  private openViewer(shellId: string | undefined | null): void {
    if (!shellId) {
      return;
    }
    this.router.navigate(PortalService.buildViewerRoute(shellId));
  }

  private openEditor(shellId: string | undefined | null): void {
    this.router.navigate(PortalService.buildRepoEditRoute(shellId ?? ''));
  }

  private openRegistryCorrection(shellId: string | undefined | null): void {
    if (!shellId) {
      return;
    }

    this.router.navigate(PortalService.buildShellRegistryCorrectionRoute(shellId));
  }

  private deleteShellById(shellId: string | undefined | null): void {
    if (shellId != null) {
      void this.deleteShell(shellId);
    }
  }

  private duplicateShellById(shellId: string | undefined | null): void {
    if (shellId != null) {
      void this.duplicateShell(shellId);
    }
  }

  private createInstanceByShell(shell: ShellListDto): void {
    if (shell.id != null) {
      this.createInstance(shell);
    }
  }

  private downloadJsonByShell(shell: ShellListDto): void {
    if (shell.id != null) {
      void this.downloadJson(shell.id, shell.idShort);
    }
  }

  private createSharedLinkById(shellId: string | undefined | null): void {
    if (shellId != null) {
      this.createSharedLink(shellId);
    }
  }

  private deleteBulkIfSelected(): void {
    if (this.selectedShells()) {
      void this.deleteBulk();
    }
  }

  private downloadBulkIfSelected(): void {
    if (this.selectedShells()) {
      void this.downloadBulk();
    }
  }

  async onShowBulkActions() {
    const currentInfrastructure = PortalService.getCurrentAasInfrastructureSetting();
    this.menuItems = this.buildBulkMenu(!currentInfrastructure?.isReadonly);
  }

  getAasTagSeverity(type: string) {
    return TagHelper.getAasTypeTagSeverityByString(type);
  }

  async loadFirstPage() {
    writeShellsListPageSize(this.pageSize());
    this.searchResultActive.set(false);
    this.cursor = undefined;
    this.firstPage.set(true);
    await this.loadPaged();
  }

  async loadNextPage() {
    this.firstPage.set(false);
    await this.loadPaged();
  }

  setInfrastructure() {
    const repo = this.selectedRepository();
    if (repo) {
      this.portalService.saveCurrentInfrastructureSetting(repo);
    }
  }

  async loadPaged() {
    this.selectedShells.set([]);
    this.shells.set([]);
    if (this.selectedRepository()) {
      try {
        this.loading.set(true);
        const res = await lastValueFrom(
          this.shellsClient.shells_GetAllShells(
            this.pageSize(),
            this.cursor,
            this.filterAasIdShort(),
            this.filterAssetId(),
            this.filterAssetKind(),
          ),
        );
        await this.store.applyShellsResult(res.shells ?? [], this.selectedColumnFields());
        this.cursor = res.cursor;
      } finally {
        this.loading.set(false);
      }
    }
  }

  getThumb(shellId: string) {
    return this.store.getThumb(shellId);
  }

  ensureThumbLoaded(shellId: string) {
    this.store.ensureThumbLoaded(shellId);
  }

  async onThumbnailError(shellId: string) {
    await this.store.onThumbnailError(shellId);
  }

  ngOnDestroy(): void {
    this.store.destroy();
  }

  getSubmodels(shellId: string) {
    return this.store.getSubmodels(shellId);
  }

  getNameplateData(shellId: string) {
    return this.store.getNameplateData(shellId);
  }

  ensureNameplateLoaded(shellId: string) {
    this.store.ensureNameplateLoaded(shellId);
  }

  ensureSubmodelsLoaded(shellId: string) {
    this.store.ensureSubmodelsLoaded(shellId);
  }

  async deleteShell(id: string) {
    try {
      this.loading.set(true);
      const res = await this.actions.deleteShell(id, this.translate.instant('DELETE_SHELL_Q'));
      if (res) {
        this.shells.set(this.shells().filter((s) => s.id !== id));
      }
    } finally {
      this.loading.set(false);
    }
  }

  async duplicateShell(id: string) {
    try {
      this.loading.set(true);
      const res = await this.actions.duplicateShell(id);
      if (res.hasPcnSubmodel) {
        if (await this.actions.confirmRegisterPcn()) {
          this.showRegisterPcnDialog(res);
        }
      } else {
        this.router.navigate(PortalService.buildRepoEditRoute(res.aasIdentifier ?? ''));
      }
    } finally {
      this.loading.set(false);
    }
  }

  async createNewAas() {
    try {
      this.loading.set(true);
      const aasId = await this.actions.createNewAas();
      this.router.navigate(PortalService.buildRepoEditRoute(aasId ?? ''));
    } finally {
      this.loading.set(false);
    }
  }

  async transferShell(targetRepoId: number, shellId: string) {
    try {
      this.loading.set(true);
      const res = await this.actions.transferShell(targetRepoId, shellId);
      if (res.hasPcnSubmodel) {
        if (await this.actions.confirmRegisterPcn()) {
          this.showRegisterPcnDialog(res);
        }
      }
    } finally {
      this.loading.set(false);
    }
  }

  async downloadShell(shell: ShellListDto) {
    try {
      this.loading.set(true);

      this.exportDialogComponent?.startExport(shell.id ?? '', shell.idShort ?? '');
    } finally {
      this.loading.set(false);
    }
  }

  async downloadJson(aasIdentifier: string, idShort: string | null | undefined) {
    try {
      this.loading.set(true);
      const blob = await this.actions.getShellJsonBlob(aasIdentifier);
      saveAs(blob, (idShort ?? 'export') + '.json');
    } finally {
      this.loading.set(false);
    }
  }

  async deleteBulk() {
    const ids =
      this.selectedShells()
        ?.filter((s) => s.id != null)
        .map((s) => s.id ?? '') ?? [];

    const confirmed = await this.actions.confirmDelete(this.translate.instant('DELETE_ALL_SELECTED_VWS_Q'));
    if (!confirmed) {
      return;
    }

    try {
      this.loading.set(true);
      this.showLoadingDialog('PLEASE_WAIT_DELETING', 'DELETE');
      const res = await this.actions.deleteBulk(ids);
      if (res) {
        await this.loadFirstPage();
      }
    } finally {
      this.ref?.close();
      this.loading.set(false);
    }
  }

  dialogService = inject(DialogService);
  ref: DynamicDialogRef | undefined | null;

  private openDialog<TComponent>(component: TComponent, config: DynamicDialogConfig): DynamicDialogRef | null {
    return this.dialogService.open(component as never, config);
  }

  showRegisterPcnDialog(transferShellResponse: TransferShellResponse) {
    this.ref = this.openDialog(PcnRegisterSubscriptionComponent, {
      width: '75%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: true,
      header: this.translate.instant('REGISTER_PCN'),
      modal: true,
      data: {
        aasIdentifier: transferShellResponse.aasIdentifier,
        brokerUrls: transferShellResponse.brokerUrls,
        topic: transferShellResponse.topic,
      },
      closable: true,
    });
    this.ref?.onClose.subscribe(() => this.openEditor(transferShellResponse.aasIdentifier));
  }
  showLoadingDialog(tag: string, headerTag: string) {
    this.ref = this.openDialog(WaitDialogComponent, {
      width: '75%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: true,
      header: this.translate.instant(headerTag),
      modal: true,
      data: { tag },
      closable: true,
    });
  }

  async downloadBulk() {
    try {
      this.loading.set(true);
      this.showLoadingDialog('PLEASE_WAIT_DOWNLOADING', 'DOWNLOAD');
      const ids =
        this.selectedShells()
          ?.filter((s) => s.id != null)
          .map((s) => s.id ?? '') ?? [];
      const res = await this.actions.downloadBulk(ids);
      if (res) {
        saveAs(res.data, res.fileName ?? 'export.zip');
      }
    } finally {
      this.ref?.close();
      this.loading.set(false);
    }
  }

  openSearch() {
    const canEdit = !PortalService.getCurrentAasInfrastructureSetting()?.isReadonly;
    this.ref = this.openDialog(ShellsSearchComponent, {
      width: '64rem',
      breakpoints: {
        '1200px': '92vw',
        '960px': '96vw',
      },
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: false,
      header: this.translate.instant('SEARCH_FOR_SHELLS'),
      data: { canEdit },
      closable: true,
    });

    this.ref?.onClose.subscribe((payload: ShellListVm | ShellSearchOpenResult | null | undefined) =>
      this.handleSearchClose(payload),
    );
  }

  private handleSearchClose(payload: ShellListVm | ShellSearchOpenResult | null | undefined): void {
    if (payload == null) {
      return;
    }

    if ((payload as ShellSearchOpenResult).type === 'open') {
      const openPayload = payload as ShellSearchOpenResult;
      if (openPayload.action === 'edit') {
        this.openEditor(openPayload.shellId);
      } else {
        this.openViewer(openPayload.shellId);
      }
      return;
    }

    const shellsVm = payload as ShellListVm;
    this.searchResultActive.set(true);
    if (shellsVm?.shells && shellsVm.shells.length > 0) {
      void this.store.applyShellsResult(shellsVm.shells, this.selectedColumnFields());
    } else {
      this.shells.set([]);
    }
  }

  clearSearchResult() {
    this.loadFirstPage();
  }

  clipboard = inject(Clipboard);

  createSharedLink(aasIdentifier: string) {
    this.ref = this.openDialog(CreateSharedLinkComponent, {
      width: '48rem',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: true,
      header: this.translate.instant('CREATE_SHARE_LINK'),
      data: {
        aasIdentifier: aasIdentifier,
      },
      closable: true,
    });

    this.ref?.onClose.subscribe((sharedLink: CreateSharedLink) => void this.handleSharedLinkClose(sharedLink));
  }

  private async handleSharedLinkClose(sharedLink: CreateSharedLink | null | undefined): Promise<void> {
    if (sharedLink == null) {
      return;
    }
    try {
      this.loading.set(true);
      const res = await this.actions.createSharedLink(sharedLink);
      if (res) {
        this.clipboard.copy(res);
        this.notificationService.showMessageAlways('SUCCESS_SHARED_LINK', 'SUCCESS', 'success', false);
      }
    } finally {
      this.loading.set(false);
    }
  }

  async findAsset() {
    const assetId = this.globalAssetId();
    if (assetId == null || assetId === '') {
      return;
    }
    try {
      this.loading.set(true);
      const res = await this.actions.findAsset(assetId);

      if (res.shells != null && res.shells.length === 1 && res.shells[0].id) {
        this.router.navigate(PortalService.buildViewerRoute(res.shells[0].id));
      } else if (res.shells == null || res.shells.length === 0) {
        this.notificationService.showMessageAlways('NO_ASSET_FOUND', 'ERROR', 'error', false);
      } else {
        this.notificationService.showMessageAlways('MULTIPLE_AAS_FOUND', 'ERROR', 'error', false);
      }
      this.globalAssetId.set('');
    } finally {
      this.loading.set(false);
    }
  }

  removeSelectedColumn(col: Column) {
    const cols = this.selectedColumns().filter((c) => c.field !== col.field);
    this.selectedColumns.set(cols);
  }

  private selectedColumnFields(): string[] {
    return this.selectedColumns().map((column) => column.field);
  }

  createInstance(shell: ShellListDto) {
    this.ref = this.openDialog(CreateInstanceComponent, {
      width: '48rem',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: true,
      header: this.translate.instant('CREATE_INSTANCE'),
      data: {
        aasIdentifier: shell.id,
      },
      closable: true,
    });

    this.ref?.onClose.subscribe(
      (createInstanceItem: CreateInstanceRequest) => void this.handleCreateInstanceClose(createInstanceItem),
    );
  }

  private async handleCreateInstanceClose(createInstanceItem: CreateInstanceRequest | null | undefined): Promise<void> {
    if (createInstanceItem == null) {
      return;
    }
    try {
      this.loading.set(true);
      const res = await this.actions.createInstance(createInstanceItem);
      if (res) {
        this.openEditor(res);
      }
    } finally {
      this.loading.set(false);
    }
  }

  showViewerSetup() {
    this.ref = this.openDialog(ViewerSetupCodeComponent, {
      width: '36rem',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: false,
      header: this.selectedRepository()?.name ?? '',
      data: {
        infrastructureId: this.selectedRepository()?.id,
      },
      closable: true,
    });
  }

  private getAdditionalShellMenuItems(shell: ShellListDto, position: 'advanced' | 'export' | 'top'): MenuItem[] {
    const context = {
      translate: this.translate,
      router: this.router,
      accessService: this.accessService,
    };

    return this.additionalShellMenuItems
      .filter((config) => !config.insertIn || config.insertIn === position)
      .map((config) => config.createMenuItem(shell, context));
  }
}
