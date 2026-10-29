import { Component, input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { QRCodeComponent } from 'angularx-qrcode';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { QrCodeExportComponent } from './qr-code-export.component';

const LINK = 'https://suite.example.com/public-viewer?accesscode=15c9a4fc';

// angularx-qrcode cannot render SVG in jsdom, so a fixed code stands in for it
@Component({
  selector: 'qrcode',
  template:
    '<svg width="256" height="256" viewBox="0 0 21 21"><path fill="#ffffff" d="M0 0h21v21H0z"/><path stroke="#000000" d="M1 1h7"/></svg>',
})
class QrCodeStubComponent {
  qrdata = input('');
  elementType = input('');
  width = input(0);
  margin = input(0);
  errorCorrectionLevel = input('');
  colorDark = input('');
  colorLight = input('');
  ariaLabel = input('');
}

describe('QrCodeExportComponent', () => {
  let fixture: ComponentFixture<QrCodeExportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [QrCodeExportComponent, TranslateModule.forRoot()] }).overrideComponent(
      QrCodeExportComponent,
      { remove: { imports: [QRCodeComponent] }, add: { imports: [QrCodeStubComponent] } },
    );
    fixture = TestBed.createComponent(QrCodeExportComponent);
    fixture.componentRef.setInput('value', LINK);
    fixture.componentRef.setInput('fileName', 'shared-link_urn:test:aas');
    fixture.componentRef.setInput('caption', 'urn:test:aas');
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.querySelectorAll('iframe').forEach((frame) => frame.remove());
  });

  it('renders the value as standalone black on white SVG', () => {
    const markup = fixture.componentInstance.svgMarkup();

    expect(markup.startsWith('<svg')).toBe(true);
    expect(markup).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(markup).toContain('#000000');
    expect(markup).toContain('#ffffff');
    expect(fixture.nativeElement.textContent).toContain(LINK);
  });

  it('downloads the SVG with a file system safe name', () => {
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:qr');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);

    fixture.componentInstance.downloadSvg();

    const link = click.mock.contexts[0] as HTMLAnchorElement;
    expect(link.download).toBe('shared-link_urn_test_aas.svg');
    expect(link.href).toBe('blob:qr');
    const blob = vi.mocked(URL.createObjectURL).mock.calls[0][0] as Blob;
    expect(blob.type).toBe('image/svg+xml');
  });

  it('prints only the code with caption and link', () => {
    const print = vi.fn();
    const appendChild = document.body.appendChild.bind(document.body);
    vi.spyOn(document.body, 'appendChild').mockImplementation((node) => {
      const appended = appendChild(node);
      if (node instanceof HTMLIFrameElement && node.contentWindow != null) {
        node.contentWindow.print = print;
        node.contentWindow.focus = vi.fn();
      }
      return appended;
    });

    fixture.componentInstance.print();

    const frame = document.querySelector('iframe');
    const printed = frame?.contentDocument?.body;
    expect(print).toHaveBeenCalledTimes(1);
    expect(printed?.querySelector('svg')).not.toBeNull();
    expect(printed?.querySelector('h1')?.textContent).toBe('urn:test:aas');
    expect(printed?.querySelector('p')?.textContent).toBe(LINK);
  });
});
