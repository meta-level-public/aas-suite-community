import { AasConfirmationService, AppConfigService, NotificationService, PortalService } from '@aas/common-services';
import { emailRegEx } from '@aas/model';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { FieldsetModule } from 'primeng/fieldset';
import { FileUpload, FileUploadModule } from 'primeng/fileupload';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { ToolbarModule } from 'primeng/toolbar';
import { Profile } from './profile';
import { ProfileService } from './profile.service';
import { HelpLabelComponent } from '@aas/common-components';

@Component({
  selector: 'aas-profile',
  templateUrl: './profile.component.html',
  imports: [
    FormsModule,
    TranslateModule,
    ButtonModule,
    FileUploadModule,
    FieldsetModule,
    InputTextModule,
    InputGroupModule,
    InputGroupAddonModule,
    AvatarModule,
    ToolbarModule,
    HelpLabelComponent,
  ],
  styleUrls: ['../../../host.scss'],
})
export class ProfileComponent implements OnInit {
  loading: boolean = false;

  profile: Profile = {} as Profile;
  emailAvailable: boolean = true;
  emailRegEx = emailRegEx;

  @ViewChild('uploader') uploader: FileUpload | undefined;

  constructor(
    private profileService: ProfileService,
    private notificationService: NotificationService,
    private portalService: PortalService,
    private confirmService: AasConfirmationService,
    private translate: TranslateService,
    public appConfigService: AppConfigService,
  ) {}

  ngOnInit(): void {
    this.profile.name = this.portalService.user?.name ?? '';
    this.profile.vorname = this.portalService.user?.vorname ?? '';
    this.profile.email = this.portalService.user?.loginName ?? '';

    this.profile.profilbildBase64 = this.portalService.user?.profilbildBase64 ?? '';
  }

  setProfilbild(event: { files: File[] }) {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.profile.profilbildBase64 = e?.target?.result?.toString() ?? '';
    };
    reader.readAsDataURL(event.files[0]);
  }

  async save() {
    try {
      this.loading = true;

      this.emailAvailable = await this.profileService.checkEmail(this.profile.email);
      if (this.emailAvailable) {
        const res = await this.profileService.saveProfile(this.profile);
        if (res === true) {
          this.notificationService.showMessageAlways('SUCCESS_SAVE_PROFILE', 'SUCCESS', 'success', false);
          const resp = this.portalService.user;
          if (resp != null) {
            resp.name = this.profile.name;
            resp.vorname = this.profile.vorname;
            resp.loginName = this.profile.email;
            resp.profilbildBase64 = this.profile.profilbildBase64;

            this.portalService.saveUser(resp);

            this.uploader?.clearInputElement();
          }
        } else {
          this.notificationService.showMessageAlways('ERROR_SAVE_PROFILE', 'ERROR', 'error', true);
        }
      }
    } finally {
      this.loading = false;
    }
  }
  deleteProfileImage() {
    this.profile.profilbildBase64 = '';
  }

  async checkEmail() {
    this.emailAvailable = await this.profileService.checkEmail(this.profile.email);
  }

  async resetHilfe() {
    if ((await this.confirmService.confirm({ message: this.translate.instant('RESET_HILFE_Q') })) === true) {
      const user = this.portalService.user;
      if (user != null && user.einstellungen != null) {
        user.einstellungen.hilfeInaktiv = {};
        await this.profileService.resetHilfe(user.einstellungen);
        this.portalService.saveUser(user);
      }
    }
  }
}
