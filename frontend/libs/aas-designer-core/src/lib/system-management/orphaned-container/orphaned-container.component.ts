import { AasConfirmationService, NotificationService } from '@aas/common-services';
import { AasInfrastructureClient, ContainerOnlyOrphanDto } from '@aas/webapi-client';
import { Component, inject, OnInit, signal } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'aas-orphaned-container',
  standalone: true,
  imports: [TranslateModule, TableModule, TagModule, ToolbarModule, ButtonModule],
  templateUrl: './orphaned-container.component.html',
})
export class OrphanedContainerComponent implements OnInit {
  infraClient = inject(AasInfrastructureClient);
  confirmationService = inject(AasConfirmationService);
  notificationService = inject(NotificationService);
  translate = inject(TranslateService);

  loading = signal(false);
  entries = signal<ContainerOnlyOrphanDto[]>([]);

  async ngOnInit() {
    await this.load();
  }

  async load() {
    this.loading.set(true);
    try {
      const result = await lastValueFrom(this.infraClient.aasInfrastructure_GetContainerOnlyOrphans());
      this.entries.set(result ?? []);
    } catch {
      this.notificationService.showMessage(this.translate.instant('ERROR_LOADING'), '', 'error');
    } finally {
      this.loading.set(false);
    }
  }

  async deleteEntry(entry: ContainerOnlyOrphanDto) {
    const confirmed = await this.confirmationService.confirm(
      this.translate.instant('ORPHANED_CONTAINER_DELETE_CONFIRM'),
    );
    if (!confirmed) return;

    try {
      await lastValueFrom(this.infraClient.aasInfrastructure_DeleteContainerOnlyOrphan(entry.containerGuid));
      this.notificationService.showMessage(this.translate.instant('DELETED_SUCCESSFULLY'), '', 'success');
      await this.load();
    } catch {
      this.notificationService.showMessage(this.translate.instant('ERROR_DELETING'), '', 'error');
    }
  }
}
