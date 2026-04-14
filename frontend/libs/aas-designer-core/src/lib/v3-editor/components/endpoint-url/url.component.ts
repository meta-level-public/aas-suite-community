import { Clipboard } from '@angular/cdk/clipboard';

import { Component, computed, inject, input, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { NotificationService } from '@aas/common-services';
import { MarkdownModule, provideMarkdown } from 'ngx-markdown';
import 'prismjs';
import 'prismjs/components/prism-bash';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'aas-url',
  imports: [TranslateModule, ButtonModule, MarkdownModule],
  providers: [provideMarkdown()],
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
