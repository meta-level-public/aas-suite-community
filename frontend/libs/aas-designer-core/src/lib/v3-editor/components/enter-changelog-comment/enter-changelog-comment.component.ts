import { Component, inject, model, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from '@openng/optimus-ui/button';
import { DialogService, DynamicDialogRef } from '@openng/optimus-ui/dynamicdialog';
import { FloatLabelModule } from '@openng/optimus-ui/floatlabel';
import { TextareaModule } from '@openng/optimus-ui/textarea';

@Component({
  selector: 'aas-enter-changelog-comment',

  imports: [FormsModule, FloatLabelModule, TranslateModule, ButtonModule, TextareaModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './enter-changelog-comment.component.html',
})
export class EnterChangelogCommentComponent {
  dialogService = inject(DialogService);
  ref = inject(DynamicDialogRef);

  comment = model('');

  closeDialog(comment: string | null) {
    this.ref.close(comment);
  }
}
