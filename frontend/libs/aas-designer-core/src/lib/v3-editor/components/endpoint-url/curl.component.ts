import { Clipboard } from '@angular/cdk/clipboard';

import { Component, computed, inject, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { NotificationService } from '@aas/common-services';
import { MarkdownModule, provideMarkdown } from 'ngx-markdown';
import 'prismjs';
import 'prismjs/components/prism-bash';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'aas-curl',
  imports: [TranslateModule, ButtonModule, MarkdownModule],
  providers: [provideMarkdown()],
  templateUrl: './curl.component.html',
})
export class CurlComponent {
  curlCode = input.required<string>();

  notificationService = inject(NotificationService);
  clipboard = inject(Clipboard);

  copyToClipboard(text: string) {
    this.clipboard.copy(text);
    this.notificationService.showMessageAlways('COPIED', 'SUCCESS', 'success', false);
  }

  preCode = computed<string>(() => {
    return ` \`\`\`bash
      ${this.curlCode()}`;
  });
}
