import { ADDITIONAL_USER_SPACE_ROUTES } from '@aas-designer-model';
import { AppRoutePaths, AppRouteSegments } from '@aas/common-services';
import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { AddressCatalogComponent } from '../catalog/address-catalog/address-catalog.component';
import { ProductDesignationCatalogComponent } from '../catalog/product-designation-catalog/product-designation-catalog.component';
import { ProductFamilyCatalogComponent } from '../catalog/product-family-catalog/product-family-catalog.component';
import { ProductRootCatalogComponent } from '../catalog/product-root-catalog/product-root-catalog.component';
import { SnippetsCatalogComponent } from '../catalog/snippets-catalog/snippets-catalog.component';
import { MySharedLinksComponent } from './my-shared-links/my-shared-links.component';
import { MyUserdataComponent } from './my-userdata/my-userdata.component';
import { ProfileComponent } from './profile/profile.component';
import { UserOrganisationListComponent } from './user-organisation-list/user-organisation-list.component';

export function getUserRoutes(): Routes {
  const additionalRoutes = inject(ADDITIONAL_USER_SPACE_ROUTES);

  return [
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
        ...additionalRoutes,
      ],
    },
  ];
}

export const USER_ROUTES: Routes = [
  {
    path: '',
    loadChildren: getUserRoutes,
  },
];
