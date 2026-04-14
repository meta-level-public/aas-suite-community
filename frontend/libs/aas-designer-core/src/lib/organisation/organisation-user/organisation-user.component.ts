import { UserInvitation } from '@aas-designer-model';
import { WorkspaceService } from '@aas/aas-designer-shared';
import { AasConfirmationService, NotificationService, PortalService } from '@aas/common-services';
import { OrganisationClient } from '@aas/webapi-client';
import { Component, computed, inject, OnInit, signal, ViewChild } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { lastValueFrom } from 'rxjs';
import { OrganisationStateService } from '../organisation-state.service';
import { OrganisationService } from '../organisation.service';
import { OrganisationUserCreateComponent } from './organisation-user-create/organisation-user-create.component';
import { OrganisationUserListComponent } from './organisation-user-list/organisation-user.component';
@Component({
  selector: 'aas-organisation-user',
  templateUrl: './organisation-user.component.html',
  imports: [
    TranslateModule,
    OrganisationUserListComponent,
    OrganisationUserCreateComponent,
    ButtonModule,
    ToolbarModule,
    TooltipModule,
  ],
})
export class OrganisationUserComponent implements OnInit {
  orgaClient = inject(OrganisationClient);
  translate = inject(TranslateService);
  portalService = inject(PortalService);
  notificationService = inject(NotificationService);
  organisationService = inject(OrganisationService);
  confirmationService = inject(AasConfirmationService);
  orgaStateService = inject(OrganisationStateService);

  userSeatStats = computed(() => this.orgaStateService.userSeatStats());
  mode = signal<string>('list');
  invitation = signal<UserInvitation>(new UserInvitation());
  loading = signal<boolean>(false);
  users = signal<any[]>([]);

  @ViewChild('userCreateComponent') createComponent: OrganisationUserCreateComponent | undefined;

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    const myOrgaId = PortalService.getCurrentOrgaId();
    if (myOrgaId) {
      try {
        this.loading.set(true);
        this.users.set(await lastValueFrom(this.orgaClient.organisation_GetOrganisationUsersById(myOrgaId)));
      } finally {
        this.loading.set(false);
      }
    }
  }

  get moreUsersAllowed() {
    return WorkspaceService.areMoreUsersAllowed(this.userSeatStats());
  }

  startAddUser() {
    this.mode.set('create');
    this.invitation.set(new UserInvitation());
  }

  async saveAddUser() {
    try {
      this.loading.set(true);
      const orgaId = PortalService.getCurrentOrgaId();
      if (orgaId != null) {
        this.invitation().organisationId = orgaId;
        this.invitation().language = this.portalService.currentLanguage;
        await this.organisationService.inviteUser(this.invitation());
        this.notificationService.showMessageAlways('USER_SUCCESS_INVITE', 'SUCCESS', 'success', false);
      } else {
        this.notificationService.showMessageAlways('NO_ORGA_FOUND', 'ERROR', 'error', true);
      }
      this.mode.set('list');
    } finally {
      this.loading.set(false);
    }
  }

  async cancelAddUser() {
    if (this.createComponent?.isDirty()) {
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

  canSaveAddUser() {
    return this.createComponent?.isValid() && this.createComponent?.isDirty();
  }
}
