import {
  AssetAdministrationShell,
  AssetInformation,
  SpecificAssetId,
} from '@aas-core-works/aas-core3.1-typescript/types';

import { AppConfigService, NotificationService, PortalService } from '@aas/common-services';
import { UrlHelper } from '@aas/helpers';
import { AasInfrastructureClient, AvailableInfastructure } from '@aas/webapi-client';
import { ChangeDetectionStrategy, Component, inject, model, signal, ViewChild, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FieldsetModule } from 'primeng/fieldset';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { lastValueFrom } from 'rxjs';
import { AasSearchService } from './aas-search.service';
import { PagedResult } from './paged-result';
import { cloneSpecificAssetIds } from '../utils/entity-asset-reference.util';

@Component({
  selector: 'aas-search-for-asset',
  imports: [
    SelectModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    TranslateModule,
    FieldsetModule,
    TableModule,
    DividerModule,
  ],
  templateUrl: './search-for-asset.component.html',
  styleUrl: './search-for-asset.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchForAssetComponent {
  @ViewChild('resultsTable') resultsTable: Table | undefined;
  config = inject(DynamicDialogConfig);
  searchService = inject(AasSearchService);
  notificationService = inject(NotificationService);
  ref = inject(DynamicDialogRef);

  aasResults: WritableSignal<AssetInformation[]> = signal([]);
  sourceOptions: WritableSignal<{ label: string | undefined; url: string | undefined; id: number | undefined }[]> =
    signal([]);

  selectedSource: { label: string | undefined; url: string | undefined; id: number | undefined } | undefined;
  selectedCustomSource: string = '';
  globalAssetId: string;
  specificAssetIds: SpecificAssetId[] | null;
  apiUrl: string;
  loading: boolean = false;

  res: PagedResult | undefined;

  firstPage = signal(true);
  pageOptions = [1, 5, 10, 20, 50];
  pageSize = model(10);
  cursor: string | undefined;

  configService = inject(AppConfigService);
  availableRepositories = signal<AvailableInfastructure[]>([]);
  infrastructureClient = inject(AasInfrastructureClient);
  translate = inject(TranslateService);

  constructor() {
    this.globalAssetId = this.config.data.globalAssetId;
    this.specificAssetIds = this.config.data.specificAssetIds;
    this.apiUrl = this.config.data.apiUrl;

    // sourceOptions sind die verfügbaren infratrukturen
    this.initAvailableRepositories();
  }

  async initAvailableRepositories() {
    try {
      const res = await lastValueFrom(this.infrastructureClient.aasInfrastructure_GetAvailableInfrastructures());
      this.availableRepositories.set(res);

      const urls = this.availableRepositories().map((repo) => ({
        url: repo.aasRepositoryUrl,
        label: repo.name,
        id: repo.id,
      }));

      // customSource ist eine benutzerdefinierte URL, die der Nutzer eingeben kann
      urls.push({ url: 'custom', label: this.translate.instant('CUSTOM_REPOSITORY'), id: -1 });
      this.sourceOptions.set(urls);

      const currentInfrastructure = PortalService.getCurrentAasInfrastructureSetting();
      this.selectedSource =
        urls.find((source) => source.id === currentInfrastructure?.id) ??
        urls.find((source) => source.id != null && source.id > 0) ??
        urls[0];

      if (this.selectedSource) {
        await this.loadAssetAdministrationShells(true);
      }
    } catch (_e) {
      this.aasResults.set([]);
      this.notificationService.showMessageAlways('ERROR_LOADING_ASSETS', 'ERROR', 'error', false);
    }
  }

  useAsset(asset: AssetInformation) {
    this.ref?.close({
      globalAssetId: asset.globalAssetId ?? '',
      specificAssetIds: cloneSpecificAssetIds(asset.specificAssetIds),
    });
  }

  closeDialog() {
    this.ref?.close(null);
  }

  async loadAssetAdministrationShells(reset: boolean = false) {
    if (this.selectedSource?.url === 'custom' && this.selectedCustomSource.trim() === '') {
      this.aasResults.set([]);
      return;
    }

    if (reset) {
      this.cursor = undefined;
    }

    try {
      this.loading = true;
      this.aasResults.set([]);
      const limit = this.pageSize();
      let url = '';
      if (this.selectedSource?.url === 'custom') {
        url = this.selectedCustomSource;
      } else {
        const proxyUrl = this.configService.config.aasProxyApiPath;
        url = UrlHelper.appendSlash(proxyUrl) + this.selectedSource?.id + '/aas-repo';
      }

      this.res = await this.searchService.search(url, [], limit, this.cursor);
      this.cursor = this.res.pagingMetadata.cursor;
      const assetInfos = this.res.result.map((r: AssetAdministrationShell) => r.assetInformation);
      this.aasResults.set(assetInfos);
    } catch (_e) {
      this.cursor = undefined;
      this.firstPage.set(true);
      this.aasResults.set([]);
      this.notificationService.showMessageAlways('ERROR_LOADING_ASSETS', 'ERROR', 'error', false);
    } finally {
      this.loading = false;
    }
  }

  async loadFirstPage() {
    this.cursor = undefined;
    this.firstPage.set(true);
    await this.loadAssetAdministrationShells();
  }

  async loadNextPage() {
    this.firstPage.set(false);
    await this.loadAssetAdministrationShells();
  }
}
