import { PortalService } from '@aas/common-services';
import { OrganisationClient, OrganisationUebersichtDto, OrganisationUserSeatStats } from '@aas/webapi-client';
import { Injectable, inject, signal } from '@angular/core';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrganisationStateService {
  private organisationClient = inject(OrganisationClient);

  organisation = signal<OrganisationUebersichtDto | null>(null);
  userSeatStats = signal<OrganisationUserSeatStats | undefined>(undefined);
  loading = signal<boolean>(false);
  infrastructureTreeVersion = signal(0);

  async loadOrganisation() {
    try {
      this.loading.set(true);
      const myOrgaId = PortalService.getCurrentOrgaId();
      if (myOrgaId) {
        this.organisation.set(await lastValueFrom(this.organisationClient.organisation_GetById(myOrgaId)));
      }
    } finally {
      this.loading.set(false);
    }
  }

  async loadUserSeatStats() {
    const myOrgaId = PortalService.getCurrentOrgaId();
    if (myOrgaId) {
      this.userSeatStats.set(await lastValueFrom(this.organisationClient.organisation_GetUserSeatStats(myOrgaId)));
    }
  }

  get myOrgaId() {
    return PortalService.getCurrentOrgaId() ?? 0;
  }

  requestInfrastructureTreeReload() {
    this.infrastructureTreeVersion.update((value) => value + 1);
  }
}
