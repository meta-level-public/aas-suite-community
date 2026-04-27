import { Component } from '@angular/core';
import { JobSettingsFormComponent } from '../job-settings-form.component';

@Component({
  selector: 'aas-periodic-organisation-deleter-settings',
  template: `<aas-job-settings-form
    jobKey="periodic-organisation-deleter"
    titleKey="JOB_PERIODIC_ORGANISATION_DELETER"
    [maxIntervalMinutes]="10080"
  />`,
  imports: [JobSettingsFormComponent],
  host: { class: 'flex flex-col flex-1 min-h-0 w-full' },
})
export class PeriodicOrganisationDeleterSettingsComponent {}
