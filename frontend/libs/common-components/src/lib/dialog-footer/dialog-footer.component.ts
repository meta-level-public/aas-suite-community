import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'lib-dialog-footer',
  templateUrl: './dialog-footer.component.html',
  imports: [TranslateModule, Button],
})
export class DialogFooter {
  constructor(public ref: DynamicDialogRef) {}

  closeDialog(data: any) {
    this.ref.close(data);
  }
}
