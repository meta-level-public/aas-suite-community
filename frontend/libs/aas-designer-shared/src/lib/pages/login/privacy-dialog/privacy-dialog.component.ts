import { SafePipe } from '@aas/common-pipes';
import { AppConfigService, PortalService } from '@aas/common-services';
import { Component, inject, input, output, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from '@openng/optimus-ui/button';
import { DialogModule } from '@openng/optimus-ui/dialog';

@Component({
  selector: 'aas-privacy-dialog',
  imports: [FormsModule, DialogModule, TranslateModule, ButtonModule, SafePipe],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './privacy-dialog.component.html',
})
export class PrivacyDialogComponent {
  portalService = inject(PortalService);
  appConfigService = inject(AppConfigService);

  showPrivacy = input.required<boolean>();

  doAccept = output<boolean>();

  accept() {
    this.doAccept.emit(true);
  }
  reject() {
    this.doAccept.emit(false);
  }
}
