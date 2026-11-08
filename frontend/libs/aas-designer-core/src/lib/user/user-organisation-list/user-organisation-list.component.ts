import { HelpLabelComponent } from '@aas/common-components';
import { Component, inject, OnChanges, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MenuItem } from '@openng/optimus-ui/api';
import { InputGroupModule } from '@openng/optimus-ui/inputgroup';
import { InputGroupAddonModule } from '@openng/optimus-ui/inputgroupaddon';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { TableModule } from '@openng/optimus-ui/table';
import { TagModule } from '@openng/optimus-ui/tag';
import { ToolbarModule } from '@openng/optimus-ui/toolbar';
import { UserOrganisationUebersicht } from './user-organisation-uebersicht';
import { UserOrganisationUebersichtService } from './user-organisation-uebersicht.service';

@Component({
  selector: 'aas-user-organisation-list',
  imports: [
    TranslateModule,
    TableModule,
    TagModule,
    ToolbarModule,
    InputTextModule,
    InputGroupModule,
    InputGroupAddonModule,
    HelpLabelComponent,
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './user-organisation-list.component.html',
})
export class UserOrganisationListComponent implements OnInit, OnChanges {
  userOrgaService = inject(UserOrganisationUebersichtService);
  translate = inject(TranslateService);
  organisations: UserOrganisationUebersicht[] = [];
  loading = false;
  menuItems: MenuItem[] = [];

  ngOnInit(): void {
    this.loadData();
  }

  ngOnChanges(): void {
    this.loadData();
  }

  async loadData() {
    try {
      this.loading = true;
      this.organisations = await this.userOrgaService.getUserOrgas();
    } finally {
      this.loading = false;
    }
  }

  onShowActions(_conn: UserOrganisationUebersicht) {
    this.menuItems = [];
    this.menuItems = [
      {
        label: this.translate.instant('EDIT'),
        icon: 'pi pi-pencil',
        // command: () => this.editConnection(conn),
      },
      {
        label: this.translate.instant('DELETE'),
        icon: 'pi pi-trash',
        // command: () => this.deleteConnection(conn),
      },
    ];
  }

  getTagSeverity(status: boolean) {
    return status ? 'success' : 'danger';
  }
}
