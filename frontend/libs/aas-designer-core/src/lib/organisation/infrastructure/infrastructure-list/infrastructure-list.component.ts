import { HelpLabelComponent } from '@aas/common-components';
import { AppConfigService } from '@aas/common-services';
import { AasInfrastructureSettingsDto, SystemManagementClient, SystemType } from '@aas/webapi-client';
import { Component, effect, inject, input, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { FieldsetModule } from 'primeng/fieldset';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { lastValueFrom } from 'rxjs';
import { ViewerSetupCodeComponent } from '../../../viewer-setup-code/viewer-setup-code.component';
import { HasChangesCheckable } from '../../my-organisation/has-changes-checkable';

@Component({
  selector: 'aas-infrastructure-list',
  imports: [
    TableModule,
    FieldsetModule,
    TranslateModule,
    TagModule,
    ToolbarModule,
    ButtonModule,
    CardModule,
    SkeletonModule,
    InputGroupModule,
    InputGroupAddonModule,
    InputTextModule,
    HelpLabelComponent,
    ViewerSetupCodeComponent,
    TooltipModule,
  ],
  templateUrl: './infrastructure-list.component.html',
  providers: [{ provide: HasChangesCheckable, useExisting: InfrastructureListComponent }],
})
export class InfrastructureListComponent extends HasChangesCheckable {
  private readonly urlKinds = [
    'discovery',
    'aasRegistry',
    'aasRepository',
    'submodelRegistry',
    'submodelRepository',
    'conceptDescriptionRepository',
  ] as const;

  settings = input.required<AasInfrastructureSettingsDto>();
  systemManagementClient = inject(SystemManagementClient);
  appConfigService = inject(AppConfigService);

  discoveryColor = signal<string>('gray');
  aasRepoColor = signal<string>('gray');
  aasRegColor = signal<string>('gray');
  smRegColor = signal<string>('gray');
  smRepoColor = signal<string>('gray');
  cdRepoColor = signal<string>('gray');

  green = 'var(--aas-success-icon)';
  red = 'var(--aas-danger-icon)';

  getProxyUrl(
    kind:
      | 'discovery'
      | 'aasRegistry'
      | 'aasRepository'
      | 'submodelRegistry'
      | 'submodelRepository'
      | 'conceptDescriptionRepository',
  ): string {
    const infrastructureId = this.settings().id;
    const proxyBaseUrl = this.appConfigService.config.aasProxyApiPath;

    if (!infrastructureId || !proxyBaseUrl) {
      return '';
    }

    const pathByKind = {
      discovery: 'discovery',
      aasRegistry: 'aas-reg',
      aasRepository: 'aas-repo',
      submodelRegistry: 'sm-reg',
      submodelRepository: 'sm-repo',
      conceptDescriptionRepository: 'cd-repo',
    } as const;

    const proxyPath = `${proxyBaseUrl}/${infrastructureId}/${pathByKind[kind]}`;
    return this.toAbsoluteUrl(proxyPath);
  }

  getDirectUrl(
    kind:
      | 'discovery'
      | 'aasRegistry'
      | 'aasRepository'
      | 'submodelRegistry'
      | 'submodelRepository'
      | 'conceptDescriptionRepository',
  ): string {
    const settings = this.settings();

    if (!settings.isInternal) {
      const directUrlByKind = {
        discovery: settings.aasDiscoveryUrl ?? '',
        aasRegistry: settings.aasRegistryUrl ?? '',
        aasRepository: settings.aasRepositoryUrl ?? '',
        submodelRegistry: settings.submodelRegistryUrl ?? '',
        submodelRepository: settings.submodelRepositoryUrl ?? '',
        conceptDescriptionRepository: settings.conceptDescriptionRepositoryUrl ?? '',
      } as const;

      return directUrlByKind[kind];
    }

    const internalUrlByKind = {
      discovery: this.buildContainerUrl(settings.aasDiscoveryContainer, settings.internalPortAasDiscovery),
      aasRegistry: this.buildContainerUrl(settings.aasRegistryContainer, settings.internalPortAasRegistry),
      aasRepository: this.buildContainerUrl(settings.aasEnvContainer, settings.internalPortAasEnv),
      submodelRegistry: this.buildContainerUrl(settings.smRegistryContainer, settings.internalPortSmRegistry),
      submodelRepository: this.buildContainerUrl(settings.aasEnvContainer, settings.internalPortAasEnv),
      conceptDescriptionRepository: this.buildContainerUrl(settings.aasEnvContainer, settings.internalPortAasEnv),
    } as const;

    return internalUrlByKind[kind];
  }

  getConfiguredUrl(
    kind:
      | 'discovery'
      | 'aasRegistry'
      | 'aasRepository'
      | 'submodelRegistry'
      | 'submodelRepository'
      | 'conceptDescriptionRepository',
  ): string {
    const settings = this.settings();

    const configuredUrlByKind = {
      discovery: settings.originalAasDiscoveryUrl ?? '',
      aasRegistry: settings.originalAasRegistryUrl ?? '',
      aasRepository: settings.originalAasRepositoryUrl ?? '',
      submodelRegistry: settings.originalSubmodelRegistryUrl ?? '',
      submodelRepository: settings.originalSubmodelRepositoryUrl ?? '',
      conceptDescriptionRepository: settings.originalConceptDescriptionRepositoryUrl ?? '',
    } as const;

    return configuredUrlByKind[kind];
  }

  shouldShowConfiguredUrl(kind: (typeof this.urlKinds)[number]): boolean {
    if (!this.settings().isInternal) {
      return false;
    }

    const configuredUrl = this.getConfiguredUrl(kind);
    if (!configuredUrl) {
      return false;
    }

    return configuredUrl !== this.getDirectUrl(kind);
  }

  private buildContainerUrl(containerName?: string, port?: number): string {
    if (!containerName || !port) {
      return '';
    }

    return `http://${containerName}:${port}`;
  }

  private toAbsoluteUrl(urlOrPath: string): string {
    if (!urlOrPath) {
      return '';
    }

    if (/^https?:\/\//i.test(urlOrPath)) {
      return urlOrPath;
    }

    if (typeof window === 'undefined' || !window.location?.origin) {
      return urlOrPath;
    }

    return new URL(urlOrPath, window.location.origin).toString();
  }

  getProxyTooltip(): string {
    return 'Use this URL if requests should run through the portal proxy with its authentication and context handling.';
  }

  getDirectTooltip(): string {
    return 'Use this URL to talk to the target service directly. For internal infrastructure this points to the container endpoint.';
  }

  getConfiguredTooltip(): string {
    return 'This is the originally configured service URL stored with the infrastructure.';
  }

  discoveryEffect = effect(async () => {
    if (this.settings() && this.settings().aasDiscoveryHcEnabled) {
      queueMicrotask(async () => {
        // abfragen
        if (this.settings().id && this.settings().aasDiscoveryHcEnabled) {
          try {
            const res = await lastValueFrom(
              this.systemManagementClient.systemManagement_GetStatus(SystemType.Discovery, this.settings().id),
            );
            if (res.available) {
              this.discoveryColor.set(this.green);
            } else {
              this.discoveryColor.set(this.red);
            }
          } catch (_e) {
            this.discoveryColor.set(this.red);
          }
        }
      });
    }
    queueMicrotask(() => {
      this.discoveryColor.set('gray');
    });
  });

  aasRegEffect = effect(async () => {
    if (this.settings() && this.settings().aasRegistryHcEnabled) {
      queueMicrotask(async () => {
        // abfragen
        try {
          const res = await lastValueFrom(
            this.systemManagementClient.systemManagement_GetStatus(SystemType.AasRegistry, this.settings().id),
          );
          if (res.available) {
            this.aasRegColor.set(this.green);
          } else {
            this.aasRegColor.set(this.red);
          }
        } catch (_e) {
          this.aasRegColor.set(this.red);
        }
      });
    }
    queueMicrotask(() => {
      this.aasRegColor.set('gray');
    });
  });

  aasRepoEffect = effect(async () => {
    if (this.settings() && this.settings().aasRepositoryHcEnabled) {
      queueMicrotask(async () => {
        try {
          // abfragen
          const res = await lastValueFrom(
            this.systemManagementClient.systemManagement_GetStatus(SystemType.AasRepository, this.settings().id),
          );
          if (res.available) {
            this.aasRepoColor.set(this.green);
          } else {
            this.aasRepoColor.set(this.red);
          }
        } catch (_e) {
          this.aasRepoColor.set(this.red);
        }
      });
    }

    queueMicrotask(() => {
      this.aasRepoColor.set('gray');
    });
  });

  smRegEffect = effect(async () => {
    if (this.settings() && this.settings().submodelRegistryHcEnabled) {
      queueMicrotask(async () => {
        try {
          // abfragen
          const res = await lastValueFrom(
            this.systemManagementClient.systemManagement_GetStatus(SystemType.SubmodelRegistry, this.settings().id),
          );
          if (res.available) {
            this.smRegColor.set(this.green);
          } else {
            this.smRegColor.set(this.red);
          }
        } catch (_e) {
          this.smRegColor.set(this.red);
        }
      });
    }
    queueMicrotask(() => {
      this.smRegColor.set('gray');
    });
  });

  smRepoEffect = effect(async () => {
    if (this.settings() && this.settings().submodelRepositoryHcEnabled) {
      queueMicrotask(async () => {
        try {
          // abfragen
          const res = await lastValueFrom(
            this.systemManagementClient.systemManagement_GetStatus(SystemType.SubmodelRepository, this.settings().id),
          );
          if (res.available) {
            this.smRepoColor.set(this.green);
          } else {
            this.smRepoColor.set(this.red);
          }
        } catch (_e) {
          this.smRepoColor.set(this.red);
        }
      });
    }
    queueMicrotask(() => {
      this.smRepoColor.set('gray');
    });
  });

  cdRepoEffect = effect(() => {
    if (this.settings() && this.settings().conceptDescriptionRepositoryHcEnabled) {
      queueMicrotask(async () => {
        try {
          // abfragen
          const res = await lastValueFrom(
            this.systemManagementClient.systemManagement_GetStatus(
              SystemType.ConceptDescriptionRepository,
              this.settings().id,
            ),
          );
          if (res.available) {
            this.cdRepoColor.set(this.green);
          } else {
            this.cdRepoColor.set(this.red);
          }
        } catch (_e) {
          this.cdRepoColor.set(this.red);
        }
      });
    }
    queueMicrotask(() => {
      this.cdRepoColor.set('gray');
    });
  });

  override hasChanges(): boolean {
    return false;
  }
  override isInEditMode(): boolean {
    return false;
  }
  override cancelEditing(): void {
    // nothing to do
  }
}
