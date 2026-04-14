import { AccessService, NotificationService } from '@aas/common-services';
import { AasInfrastructureClient, AasInfrastructureSettingsDto } from '@aas/webapi-client';
import { Component, ElementRef, inject, output, signal, viewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { lastValueFrom } from 'rxjs';
import { HasChangesCheckable } from '../../my-organisation/has-changes-checkable';
import { OrganisationStateService } from '../../organisation-state.service';
import { InfrastructureAddComponent } from '../infrastructure-add/infrastructure-add.component';

@Component({
  selector: 'aas-infrastructure-parent',
  imports: [ToolbarModule, TranslateModule, ButtonModule, InfrastructureAddComponent],
  templateUrl: './infrastructure-parent.component.html',
  providers: [{ provide: HasChangesCheckable, useExisting: InfrastructureParentComponent }],
})
export class InfrastructureParentComponent extends HasChangesCheckable {
  accessService = inject(AccessService);
  infrastructureClient = inject(AasInfrastructureClient);
  notificationService = inject(NotificationService);
  orgaStateService = inject(OrganisationStateService);

  loading = signal(false);
  mode = signal<'add' | 'view'>('view');
  settings = signal<AasInfrastructureSettingsDto>(new AasInfrastructureSettingsDto());
  reloadInfrastuctureList = output();

  addComponent = viewChild(InfrastructureAddComponent);
  contentScroll = viewChild<ElementRef<HTMLDivElement>>('contentScroll');

  startAdding() {
    this.mode.set('add');
    this.scrollToTop();
    const newSettings = new AasInfrastructureSettingsDto();
    newSettings.aasDiscoveryHcEnabled = false;
    newSettings.aasRegistryHcEnabled = false;
    newSettings.submodelRegistryHcEnabled = false;
    newSettings.aasRepositoryHcEnabled = false;
    newSettings.submodelRepositoryHcEnabled = false;
    newSettings.aasDiscoveryHcEnabled = false;
    newSettings.conceptDescriptionRepositoryHcEnabled = false;
    newSettings.isActive = true;
    this.settings.set(newSettings);
  }

  cancelAdding() {
    this.mode.set('view');
    this.scrollToTop();
  }

  saveEnabled() {
    return true;
  }

  async saveSettings() {
    try {
      this.loading.set(true);
      const res = await lastValueFrom(this.infrastructureClient.aasInfrastructure_AddInfrastructure(this.settings()));
      if (res) {
        this.notificationService.showMessageAlways('INFRASTRUCTURE_SAVED', 'SUCCESS', 'success', false);
      }
      this.mode.set('view');
      this.scrollToTop();
      this.orgaStateService.requestInfrastructureTreeReload();
      this.reloadInfrastuctureList.emit();
    } finally {
      this.loading.set(false);
    }
  }

  override hasChanges(): boolean {
    if (this.mode() === 'view') {
      return false;
    } else {
      const addComponent = this.addComponent();
      if (addComponent) {
        return addComponent.hasChanges();
      }
      return false;
    }
  }

  override isInEditMode(): boolean {
    return this.mode() === 'add';
  }

  override cancelEditing(_force: boolean): void {
    this.mode.set('view');
    this.scrollToTop();
  }

  private scrollToTop() {
    queueMicrotask(() => {
      this.contentScroll()?.nativeElement?.scrollTo({ top: 0, behavior: 'auto' });
    });
  }
}
