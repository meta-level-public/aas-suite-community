import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from '@openng/optimus-ui/button';
import { ConfirmDialogModule } from '@openng/optimus-ui/confirmdialog';

@Component({
  selector: 'aas-confirm-dialog',
  imports: [ConfirmDialogModule, ButtonModule, TranslateModule],
  templateUrl: './confirm-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./confirm-dialog.component.css'],
})
export class ConfirmDialogComponent {}
