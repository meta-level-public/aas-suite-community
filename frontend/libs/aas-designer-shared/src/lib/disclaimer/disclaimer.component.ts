import { AppConfigService, PortalService } from '@aas/common-services';
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'aas-disclaimer',
  templateUrl: './disclaimer.component.html',
  imports: [CommonModule, TranslateModule, ButtonModule],
})
export class DisclaimerComponent {
  @Input() direction: 'vertical' | 'horizontal' = 'horizontal';
  @Input() withAasSuite: boolean = false;

  constructor(
    public portalService: PortalService,
    public appConfigService: AppConfigService,
  ) {}
}
