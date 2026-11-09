import { AssetAdministrationShell, SpecificAssetId } from '@aas-core-works/aas-core3.1-typescript/types';

import { AasConfirmationService, AppConfigService, EncodingService } from '@aas/common-services';
import { UrlHelper } from '@aas/helpers';
import { AasInfrastructureClient, AasViewerClient, AvailableInfastructure, ViewerDescriptor } from '@aas/webapi-client';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  OnChanges,
  signal,
  type WritableSignal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from '@openng/optimus-ui/button';
import { FieldsetModule } from '@openng/optimus-ui/fieldset';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { SelectModule } from '@openng/optimus-ui/select';
import { TableModule } from '@openng/optimus-ui/table';
import { lastValueFrom } from 'rxjs';
import { AasSearchService } from './aas-search.service';
import { PagedResult } from './paged-result';

@Component({
  selector: 'aas-aas-result-list',
  imports: [FormsModule, TableModule, TranslateModule, ButtonModule, FieldsetModule, SelectModule, InputTextModule],
  templateUrl: './aas-result-list.component.html',
  styleUrl: './aas-result-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AasResultListComponent implements OnChanges {
  @Input({ required: true }) apiUrl: string = '/api';
  @Input() globalAssetId: string | null = null;
  @Input() specificAssetIds: SpecificAssetId[] | null = [];

  translate = inject(TranslateService);
  searchService = inject(AasSearchService);
  confirmService = inject(AasConfirmationService);

  aasResults: WritableSignal<AssetAdministrationShell[]> = signal([]);

  configService = inject(AppConfigService);
  viewerClient = inject(AasViewerClient);

  sourceOptions: WritableSignal<{ label: string | undefined; url: string | undefined; id: number | undefined }[]> =
    signal([]);

  disoveryUrl = '';

  selectedSource: { label: string | undefined; url: string | undefined; id: number | undefined } | undefined;
  selectedCustomSource: string = '';

  availableRepositories = signal<AvailableInfastructure[]>([]);
  infrastructureClient = inject(AasInfrastructureClient);
  loading = signal(false);

  constructor() {
    this.initAvailableRepositories();
  }

  async initAvailableRepositories() {
    const res = await lastValueFrom(this.infrastructureClient.aasInfrastructure_GetAvailableInfrastructures());
    this.availableRepositories.set(res);

    const urls = this.availableRepositories().map((repo) => ({
      url: repo.aasRepositoryUrl,
      label: repo.name,
      id: repo.id,
    }));
    urls.push({ url: 'custom', label: this.translate.instant('CUSTOM_REPOSITORY'), id: -1 });
    this.selectedSource = urls[0];
    this.sourceOptions.set(urls);
    this.loadAssetAdministrationShells();
  }

  ngOnChanges() {
    this.loadAssetAdministrationShells();
  }

  async loadAssetAdministrationShells() {
    try {
      this.loading.set(true);
      this.aasResults.set([]);
      if (this.globalAssetId && this.selectedSource != null) {
        const url = this.getRepositoryUrls().aasRepositoryUrl;
        if (url === '') {
          this.loading.set(false);
          return;
        }
        let res: PagedResult | undefined;

        try {
          res = await this.searchService.findAasByRepo(this.globalAssetId, url);
          if (res != null && res.result != null && res.result.length > 0) {
            this.aasResults.set(res.result);
          }
        } catch {
          // per discovery finden
          const matches = url.match('(/aas-proxy/)(.*)/aas-repo');
          const discoveryUrl = matches ? matches[1] + matches[2] + '/discovery' : url;
          try {
            res = await this.searchService.findAasByDiscovery(this.globalAssetId, discoveryUrl);
            if (res != null && res.result != null && res.result.length > 0) {
              // now we need to load the AASes
              const results = [];
              for (const r of res.result) {
                const aas = await this.searchService.getAasById(r, url);
                results.push(aas);
              }

              this.aasResults.set(results);
            }
          } catch (e) {
            // gings eben nicht
            console.warn('Error loading AAS by discovery', e);
          }
        }
      }
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * AAS and submodel repository of the selected source. Configured infrastructures go through the AAS proxy, where
   * shells and submodels can live in separate repositories (e.g. BaSyx Go); a custom URL is a complete AAS
   * environment that serves both.
   */
  getRepositoryUrls(): { aasRepositoryUrl: string; submodelRepositoryUrl: string } {
    if (this.selectedSource?.url === 'custom') {
      return { aasRepositoryUrl: this.selectedCustomSource, submodelRepositoryUrl: this.selectedCustomSource };
    }

    if (this.selectedSource == null) {
      return { aasRepositoryUrl: '', submodelRepositoryUrl: '' };
    }

    const infrastructureUrl =
      UrlHelper.appendSlash(this.configService.config.aasProxyApiPath) + this.selectedSource.id + '/';
    return {
      aasRepositoryUrl: infrastructureUrl + 'aas-repo',
      submodelRepositoryUrl: infrastructureUrl + 'sm-repo',
    };
  }

  createViewerDescriptor(result: any, aasRepositoryUrl: string, submodelRepositoryUrl: string) {
    const viewerDescriptor = new ViewerDescriptor();

    viewerDescriptor.aasId = result.id;
    viewerDescriptor.aasEndpoint =
      UrlHelper.appendSlash(aasRepositoryUrl) + 'shells/' + EncodingService.base64urlEncode(result.id);
    viewerDescriptor.submodelEndpoints = (result.submodels ?? []).map(
      (sm: any) =>
        UrlHelper.appendSlash(submodelRepositoryUrl) +
        'submodels/' +
        EncodingService.base64urlEncode(sm.keys?.[0].value ?? ''),
    );

    return viewerDescriptor;
  }

  async openViewer(result: any) {
    const { aasRepositoryUrl, submodelRepositoryUrl } = this.getRepositoryUrls();
    const descriptor = this.createViewerDescriptor(result, aasRepositoryUrl, submodelRepositoryUrl);
    window.dispatchEvent(
      new CustomEvent('openViewer', {
        detail: {
          viewerDescriptor: descriptor,
        },
      }),
    );
  }

  async navigateToExternalLink() {
    if (
      this.hasExternalLink() &&
      (await this.confirmService.confirm({
        message: this.translate.instant('OPEN_EXTERNAL_WARNING', { link: this.getExternalLink() }),
      }))
    ) {
      // Achtung: hier stirbt die Anwendung im Debug-Mode
      window.open(this.getExternalLink(), '_blank');
    }
  }

  hasExternalLink() {
    return this.specificAssetIds?.some((s) => s.name === 'EXTERNAL_LINK') ?? false;
  }

  getExternalLink() {
    return this.specificAssetIds?.find((s) => s.name === 'EXTERNAL_LINK')?.value;
  }
}
