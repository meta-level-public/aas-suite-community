import { Component, Input, model, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from '@openng/optimus-ui/button';
import { DialogModule } from '@openng/optimus-ui/dialog';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { TextareaModule } from '@openng/optimus-ui/textarea';

@Component({
  selector: 'aas-v3-save-snippet-dialog',
  templateUrl: './v3-save-snippet-dialog.component.html',

  changeDetection: ChangeDetectionStrategy.Eager,
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
