import { AppConfigService, NotificationService, PortalService } from '@aas/common-services';
import { emailRegEx } from '@aas/model';
import { Component, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AvatarModule } from '@openng/optimus-ui/avatar';
import { ButtonModule } from '@openng/optimus-ui/button';
import { FieldsetModule } from '@openng/optimus-ui/fieldset';
import { FileUpload, FileUploadModule } from '@openng/optimus-ui/fileupload';
import { InputGroupModule } from '@openng/optimus-ui/inputgroup';
import { InputGroupAddonModule } from '@openng/optimus-ui/inputgroupaddon';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { ToolbarModule } from '@openng/optimus-ui/toolbar';
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
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['../../../host.scss'],
})
export class ProfileComponent implements OnInit {
  loading: boolean = false;

  profile: Profile = {} as Profile;
  emailAvailable: boolean = true;
  emailRegEx = emailRegEx;

  /** Profile image as last saved; a different image enables saving even if the form is pristine */
  private savedProfilbild = '';
  /** Image shown before a file was chosen; restored when the chosen file is removed again */
  private profilbildBeforeSelection: string | null = null;

  @ViewChild('uploader') uploader: FileUpload | undefined;
  @ViewChild('profileForm') profileForm: NgForm | undefined;

  constructor(
    private profileService: ProfileService,
    private notificationService: NotificationService,
    private portalService: PortalService,
    public appConfigService: AppConfigService,
  ) {}

  ngOnInit(): void {
    this.profile.name = this.portalService.user?.name ?? '';
    this.profile.vorname = this.portalService.user?.vorname ?? '';
    this.profile.email = this.portalService.user?.loginName ?? '';

    this.profile.profilbildBase64 = this.portalService.user?.profilbildBase64 ?? '';
    this.savedProfilbild = this.profile.profilbildBase64;
  }

  get profilbildChanged() {
    return (this.profile.profilbildBase64 ?? '') !== this.savedProfilbild;
  }

  setProfilbild(event: { files: File[] }) {
    if (event.files.length === 0) {
      return;
    }
    if (this.profilbildBeforeSelection == null) {
      this.profilbildBeforeSelection = this.profile.profilbildBase64 ?? '';
    }
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
          }
          this.savedProfilbild = this.profile.profilbildBase64 ?? '';
          this.profilbildBeforeSelection = null;
          this.uploader?.clear();
          this.profileForm?.form.markAsPristine();
        } else {
          this.notificationService.showMessageAlways('ERROR_SAVE_PROFILE', 'ERROR', 'error', true);
        }
      }
    } finally {
      this.loading = false;
    }
  }
  deleteProfileImage() {
    this.profilbildBeforeSelection = null;
    this.uploader?.clear();
    this.profile.profilbildBase64 = '';
  }

  /** Removing the chosen file restores the image shown before the selection */
  discardSelectedProfilbild() {
    if (this.profilbildBeforeSelection != null) {
      this.profile.profilbildBase64 = this.profilbildBeforeSelection;
      this.profilbildBeforeSelection = null;
    }
  }

  async checkEmail() {
    this.emailAvailable = await this.profileService.checkEmail(this.profile.email);
  }
}
