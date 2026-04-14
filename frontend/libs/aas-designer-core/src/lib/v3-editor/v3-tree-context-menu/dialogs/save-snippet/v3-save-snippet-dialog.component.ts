import { Component, Input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'aas-v3-save-snippet-dialog',
  templateUrl: './v3-save-snippet-dialog.component.html',

  imports: [FormsModule, TranslateModule, DialogModule, ButtonModule, InputTextModule, TextareaModule],
})
export class V3SaveSnippetDialogComponent {
  visible = model<boolean>(false);
  // Signal-based confirmation flag
  confirmed = model<boolean | null>(null);

  // The snippet object is mutated via two-way bindings on its properties
  @Input() snippet: any;

  onHide() {
    this.visible.set(false);
  }
}
