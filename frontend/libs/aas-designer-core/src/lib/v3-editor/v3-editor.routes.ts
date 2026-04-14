import { Routes } from '@angular/router';
import { AuthRoles } from '../general/model/auth-roles';
import { canActivate } from '../guards/can-activate.guard';
import { DeactivateGuard } from '../guards/deactivate.guard';
import { EditorStartComponent } from './editor-start/editor-start.component';

export const V3_EDITOR_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: 'repo-edit/:infrastructureId/:aasId',
        component: EditorStartComponent,
        canActivate: [() => canActivate([AuthRoles.BENUTZER, AuthRoles.ORGA_ADMIN, AuthRoles.SYSTEM_ADMIN])],
        canDeactivate: [DeactivateGuard],
      },
      {
        path: 'repo-edit/:aasId',
        component: EditorStartComponent,
        canActivate: [() => canActivate([AuthRoles.BENUTZER, AuthRoles.ORGA_ADMIN, AuthRoles.SYSTEM_ADMIN])],
        canDeactivate: [DeactivateGuard],
      },
    ],
  },
];
