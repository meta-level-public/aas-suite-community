import { AasConfirmationService, AccessService } from '@aas/common-services';
import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { OrganisationStateService } from '../organisation-state.service';
import { OrganisationDetailsEditComponent } from './organisation-details-edit/organisation-details-edit.component';
import { OrganisationDetailsListComponent } from './organisation-details-list/organisation-details-list.component';

@Component({
  selector: 'aas-orga-details',
  imports: [
    TableModule,
    TranslateModule,
    ToolbarModule,
    ButtonModule,
    OrganisationDetailsEditComponent,
    OrganisationDetailsListComponent,
  ],
  templateUrl: './orga-details.component.html',
  styleUrls: ['../../../host.scss'],
})
export class OrgaDetailsComponent {
  confirmationService = inject(AasConfirmationService);
  translate = inject(TranslateService);
  accessService = inject(AccessService);
  orgaStateService = inject(OrganisationStateService);
  organisation = computed(() => this.orgaStateService.organisation());
  mode = signal<'list' | 'edit'>('list');
  loading = signal<boolean>(false);

  editComponent = viewChild(OrganisationDetailsEditComponent);

  startEditing() {
    this.mode.set('edit');
  }

  async save() {
    try {
      this.loading.set(true);
      await this.editComponent()?.save();
      this.mode.set('list');
      await this.orgaStateService.loadOrganisation();
    } finally {
      this.loading.set(false);
    }
  }

  canSave() {
    return this.editComponent()?.isDirty() && this.editComponent()?.validData();
  }

  async cancelEditing() {
    if (this.editComponent()?.isDirty()) {
      if (
        await this.confirmationService.confirm({
          message: this.translate.instant('WOULD_YOU_LIKE_TO_CONTINUE_WITHOUT_SAVING'),
        })
      ) {
        this.mode.set('list');
      }
    } else {
      this.mode.set('list');
    }
  }
}
