import { Component } from '@angular/core';
import { JobSettingsFormComponent } from '../job-settings-form.component';

@Component({
  selector: 'aas-statistic-calculator-settings',
  template: `<aas-job-settings-form
    jobKey="statistic-calculator"
    titleKey="JOB_STATISTIC_CALCULATOR"
    [maxIntervalMinutes]="1440"
  />`,
  imports: [JobSettingsFormComponent],
  host: { class: 'flex flex-col flex-1 min-h-0 w-full' },
})
export class StatisticCalculatorSettingsComponent {}
