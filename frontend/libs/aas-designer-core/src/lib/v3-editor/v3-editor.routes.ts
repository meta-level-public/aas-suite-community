import { Routes } from '@angular/router';
import { AuthRoles } from '../general/model/auth-roles';
import { canActivate } from '../guards/can-activate.guard';
import { DeactivateGuard } from '../guards/deactivate.guard';
import { EditorStartComponent } from './editor-start/editor-start.component';

// Editing needs the write right on the current infrastructure (SHELLS_EDITOR), for administrators as well
export const V3_EDITOR_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: 'repo-edit/:infrastructureId/:aasId',
        component: EditorStartComponent,
        canActivate: [() => canActivate([AuthRoles.SHELLS_EDITOR])],
        canDeactivate: [DeactivateGuard],
      },
      {
        path: 'repo-edit/:aasId',
        component: EditorStartComponent,
        canActivate: [() => canActivate([AuthRoles.SHELLS_EDITOR])],
        canDeactivate: [DeactivateGuard],
      },
    ],
  },
];
