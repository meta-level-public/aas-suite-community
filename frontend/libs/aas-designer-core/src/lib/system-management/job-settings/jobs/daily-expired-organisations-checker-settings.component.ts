import { Component, ChangeDetectionStrategy } from '@angular/core';
import { JobSettingsFormComponent } from '../job-settings-form.component';

@Component({
  selector: 'aas-daily-expired-organisations-checker-settings',
  templateUrl: '../job-settings-page.component.html',
  imports: [JobSettingsFormComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  host: { class: 'flex flex-col flex-1 min-h-0 w-full' },
})
export class DailyExpiredOrganisationsCheckerSettingsComponent {
  protected readonly jobKey = 'daily-expired-organisations-checker';
  protected readonly titleKey = 'JOB_DAILY_EXPIRED_ORGANISATIONS_CHECKER';
  protected readonly maxIntervalMinutes = 10080;
}
