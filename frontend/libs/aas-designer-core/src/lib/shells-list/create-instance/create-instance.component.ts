import { CreateInstanceRequest, ShellsClient } from '@aas/webapi-client';
import { Component, inject, model, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from '@openng/optimus-ui/button';
import { DatePickerModule } from '@openng/optimus-ui/datepicker';
import { DynamicDialogConfig, DynamicDialogRef } from '@openng/optimus-ui/dynamicdialog';
import { InputTextModule } from '@openng/optimus-ui/inputtext';

/**
 * Formats a date as ISO 8601 in local time with the time zone offset (e.g. 2026-11-09T13:26:18+01:00),
 * so the server writes the calendar date the user picked instead of the UTC date.
 */
export function toLocalIsoString(date: Date): string {
  const pad = (value: number) => String(Math.abs(value)).padStart(2, '0');
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? '+' : '-';
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}` +
    `${sign}${pad(Math.trunc(offsetMinutes / 60))}:${pad(offsetMinutes % 60)}`
  );
}

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
    this.createInstanceItem().dateOfManufacture = toLocalIsoString(this.dateValue);
  }

  closeDialog() {
    this.ref.close(null);
  }

  doCreateInstance() {
    this.ref.close(this.createInstanceItem());
  }

  onDateSelect(event: Date | null) {
    if (event != null) {
      this.createInstanceItem().dateOfManufacture = toLocalIsoString(event);
    } else {
      this.createInstanceItem().dateOfManufacture = undefined;
    }
  }
}
