import { Component, input, model, ChangeDetectionStrategy } from '@angular/core';
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
  /** Translation key of the question (shell with its submodels or a single submodel). */
  questionKey = input<string>('PASTE_AS_REFERENCE_QUESTION');
  // Signal-based result: 'reference' | 'copy' | null
  acceptedAction = model<'reference' | 'copy' | null>(null);

  onHide() {
    this.visible.set(false);
  }
}
