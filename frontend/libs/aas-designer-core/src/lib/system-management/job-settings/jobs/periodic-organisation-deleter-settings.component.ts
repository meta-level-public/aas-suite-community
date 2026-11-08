import { Component, ChangeDetectionStrategy } from '@angular/core';
import { JobSettingsFormComponent } from '../job-settings-form.component';

@Component({
  selector: 'aas-periodic-organisation-deleter-settings',
  templateUrl: '../job-settings-page.component.html',
  imports: [JobSettingsFormComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  host: { class: 'flex flex-col flex-1 min-h-0 w-full' },
})
export class PeriodicOrganisationDeleterSettingsComponent {
  protected readonly jobKey = 'periodic-organisation-deleter';
  protected readonly titleKey = 'JOB_PERIODIC_ORGANISATION_DELETER';
  protected readonly maxIntervalMinutes = 10080;
}
