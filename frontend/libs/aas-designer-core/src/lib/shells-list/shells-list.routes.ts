import { Routes } from '@angular/router';
import { RegistryCorrectionComponent } from './registry-correction/registry-correction.component';
import { ShellsListComponent } from './shells-list.component';

export const SHELLS_LIST_ROUTES: Routes = [
  {
    path: ':aasId/registry-correction',
    component: RegistryCorrectionComponent,
  },
  {
    path: '',
    component: ShellsListComponent,
  },
];
