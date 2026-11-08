import { Clipboard } from '@angular/cdk/clipboard';

import { Component, computed, inject, input, signal, ChangeDetectionStrategy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { NotificationService } from '@aas/common-services';
import { MarkdownModule, provideMarkdown } from 'ngx-markdown';
import { ButtonModule } from '@openng/optimus-ui/button';
import { loadPrismLanguages } from '../../../general/prism/prism-loader';

// Load Prism (core + languages) for code highlighting in production builds
void loadPrismLanguages('bash');

@Component({
  selector: 'aas-url',
  imports: [TranslateModule, ButtonModule, MarkdownModule],
  providers: [provideMarkdown()],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './url.component.html',
})
export class UrlComponent {
  endpointUrl = input.required<string>();
  notificationService = inject(NotificationService);
  clipboard = inject(Clipboard);
  visible = signal<boolean>(false);

  preEndpointUrl = computed<string>(() => {
    return ` \`\`\`bash

    ${this.endpointUrl()}
          `;
  });

  copyToClipboard(text: string) {
    this.clipboard.copy(text);
    this.notificationService.showMessageAlways('COPIED', 'SUCCESS', 'success', false);
  }
}
