import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { HelpResult } from './help-confirmation.service';

@Component({
  selector: 'aas-help-confirmation',
  templateUrl: './help-confirmation.component.html',
  imports: [Checkbox, FormsModule, Button, TranslateModule],
})
export class HelpConfirmationComponent {
  result: HelpResult = {} as HelpResult;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
  ) {}

  reject() {
    this.result.result = false;
    this.result.type = this.config.data.options.type;
    this.ref.close(this.result);
  }

  accept() {
    this.result.result = true;
    this.result.type = this.config.data.options.type;
    this.ref.close(this.result);
  }
}
