import { Component, model } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'aas-v3-paste-question-dialog',
  templateUrl: './v3-paste-question-dialog.component.html',

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
