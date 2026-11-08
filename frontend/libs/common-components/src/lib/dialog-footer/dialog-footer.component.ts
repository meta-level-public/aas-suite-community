import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Button } from '@openng/optimus-ui/button';
import { DynamicDialogRef } from '@openng/optimus-ui/dynamicdialog';

@Component({
  selector: 'lib-dialog-footer',
  templateUrl: './dialog-footer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, Button],
})
export class DialogFooter {
  constructor(public ref: DynamicDialogRef) {}

  closeDialog(data: any) {
    this.ref.close(data);
  }
}
