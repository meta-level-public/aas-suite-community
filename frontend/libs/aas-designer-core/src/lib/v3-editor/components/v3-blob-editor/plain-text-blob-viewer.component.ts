import { Component, computed, input, ChangeDetectionStrategy } from '@angular/core';
import { marked } from 'marked';
import { MarkdownModule, provideMarkdown } from 'ngx-markdown';
import { loadPrismLanguages } from '../../../general/prism/prism-loader';

// Load Prism (core + languages) for code highlighting in production builds
void loadPrismLanguages('json', 'typescript', 'yaml', 'powershell', 'ruby', 'batch');

@Component({
  selector: 'aas-plain-text-blob-viewer',
  imports: [MarkdownModule],
  providers: [provideMarkdown()],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './plain-text-blob-viewer.component.html',
})
export class PlainTextBlobViewerComponent {
  blobValue = input.required<Uint8Array>();
  blobIdShort = input.required<string>();
  type = input<string | null>(null);

  renderedMarked = computed(() => {
    const renderedMarkdown = marked(this.blobContentString());
    return renderedMarkdown;
  });

  blobContentString = computed(() => {
    const blobValue = this.blobValue();
    const decoder = new TextDecoder('utf-8');
    const s = decoder.decode(blobValue);

    return s;
  });

  markdownLang = computed(() => {
    const type = this.type();
    if (type != null) {
      return type;
    }
    if (this.blobIdShort().endsWith('_dot_css')) {
      return 'css\n';
    }
    if (this.blobIdShort().endsWith('_dot_html')) {
      return 'html\n';
    }
    if (this.blobIdShort().endsWith('_dot_yml')) {
      return 'yaml\n';
    }
    if (this.blobIdShort().endsWith('_dot_ps1')) {
      return 'powershell\n';
    }
    if (this.blobIdShort().endsWith('_dot_rb')) {
      return 'ruby\n';
    }
    if (this.blobIdShort().endsWith('_dot_bat')) {
      return 'batch\n';
    }
    return 'none';
  });
}
