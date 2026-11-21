import { Routes } from '@angular/router';
import { DeactivateGuard } from '../guards/deactivate.guard';
import { SubmodelEditorComponent } from './submodel-editor.component';

export const SUBMODEL_EDITOR_ROUTES: Routes = [
  {
    path: '',
    component: SubmodelEditorComponent,
    canDeactivate: [DeactivateGuard],
  },
];
