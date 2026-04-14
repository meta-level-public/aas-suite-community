import { Component, inject, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ProgressBarModule } from 'primeng/progressbar';

@Component({
  selector: 'lib-wait-dialog',
  imports: [TranslateModule, ProgressBarModule],
  templateUrl: './wait-dialog.component.html',
})
export class WaitDialogComponent {
  tag = signal('');
  ref = inject(DynamicDialogRef);
  config = inject(DynamicDialogConfig);

  constructor() {
    this.tag.set(this.config.data.tag);
  }
}
