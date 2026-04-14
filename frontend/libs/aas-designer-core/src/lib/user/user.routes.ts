import { Routes } from '@angular/router';
import { AppRoutePaths, AppRouteSegments } from '@aas/common-services';
import { AddressCatalogComponent } from '../catalog/address-catalog/address-catalog.component';
import { ProductDesignationCatalogComponent } from '../catalog/product-designation-catalog/product-designation-catalog.component';
import { ProductFamilyCatalogComponent } from '../catalog/product-family-catalog/product-family-catalog.component';
import { ProductRootCatalogComponent } from '../catalog/product-root-catalog/product-root-catalog.component';
import { SnippetsCatalogComponent } from '../catalog/snippets-catalog/snippets-catalog.component';
import { MySharedLinksComponent } from './my-shared-links/my-shared-links.component';
import { MyUserdataComponent } from './my-userdata/my-userdata.component';
import { ProfileComponent } from './profile/profile.component';
import { UserOrganisationListComponent } from './user-organisation-list/user-organisation-list.component';

export const USER_ROUTES: Routes = [
  {
    path: '',
    component: MyUserdataComponent,
    children: [
      {
        path: '',
        redirectTo: AppRoutePaths.mySpaceProfile,
        pathMatch: 'full',
      },
      {
        path: AppRoutePaths.mySpaceProfile,
        component: ProfileComponent,
      },
      {
        path: AppRouteSegments.organisations,
        component: UserOrganisationListComponent,
      },
      {
        path: AppRouteSegments.snippets,
        component: SnippetsCatalogComponent,
      },
      {
        path: AppRouteSegments.addresses,
        component: AddressCatalogComponent,
      },
      {
        path: AppRouteSegments.productDesignation,
        component: ProductDesignationCatalogComponent,
      },
      {
        path: AppRouteSegments.productFamily,
        component: ProductFamilyCatalogComponent,
      },
      {
        path: AppRouteSegments.productRoot,
        component: ProductRootCatalogComponent,
      },
      {
        path: AppRouteSegments.sharedLinks,
        component: MySharedLinksComponent,
      },
    ],
  },
];
