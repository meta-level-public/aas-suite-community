import { SelectionCardComponent } from '@aas/common-components';
import { AppRouteUrls, PluginRegistryService, PortalService } from '@aas/common-services';
import { AasInfrastructureClient, AvailableInfastructure } from '@aas/webapi-client';
import { ChangeDetectionStrategy, Component, computed, inject, model, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SelectModule } from 'primeng/select';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'aas-plugin-overview',
  templateUrl: './plugin-overview.component.html',
  styleUrls: ['./plugin-overview.component.scss', '../../../host.scss'],
  imports: [SelectionCardComponent, TranslateModule, FormsModule, SelectModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PluginOverviewComponent implements OnInit {
  private readonly pluginRegistry = inject(PluginRegistryService);
  private readonly router = inject(Router);
  private readonly portalService = inject(PortalService);
  private readonly infrastructureClient = inject(AasInfrastructureClient);

  readonly availableRepositories = signal<AvailableInfastructure[]>([]);
  readonly selectedRepository = model<AvailableInfastructure | null>(null);

  readonly plugins = computed(() =>
    this.pluginRegistry
      .plugins()
      .filter((plugin) => !plugin.requiresWritableRepo || !this.selectedRepository()?.isReadonly),
  );

  async ngOnInit() {
    await this.initAvailableRepositories();
  }

  async initAvailableRepositories() {
    const res = await lastValueFrom(this.infrastructureClient.aasInfrastructure_GetAvailableInfrastructures());
    this.availableRepositories.set(res);

    const selectedRepo = PortalService.getCurrentAasInfrastructureSetting();
    const foundRepo = this.availableRepositories().find((r) => r.id === selectedRepo?.id);
    if (foundRepo) {
      this.selectedRepository.set(foundRepo);
    } else {
      const internalRepo = this.availableRepositories().find((r) => r.isInternal);
      this.selectedRepository.set(internalRepo ?? this.availableRepositories()[0] ?? null);
      if (this.selectedRepository()) {
        this.portalService.saveCurrentInfrastructureSetting(this.selectedRepository()!);
      }
    }
  }

  setInfrastructure() {
    const repo = this.selectedRepository();
    if (repo) {
      this.portalService.saveCurrentInfrastructureSetting(repo);
    }
  }

  openPlugin(route: string) {
    this.router.navigate([route]);
  }

  backToPlugins() {
    this.router.navigate([AppRouteUrls.plugins]);
  }
}
