import { Component } from '@angular/core';
import { JobSettingsFormComponent } from '../job-settings-form.component';

@Component({
  selector: 'aas-daily-statistic-calculator-settings',
  template: `<aas-job-settings-form
    jobKey="daily-statistic-calculator"
    titleKey="JOB_DAILY_STATISTIC_CALCULATOR"
    [maxIntervalMinutes]="10080"
  />`,
  imports: [JobSettingsFormComponent],
  host: { class: 'flex flex-col flex-1 min-h-0 w-full' },
})
export class DailyStatisticCalculatorSettingsComponent {}
