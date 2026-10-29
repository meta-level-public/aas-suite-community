import { Component, ElementRef, inject, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { QRCodeComponent } from 'angularx-qrcode';
import { Button } from 'primeng/button';

/**
 * Shows a value (e.g. a link) as QR code and offers it as SVG download and for printing.
 * The code is always rendered black on white so that it can be scanned in the dark theme and on paper.
 */
@Component({
  selector: 'lib-qr-code-export',
  templateUrl: './qr-code-export.component.html',
  styleUrls: ['./qr-code-export.component.css'],
  imports: [QRCodeComponent, Button, TranslateModule],
})
export class QrCodeExportComponent {
  value = input.required<string>();
  /** File name of the SVG download without extension */
  fileName = input('qr-code');
  /** Optional heading printed above the code */
  caption = input('');

  private elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /** The rendered QR code as standalone SVG document */
  svgMarkup(): string {
    const svg = this.elementRef.nativeElement.querySelector('.qr-code-image svg');
    if (svg == null) return '';

    const clone = svg.cloneNode(true) as SVGElement;
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    return new XMLSerializer().serializeToString(clone);
  }

  downloadSvg() {
    const markup = this.svgMarkup();
    if (markup === '') return;

    const url = URL.createObjectURL(new Blob([markup], { type: 'image/svg+xml' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.safeFileName()}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  }

  print() {
    const markup = this.svgMarkup();
    if (markup === '') return;

    // A hidden frame prints only the code and the link instead of the whole application
    const frame = document.createElement('iframe');
    frame.setAttribute('aria-hidden', 'true');
    frame.style.position = 'fixed';
    frame.style.width = '0';
    frame.style.height = '0';
    frame.style.border = '0';
    document.body.appendChild(frame);

    const doc = frame.contentDocument;
    const win = frame.contentWindow;
    if (doc == null || win == null) {
      frame.remove();
      return;
    }

    doc.open();
    doc.write(this.printDocument(markup));
    doc.close();
    win.addEventListener('afterprint', () => frame.remove(), { once: true });
    win.focus();
    win.print();
  }

  private printDocument(svgMarkup: string): string {
    const caption = this.caption() ? `<h1>${escapeHtml(this.caption())}</h1>` : '';
    return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(this.caption() || this.value())}</title>
<style>
  body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; margin: 2cm; }
  h1 { font-size: 14pt; margin: 0 0 0.5cm; text-align: center; }
  svg { width: 8cm; height: 8cm; }
  p { font-size: 9pt; word-break: break-all; text-align: center; max-width: 12cm; }
</style></head><body>${caption}${svgMarkup}<p>${escapeHtml(this.value())}</p></body></html>`;
  }

  private safeFileName() {
    return this.fileName().replace(/[^a-zA-Z0-9._-]+/g, '_') || 'qr-code';
  }
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
