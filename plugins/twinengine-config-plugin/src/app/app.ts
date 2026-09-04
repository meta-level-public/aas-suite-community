import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { map, switchMap } from 'rxjs';
import { ConfigApiService, NameRule, TwinEngineConfig } from './config-api.service';

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private readonly api = inject(ConfigApiService);
  protected config = signal<TwinEngineConfig | null>(null);
  protected status = signal('Lade Konfiguration ...');
  protected busy = signal(false);
  protected errors = signal<string[]>([]);
  protected mappingWarnings = signal<Partial<Record<number, string[]>>>({});
  protected mappingSuccesses = signal<Partial<Record<number, string>>>({});
  protected shellTemplateWarning = signal<string | null>(null);
  protected shellTemplateSuccess = signal<string | null>(null);
  protected templateRepositoryWarning = signal<string | null>(null);
  protected activeTab = signal<'dataEngine' | 'dppPlugin'>('dataEngine');

  ngOnInit(): void {
    this.load();
  }
  load(): void {
    this.busy.set(true);
    this.api.getConfig().subscribe({
      next: (config) => {
        this.config.set(config);
        this.status.set(`Version ${config.version} geladen`);
      },
      error: () => this.status.set('API nicht erreichbar'),
      complete: () => this.busy.set(false),
    });
  }
  save(): void {
    const config = this.config();
    if (!config) return;
    this.busy.set(true);
    this.api.saveConfig(config).subscribe({
      next: (saved) => {
        this.config.set(saved);
        this.errors.set([]);
        this.status.set(`Entwurf Version ${saved.version} gespeichert`);
      },
      error: (error) => this.showErrors(error),
      complete: () => this.busy.set(false),
    });
  }
  validate(): void {
    const config = this.config();
    if (!config) return;
    this.busy.set(true);
    this.api
      .validateConfig(config)
      .pipe(
        switchMap((result) =>
          this.api
            .validateTemplateMappings(
              config.dataEngine.templateMappings,
              config.dataEngine.shellTemplateMapping,
            )
            .pipe(map((templateValidation) => ({ result, templateValidation }))),
        ),
      )
      .subscribe({
        next: ({ result, templateValidation }) => {
          this.errors.set(result.errors);
          this.mappingWarnings.set(templateValidation.mappingWarnings);
          this.mappingSuccesses.set(templateValidation.mappingSuccesses);
          this.shellTemplateWarning.set(templateValidation.shellTemplateWarning ?? null);
          this.shellTemplateSuccess.set(templateValidation.shellTemplateSuccess ?? null);
          this.templateRepositoryWarning.set(templateValidation.generalWarning ?? null);
          this.status.set(
            result.valid ? 'Konfiguration ist gültig' : 'Konfiguration enthält Fehler',
          );
        },
        error: (error) => this.showErrors(error),
        complete: () => this.busy.set(false),
      });
  }
  export(): void {
    this.busy.set(true);
    this.api.exportConfig().subscribe({
      next: (result) => this.status.set(`Export Version ${result.version} erstellt`),
      error: (error) => this.showErrors(error),
      complete: () => this.busy.set(false),
    });
  }
  addLanguage(): void {
    this.config.update((config) =>
      config
        ? {
            ...config,
            dataEngine: {
              ...config.dataEngine,
              defaultLanguages: [...config.dataEngine.defaultLanguages, ''],
            },
          }
        : config,
    );
  }
  removeLanguage(index: number): void {
    this.config.update((config) =>
      config && config.dataEngine.defaultLanguages.length > 1
        ? {
            ...config,
            dataEngine: {
              ...config.dataEngine,
              defaultLanguages: config.dataEngine.defaultLanguages.filter(
                (_, itemIndex) => itemIndex !== index,
              ),
            },
          }
        : config,
    );
  }
  addMapping(): void {
    this.clearMappingValidationResults();
    this.config.update((config) =>
      config
        ? {
            ...config,
            dataEngine: {
              ...config.dataEngine,
              templateMappings: [
                ...config.dataEngine.templateMappings,
                { templateId: '', pattern: '' },
              ],
            },
          }
        : config,
    );
  }
  removeMapping(index: number): void {
    this.clearMappingValidationResults();
    this.config.update((config) =>
      config
        ? {
            ...config,
            dataEngine: {
              ...config.dataEngine,
              templateMappings: config.dataEngine.templateMappings.filter(
                (_, itemIndex) => itemIndex !== index,
              ),
            },
          }
        : config,
    );
  }
  addRule(): void {
    this.config.update((config) =>
      config
        ? {
            ...config,
            dppPlugin: {
              ...config.dppPlugin,
              submodelNameRules: [...config.dppPlugin.submodelNameRules, this.createRule()],
            },
          }
        : config,
    );
  }
  removeRule(index: number): void {
    this.config.update((config) =>
      config
        ? {
            ...config,
            dppPlugin: {
              ...config.dppPlugin,
              submodelNameRules: config.dppPlugin.submodelNameRules.filter(
                (_, itemIndex) => itemIndex !== index,
              ),
            },
          }
        : config,
    );
  }
  addPattern(ruleIndex: number): void {
    this.config.update((config) =>
      config
        ? {
            ...config,
            dppPlugin: {
              ...config.dppPlugin,
              submodelNameRules: config.dppPlugin.submodelNameRules.map((rule, index) =>
                index === ruleIndex ? { ...rule, patterns: [...rule.patterns, ''] } : rule,
              ),
            },
          }
        : config,
    );
  }
  removePattern(ruleIndex: number, patternIndex: number): void {
    this.config.update((config) =>
      config
        ? {
            ...config,
            dppPlugin: {
              ...config.dppPlugin,
              submodelNameRules: config.dppPlugin.submodelNameRules.map((rule, index) =>
                index === ruleIndex && rule.patterns.length > 1
                  ? {
                      ...rule,
                      patterns: rule.patterns.filter((_, itemIndex) => itemIndex !== patternIndex),
                    }
                  : rule,
              ),
            },
          }
        : config,
    );
  }
  protected showErrors(error: { error?: { errors?: string[] } }): void {
    this.errors.set(error.error?.errors || ['Unbekannter API-Fehler']);
    this.status.set('Aktion fehlgeschlagen');
  }
  clearMappingValidation(index: number): void {
    this.mappingWarnings.update((warnings) => this.withoutIndex(warnings, index));
    this.mappingSuccesses.update((successes) => this.withoutIndex(successes, index));
  }
  clearShellTemplateValidation(): void {
    this.shellTemplateWarning.set(null);
    this.shellTemplateSuccess.set(null);
  }
  private createRule(): NameRule {
    return { submodelName: '', patterns: [''] };
  }
  private clearMappingValidationResults(): void {
    this.mappingWarnings.set({});
    this.mappingSuccesses.set({});
  }
  private withoutIndex<T>(
    values: Partial<Record<number, T>>,
    index: number,
  ): Partial<Record<number, T>> {
    const { [index]: _, ...remaining } = values;
    return remaining;
  }
}
