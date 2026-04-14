import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { StepperModule } from 'primeng/stepper';
import { StepsModule } from 'primeng/steps';
import { PortalService } from '@aas/common-services';
import { OrganisationUebersichtBenutzerDto } from '../model/organisation-uebersicht-benutzer-dto';
import { DeleteUserMovePackageService } from './delete-user-move-package.service';

@Component({
  selector: 'aas-delete-user-move-package-dialog',
  imports: [
    FormsModule,
    TranslateModule,
    SelectModule,
    StepperModule,
    ButtonModule,
    StepsModule,
    CardModule,
    MessageModule,
  ],
  templateUrl: './delete-user-move-package-dialog.component.html',
})
export class DeleteUserMovePackageDialogComponent {
  selectedTargetUser: OrganisationUebersichtBenutzerDto | undefined;
  targetUserOptions: OrganisationUebersichtBenutzerDto[] = [];
  mode: 'delete' | 'move' = 'delete';
  activeIndex = 0;
  userTomoveId = 0;

  steps: MenuItem[] = [];
  ref = inject(DynamicDialogRef);
  translate = inject(TranslateService);
  config = inject(DynamicDialogConfig);
  deleteMoveService = inject(DeleteUserMovePackageService);

  constructor() {
    this.userTomoveId = this.config.data.user.id;
    this.initSteps();
    this.translate.onLangChange.subscribe(() => {
      this.initSteps();
    });
    this.loadMoveTargetUsers();
  }

  async loadMoveTargetUsers() {
    const myOrgaId = PortalService.getCurrentOrgaId();
    if (myOrgaId) {
      this.targetUserOptions = await this.deleteMoveService.getTargetOptions(myOrgaId, this.userTomoveId);
    }
  }

  initSteps() {
    this.steps = [
      { label: this.translate.instant('SURE_Q') },
      { label: this.translate.instant('PACKAGES') },
      { label: this.translate.instant('TARGET') },
    ];
  }

  cancel() {
    this.selectedTargetUser = undefined;
    this.ref.close({ cancel: true });
  }

  delete() {
    this.selectedTargetUser = undefined;
    this.mode = 'delete';
    this.ref.close({ cancel: false, mode: this.mode });
  }

  move() {
    this.mode = 'move';
    this.ref.close({ cancel: false, mode: this.mode, target: this.selectedTargetUser?.id });
  }
}
