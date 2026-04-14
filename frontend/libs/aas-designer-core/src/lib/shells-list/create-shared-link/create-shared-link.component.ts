import { Component, inject, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NotificationService } from '@aas/common-services';
import { CreateSharedLink } from '@aas/webapi-client';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'aas-create-shared-link',
  imports: [
    FormsModule,
    ButtonModule,
    TranslateModule,
    InputTextModule,
    DatePickerModule,
    PasswordModule,
    TextareaModule,
  ],
  templateUrl: './create-shared-link.component.html',
})
export class CreateSharedLinkComponent {
  notificationService = inject(NotificationService);
  ref = inject(DynamicDialogRef);
  config = inject(DynamicDialogConfig);

  sharedLink = model<CreateSharedLink>(new CreateSharedLink());
  loading = signal(false);

  constructor() {
    this.sharedLink().aasIdentifier = this.config.data.aasIdentifier;
  }

  cancel() {
    this.ref.close(null);
  }

  share() {
    this.ref.close(this.sharedLink());
  }
}
