import { ADDITIONAL_ORGANISATION_ROUTES } from '@aas-designer-model';
import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { OrgaPaymentModelListComponent } from '../payment/orga-payment-model-list/orga-payment-model-list.component';
import { EclassDetailsComponent } from './eclass-details/eclass-details.component';
import { InfrastructureParentComponent } from './infrastructure/infrastructure-parent/infrastructure-parent.component';
import { InfrastructureComponent } from './infrastructure/infrastructure.component';
import { MyOrganisationComponent } from './my-organisation/my-organisation.component';
import { OrgaDetailsComponent } from './orga-details/orga-details.component';
import { OrganisationTokenComponent } from './organisation-token/organisation-token.component';
import { OrganisationUserComponent } from './organisation-user/organisation-user.component';
import { UserInvitationListComponent } from './user-invitation-list/user-invitation-list.component';

// Factory function to create routes with injected additional routes
export function getOrganisationRoutes(): Routes {
  const additionalRoutes = inject(ADDITIONAL_ORGANISATION_ROUTES);

  return [
    {
      path: '',
      component: MyOrganisationComponent,
      children: [
        {
          path: '',
          redirectTo: 'details',
          pathMatch: 'full',
        },
        {
          path: 'details',
          component: OrgaDetailsComponent,
        },
        {
          path: 'users',
          component: OrganisationUserComponent,
        },
        {
          path: 'invitations',
          component: UserInvitationListComponent,
        },
        {
          path: 'eclass',
          component: EclassDetailsComponent,
        },
        {
          path: 'token',
          component: OrganisationTokenComponent,
        },
        {
          path: 'infrastructure',
          component: InfrastructureParentComponent,
        },
        {
          path: 'infrastructure/:id',
          component: InfrastructureComponent,
        },
        {
          path: 'payment-model',
          component: OrgaPaymentModelListComponent,
        },
        // Additional routes injected from apps
        ...additionalRoutes,
      ],
    },
  ];
}

// For backward compatibility
export const ORGANISATION_ROUTES: Routes = [
  {
    path: '',
    loadChildren: getOrganisationRoutes,
  },
];
