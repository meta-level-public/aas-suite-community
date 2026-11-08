import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DynamicDialogConfig, DynamicDialogRef } from '@openng/optimus-ui/dynamicdialog';
import { ProgressBarModule } from '@openng/optimus-ui/progressbar';

@Component({
  selector: 'lib-wait-dialog',
  imports: [TranslateModule, ProgressBarModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
