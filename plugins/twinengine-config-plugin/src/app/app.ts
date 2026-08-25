import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfigApiService, TwinEngineConfig } from './config-api.service';

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private readonly api = inject(ConfigApiService);
  protected config = signal<TwinEngineConfig | null>(null);
  protected status = signal('Lade Konfiguration ...');
  protected busy = signal(false);
  protected errors = signal<string[]>([]);

  ngOnInit(): void { this.load(); }
  load(): void { this.busy.set(true); this.api.getConfig().subscribe({ next: (config) => { this.config.set(config); this.status.set(`Version ${config.version} geladen`); }, error: () => this.status.set('API nicht erreichbar'), complete: () => this.busy.set(false) }); }
  save(): void { const config = this.config(); if (!config) return; this.busy.set(true); this.api.saveConfig(config).subscribe({ next: (saved) => { this.config.set(saved); this.errors.set([]); this.status.set(`Entwurf Version ${saved.version} gespeichert`); }, error: (error) => this.showErrors(error), complete: () => this.busy.set(false) }); }
  validate(): void { const config = this.config(); if (!config) return; this.busy.set(true); this.api.validateConfig(config).subscribe({ next: (result) => { this.errors.set(result.errors); this.status.set(result.valid ? 'Konfiguration ist gültig' : 'Konfiguration enthält Fehler'); }, error: (error) => this.showErrors(error), complete: () => this.busy.set(false) }); }
  export(): void { this.busy.set(true); this.api.exportConfig().subscribe({ next: (result) => this.status.set(`Export Version ${result.version} erstellt`), error: (error) => this.showErrors(error), complete: () => this.busy.set(false) }); }
  addMapping(): void { this.config.update((value) => value ? { ...value, templateMappings: [...value.templateMappings, { templateId: '', pattern: '' }] } : value); }
  removeMapping(index: number): void { this.config.update((value) => value ? { ...value, templateMappings: value.templateMappings.filter((_, itemIndex) => itemIndex !== index) } : value); }
  addRule(): void { this.config.update((value) => value ? { ...value, dppPlugin: { ...value.dppPlugin, submodelNameRules: [...value.dppPlugin.submodelNameRules, { submodelName: '', patterns: [''] }] } } : value); }
  removeRule(index: number): void { this.config.update((value) => value ? { ...value, dppPlugin: { ...value.dppPlugin, submodelNameRules: value.dppPlugin.submodelNameRules.filter((_, itemIndex) => itemIndex !== index) } } : value); }
  updatePatterns(rule: { patterns: string[] }, value: string): void { rule.patterns = value.split(',').map((item) => item.trim()).filter(Boolean); }
  protected showErrors(error: { error?: { errors?: string[] } }): void { this.errors.set(error.error?.errors || ['Unbekannter API-Fehler']); this.status.set('Aktion fehlgeschlagen'); }
}
