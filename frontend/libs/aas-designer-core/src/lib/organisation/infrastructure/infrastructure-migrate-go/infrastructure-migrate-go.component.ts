import { NotificationService } from '@aas/common-services';
import { AasInfrastructureClient, AvailableInfastructure } from '@aas/webapi-client';
import { Component, inject, input, output, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'aas-infrastructure-migrate-go',
  imports: [TranslateModule, ButtonModule],
  templateUrl: './infrastructure-migrate-go.component.html',
})
export class InfrastructureMigrateGoComponent {
  infrastructureClient = inject(AasInfrastructureClient);
  notificationService = inject(NotificationService);

  allInfrastructures = input<AvailableInfastructure[]>([]);
  goInfraCreated = output<void>();

  loading = signal(false);

  hasGoInfrastructure(): boolean {
    return this.allInfrastructures().some((i) => i.isGoInfrastructure === true);
  }

  async createGoInfrastructure() {
    try {
      this.loading.set(true);
      await lastValueFrom(this.infrastructureClient.aasInfrastructure_CreateGoInfrastructure());
      this.notificationService.showMessageAlways('GO_INFRASTRUCTURE_CREATED', 'SUCCESS', 'success', false);
      this.goInfraCreated.emit();
    } catch {
      this.notificationService.showMessageAlways('GO_INFRASTRUCTURE_CREATE_ERROR', 'ERROR', 'error', false);
    } finally {
      this.loading.set(false);
    }
  }
}
