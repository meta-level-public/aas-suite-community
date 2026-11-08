import { Component, ChangeDetectionStrategy } from '@angular/core';
import { JobSettingsFormComponent } from '../job-settings-form.component';

@Component({
  selector: 'aas-pcn-update-listener-settings',
  templateUrl: '../job-settings-page.component.html',
  imports: [JobSettingsFormComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  host: { class: 'flex flex-col flex-1 min-h-0 w-full' },
})
export class PcnUpdateListenerSettingsComponent {
  protected readonly jobKey = 'pcn-update-listener';
  protected readonly titleKey = 'JOB_PCN_UPDATE_LISTENER';
  protected readonly maxIntervalMinutes = 1440;
}
