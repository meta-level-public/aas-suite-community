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

interface DppExample { name: string; format: string; url: string; }

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
  protected readonly examples = signal<DppExample[]>([]);
  protected readonly exampleGroups = computed(() => {
    const formats = [...new Set(this.examples().map((example) => example.format))];
    return formats.map((format) => ({
      format, examples: this.examples().filter((example) => example.format === format),
    }));
  });
  protected selectedExample = '';
  protected readonly openDpp = computed(() => formatOpenDppPassport(this.result()?.data));
  protected readonly basyx = computed(() => formatBaSyxPassport(this.result()?.data));
  protected readonly formatted = computed(() => this.openDpp() ?? formatPassport(this.result()?.data));
  protected readonly generic = computed(() => formatGenericPassport(this.result()?.data));
  protected readonly formattedIsBattery = computed(() =>
    this.formatted()?.groups.some((group) => group.title === 'Batteriedaten') ?? false);
  /** Key facts for UNTP/OpenDPP: battery data for batteries, otherwise origin and footprint. */
  protected readonly formattedMetrics = computed(() => {
    const groups = this.formatted()?.groups ?? [];
    const battery = groups.find((group) => group.title === 'Batteriedaten');
    if (battery) return battery.fields.slice(0, 8);
    const pick = (groupTitle: string, label: string, title = label) => {
      const field = groups.find((group) => group.title === groupTitle)?.fields.find((item) => item.label === label);
      return field ? [{ label: title, value: field.value }] : [];
    };
    return [
      ...pick('Produktidentität', 'Produktkategorie'), ...pick('Herstellung', 'Hersteller'),
      ...pick('Herstellung', 'Land', 'Herkunftsland'), ...pick('CO₂-Fußabdruck', 'Gesamt', 'CO₂-Fußabdruck'),
    ];
  });
  protected readonly iconFor = iconForLabel;
  protected readonly display = presentText;

  protected scrollToSection(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async ngOnInit(): Promise<void> {
    try {
      const config = await firstValueFrom(this.http.get<{ examples: DppExample[] }>(
        '/designer-api/plugin-api/dpp-explorer/api/examples',
        { withCredentials: true },
      ));
      this.examples.set(config.examples);
    } catch (error) {
      const response = error as HttpErrorResponse;
      this.error.set(response.status === 401
        ? 'Bitte melde dich in der AAS Suite an und waehle eine Organisation.'
        : 'Die Plugin-Konfiguration konnte nicht geladen werden.');
    }
  }

  protected async openExample(url: string): Promise<void> {
    if (!url) return;
    this.url = url;
    await this.open();
  }

  protected async open(): Promise<void> {
    if (this.url.trim() !== this.selectedExample) this.selectedExample = '';
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
