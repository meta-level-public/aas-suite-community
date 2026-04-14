import { Routes } from '@angular/router';
import { AdministrationCreateComponent } from './administration-create/administration-create.component';
import { AdministrationEditComponent } from './administration-edit/administration-edit.component';
import { AdministrationComponent } from './administration.component';

export const ADMINISTRATION_ROUTES: Routes = [
  {
    path: '',
    component: AdministrationComponent,
  },
  {
    path: 'create',
    component: AdministrationCreateComponent,
  },
  {
    path: 'edit/:id',
    component: AdministrationEditComponent,
  },
];
