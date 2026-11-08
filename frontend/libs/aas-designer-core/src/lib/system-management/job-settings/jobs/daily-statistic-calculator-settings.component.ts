import { Component, ChangeDetectionStrategy } from '@angular/core';
import { JobSettingsFormComponent } from '../job-settings-form.component';

@Component({
  selector: 'aas-daily-statistic-calculator-settings',
  templateUrl: '../job-settings-page.component.html',
  imports: [JobSettingsFormComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  host: { class: 'flex flex-col flex-1 min-h-0 w-full' },
})
export class DailyStatisticCalculatorSettingsComponent {
  protected readonly jobKey = 'daily-statistic-calculator';
  protected readonly titleKey = 'JOB_DAILY_STATISTIC_CALCULATOR';
  protected readonly maxIntervalMinutes = 10080;
}
