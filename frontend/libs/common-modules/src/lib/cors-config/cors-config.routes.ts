import { Routes } from '@angular/router';
import { CorsListComponent } from './cors-list/cors-list.component';

export const corsConfigRoutes: Routes = [
  {
    path: '',
    component: CorsListComponent,
  },
];
