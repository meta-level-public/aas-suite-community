import { Component, inject, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'aas-enter-changelog-comment',

  imports: [FormsModule, FloatLabelModule, TranslateModule, ButtonModule, TextareaModule],
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
