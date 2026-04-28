import { Component } from '@angular/core';
import { JobSettingsFormComponent } from '../job-settings-form.component';

@Component({
  selector: 'aas-pcn-update-listener-settings',
  template: `<aas-job-settings-form
    jobKey="pcn-update-listener"
    titleKey="JOB_PCN_UPDATE_LISTENER"
    [maxIntervalMinutes]="1440"
  />`,
  imports: [JobSettingsFormComponent],
  host: { class: 'flex flex-col flex-1 min-h-0 w-full' },
})
export class PcnUpdateListenerSettingsComponent {}
