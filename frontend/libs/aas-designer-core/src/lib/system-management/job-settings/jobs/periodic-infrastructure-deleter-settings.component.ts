import { Component, ChangeDetectionStrategy } from '@angular/core';
import { JobSettingsFormComponent } from '../job-settings-form.component';

@Component({
  selector: 'aas-periodic-infrastructure-deleter-settings',
  templateUrl: '../job-settings-page.component.html',
  imports: [JobSettingsFormComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  host: { class: 'flex flex-col flex-1 min-h-0 w-full' },
})
export class PeriodicInfrastructureDeleterSettingsComponent {
  protected readonly jobKey = 'periodic-infrastructure-deleter';
  protected readonly titleKey = 'JOB_PERIODIC_INFRASTRUCTURE_DELETER';
  protected readonly maxIntervalMinutes = 10080;
}
