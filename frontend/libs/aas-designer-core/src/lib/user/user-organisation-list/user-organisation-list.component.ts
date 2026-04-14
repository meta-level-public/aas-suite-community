import { HelpLabelComponent } from '@aas/common-components';
import { Component, inject, OnChanges, OnInit } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
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
