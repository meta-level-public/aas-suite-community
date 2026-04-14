import { AppRoutePaths } from '@aas/common-services';
import { Routes } from '@angular/router';
import { V3ViewerComponent } from './v3-viewer/v3-viewer.component';

export const AASX_VIEW_ROUTES: Routes = [
  {
    path: AppRoutePaths.v3View,
    component: V3ViewerComponent,
  },
  {
    path: AppRoutePaths.legacyV3View,
    component: V3ViewerComponent,
  },
  {
    path: AppRoutePaths.aasViewWithInfrastructure,
    component: V3ViewerComponent,
  },
  {
    path: AppRoutePaths.aasView,
    component: V3ViewerComponent,
  },
];
