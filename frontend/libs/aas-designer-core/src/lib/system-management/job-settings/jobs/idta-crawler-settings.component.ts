import { Component } from '@angular/core';
import { JobSettingsFormComponent } from '../job-settings-form.component';

@Component({
  selector: 'aas-idta-crawler-settings',
  template: `<aas-job-settings-form jobKey="idta-crawler" titleKey="JOB_IDTA_CRAWLER" [maxIntervalMinutes]="10080" />`,
  imports: [JobSettingsFormComponent],
  host: { class: 'flex flex-col flex-1 min-h-0 w-full' },
})
export class IdtaCrawlerSettingsComponent {}
