import { PortalService } from '@aas/common-services';
import { TagHelper } from '@aas/helpers';
import {
  AasInfrastructureClient,
  AasViewerClient,
  AvailableInfastructure,
  ShellListDto,
  ShellsClient,
} from '@aas/webapi-client';
import { Component, inject, model, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { lastValueFrom } from 'rxjs';
import { ShellSelectResult } from './shell-select-result';

@Component({
  selector: 'aas-shell-select',
  imports: [
    FormsModule,
    TranslateModule,
    ToolbarModule,
    ButtonModule,
    SelectModule,
    TableModule,
    SkeletonModule,
    TagModule,
  ],
  templateUrl: './shell-select.component.html',
})
export class ShellSelectComponent implements OnInit {
  shellsClient = inject(ShellsClient);
  shells = signal<ShellListDto[]>([]);
  viewerClient = inject(AasViewerClient);

  portalService = inject(PortalService);
  firstPage = signal(true);
  pageOptions = [1, 5, 10, 20, 50];
  pageSize = model(10);

  cursor: string | undefined;
  loading = signal(false);

  availableRepositories = signal<AvailableInfastructure[]>([]);
  selectedRepository = model<AvailableInfastructure | null>(null);

  infrastructureClient = inject(AasInfrastructureClient);

  async ngOnInit() {
    await this.initAvailableRepositories();
    this.loadFirstPage();
  }

  async initAvailableRepositories() {
    const res = await lastValueFrom(this.infrastructureClient.aasInfrastructure_GetAvailableInfrastructures());
    this.availableRepositories.set(res);

    const selectedRepo = PortalService.getCurrentAasInfrastructureSetting();
    const foundRepo = this.availableRepositories().find((r) => r.id === selectedRepo?.id);
    if (foundRepo) {
      this.selectedRepository.set(foundRepo);
    } else {
      // select internally
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
  ref = inject(DynamicDialogRef);

  config = inject(DynamicDialogConfig);

  async selectShell(shell: ShellListDto) {
    // descriptor bestimmen!

    const descriptor = await lastValueFrom(this.viewerClient.aasViewer_GetViewerDescriptor(shell.id));

    const shellSelectResult = new ShellSelectResult();
    shellSelectResult.aasIdentifier = shell.id;
    shellSelectResult.aasIdShort = shell.idShort;
    shellSelectResult.aasUrl = descriptor.aasEndpoint;
    shellSelectResult.globalAssetId = shell.globalAssetId;
    shellSelectResult.infrastructureId = this.selectedRepository()?.id;

    this.ref.close(shellSelectResult);
  }

  getAasTagSeverity(type: string) {
    return TagHelper.getAasTypeTagSeverityByString(type);
  }

  async loadFirstPage() {
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
    this.shells.set([]);
    if (this.selectedRepository()) {
      try {
        this.loading.set(true);
        const res = await lastValueFrom(
          this.shellsClient.shells_GetAllShells(this.pageSize(), this.cursor, undefined, undefined, undefined),
        );
        this.shells.set(res.shells ?? []);

        this.cursor = res.cursor;
      } finally {
        this.loading.set(false);
      }
    }
  }
}
