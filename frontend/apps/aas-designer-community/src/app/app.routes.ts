import { AuthRoles } from '@aas-designer-model';
import {
  AppAccessdeniedComponent,
  AppErrorComponent,
  AppForbiddenComponent,
  AppMainComponent,
  AppNotfoundComponent,
  canActivate,
  CreateInvitedAccountComponent,
  PublicViewerComponent,
  SsoLoginSuccessComponent,
} from '@aas/aas-designer-shared';
import { AppRoutePaths, AppRouteSegments } from '@aas/common-services';
import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  {
    path: '',
    component: AppMainComponent,
    children: [
      {
        path: AppRoutePaths.empty,
        loadComponent: () => import('@aas/login-community').then((m) => m.AppLoginComponent),
      },
      {
        path: AppRoutePaths.contact,
        loadComponent: () => import('@aas/login-community').then((m) => m.AppLoginComponent),
      },
      {
        path: AppRoutePaths.contactWithId,
        loadComponent: () => import('@aas/login-community').then((m) => m.AppLoginComponent),
      },
      {
        path: AppRoutePaths.createInvitedAccount,
        component: CreateInvitedAccountComponent,
      },
      {
        path: AppRouteSegments.generator,
        loadChildren: () => import('@aas/aas-designer-core').then((m) => m.GENERATOR_ROUTES),
        canActivate: [() => canActivate([AuthRoles.BENUTZER, AuthRoles.ORGA_ADMIN, AuthRoles.SYSTEM_ADMIN])],
      },
      {
        path: AppRouteSegments.viewer,
        loadChildren: () => import('@aas/aas-designer-core').then((m) => m.AASX_VIEW_ROUTES),
        canActivate: [() => canActivate([AuthRoles.BENUTZER, AuthRoles.ORGA_ADMIN, AuthRoles.SYSTEM_ADMIN])],
      },
      {
        path: AppRouteSegments.instanceViewer,
        loadChildren: () => import('@aas/aas-designer-core').then((m) => m.INSTANCE_VIEWER_ROUTES),
        canActivate: [() => canActivate([AuthRoles.BENUTZER, AuthRoles.ORGA_ADMIN, AuthRoles.SYSTEM_ADMIN])],
      },
      {
        path: AppRouteSegments.shellsList,
        loadChildren: () => import('@aas/aas-designer-core').then((m) => m.SHELLS_LIST_ROUTES),
        canActivate: [() => canActivate([AuthRoles.BENUTZER, AuthRoles.ORGA_ADMIN, AuthRoles.SYSTEM_ADMIN])],
      },
      {
        path: AppRouteSegments.cdsList,
        loadChildren: () => import('@aas/aas-designer-core').then((m) => m.CDS_LIST_ROUTES),
        canActivate: [() => canActivate([AuthRoles.BENUTZER, AuthRoles.ORGA_ADMIN, AuthRoles.SYSTEM_ADMIN])],
      },
      {
        path: AppRoutePaths.cdEditWithInfrastructure,
        loadChildren: () => import('@aas/aas-designer-core').then((m) => m.CD_EDIT_ROUTES),
        canActivate: [() => canActivate([AuthRoles.BENUTZER, AuthRoles.ORGA_ADMIN, AuthRoles.SYSTEM_ADMIN])],
      },
      {
        path: AppRoutePaths.cdEdit,
        loadChildren: () => import('@aas/aas-designer-core').then((m) => m.CD_EDIT_ROUTES),
        canActivate: [() => canActivate([AuthRoles.BENUTZER, AuthRoles.ORGA_ADMIN, AuthRoles.SYSTEM_ADMIN])],
      },
      {
        path: AppRouteSegments.submodels,
        loadChildren: () => import('@aas/aas-designer-core').then((m) => m.IDTA_SUBMODELS_ROUTES),
        canActivate: [() => canActivate([AuthRoles.BENUTZER, AuthRoles.ORGA_ADMIN, AuthRoles.SYSTEM_ADMIN])],
      },
      {
        path: AppRouteSegments.mySpace,
        loadChildren: () => import('@aas/aas-designer-core').then((m) => m.USER_ROUTES),
        canActivate: [() => canActivate([AuthRoles.BENUTZER, AuthRoles.ORGA_ADMIN, AuthRoles.SYSTEM_ADMIN])],
      },
      {
        path: AppRouteSegments.systemManagement,
        loadChildren: () => import('@aas/aas-designer-core').then((m) => m.SYSTEM_MANAGEMENT_ROUTES),
        canActivate: [() => canActivate([AuthRoles.SYSTEM_ADMIN])],
      },
      {
        path: AppRouteSegments.myOrganization,
        loadChildren: () => import('@aas/aas-designer-core').then((m) => m.ORGANISATION_ROUTES),
        canActivate: [() => canActivate([AuthRoles.ORGA_ADMIN])],
      },
      {
        path: AppRouteSegments.aas,
        children: [
          {
            path: AppRoutePaths.empty,
            loadChildren: () => import('@aas/aas-designer-core').then((m) => m.GENERATOR_ROUTES),
            canActivate: [() => canActivate([AuthRoles.BENUTZER, AuthRoles.ORGA_ADMIN, AuthRoles.SYSTEM_ADMIN])],
          },
          {
            path: AppRouteSegments.v3,
            loadChildren: () => import('@aas/aas-designer-core').then((m) => m.V3_EDITOR_ROUTES),
          },
        ],
      },
    ],
  },
  {
    path: AppRouteSegments.publicViewer,
    component: PublicViewerComponent,
  },
  {
    path: AppRouteSegments.ssoLoginSuccess,
    component: SsoLoginSuccessComponent,
  },
  { path: AppRouteSegments.ssoLoginStatusLegacy, redirectTo: AppRouteSegments.ssoLoginSuccess, pathMatch: 'full' },
  {
    path: AppRouteSegments.error,
    component: AppErrorComponent,
  },
  {
    path: AppRouteSegments.access,
    component: AppAccessdeniedComponent,
  },
  {
    path: AppRouteSegments.notFound,
    component: AppNotfoundComponent,
  },
  { path: AppRouteSegments.login, redirectTo: '/' },
  {
    path: AppRouteSegments.forbidden,
    component: AppForbiddenComponent,
  },
  { path: '**', redirectTo: '/' },
];
