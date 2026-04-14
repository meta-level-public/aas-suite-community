import { FileSizePipe } from '@aas/common-pipes';
import { AasConfirmationService, NotificationService } from '@aas/common-services';
import {
  AasInfrastructureClient,
  InfrastructureStatus,
  OrganisationClient,
  RecreateContainerData,
} from '@aas/webapi-client';
import { CommonModule } from '@angular/common';
import { Component, computed, inject, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'aas-infrastructure-status',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    TableModule,
    TagModule,
    ToolbarModule,
    ButtonModule,
    InputNumberModule,
    FileSizePipe,
  ],
  templateUrl: './infrastructure-status.component.html',
  styleUrls: ['../../../host.scss'],
})
export class InfrastructureStatusComponent {
  infraClient = inject(AasInfrastructureClient);
  confirmationService = inject(AasConfirmationService);
  orgaClient = inject(OrganisationClient);
  translate = inject(TranslateService);
  notificationService = inject(NotificationService);

  reloadTrigger = signal(0);
  loading = signal(false);

  memoryLimitDiscovery = model(256);
  memoryLimitAasEnv = model(512);
  memoryLimitAasRegistry = model(512);
  memoryLimitSmRegistry = model(512);
  memoryLimitMongo = model(128);
  memoryLimitMqtt = model(128);

  memorySwapDiscovery = model(-1);
  memorySwapAasEnv = model(-1);
  memorySwapAasRegistry = model(-1);
  memorySwapSmRegistry = model(-1);
  memorySwapMongo = model(-1);
  memorySwapMqtt = model(-1);

  selectedEntries = model<InfrastructureStatus[] | undefined>([]);

  infrastructureStatusEntries = computed(async () => {
    const _x = this.reloadTrigger();
    let res = [];
    try {
      queueMicrotask(() => this.loading.set(true));
      res = await lastValueFrom(this.infraClient.aasInfrastructure_GetStatusList());
    } finally {
      queueMicrotask(() => this.loading.set(false));
    }
    return res;
  });

  reload() {
    this.reloadTrigger.set(this.reloadTrigger() + 1);
  }

