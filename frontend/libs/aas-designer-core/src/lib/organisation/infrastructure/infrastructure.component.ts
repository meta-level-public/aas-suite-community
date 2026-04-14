import { AasConfirmationService, AccessService, PortalService } from '@aas/common-services';
import {
  AasInfrastructureClient,
  AasInfrastructureSettingsDto,
  AvailableInfastructure,
  OrganisationClient,
  SystemConfigurationDto,
  SystemManagementClient,
} from '@aas/webapi-client';
import { Component, computed, ElementRef, inject, OnInit, output, signal, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { FieldsetModule } from 'primeng/fieldset';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { lastValueFrom } from 'rxjs';
import { HasChangesCheckable } from '../my-organisation/has-changes-checkable';
import { OrganisationStateService } from '../organisation-state.service';
import { InfrastructureEditComponent } from './infrastructure-edit/infrastructure-edit.component';
import { InfrastructureListComponent } from './infrastructure-list/infrastructure-list.component';
import { InfrastructureUpdateVersionsComponent } from './infrastructure-update-versions/infrastructure-update-versions.component';

@Component({
  selector: 'aas-infrastructure',
  imports: [
    TableModule,
    FieldsetModule,
    TranslateModule,
    TagModule,
    ToolbarModule,
    ButtonModule,
    InfrastructureEditComponent,
    InfrastructureListComponent,
    InfrastructureUpdateVersionsComponent,
  ],
  templateUrl: './infrastructure.component.html',
  styleUrls: ['../../../host.scss'],
  providers: [{ provide: HasChangesCheckable, useExisting: InfrastructureComponent }],
})
export class InfrastructureComponent extends HasChangesCheckable implements OnInit {
  organisationClient = inject(OrganisationClient);
  confirmationService = inject(AasConfirmationService);
  translate = inject(TranslateService);
  accessService = inject(AccessService);
  infrastructureClient = inject(AasInfrastructureClient);
  systemManagementClient = inject(SystemManagementClient);
  orgaStateService = inject(OrganisationStateService);
  route = inject(ActivatedRoute);

  loading = signal<boolean>(false);
  mode = signal<'list' | 'edit' | 'updateVersions'>('list');
  requestReload = output();
  settingsBackup = computed(() => {
    return JSON.stringify(this.settings());
  });
  settings = signal<AasInfrastructureSettingsDto | undefined>(undefined);
  selectedInfrastructure = signal<AvailableInfastructure | undefined>(undefined);
  systemConfiguration = signal<SystemConfigurationDto | null>(null);
  @ViewChild('editComponent') editComponent: InfrastructureEditComponent | undefined;
  @ViewChild('updateVersionsComponent') updateVersionsComponent: InfrastructureUpdateVersionsComponent | undefined;
  @ViewChild('contentScroll') contentScroll: ElementRef<HTMLDivElement> | undefined;
  reloadInfrastuctureList = output();

  async ngOnInit() {
    this.systemConfiguration.set(await lastValueFrom(this.systemManagementClient.systemManagement_GetConfiguration()));

    // Get infrastructure ID from route
    this.route.params.subscribe(async (params) => {
      const id = parseInt(params['id']);
      if (id) {
        // Load infrastructure details by ID
        const allInfrastructures = await lastValueFrom(
          this.infrastructureClient.aasInfrastructure_GetAllSavedInfrastructures(),
        );
        const infrastructure = allInfrastructures.find((i) => i.id === id);
        if (infrastructure) {
          this.selectedInfrastructure.set(infrastructure);
          await this.loadSettings();
        }
      }
    });
  }

  canManageInternalInfrastructure(): boolean {
    return this.settings()?.isInternal === true && this.systemConfiguration()?.singleTenantMode === false;
  }

  startEditing() {
    this.mode.set('edit');
    this.scrollToTop();
  }

  async loadSettings() {
    try {
      this.loading.set(true);
      const res = await lastValueFrom(
        this.infrastructureClient.aasInfrastructure_GetInfrastructureDetails(this.selectedInfrastructure()?.id),
      );
      if (res) {
        this.settings.set(res);
      }
    } finally {
      this.loading.set(false);
    }
  }

  async cancelEditing(force = false) {
    if (this.hasChanges() && !force) {
      if (
        await this.confirmationService.confirm({
          message: this.translate.instant('WOULD_YOU_LIKE_TO_CONTINUE_WITHOUT_SAVING'),
        })
      ) {
        this.loadSettings();
        this.mode.set('list');
        this.scrollToTop();
      }
    } else {
      this.mode.set('list');
      this.scrollToTop();
    }
  }

  private scrollToTop() {
    queueMicrotask(() => {
      this.contentScroll?.nativeElement?.scrollTo({ top: 0, behavior: 'auto' });
    });
  }

  async save() {
    if (this.mode() !== 'updateVersions') {
      try {
        this.loading.set(true);
        const myOrgaId = PortalService.getCurrentOrgaId();
        if (myOrgaId) {
          // const organisationUpdateDto = new OrganisationUpdateDto();
          // Object.assign(organisationUpdateDto, this.organisation());
          // await lastValueFrom(this.organisationClient.organisation_Update(myOrgaId, organisationUpdateDto));
          const settings = this.settings();
          if (settings != null) {
            const res = await lastValueFrom(this.infrastructureClient.aasInfrastructure_UpdateInfrastructure(settings));
            if (res) {
              this.loadSettings();
              this.orgaStateService.requestInfrastructureTreeReload();
              this.reloadInfrastuctureList.emit();
            }
          }
        }
        this.mode.set('list');
        this.scrollToTop();
        this.requestReload.emit();
      } finally {
        this.loading.set(false);
      }
    } else {
      if (
        await this.confirmationService.confirm({
          message: this.translate.instant('RECREATE_INFRASTRUCTURE_Q'),
        })
      ) {
        const settings = this.settings();
        if (settings != null) {
          try {
            this.loading.set(true);

            if (this.updateVersionsComponent?.selectedDiscovery() != null) {
              settings.aasDiscoveryVersion = this.updateVersionsComponent?.selectedDiscovery();
            }

            if (this.updateVersionsComponent?.selectedAasReg() != null) {
              settings.aasRegistryVersion = this.updateVersionsComponent?.selectedAasReg();
            }

            if (this.updateVersionsComponent?.selectedSmReg() != null) {
              settings.submodelRegistryVersion = this.updateVersionsComponent?.selectedSmReg();
            }

            if (this.updateVersionsComponent?.selectedEnv() != null) {
              settings.aasRepositoryVersion = this.updateVersionsComponent?.selectedEnv();
              settings.submodelRepositoryVersion = this.updateVersionsComponent?.selectedEnv();
              settings.conceptDescriptionRepositoryVersion = this.updateVersionsComponent?.selectedEnv();
            }

            await lastValueFrom(this.infrastructureClient.aasInfrastructure_UpdateInternalInfrastructure(settings));
            this.mode.set('list');
            this.scrollToTop();
            this.requestReload.emit();
          } finally {
            this.loading.set(false);
          }
        }
      }
    }
  }

  override hasChanges() {
    const hasChanges =
      this.settingsBackup() !== JSON.stringify(this.settings()) ||
      (this.mode() === 'updateVersions' && this.updateVersionsComponent?.hasChanges());

    return hasChanges ?? false;
  }

  override isInEditMode(): boolean {
    if (this.mode() === 'edit' || this.mode() === 'updateVersions') {
      return true;
    }
    return false;
  }

  async deleteInfrastructure() {
    if (
      await this.confirmationService.confirm({
        message: this.translate.instant('DELETE_INFRASTRUCTURE_Q'),
      })
    ) {
      await lastValueFrom(
        this.infrastructureClient.aasInfrastructure_DeleteInfrastructure(this.selectedInfrastructure()?.id),
      );
      this.orgaStateService.requestInfrastructureTreeReload();
      this.reloadInfrastuctureList.emit();
    }
  }

  async recreateInfrastructure() {
    if (
      await this.confirmationService.confirm({
        message: this.translate.instant('RECREATE_INFRASTRUCTURE_Q'),
      })
    ) {
      const settings = this.settings();
      if (settings != null) {
        await lastValueFrom(this.infrastructureClient.aasInfrastructure_UpdateInternalInfrastructure(settings));
      }
    }
  }

  async deactivateInfrastructure() {
    if (
      await this.confirmationService.confirm({
        message: this.translate.instant('DEACTIVATE_INFRASTRUCTURE_Q'),
      })
    ) {
      await lastValueFrom(
        this.infrastructureClient.aasInfrastructure_DisableInternalInfrastructure(this.selectedInfrastructure()?.id),
      );
      this.loadSettings();
    }
  }

  async activateInfrastructure() {
    if (
      await this.confirmationService.confirm({
        message: this.translate.instant('ACTIVATE_INFRASTRUCTURE_Q'),
      })
    ) {
      await lastValueFrom(
        this.infrastructureClient.aasInfrastructure_EnableInternalInfrastructure(this.selectedInfrastructure()?.id),
      );
      this.loadSettings();
    }
  }

  startUpdatingVersions() {
    this.mode.set('updateVersions');
    this.scrollToTop();
  }
}
