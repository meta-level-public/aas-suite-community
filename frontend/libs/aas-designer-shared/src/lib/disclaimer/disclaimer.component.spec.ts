import { AppConfigService, PortalService } from '@aas/common-services';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { DisclaimerComponent } from './disclaimer.component';

describe('DisclaimerComponent', () => {
  let fixture: ComponentFixture<DisclaimerComponent>;
  const portalService = { currentLanguage: 'de' };

  beforeEach(() => {
    portalService.currentLanguage = 'de';
    TestBed.configureTestingModule({
      imports: [DisclaimerComponent, TranslateModule.forRoot()],
      providers: [
        { provide: PortalService, useValue: portalService },
        {
          provide: AppConfigService,
          useValue: {
            config: {
              aasSuiteLink: 'https://aas-suite.example',
              datenschutzLinkDe: 'https://example/datenschutz',
              datenschutzLinkEn: 'https://example/privacy',
              avvLinkDe: 'https://example/avv',
              avvLinkEn: 'https://example/dpa',
              agbLinkDe: 'https://example/agb',
              agbLinkEn: 'https://example/terms',
              imprintLink: 'https://example/imprint',
            },
          },
        },
      ],
    });
    fixture = TestBed.createComponent(DisclaimerComponent);
  });

  const hrefs = () =>
    Array.from(fixture.nativeElement.querySelectorAll('a') as NodeListOf<HTMLAnchorElement>).map((a) =>
      a.getAttribute('href'),
    );
  const separators = () => fixture.nativeElement.querySelectorAll('.disclaimer-separator').length;

  it('separates the links with dots by default', () => {
    fixture.detectChanges();

    expect(hrefs()).toEqual([
      'https://meta-level.de',
      'https://example/datenschutz',
      'https://example/avv',
      'https://example/agb',
      'https://example/imprint',
    ]);
    expect(separators()).toBe(4);
  });

  it('shows small links without separators in the compact variant', () => {
    fixture.componentInstance.compact = true;
    fixture.componentInstance.withAasSuite = true;
    fixture.detectChanges();

    expect(hrefs()[0]).toBe('https://aas-suite.example');
    expect(hrefs()).toHaveLength(6);
    expect(separators()).toBe(0);
    expect(fixture.nativeElement.querySelector('.disclaimer-compact')).not.toBeNull();
  });

  it('links the English documents for other languages', () => {
    portalService.currentLanguage = 'en';
    fixture.detectChanges();

    expect(hrefs()).toContain('https://example/privacy');
    expect(hrefs()).toContain('https://example/dpa');
    expect(hrefs()).toContain('https://example/terms');
  });
});
