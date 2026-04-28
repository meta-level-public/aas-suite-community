import { Component } from '@angular/core';
import { JobSettingsFormComponent } from '../job-settings-form.component';

@Component({
  selector: 'aas-daily-expired-organisations-checker-settings',
  template: `<aas-job-settings-form
    jobKey="daily-expired-organisations-checker"
    titleKey="JOB_DAILY_EXPIRED_ORGANISATIONS_CHECKER"
    [maxIntervalMinutes]="10080"
  />`,
  imports: [JobSettingsFormComponent],
  host: { class: 'flex flex-col flex-1 min-h-0 w-full' },
})
export class DailyExpiredOrganisationsCheckerSettingsComponent {}
