import { HelpLabelComponent } from '@aas/common-components';
import { buildSubmodelEditRoute, PortalService } from '@aas/common-services';
import { AasInfrastructureClient, AvailableInfastructure, SmDto, SubmodelClient } from '@aas/webapi-client';
import { CommonModule } from '@angular/common';
import { Component, inject, model, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'aas-submodels-list',
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    InputTextModule,
    InputGroupModule,
    InputGroupAddonModule,
    HelpLabelComponent,
    ButtonModule,
    SelectModule,
    TableModule,
    TagModule,
  ],
  templateUrl: './submodels-list.component.html',
  styleUrls: ['../../host.scss'],
})
export class SubmodelsListComponent implements OnInit {
  portalService = inject(PortalService);
  infrastructureClient = inject(AasInfrastructureClient);
  submodelClient = inject(SubmodelClient);
  router = inject(Router);

  loading = signal(false);

  firstPage = signal(true);
  pageOptions = [1, 5, 10, 20, 50, 100];
  pageSize = model(10);
  cursor: string | undefined;

  submodelIdShortFilter = model<string>('');

  availableRepositories = signal<AvailableInfastructure[]>([]);
  selectedRepository = model<AvailableInfastructure | null>(null);
  submodels = signal<SmDto[]>([]);

  async ngOnInit() {
    this.loading.set(true);
    try {
      const page = window.localStorage.getItem('submodels-list-footer-state');
      if (page && page !== '') {
        const pageInt = parseInt(page);
        this.pageSize.set(pageInt > 0 ? pageInt : 10);
      }

      await this.initAvailableRepositories();
      await this.loadFirstPage();
    } finally {
      this.loading.set(false);
    }
  }

  async initAvailableRepositories() {
    const repos = await lastValueFrom(this.infrastructureClient.aasInfrastructure_GetAvailableInfrastructures());
    this.availableRepositories.set(repos);

    const selectedRepo = PortalService.getCurrentAasInfrastructureSetting();
    const foundRepo = this.availableRepositories().find((r) => r.id === selectedRepo?.id);
    if (foundRepo) {
      this.selectedRepository.set(foundRepo);
      return;
    }

    const internalRepo = this.availableRepositories().find((r) => r.isInternal);
    if (internalRepo) {
      this.selectedRepository.set(internalRepo);
      this.portalService.saveCurrentInfrastructureSetting(internalRepo);
      return;
    }

    const firstRepo = this.availableRepositories()[0];
    if (firstRepo) {
      this.selectedRepository.set(firstRepo);
      this.portalService.saveCurrentInfrastructureSetting(firstRepo);
    }
  }

  async loadFirstPage() {
    window.localStorage.setItem('submodels-list-footer-state', this.pageSize().toString());
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
    this.submodels.set([]);
    if (!this.selectedRepository()) {
      return;
    }

    try {
      this.loading.set(true);
      const res = await lastValueFrom(
        this.submodelClient.submodel_GetSmList(this.pageSize(), this.cursor, this.submodelIdShortFilter()),
      );
      this.submodels.set(res.smList ?? []);
      this.cursor = res.cursor ?? undefined;
    } finally {
      this.loading.set(false);
    }
  }

  async onRowClick(submodelData: SmDto | SmDto[] | undefined) {
    const submodel = Array.isArray(submodelData) ? submodelData[0] : submodelData;
    if (!submodel?.id) {
      return;
    }

    const infraId = this.selectedRepository()?.id ?? PortalService.getCurrentAasInfrastructureSetting()?.id;
    await this.router.navigate(buildSubmodelEditRoute(infraId, submodel.id));
  }
}
