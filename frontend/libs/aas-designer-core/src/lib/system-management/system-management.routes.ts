import { ADDITIONAL_SYSTEM_MANAGEMENT_ROUTES } from '@aas-designer-model';
import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { AuthRoles } from '../general/model/auth-roles';
import { canActivate } from '../guards/can-activate.guard';
import { DeactivateGuard } from '../guards/deactivate.guard';
import { SystemManagementComponent } from './system-management/system-management.component';

export function getSystemManagementRoutes(): Routes {
  const additionalRoutes = inject(ADDITIONAL_SYSTEM_MANAGEMENT_ROUTES);

  return [
    {
      path: '',
      component: SystemManagementComponent,
      children: [
        {
          path: 'administration',
          loadChildren: () => import('../administration/administration.routes').then((m) => m.ADMINISTRATION_ROUTES),
          canActivate: [() => canActivate([AuthRoles.SYSTEM_ADMIN])],
        },
        {
          path: 'template-management',
          loadChildren: () =>
            import('../submodel-template/submodel-template.routes').then((m) => m.SUBMODEL_TEMPLATE_ROUTES),
          canActivate: [() => canActivate([AuthRoles.SYSTEM_ADMIN])],
          canDeactivate: [DeactivateGuard],
        },
        {
          path: 'help-text-config',
          loadChildren: () =>
            import('./help-text-management/help-text-management.routes').then((m) => m.HELP_TEXT_MANAGEMENT_ROUTES),
          canActivate: [() => canActivate([AuthRoles.SYSTEM_ADMIN])],
          canDeactivate: [DeactivateGuard],
        },
        {
          path: 'infrastructure-status',
          loadChildren: () =>
            import('./infrastructure-status/infrastructure-status.routes').then((m) => m.INFRASTRUCTURE_STATUS_ROUTES),
          canActivate: [() => canActivate([AuthRoles.SYSTEM_ADMIN])],
          canDeactivate: [DeactivateGuard],
        },
        {
          path: 'payment-model-management',
          loadChildren: () => import('../payment/payment.routes').then((m) => m.PAYMENT_ROUTES),
          canActivate: [() => canActivate([AuthRoles.SYSTEM_ADMIN])],
          canDeactivate: [DeactivateGuard],
        },
        {
          path: 'invoice',
          loadChildren: () => import('../invoice/invoice.routes').then((m) => m.INVOICE_ROUTES),
          canActivate: [() => canActivate([AuthRoles.SYSTEM_ADMIN])],
          canDeactivate: [DeactivateGuard],
        },
        {
          path: 'cors-config',
          loadChildren: () => import('@aas/common-modules').then((m) => m.corsConfigRoutes),
          canActivate: [() => canActivate([AuthRoles.SYSTEM_ADMIN])],
        },
        {
          path: 'mail-settings',
          loadChildren: () => import('./mail-settings/mail-settings.routes').then((m) => m.MAIL_SETTINGS_ROUTES),
          canActivate: [() => canActivate([AuthRoles.SYSTEM_ADMIN])],
        },
        {
          path: 'news-management',
          loadChildren: () => import('./news-management/news-management.routes').then((m) => m.NEWS_MANAGEMENT_ROUTES),
          canActivate: [() => canActivate([AuthRoles.SYSTEM_ADMIN])],
        },
        {
          path: 'legal-links-settings',
          loadChildren: () =>
            import('./legal-links-settings/legal-links-settings.routes').then((m) => m.LEGAL_LINK_SETTINGS_ROUTES),
          canActivate: [() => canActivate([AuthRoles.SYSTEM_ADMIN])],
        },
        {
          path: 'request-for-offer',
          loadChildren: () =>
            import('../request-for-offer/request-for-offer.routes').then((m) => m.REQUEST_FOR_OFFER_ROUTES),
          canActivate: [() => canActivate([AuthRoles.SYSTEM_ADMIN])],
        },
        {
          path: 'job-settings',
          loadChildren: () => import('./job-settings/job-settings.routes').then((m) => m.JOB_SETTINGS_ROUTES),
          canActivate: [() => canActivate([AuthRoles.SYSTEM_ADMIN])],
        },
        ...additionalRoutes,
      ],
    },
  ];
}

export const SYSTEM_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    loadChildren: getSystemManagementRoutes,
  },
];
