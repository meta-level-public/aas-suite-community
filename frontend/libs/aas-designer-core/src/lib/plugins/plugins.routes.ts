import { Routes } from '@angular/router';
import { PluginOverviewComponent } from './plugin-overview/plugin-overview.component';

export const PLUGINS_ROUTES: Routes = [
  {
    path: '',
    component: PluginOverviewComponent,
  },
];
