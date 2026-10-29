import { AppConfigService, PortalService } from '@aas/common-services';
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';

interface DisclaimerLink {
  label: string;
  href: string;
  /** Label is a translation key */
  translate: boolean;
}

@Component({
  selector: 'aas-disclaimer',
  templateUrl: './disclaimer.component.html',
  styleUrls: ['./disclaimer.component.css'],
  imports: [CommonModule, TranslateModule, ButtonModule],
})
export class DisclaimerComponent {
  @Input() direction: 'vertical' | 'horizontal' = 'horizontal';
  @Input() withAasSuite: boolean = false;
  /** Small links without separators, e.g. for page footers */
  @Input() compact: boolean = false;

  constructor(
    public portalService: PortalService,
    public appConfigService: AppConfigService,
  ) {}

  get links(): DisclaimerLink[] {
    const config = this.appConfigService.config;
    const german = this.portalService.currentLanguage.toLowerCase() === 'de';
    return [
      ...(this.withAasSuite ? [{ label: 'AAS Suite', href: config.aasSuiteLink, translate: false }] : []),
      { label: 'Meta-Level Software AG', href: 'https://meta-level.de', translate: false },
      { label: 'PRIVACY_OPEN', href: german ? config.datenschutzLinkDe : config.datenschutzLinkEn, translate: true },
      { label: 'AVV', href: german ? config.avvLinkDe : config.avvLinkEn, translate: true },
      { label: 'AGB_OPEN', href: german ? config.agbLinkDe : config.agbLinkEn, translate: true },
      { label: 'IMPRINT', href: config.imprintLink, translate: true },
    ];
  }
}
