import { Component, ChangeDetectionStrategy } from '@angular/core';
import { JobSettingsFormComponent } from '../job-settings-form.component';

@Component({
  selector: 'aas-statistic-calculator-settings',
  templateUrl: '../job-settings-page.component.html',
  imports: [JobSettingsFormComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  host: { class: 'flex flex-col flex-1 min-h-0 w-full' },
})
export class StatisticCalculatorSettingsComponent {
  protected readonly jobKey = 'statistic-calculator';
  protected readonly titleKey = 'JOB_STATISTIC_CALCULATOR';
  protected readonly maxIntervalMinutes = 1440;
}
