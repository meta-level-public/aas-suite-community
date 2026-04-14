import {
  AasInfrastructureClient,
  AasInfrastructureSettingsDto,
  SystemManagementClient,
  SystemType,
  VersionEntry,
} from '@aas/webapi-client';
import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, model, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { FieldsetModule } from 'primeng/fieldset';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'aas-infrastructure-update-versions',
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    FieldsetModule,
    TranslateModule,
    TagModule,
    ToolbarModule,
    ButtonModule,
    CardModule,
    SelectModule,
  ],
  templateUrl: './infrastructure-update-versions.component.html',
})
export class InfrastructureUpdateVersionsComponent implements OnInit {
  settings = input.required<AasInfrastructureSettingsDto>();

  systemManagementClient = inject(SystemManagementClient);

  discoveryColor = signal<string>('gray');
  aasRepoColor = signal<string>('gray');
  aasRegColor = signal<string>('gray');
  smRegColor = signal<string>('gray');
  smRepoColor = signal<string>('gray');
  cdRepoColor = signal<string>('gray');

  green = 'var(--aas-success-icon)';
  red = 'var(--aas-danger-icon)';

  discoveryEffect = effect(async () => {
    if (this.settings() && this.settings().aasDiscoveryHcEnabled) {
      queueMicrotask(async () => {
        // abfragen
        if (this.settings().id && this.settings().aasDiscoveryHcEnabled) {
          const res = await lastValueFrom(
            this.systemManagementClient.systemManagement_GetStatus(SystemType.Discovery, this.settings().id),
          );
          if (res.available) {
            this.discoveryColor.set(this.green);
          } else {
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
        const res = await lastValueFrom(
          this.systemManagementClient.systemManagement_GetStatus(SystemType.AasRegistry, this.settings().id),
        );
        if (res.available) {
          this.aasRegColor.set(this.green);
        } else {
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
        // abfragen
        const res = await lastValueFrom(
          this.systemManagementClient.systemManagement_GetStatus(SystemType.AasRepository, this.settings().id),
        );
        if (res.available) {
          this.aasRepoColor.set(this.green);
        } else {
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
        // abfragen
        const res = await lastValueFrom(
          this.systemManagementClient.systemManagement_GetStatus(SystemType.SubmodelRegistry, this.settings().id),
        );
        if (res.available) {
          this.smRegColor.set(this.green);
        } else {
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
        // abfragen
        const res = await lastValueFrom(
          this.systemManagementClient.systemManagement_GetStatus(SystemType.SubmodelRepository, this.settings().id),
        );
        if (res.available) {
          this.smRepoColor.set(this.green);
        } else {
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
      });
    }
    queueMicrotask(() => {
      this.cdRepoColor.set('gray');
    });
  });

  infrastructureClient = inject(AasInfrastructureClient);
  envCandidates = signal<VersionEntry[]>([]);
  aasRegCandidates = signal<VersionEntry[]>([]);
  smRegCandidates = signal<VersionEntry[]>([]);
  discoveryCandidates = signal<VersionEntry[]>([]);

  selectedEnv = model<string | undefined>(undefined);
  selectedAasReg = model<string | undefined>(undefined);
  selectedSmReg = model<string | undefined>(undefined);
  selectedDiscovery = model<string | undefined>(undefined);

  loading = signal(false);

  async ngOnInit() {
    try {
      this.loading.set(true);

      const versions = await lastValueFrom(this.infrastructureClient.aasInfrastructure_GetAvailableBasyxVersions());
      this.envCandidates.set(versions.aasEnvVersions ?? []);
      this.aasRegCandidates.set(versions.aasRegVersions ?? []);
      this.smRegCandidates.set(versions.smRegVersions ?? []);
      this.discoveryCandidates.set(versions.discoveryVersions ?? []);
    } finally {
      this.loading.set(false);
    }
  }

  hasChanges() {
    return (
      (this.selectedEnv() != null && this.selectedEnv() !== this.settings().aasRepositoryVersion) ||
      (this.selectedAasReg() != null && this.selectedAasReg() !== this.settings().aasRegistryVersion) ||
      (this.selectedSmReg() != null && this.selectedSmReg() !== this.settings().submodelRegistryVersion) ||
      (this.selectedDiscovery() != null && this.selectedDiscovery() !== this.settings().aasDiscoveryVersion)
    );
  }
}
