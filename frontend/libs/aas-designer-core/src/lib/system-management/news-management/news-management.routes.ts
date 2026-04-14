import { Routes } from '@angular/router';
import { NewsManagementEditorComponent } from './news-management-editor.component';
import { NewsManagementComponent } from './news-management.component';

export const NEWS_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    component: NewsManagementComponent,
  },
  {
    path: 'new',
    component: NewsManagementEditorComponent,
  },
  {
    path: ':id',
    component: NewsManagementEditorComponent,
  },
];
