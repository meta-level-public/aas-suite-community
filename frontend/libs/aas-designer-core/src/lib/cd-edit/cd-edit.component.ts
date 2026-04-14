import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { NotificationService } from '@aas/common-services';
import { ShellResult } from '@aas/model';
import { AasInfrastructureClient, AvailableInfastructure, ConceptDescriptionClient } from '@aas/webapi-client';
import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { lastValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { V3ConceptDescriptionComponent } from '../v3-editor';
import { V3TreeItem } from '../v3-editor/model/v3-tree-item';
import { PortalService } from '@aas/common-services';

@Component({
  selector: 'aas-cd-edit',
  imports: [CommonModule, TranslateModule, ButtonModule, ToolbarModule, V3ConceptDescriptionComponent],
  templateUrl: './cd-edit.component.html',
})
export class CdEditComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private portalService = inject(PortalService);
  id = input<string>(toSignal(this.route.paramMap.pipe(map((params) => params.get('id') || '')))() || '');
  notificationService = inject(NotificationService);

  infrastructureClient = inject(AasInfrastructureClient);
  cdClient = inject(ConceptDescriptionClient);
  loading = signal(false);
  infrastructureReady = signal(false);

  shellResult = new ShellResult();

  async ngOnInit(): Promise<void> {
    const success = await this.applyInfrastructureFromRoute();
    this.infrastructureReady.set(success);
  }

  cd = computed(async () => {
    if (!this.infrastructureReady()) {
      return undefined;
    }

    const id = this.id();
    if (!id) {
      return undefined;
    }

    queueMicrotask(() => {
      this.loading.set(true);
    });

    try {
      const cdRes = await lastValueFrom(this.cdClient.conceptDescription_GetCd(id));
      const cdObj = aas.jsonization.conceptDescriptionFromJsonable(JSON.parse(cdRes)).value;
      return cdObj;
    } catch {
      this.notificationService.showMessageAlways('CONCEPT_DESCRIPTION_NOT_LOADED', 'ERROR', 'error');
      this.router.navigate(['/', 'cds-list']);
      return undefined;
    } finally {
      queueMicrotask(() => {
        this.loading.set(false);
      });
    }
  });

  private get routeInfrastructureId(): number | null {
    const raw = this.route.snapshot.paramMap.get('infrastructureId');
    if (raw == null) {
      return null;
    }

    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private async applyInfrastructureFromRoute(): Promise<boolean> {
    const requestedInfrastructureId = this.routeInfrastructureId;
    if (requestedInfrastructureId == null || requestedInfrastructureId < 0) {
      return true;
    }

    const available = await lastValueFrom(this.infrastructureClient.aasInfrastructure_GetAvailableInfrastructures());
    const selected = available.find((item: AvailableInfastructure) => item.id === requestedInfrastructureId);
    if (!selected) {
      this.notificationService.showMessageAlways(
        'CONCEPT_DESCRIPTION_NOT_LOADED_INFRASTRUCTURE_ACCESS',
        'ERROR',
        'error',
      );
      this.router.navigate(['/', 'cds-list']);
      return false;
    }

    if (PortalService.getCurrentAasInfrastructureSetting()?.id !== selected.id) {
      this.portalService.saveCurrentInfrastructureSetting(selected);
    }

    return true;
  }

  cdTreeItem = computed(async () => {
    const cd = await this.cd();
    if (cd == null) {
      return undefined;
    }

    const treeItem = new V3TreeItem<aas.types.ConceptDescription>();
    treeItem.content = cd;

    return treeItem;
  });

  close() {
    window.history.back();
  }

  async save() {
    try {
      this.loading.set(true);
      const cd = await this.cd();
      if (cd != null) {
        const res = await lastValueFrom(
          this.cdClient.conceptDescription_UpdateCd(JSON.stringify(aas.jsonization.toJsonable(cd))),
        );
        if (res === true) {
          this.notificationService.showMessageAlways('CD_SAVED_SUCCESSFULLY', 'success', 'success', false);
        } else {
          this.notificationService.showMessageAlways('CD_SAVE_FAILED', 'error', 'error', true);
        }
      }
    } finally {
      this.loading.set(false);
    }
  }
}
