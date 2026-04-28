import { NotificationService } from '@aas/common-services';
import { Component, inject, input, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { JobSettingsDto, JobSettingsService } from './job-settings.service';

@Component({
  selector: 'aas-job-settings-form',
  templateUrl: './job-settings-form.component.html',
  imports: [TranslateModule, FormsModule, ButtonModule, InputNumberModule, ToggleSwitchModule],
  host: { class: 'flex flex-col flex-1 min-h-0 w-full' },
})
export class JobSettingsFormComponent implements OnInit {
  readonly jobKey = input.required<string>();
  readonly titleKey = input.required<string>();
  readonly maxIntervalMinutes = input<number>(10080);

  private readonly jobSettingsService = inject(JobSettingsService);
  private readonly notificationService = inject(NotificationService);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly settings = signal<JobSettingsDto>({ intervalMinutes: 60, isEnabled: true });

  async ngOnInit(): Promise<void> {
    await this.loadData();
  }

  async loadData(): Promise<void> {
    try {
      this.loading.set(true);
      const result = await this.jobSettingsService.getSettings(this.jobKey());
      this.settings.set(result);
    } catch {
      this.notificationService.showMessageAlways('JOB_SETTINGS_LOAD_ERROR', 'ERROR', 'error', false);
    } finally {
      this.loading.set(false);
    }
  }

  async save(): Promise<void> {
    try {
      this.saving.set(true);
      const result = await this.jobSettingsService.updateSettings(this.jobKey(), this.settings());
      this.settings.set(result);
      this.notificationService.showMessageAlways('SAVED', 'SUCCESS', 'success', false);
    } catch {
      this.notificationService.showMessageAlways('SAVE_ERROR', 'ERROR', 'error', false);
    } finally {
      this.saving.set(false);
    }
  }

  setIntervalMinutes(value: number): void {
    this.settings.update((s) => ({ ...s, intervalMinutes: value }));
  }

  setEnabled(value: boolean): void {
    this.settings.update((s) => ({ ...s, isEnabled: value }));
  }
}
