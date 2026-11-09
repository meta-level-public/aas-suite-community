import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { HandoverDocumentationSummary } from '../handover-documentation.service';
import { HandoverDocumentationHeroComponent } from './handover-documentation-hero.component';

describe('HandoverDocumentationHeroComponent', () => {
  let fixture: ComponentFixture<HandoverDocumentationHeroComponent>;

  async function render(summary: HandoverDocumentationSummary) {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), HandoverDocumentationHeroComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(HandoverDocumentationHeroComponent);
    fixture.componentRef.setInput('summary', summary);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  function tagTexts(element: HTMLElement) {
    return Array.from(element.querySelectorAll('p-tag')).map((tag) => tag.textContent?.trim());
  }

  it('shows the number of documents with a singular label', async () => {
    const element = await render({ documentCount: 1, classNames: [], languages: [] });

    expect(element.querySelector('.viewer-hero-eyebrow')?.textContent).toContain('HANDOVER_DOCUMENTATION');
    expect(element.querySelector('.viewer-hero-value')?.textContent).toContain('1');
    expect(element.querySelector('.viewer-hero-unit')?.textContent?.trim()).toBe('DOCUMENT');
    expect(element.querySelector('.viewer-tags')).toBeNull();
  });

  it('shows classes and languages as at most six tags and summarizes the rest', async () => {
    const element = await render({
      documentCount: 9,
      classNames: ['Operation', 'Assembly', 'Certificate', 'Drawing', 'Spare parts', 'Maintenance'],
      languages: ['DE', 'EN'],
    });

    expect(element.querySelector('.viewer-hero-unit')?.textContent?.trim()).toBe('DOCUMENTS');
    expect(tagTexts(element)).toEqual(['Operation', 'Assembly', 'Certificate', 'Drawing', 'DE', 'EN', '+2']);
    expect(element.querySelector('p-tag:last-of-type')?.getAttribute('title')).toBe('Spare parts, Maintenance');
  });
});