  getTagSeverity(severity: string) {
    switch (severity) {
      case 'Running':
        return 'success';
      case 'Exited':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  async recreate(entry: InfrastructureStatus) {
    if (
      await this.confirmationService.confirm({
        message: this.translate.instant('RECREATE_INFRASTRUCTURE_Q'),
      })
    ) {
      const data = new RecreateContainerData();
      data.infrastructureId = entry.infrastructureId;
      data.aasEnvMaxMemSetting = entry.aasEnvMaxMemSetting;
      data.aasEnvMemSwapSetting = entry.aasEnvMemSwapSetting;
      data.aasRegistryMaxMemSetting = entry.aasRegistryMaxMemSetting;
      data.aasRegistryMemSwapSetting = entry.aasRegistryMemSwapSetting;
      data.discoveryMaxMemSetting = entry.discoveryMaxMemSetting;
      data.discoveryMemSwapSetting = entry.discoveryMemSwapSetting;
      data.mongoMaxMemSetting = entry.mongoMaxMemSetting;
      data.mongoMemSwapSetting = entry.mongoMemSwapSetting;
      data.mqttMaxMemSetting = entry.mqttMaxMemSetting;
      data.mqttMemSwapSetting = entry.mqttMemSwapSetting;
      data.smRegistryMaxMemSetting = entry.smRegistryMaxMemSetting;
      data.smRegistryMemSwapSetting = entry.smRegistryMemSwapSetting;

      await lastValueFrom(this.infraClient.aasInfrastructure_ConfigureAndRecreateContainer(data));
      this.notificationService.showMessageAlways('CHANGE_REQUESTED', 'SUCCESS', 'success', false);
    }
  }

  async start(name: string) {
    await lastValueFrom(this.infraClient.aasInfrastructure_StartContainer(name));
    this.notificationService.showMessageAlways('CHANGE_REQUESTED', 'SUCCESS', 'success', false);
  }

  async stop(name: string) {
    await lastValueFrom(this.infraClient.aasInfrastructure_StopContainer(name));
    this.notificationService.showMessageAlways('CHANGE_REQUESTED', 'SUCCESS', 'success', false);
  }

  async remove(id: number) {
    if (await this.confirmationService.confirm({ message: this.translate.instant('REMOVE_INFRASTRUCTURE_Q') })) {
      await lastValueFrom(this.infraClient.aasInfrastructure_RemoveStack(id));
      this.notificationService.showMessageAlways('CHANGE_REQUESTED', 'SUCCESS', 'success', false);
    }
  }

  async recreateAll() {
    if (
      await this.confirmationService.confirm({
        message: this.translate.instant('RECREATE_INFRASTRUCTURE_Q'),
      })
    ) {
      const recreateList = this.selectedEntries()?.map((entry) => {
        const data = new RecreateContainerData();
        data.infrastructureId = entry.infrastructureId;
        data.aasEnvMaxMemSetting = entry.aasEnvMaxMemSetting;
        data.aasEnvMemSwapSetting = entry.aasEnvMemSwapSetting;
        data.aasRegistryMaxMemSetting = entry.aasRegistryMaxMemSetting;
        data.aasRegistryMemSwapSetting = entry.aasRegistryMemSwapSetting;
        data.discoveryMaxMemSetting = entry.discoveryMaxMemSetting;
        data.discoveryMemSwapSetting = entry.discoveryMemSwapSetting;
        data.mongoMaxMemSetting = entry.mongoMaxMemSetting;
        data.mongoMemSwapSetting = entry.mongoMemSwapSetting;
        data.mqttMaxMemSetting = entry.mqttMaxMemSetting;
        data.mqttMemSwapSetting = entry.mqttMemSwapSetting;
        data.smRegistryMaxMemSetting = entry.smRegistryMaxMemSetting;
        data.smRegistryMemSwapSetting = entry.smRegistryMemSwapSetting;

        return data;
      });
      if (recreateList != null) {
        await lastValueFrom(this.infraClient.aasInfrastructure_ConfigureAndRecreateContainerBulk(recreateList));
        this.notificationService.showMessageAlways('CHANGE_REQUESTED', 'SUCCESS', 'success', false);
      }
    }
  }

  async setMemoryLimit(type: string) {
    const entries = await this.infrastructureStatusEntries();
    entries.forEach((entry) => {
      switch (type) {
        case 'discovery':
          entry.discoveryMaxMemSetting = this.memoryLimitDiscovery();
          break;
        case 'aasEnv':
          entry.aasEnvMaxMemSetting = this.memoryLimitAasEnv();
          break;
        case 'aasRegistry':
          entry.aasRegistryMaxMemSetting = this.memoryLimitAasRegistry();
          break;
        case 'smRegistry':
          entry.smRegistryMaxMemSetting = this.memoryLimitSmRegistry();
          break;
        case 'mongo':
          entry.mongoMaxMemSetting = this.memoryLimitMongo();
          break;
        case 'mqtt':
          entry.mqttMaxMemSetting = this.memoryLimitMqtt();
          break;
      }
    });
  }

  async setMemorySwap(type: string) {
    const entries = await this.infrastructureStatusEntries();
    entries.forEach((entry) => {
      switch (type) {
        case 'discovery':
          entry.discoveryMemSwapSetting = this.memorySwapDiscovery();
          break;
        case 'aasEnv':
          entry.aasEnvMemSwapSetting = this.memorySwapAasEnv();
          break;
        case 'aasRegistry':
          entry.aasRegistryMemSwapSetting = this.memorySwapAasRegistry();
          break;
        case 'smRegistry':
          entry.smRegistryMemSwap = this.memorySwapSmRegistry();
          break;
        case 'mongo':
          entry.mongoMemSwapSetting = this.memorySwapMongo();
          break;
        case 'mqtt':
          entry.mqttMemSwapSetting = this.memorySwapMqtt();
          break;
      }
    });
  }
}
