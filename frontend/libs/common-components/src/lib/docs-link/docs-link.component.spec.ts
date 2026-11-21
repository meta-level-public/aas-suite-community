import { DocsTopic, docsTopic, UserDocsService } from '@aas/common-services';
import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DocsLinkComponent } from './docs-link.component';

describe('DocsLinkComponent', () => {
  let urlFor: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    urlFor = vi.fn();
    TestBed.configureTestingModule({
      imports: [DocsLinkComponent, TranslateModule.forRoot()],
      providers: [{ provide: UserDocsService, useValue: { urlFor } }],
    });
  });

  function render(topic: DocsTopic) {
    const fixture = TestBed.createComponent(DocsLinkComponent);
    fixture.componentRef.setInput('topic', topic);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('links to the documentation page in a new tab', () => {
    urlFor.mockReturnValue('https://docs.example.com/designer/pcn#mitteilung-versenden-hersteller');

    const link = render(docsTopic('designer/pcn', 'mitteilung-versenden-hersteller')).querySelector('a');

    expect(urlFor).toHaveBeenCalledWith('designer/pcn#mitteilung-versenden-hersteller');
    expect(link?.getAttribute('href')).toBe('https://docs.example.com/designer/pcn#mitteilung-versenden-hersteller');
    expect(link?.getAttribute('target')).toBe('_blank');
    expect(link?.getAttribute('rel')).toBe('noopener');
  });

  it('is hidden if no documentation is configured', () => {
    urlFor.mockReturnValue(null);

    expect(render(docsTopic('designer/pcn')).querySelector('a')).toBeNull();
  });
});
