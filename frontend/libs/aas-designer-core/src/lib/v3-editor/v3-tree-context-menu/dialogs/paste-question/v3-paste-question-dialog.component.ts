import { Component, model, ChangeDetectionStrategy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from '@openng/optimus-ui/button';
import { DialogModule } from '@openng/optimus-ui/dialog';

@Component({
  selector: 'aas-v3-paste-question-dialog',
  templateUrl: './v3-paste-question-dialog.component.html',

  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [TranslateModule, DialogModule, ButtonModule],
})
export class V3PasteQuestionDialogComponent {
  visible = model<boolean>(false);
  // Signal-based result: 'reference' | 'copy' | null
  acceptedAction = model<'reference' | 'copy' | null>(null);

  onHide() {
    this.visible.set(false);
  }
}
