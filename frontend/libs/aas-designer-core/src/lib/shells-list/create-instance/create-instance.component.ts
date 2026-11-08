import { CreateInstanceRequest, ShellsClient } from '@aas/webapi-client';
import { Component, inject, model, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from '@openng/optimus-ui/button';
import { DatePickerModule } from '@openng/optimus-ui/datepicker';
import { DynamicDialogConfig, DynamicDialogRef } from '@openng/optimus-ui/dynamicdialog';
import { InputTextModule } from '@openng/optimus-ui/inputtext';

@Component({
  selector: 'aas-create-instance',
  imports: [FormsModule, TranslateModule, InputTextModule, ButtonModule, DatePickerModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './create-instance.component.html',
})
export class CreateInstanceComponent {
  ref = inject(DynamicDialogRef);
  config = inject(DynamicDialogConfig);
  dateValue: Date = new Date();
  shellsClient = inject(ShellsClient);

  createInstanceItem = model<CreateInstanceRequest>(new CreateInstanceRequest());
  loading = signal(false);

  constructor() {
    this.createInstanceItem().aasIdentifier = this.config.data.aasIdentifier;
    this.createInstanceItem().dateOfManufacture = this.dateValue.toISOString();
  }

  closeDialog() {
    this.ref.close(null);
  }

  doCreateInstance() {
    this.ref.close(this.createInstanceItem());
  }

  onDateSelect(event: Date | null) {
    if (event != null) {
      this.createInstanceItem().dateOfManufacture = event.toISOString();
    } else {
      this.createInstanceItem().dateOfManufacture = undefined;
    }
  }
}
