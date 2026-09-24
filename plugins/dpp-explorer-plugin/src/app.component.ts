import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { formatPassport } from './passport-view-model';
import { formatOpenDppPassport } from './opendpp-passport';
import { formatGenericPassport } from './generic-passport';
import { formatBaSyxPassport, presentText } from './basyx-passport';
import { BaSyxViewComponent } from './basyx-view.component';
import { IconComponent } from './icon.component';
import { iconForLabel } from './icons';

interface PassResponse {
  sourceUrl: string;
  fetchedAtUtc: string;
  data: unknown;
}

interface DppSource { name: string; host: string; exampleUrl: string; }
interface SourceConfig { sources: DppSource[]; canManage: boolean; }

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, BaSyxViewComponent, IconComponent],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  private readonly http = inject(HttpClient);
  protected url = '';
  protected readonly loading = signal(false);
  protected readonly error = signal('');
  protected readonly result = signal<PassResponse | null>(null);
  protected readonly sources = signal<DppSource[]>([]);
  protected readonly canManage = signal(false);
  protected readonly editing = signal(false);
  protected readonly saving = signal(false);
  protected readonly saveMessage = signal('');
  protected draft: DppSource[] = [];
  protected readonly openDpp = computed(() => formatOpenDppPassport(this.result()?.data));
  protected readonly basyx = computed(() => formatBaSyxPassport(this.result()?.data));
  protected readonly formatted = computed(() => this.openDpp() ?? formatPassport(this.result()?.data));
  protected readonly generic = computed(() => formatGenericPassport(this.result()?.data));
  /** Key facts for UNTP/OpenDPP: battery data first, product identity as fallback. */
  protected readonly formattedMetrics = computed(() => {
    const groups = this.formatted()?.groups ?? [];
    const battery = groups.find((group) => group.title === 'Batteriedaten');
    return battery ? battery.fields.slice(0, 8) : (groups[0]?.fields ?? []).slice(0, 4);
  });
  protected readonly iconFor = iconForLabel;
  protected readonly display = presentText;

  protected scrollToSection(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async ngOnInit(): Promise<void> {
    try {
      const config = await firstValueFrom(this.http.get<SourceConfig>(
        '/designer-api/plugin-api/dpp-explorer/api/config',
        { withCredentials: true },
      ));
      this.sources.set(config.sources);
      this.canManage.set(config.canManage);
      this.draft = config.sources.map((source) => ({ ...source }));
      if (!this.url && config.sources[0]?.exampleUrl) this.url = config.sources[0].exampleUrl;
    } catch (error) {
      const response = error as HttpErrorResponse;
      this.error.set(response.status === 401
        ? 'Bitte melde dich in der AAS Suite an und waehle eine Organisation.'
        : 'Die Plugin-Konfiguration konnte nicht geladen werden.');
    }
  }

  protected editSources(): void {
    this.draft = this.sources().map((source) => ({ ...source }));
    this.saveMessage.set('');
    this.editing.set(true);
  }

  protected addSource(): void {
    this.draft = [...this.draft, { name: '', host: '', exampleUrl: '' }];
  }

  protected removeSource(index: number): void {
    this.draft = this.draft.filter((_, current) => current !== index);
  }

  protected async saveSources(): Promise<void> {
    this.saveMessage.set('');
    this.saving.set(true);
    try {
      await firstValueFrom(this.http.get('/bff/csrf', { responseType: 'text', withCredentials: true }));
      const config = await firstValueFrom(this.http.put<SourceConfig>(
        '/designer-api/plugin-api/dpp-explorer/api/config',
        this.draft.map((source) => ({
          name: source.name.trim(), host: source.host.trim().toLowerCase(), exampleUrl: source.exampleUrl.trim(),
        })),
      ));
      this.sources.set(config.sources);
      this.editing.set(false);
      this.saveMessage.set('Freigegebene Hosts gespeichert.');
    } catch (error) {
      const response = error as HttpErrorResponse;
      this.saveMessage.set(response.error?.error ?? 'Freigegebene Hosts konnten nicht gespeichert werden.');
    } finally {
      this.saving.set(false);
    }
  }

  protected async open(): Promise<void> {
    this.error.set('');
    this.result.set(null);
    const input = this.url.trim();
    if (!input) return;
    this.loading.set(true);
    try {
      const response = await firstValueFrom(this.http.get<PassResponse>(
        '/designer-api/plugin-api/dpp-explorer/api/pass',
        { params: { url: input }, withCredentials: true },
      ));
      this.result.set(response);
    } catch (error) {
      const response = error as HttpErrorResponse;
      this.error.set(response.error?.error ?? 'Der Pass konnte nicht geladen werden.');
    } finally {
      this.loading.set(false);
    }
  }

}
