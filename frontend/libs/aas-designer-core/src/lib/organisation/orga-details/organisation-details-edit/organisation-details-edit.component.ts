import { DirtyCheckable, Organisation } from '@aas-designer-model';
import { ActiveComponentsService } from '@aas/aas-designer-shared';
import { AasEmailValidator, CountryCodeComponent } from '@aas/common-components';
import { NotificationService, PortalService } from '@aas/common-services';
import { FilenameHelper } from '@aas/helpers';
import { emailRegEx, urlRegEx } from '@aas/model';
import { Component, effect, input, OnDestroy, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { FieldsetModule } from 'primeng/fieldset';
import { FileSelectEvent, FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { KeyFilterModule } from 'primeng/keyfilter';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ToolbarModule } from 'primeng/toolbar';
import { OrganisationService } from '../../organisation.service';

@Component({
  selector: 'aas-organisation-details-edit',
  templateUrl: './organisation-details-edit.component.html',
  imports: [
    TranslateModule,
    ButtonModule,
    ToolbarModule,
    InputTextModule,
    ToggleSwitchModule,
    FormsModule,
    FieldsetModule,
    CountryCodeComponent,
    FileUploadModule,
    KeyFilterModule,
  ],
  styleUrls: ['../../../../host.scss'],
})
export class OrganisationDetailsEditComponent extends DirtyCheckable implements OnDestroy {
  @ViewChild('orgaForm') form: NgForm | undefined;
  organisation = new Organisation();
  organisationId = input.required<number>();
  emailRegEx = emailRegEx;
  isEmailValid = false;
  isValidUrl = urlRegEx;
  loading = false;

  constructor(
    private organisationMangementService: OrganisationService,
    private notificationService: NotificationService,
    private activeComponents: ActiveComponentsService,
    private portalService: PortalService,
  ) {
    super();
    activeComponents.register(this);
    const currentOrgaId = PortalService.getCurrentOrgaId();
    if (currentOrgaId) this.getOrganisation(currentOrgaId);
  }
  ngOnDestroy(): void {
    this.activeComponents.unregister(this);
  }

  orgaIdEffect = effect(() => {
    if (this.organisationId()) {
      this.getOrganisation(this.organisationId());
    }
  });

  setCountryCode(countryCode: string) {
    this.organisation.laenderCode = countryCode;
  }

  async save() {
    try {
      this.loading = true;
      const result = await this.organisationMangementService.updateOrganisation(this.organisation);
      if (result === true) {
        this.notificationService.showMessageAlways('SUCCESS_EDIT_ORGANIZATION', 'SUCCESS', 'success', false);
        this.updatePrefixIri(this.organisation.iriPrefix ?? '');
        this.portalService.saveOrganisationLogo(this.organisation.logoBase64 ?? '');
      } else {
        this.notificationService.showMessageAlways('COMMON_ERROR', 'ERROR', 'error', false);
      }
    } finally {
      this.loading = false;
    }
  }

  validData() {
    return this.organisationMangementService.validateOrganisationData(this.organisation);
  }

  override isDirty() {
    return this.form?.dirty === true && this.form?.submitted === false;
  }

  private async getOrganisation(orgaId: number) {
    try {
      this.loading = true;
      this.organisation = await this.organisationMangementService.getMyOrganisationById(orgaId);
    } finally {
      this.loading = false;
    }
  }

  private updatePrefixIri(prefix: string) {
    this.portalService.saveOrganisationPrefixIri(prefix);
  }

  onSelectOrgaLogo(event: FileSelectEvent) {
    const file = event.files?.[0];
    if (file == null) {
      return;
    }

    this.organisation.logoBase64 = '';

    this.resizeImage(file, 96, 96).then((blob) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        const base64data = reader.result;
        this.organisation.logoBase64 = base64data as string;
      };
    });
  }

  choose(_event: any, callback: any) {
    callback();
  }

  onClearOrgaLogo() {
    this.organisation.logoBase64 = '';
  }

  resizeImage(file: File, maxWidth: number, maxHeight: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      let objectUrl = '';
      const revokeObjectUrl = () => {
        if (objectUrl !== '') {
          URL.revokeObjectURL(objectUrl);
          objectUrl = '';
        }
      };
      image.onload = () => {
        const width = image.width;
        const height = image.height;

        if (width <= maxWidth && height <= maxHeight) {
          revokeObjectUrl();
          resolve(new Blob([file], { type: file.type || FilenameHelper.getContentType(file) }));
          return;
        }

        let newWidth;
        let newHeight;

        if (width > height) {
          newHeight = height * (maxWidth / width);
          newWidth = maxWidth;
        } else {
          newWidth = width * (maxHeight / height);
          newHeight = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;

        const context = canvas.getContext('2d');

        context?.drawImage(image, 0, 0, newWidth, newHeight);

        canvas.toBlob((blob) => {
          revokeObjectUrl();
          if (blob) {
            resolve(blob);
          } else {
            reject();
          }
        });
      };
      image.onerror = () => {
        revokeObjectUrl();
        reject();
      };

      void FilenameHelper.buildPreviewImageBlob(file)
        .then((previewBlob) => {
          objectUrl = URL.createObjectURL(previewBlob);
          image.src = objectUrl;
        })
        .catch(() => reject());
    });
  }

  isValidEmail(email: string) {
    return AasEmailValidator.isValidEmail(email);
  }
}
