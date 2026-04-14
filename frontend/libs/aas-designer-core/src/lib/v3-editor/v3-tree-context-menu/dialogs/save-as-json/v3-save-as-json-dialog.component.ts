import { Component, EventEmitter, Input, Output, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'aas-v3-save-as-json-dialog',
  templateUrl: './v3-save-as-json-dialog.component.html',

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
