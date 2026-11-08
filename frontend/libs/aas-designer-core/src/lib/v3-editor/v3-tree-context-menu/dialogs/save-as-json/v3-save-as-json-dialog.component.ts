import { Component, EventEmitter, Input, Output, model, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from '@openng/optimus-ui/button';
import { DialogModule } from '@openng/optimus-ui/dialog';
import { TextareaModule } from '@openng/optimus-ui/textarea';

@Component({
  selector: 'aas-v3-save-as-json-dialog',
  templateUrl: './v3-save-as-json-dialog.component.html',

  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [TranslateModule, DialogModule, ButtonModule, TextareaModule, FormsModule],
})
export class V3SaveAsJsonDialogComponent {
  visible = model<boolean>(false);
  // Signal-based result of the dialog action: 'copy' | 'download' | 'cancel' | null
  action = model<'copy' | 'download' | 'cancel' | null>(null);

  @Input() jsonText: string = '';
  @Output() jsonTextChange = new EventEmitter<string>();

  onHide() {
    this.visible.set(false);
  }
}
