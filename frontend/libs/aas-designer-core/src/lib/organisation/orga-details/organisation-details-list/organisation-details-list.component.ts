import { HelpLabelComponent } from '@aas/common-components';
import { OrganisationUebersichtDto } from '@aas/webapi-client';
import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from '@openng/optimus-ui/button';
import { InputGroupModule } from '@openng/optimus-ui/inputgroup';
import { InputGroupAddonModule } from '@openng/optimus-ui/inputgroupaddon';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { TableModule } from '@openng/optimus-ui/table';

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
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['../../../../host.scss'],
})
export class OrganisationDetailsListComponent {
  organisation = input.required<OrganisationUebersichtDto>();
}
