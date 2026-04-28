import { Routes } from '@angular/router';

export const JOB_SETTINGS_ROUTES: Routes = [
  {
    path: 'statistic-calculator',
    loadComponent: () =>
      import('./jobs/statistic-calculator-settings.component').then((m) => m.StatisticCalculatorSettingsComponent),
  },
  {
    path: 'daily-statistic-calculator',
    loadComponent: () =>
      import('./jobs/daily-statistic-calculator-settings.component').then(
        (m) => m.DailyStatisticCalculatorSettingsComponent,
      ),
  },
  {
    path: 'daily-expired-organisations-checker',
    loadComponent: () =>
      import('./jobs/daily-expired-organisations-checker-settings.component').then(
        (m) => m.DailyExpiredOrganisationsCheckerSettingsComponent,
      ),
  },
  {
    path: 'periodic-organisation-deleter',
    loadComponent: () =>
      import('./jobs/periodic-organisation-deleter-settings.component').then(
        (m) => m.PeriodicOrganisationDeleterSettingsComponent,
      ),
  },
  {
    path: 'periodic-infrastructure-deleter',
    loadComponent: () =>
      import('./jobs/periodic-infrastructure-deleter-settings.component').then(
        (m) => m.PeriodicInfrastructureDeleterSettingsComponent,
      ),
  },
  {
    path: 'idta-crawler',
    loadComponent: () => import('./jobs/idta-crawler-settings.component').then((m) => m.IdtaCrawlerSettingsComponent),
  },
  {
    path: 'pcn-update-listener',
    loadComponent: () =>
      import('./jobs/pcn-update-listener-settings.component').then((m) => m.PcnUpdateListenerSettingsComponent),
  },
  { path: '', redirectTo: 'statistic-calculator', pathMatch: 'full' },
];
