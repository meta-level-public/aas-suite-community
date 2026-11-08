import { Component, inject, model, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NotificationService } from '@aas/common-services';
import { CreateSharedLink } from '@aas/webapi-client';
import { ButtonModule } from '@openng/optimus-ui/button';
import { DatePickerModule } from '@openng/optimus-ui/datepicker';
import { DynamicDialogConfig, DynamicDialogRef } from '@openng/optimus-ui/dynamicdialog';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { PasswordModule } from '@openng/optimus-ui/password';
import { TextareaModule } from '@openng/optimus-ui/textarea';

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
  changeDetection: ChangeDetectionStrategy.Eager,
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
