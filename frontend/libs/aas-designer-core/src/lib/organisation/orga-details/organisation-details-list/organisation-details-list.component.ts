import { HelpLabelComponent } from '@aas/common-components';
import { OrganisationUebersichtDto } from '@aas/webapi-client';
import { Component, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'aas-organisation-details-list',
  templateUrl: './organisation-details-list.component.html',
  imports: [
    TableModule,
    ButtonModule,
    TranslateModule,
    InputGroupModule,
    InputGroupAddonModule,
    InputTextModule,
    HelpLabelComponent,
  ],
  styleUrls: ['../../../../host.scss'],
})
export class OrganisationDetailsListComponent {
  organisation = input.required<OrganisationUebersichtDto>();
}
