import { Component, ChangeDetectionStrategy } from '@angular/core';
import { JobSettingsFormComponent } from '../job-settings-form.component';

@Component({
  selector: 'aas-idta-crawler-settings',
  templateUrl: '../job-settings-page.component.html',
  imports: [JobSettingsFormComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  host: { class: 'flex flex-col flex-1 min-h-0 w-full' },
})
export class IdtaCrawlerSettingsComponent {
  protected readonly jobKey = 'idta-crawler';
  protected readonly titleKey = 'JOB_IDTA_CRAWLER';
  protected readonly maxIntervalMinutes = 10080;
}
