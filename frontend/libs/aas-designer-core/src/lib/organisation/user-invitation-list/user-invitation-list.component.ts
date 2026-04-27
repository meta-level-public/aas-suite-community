import { UserInvitation } from '@aas-designer-model';
import { AasConfirmationService } from '@aas/aas-designer-shared';
import { NotificationService } from '@aas/common-services';
import { ChangeDetectorRef, Component, OnChanges, OnInit, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { FieldsetModule } from 'primeng/fieldset';
import { MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { OrganisationService } from '../organisation.service';

@Component({
  selector: 'aas-user-invitation-list',
  imports: [TranslateModule, TableModule, ButtonModule, MenuModule, TagModule, FieldsetModule, ToolbarModule],
  templateUrl: './user-invitation-list.component.html',
})
export class UserInvitationListComponent implements OnChanges, OnInit {
  menuItems: MenuItem[] = [];
  translate = inject(TranslateService);
  orgaService = inject(OrganisationService);
  confirmationService = inject(AasConfirmationService);
  notificationService = inject(NotificationService);
  cdRef = inject(ChangeDetectorRef);
  invitations: UserInvitation[] = [];
  loading: boolean = false;

  ngOnChanges() {
    this.loadData();
  }

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    try {
      this.loading = true;
      this.invitations = await this.orgaService.getInvitations();
      this.cdRef.detectChanges();
    } finally {
      this.loading = false;
    }
  }

  onShowActions(invitation: UserInvitation) {
    this.menuItems = [
      {
        label: this.translate.instant('RESEND_INVITATION'),
        command: () => {
          this.resendSelectedInvitation(invitation);
        },
      },
      {
        label: this.translate.instant('DELETE'),
        command: () => {
          this.deleteSelectedInvitation(invitation);
        },
      },
    ];
  }

  isValid(invitation: UserInvitation) {
    return invitation.validUntil && invitation.validUntil > new Date();
  }

  async resendSelectedInvitation(invitation: UserInvitation) {
    if (invitation.id !== undefined) {
      try {
        this.loading = true;
        await this.orgaService.resendInvitation(invitation.id);
        this.notificationService.showMessageAlways('INVITATION_SUCCESS_RESEND', 'SUCCESS', 'success', false);
        this.loadData();
      } finally {
        this.loading = false;
      }
    }
  }

  async deleteSelectedInvitation(invitation: UserInvitation) {
    if (
      await this.confirmationService.confirm({
        message: this.translate.instant('DELETE_INVITATION_Q'),
      })
    ) {
      if (invitation.id !== undefined) {
        try {
          this.loading = true;
          await this.orgaService.deleteInvitation(invitation.id);
          this.notificationService.showMessageAlways('INVITATION_SUCCESS_DELETE', 'SUCCESS', 'success', false);
          this.loadData();
        } finally {
          this.loading = false;
        }
      }
    }
  }
}
