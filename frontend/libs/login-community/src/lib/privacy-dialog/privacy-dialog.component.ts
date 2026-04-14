import { PortalService } from '@aas/common-services';
import { SafePipe } from '@aas/common-pipes';
import { AppConfigService } from '@aas/common-services';
import { Component, inject, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'aas-privacy-dialog',
  imports: [FormsModule, DialogModule, TranslateModule, ButtonModule, SafePipe],
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
