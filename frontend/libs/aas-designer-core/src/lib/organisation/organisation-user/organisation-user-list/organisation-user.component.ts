import { Benutzer } from '@aas-designer-model';
import { AasConfirmationService, NotificationService, PortalService } from '@aas/common-services';
import { OrganisationClient, OrganisationUebersichtBenutzerDto, OrganisationUserSeatStats } from '@aas/webapi-client';
import { CommonModule } from '@angular/common';
import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MenuModule } from 'primeng/menu';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { OrganisationService } from '../../organisation.service';

@Component({
  selector: 'aas-organisation-user-list',
  templateUrl: './organisation-user.component.html',
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    TableModule,
    ButtonModule,
    MessageModule,
    MenuModule,
    TagModule,
    DialogModule,
    CheckboxModule,
  ],
})
export class OrganisationUserListComponent implements OnInit {
  orgaClient = inject(OrganisationClient);
  translate = inject(TranslateService);
  portalService = inject(PortalService);
  dialogService = inject(DialogService);
  notificationService = inject(NotificationService);
  organisationService = inject(OrganisationService);
  confirmService = inject(AasConfirmationService);

  ref: DynamicDialogRef | undefined | null;
  users = input.required<OrganisationUebersichtBenutzerDto[] | null>();
  userSeatStats = input.required<OrganisationUserSeatStats | undefined>();
  loading = false;

  reloadRequested = output<void>();

  menuItems = signal<MenuItem[]>([]);

  availableRoles: string[] = [];

  currentEditUser = signal<Benutzer | null>(null);
  editRolesVisible = signal(false);

  rolesBackup: string[] = [];

  async ngOnInit() {
    this.availableRoles = await this.organisationService.getAvailableRoles();
  }

  onShowActions(user: Benutzer, _event: any) {
    this.menuItems.set([
      {
        label: this.translate.instant('DELETE'),
        disabled: this.portalService.user?.id === user.id,
        command: () => {
          this.deleteSelectedUser(user);
        },
      },
      {
        label: this.translate.instant('EDIT_ROLES'),
        command: () => {
          this.currentEditUser.set(user);
          this.rolesBackup = [...user.benutzerRollen];
          this.editRolesVisible.set(true);
        },
      },
    ]);
  }

  get maxUsersString() {
    if (this.userSeatStats) {
      return this.userSeatStats()?.maxUserSeatsCount === -1
        ? this.translate.instant('UNLIMITED')
        : (this.userSeatStats()?.maxUserSeatsCount ?? '').toString();
    }
    return '';
  }

  async deleteSelectedUser(user: Benutzer) {
    if (await this.confirmService.confirm({ message: this.translate.instant('DELETE_USER_FROM_ORGA') })) {
      const myOrgaId = PortalService.getCurrentOrgaId();
      if (user.id && myOrgaId) {
        try {
          this.loading = true;

          const userDeleted = await this.organisationService.deleteUser(user.id, myOrgaId);
          if (userDeleted) {
            this.notificationService.showMessageAlways('USER_SUCCESS_DELETE', 'SUCCESS', 'success', false);
            this.reloadRequested.emit();
          }
        } finally {
          this.loading = false;
        }
      }
    }
  }

  cancelEditRoles() {
    const currentEditUser = this.currentEditUser();
    if (currentEditUser != null) {
      currentEditUser.benutzerRollen = this.rolesBackup;
    }
    this.editRolesVisible.set(false);
  }

  async saveEditRoles() {
    try {
      this.loading = true;
      const currentEditUser = this.currentEditUser();
      const myOrgaId = PortalService.getCurrentOrgaId();

      if (currentEditUser == null || myOrgaId == null || currentEditUser.id == null) {
        return;
      }
      const res = await this.organisationService.updateUserRoles(
        myOrgaId,
        currentEditUser.id,
        currentEditUser.benutzerRollen,
      );
      if (res) {
        this.notificationService.showMessageAlways('SUCCESS_UPDATE', 'SUCCESS', 'success', false);
        this.editRolesVisible.set(false);
        this.reloadRequested.emit();
      }
    } finally {
      this.loading = false;
    }
  }

  isRoleDisabled(role: string): boolean {
    return this.portalService.user?.id === this.currentEditUser()?.id && role === 'ORGA_ADMIN';
  }

  canSaveEditRoles() {
    const currentEditUser = this.currentEditUser();
    return (
      currentEditUser != null &&
      currentEditUser.benutzerRollen !== this.rolesBackup &&
      currentEditUser.benutzerRollen.length > 0
    );
  }
}
