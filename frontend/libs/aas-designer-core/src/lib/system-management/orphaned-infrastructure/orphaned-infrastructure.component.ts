import { AasConfirmationService, NotificationService } from '@aas/common-services';
import { AasInfrastructureClient, OrphanedInfrastructureDto } from '@aas/webapi-client';
import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from '@openng/optimus-ui/button';
import { TableModule } from '@openng/optimus-ui/table';
import { TagModule } from '@openng/optimus-ui/tag';
import { ToolbarModule } from '@openng/optimus-ui/toolbar';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'aas-orphaned-infrastructure',
  standalone: true,
  imports: [TranslateModule, TableModule, TagModule, ToolbarModule, ButtonModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './orphaned-infrastructure.component.html',
})
export class OrphanedInfrastructureComponent implements OnInit {
  infraClient = inject(AasInfrastructureClient);
  confirmationService = inject(AasConfirmationService);
  notificationService = inject(NotificationService);
  translate = inject(TranslateService);

  loading = signal(false);
  entries = signal<OrphanedInfrastructureDto[]>([]);

  async ngOnInit() {
    await this.load();
  }

  async load() {
    this.loading.set(true);
    try {
      const result = await lastValueFrom(this.infraClient.aasInfrastructure_GetOrphanedInfrastructures());
      this.entries.set(result ?? []);
    } catch {
      this.notificationService.showMessage(this.translate.instant('ERROR_LOADING'), '', 'error');
    } finally {
      this.loading.set(false);
    }
  }

  async deleteEntry(entry: OrphanedInfrastructureDto) {
    const confirmed = await this.confirmationService.confirm(this.translate.instant('ORPHANED_INFRA_DELETE_CONFIRM'));
    if (!confirmed) return;

    try {
      await lastValueFrom(this.infraClient.aasInfrastructure_DeleteOrphanedInfrastructure(entry.id));
      this.notificationService.showMessage(this.translate.instant('DELETED_SUCCESSFULLY'), '', 'success');
      await this.load();
    } catch {
      this.notificationService.showMessage(this.translate.instant('ERROR_DELETING'), '', 'error');
    }
  }
}
