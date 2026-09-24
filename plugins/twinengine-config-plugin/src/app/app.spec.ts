import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('renders only the allowed configuration sections', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    httpTesting.expectOne('/designer-api/plugin-api/twinengine-config/api/config').flush({
      version: 1,
      dataEngine: {
        defaultLanguages: ['en', 'de'],
        templateMappings: Array.from({ length: 5 }, () => ({
          templateId: 'https://example.com/template',
          pattern: 'Pattern',
        })),
        shellTemplateMapping: { templateId: 'https://example.com/shell', pattern: '.+' },
        aasIdExtractionRule: { strategy: 'Split', pattern: '/', index: 5 },
      },
      dppPlugin: {
        submodelNameRules: [{ submodelName: 'NamePlate', patterns: ['Nameplate'] }],
        productIdExtractionRule: { pattern: '/', index: 5, strategy: 'Split', description: 'Test' },
      },
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Configuration studio');
    expect(compiled.querySelectorAll('input')).toHaveSize(17);
    expect(compiled.textContent).toContain('Data Engine');
    expect(compiled.textContent).toContain('DPP Plugin');
    expect(compiled.textContent).not.toContain('DataEngine');
    expect(compiled.textContent).not.toContain('DPP plugin rules');
  });

  it('allows mappings, rules, and patterns to be added and removed', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    httpTesting.expectOne('/designer-api/plugin-api/twinengine-config/api/config').flush({
      version: 1,
      dataEngine: {
        defaultLanguages: ['en', 'de'],
        templateMappings: [{ templateId: 'https://example.com/template', pattern: 'Pattern' }],
        shellTemplateMapping: { templateId: 'https://example.com/shell', pattern: '.+' },
        aasIdExtractionRule: { strategy: 'Split', pattern: '/', index: 5 },
      },
      dppPlugin: {
        submodelNameRules: [{ submodelName: 'NamePlate', patterns: ['Nameplate'] }],
        productIdExtractionRule: { pattern: '/', index: 5, strategy: 'Split', description: 'Test' },
      },
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('.language-row')).toHaveSize(2);
    (compiled.querySelector('[aria-label="Sprache hinzufügen"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(compiled.querySelectorAll('.language-row')).toHaveSize(3);

    (compiled.querySelector('[aria-label="Sprache 3 löschen"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(compiled.querySelectorAll('.language-row')).toHaveSize(2);

    (
      compiled.querySelector('[aria-label="Template-Mapping hinzufügen"]') as HTMLButtonElement
    ).click();
    fixture.detectChanges();
    expect(compiled.querySelectorAll('.mapping-row')).toHaveSize(2);

    (
      compiled.querySelector('[aria-label="Template-Mapping 2 löschen"]') as HTMLButtonElement
    ).click();
    fixture.detectChanges();
    expect(compiled.querySelectorAll('.mapping-row')).toHaveSize(1);

    (compiled.querySelector('[role="tab"]:last-child') as HTMLButtonElement).click();
    fixture.detectChanges();
    (
      compiled.querySelector('[aria-label="Extraktionsregel hinzufügen"]') as HTMLButtonElement
    ).click();
    fixture.detectChanges();
    expect(compiled.querySelectorAll('.rule-card')).toHaveSize(2);

    (
      compiled.querySelector('[aria-label="Pattern zu Regel 1 hinzufügen"]') as HTMLButtonElement
    ).click();
    fixture.detectChanges();
    expect(
      compiled.querySelectorAll('.rule-card').item(0).querySelectorAll('.pattern-row'),
    ).toHaveSize(2);
  });

  it('clears a mapping validation result when the mapping changes', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance as unknown as {
      clearMappingValidation(index: number): void;
      mappingWarnings: {
        set(value: Partial<Record<number, string[]>>): void;
        (): Partial<Record<number, string[]>>;
      };
      mappingSuccesses: {
        set(value: Partial<Record<number, string>>): void;
        (): Partial<Record<number, string>>;
      };
    };
    app.mappingWarnings.set({ 0: ['Missing template'] });
    app.mappingSuccesses.set({ 0: 'Template found' });

    app.clearMappingValidation(0);

    expect(app.mappingWarnings()[0]).toBeUndefined();
    expect(app.mappingSuccesses()[0]).toBeUndefined();
  });
});
