import { AuthenticateResponse, OrgaSettings, ResultCode, UserInvitation } from '@aas-designer-model';
import { AppConfigService, PortalService } from '@aas/common-services';
import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from '@openng/optimus-ui/button';
import { CheckboxModule } from '@openng/optimus-ui/checkbox';
import { DialogService, DynamicDialogRef } from '@openng/optimus-ui/dynamicdialog';
import { FieldsetModule } from '@openng/optimus-ui/fieldset';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { PasswordModule } from '@openng/optimus-ui/password';
import { ToolbarModule } from '@openng/optimus-ui/toolbar';
import { DisclaimerComponent } from '../disclaimer/disclaimer.component';
import { SelectOrganisationComponent } from '../select-organisation/select-organisation.component';
import { CreateInvitatedAccountService } from './create-invitated-account.service';

@Component({
  selector: 'aas-create-invited-account',
  imports: [
    ToolbarModule,
    FieldsetModule,
    ButtonModule,
    InputTextModule,
    CheckboxModule,
    PasswordModule,
    FormsModule,
    DisclaimerComponent,
    TranslateModule,
  ],
  templateUrl: './create-invited-account.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './create-invited-account.component.scss',
})
export class CreateInvitedAccountComponent implements OnInit {
  appConfigService = inject(AppConfigService);
  portalService = inject(PortalService);
  route = inject(ActivatedRoute);
  service = inject(CreateInvitatedAccountService);
  dialogService = inject(DialogService);
  translate = inject(TranslateService);

  invitation: UserInvitation | undefined;

  privacy: boolean = false;
  agb: boolean = false;
  contact: boolean = false;

  loading: boolean = false;
  password: string = '';
  password2: string = '';
  ref: DynamicDialogRef | undefined | null;
  loginResult: AuthenticateResponse | undefined;

  ngOnInit() {
    this.loadInvitation();
  }

  get guid() {
    return this.route.snapshot.params['guid'];
  }

  async loadInvitation() {
    try {
      this.loading = true;
      this.invitation = await this.service.getInvitation(this.guid);
    } finally {
      this.loading = false;
    }
  }

  get valid() {
    return (this.agb === true && this.contact === true && this.privacy === true) ?? false;
  }

  async send() {
    if (this.valid && this.invitation) {
      try {
        this.loading = true;
        this.loginResult = await this.service.createAccount(this.invitation, this.password);
        if (this.loginResult.resultCode === ResultCode.OK) {
          if (this.loginResult.orgaSettings.length > 1) {
            this.showDialog();
          } else {
            this.portalService.logIn(this.loginResult, this.loginResult.orgaSettings[0]);
          }
        }
      } finally {
        this.loading = false;
      }
    }
  }

  showDialog() {
    this.ref = this.dialogService.open(SelectOrganisationComponent, {
      width: '50%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: true,
      data: { orgaSettings: this.loginResult?.orgaSettings },
      header: this.translate.instant('SELECT_ORGANISATION'),
      closable: true,
    });

    this.ref?.onClose.subscribe((orgaSetting: OrgaSettings) => {
      if (orgaSetting && this.loginResult) {
        this.portalService.logIn(this.loginResult, orgaSetting);
      }
    });
  }
}
