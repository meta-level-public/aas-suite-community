import { OrganisationAdminUebersichtDto } from '@aas-designer-model';
import { BreadcrumbService } from '@aas/aas-designer-shared';
import { DateProxyPipe } from '@aas/common-pipes';
import { AasConfirmationService, NotificationService } from '@aas/common-services';
import { OrganisationClient, SystemConfigurationDto, SystemManagementClient } from '@aas/webapi-client';
import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MenuItem, PrimeTemplate } from 'primeng/api';
import { Button } from 'primeng/button';
import { Menu } from 'primeng/menu';
import { Table, TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { lastValueFrom } from 'rxjs';
import { AdministratorService } from './administrator.service';

@Component({
  selector: 'aas-administration',
  templateUrl: './administration.component.html',
  styleUrls: ['../../host.scss'],
  imports: [Button, RouterLink, TableModule, PrimeTemplate, Button, Menu, Tag, TranslateModule, DateProxyPipe],
})
export class AdministrationComponent implements OnInit {
  organisations: OrganisationAdminUebersichtDto[] = [];
  menuItems: MenuItem[] = [];
  items: MenuItem[] = [];
  @ViewChild('dtOrga') dtOrga: Table | undefined;

  loading = false;
  stateKey = 'orgaTable_admin';

  systemConfguration = signal<SystemConfigurationDto | null>(null);
  systemManagementClient = inject(SystemManagementClient);
  orgaClient = inject(OrganisationClient);

  columns: any[] = [
    { field: 'orgaName' },
    { field: 'orgaEmail' },
    { field: 'strasse' },
    { field: 'plz' },
    { field: 'ort' },
    { field: 'aktiv' },
    { field: 'anzahlNutzer' },
    { field: 'hatGueltigesAbo' },
    { field: 'anlageDatum' },
    { field: 'aenderungsDatum' },
  ];

  constructor(
    private translate: TranslateService,
    private administrationService: AdministratorService,
    private confirmationService: AasConfirmationService,
    private notificationService: NotificationService,
    private breadcrumbService: BreadcrumbService,
  ) {
    this.breadcrumbService.setItems([{ label: translate.instant('ORGANIZATIONS') }]);
  }

  async ngOnInit() {
    this.loadData();
    this.systemConfguration.set(await lastValueFrom(this.systemManagementClient.systemManagement_GetConfiguration()));
  }

  async changeActiveStatusOfSelectedOrga(organisation: OrganisationAdminUebersichtDto) {
    if (organisation.id == null) {
      return;
    }
    try {
      this.loading = true;
      const newStatus = !organisation.aktiv;
      await this.administrationService.changeStatus(newStatus, organisation.id);
      this.notificationService.showMessageAlways('SUCCESS_CHANGE_ORGANIZATION_STATUS', 'SUCCESS', 'success', false);
      organisation.aktiv = newStatus;
      this.loadData();
    } finally {
      this.loading = false;
    }
  }

  async deleteOrganisation(organisation: OrganisationAdminUebersichtDto) {
    const deleted = await this.administrationService.deleteOrganisationById(organisation.id as number);

    if (deleted) {
      this.loadData();
    }
  }

  onShowActions(organisation: OrganisationAdminUebersichtDto) {
    this.menuItems = [
      {
        label: this.translate.instant('EDIT'),
        icon: 'pi pi-pencil',
        routerLink: `./edit/${organisation.id}`,
      },
      {
        label: this.getLabel(organisation.aktiv),
        icon: this.getIcon(organisation.aktiv),
        command: (_event) => {
          this.changeActiveStatusOfSelectedOrga(organisation);
        },
      },

      {
        label: this.translate.instant('DELETE'),
        icon: 'pi pi-trash',
        command: async () => {
          if (
            await this.confirmationService.confirm({
              message: `${this.translate.instant('DELETE_CURRENT_ORGANIZATION')} ${organisation.orgaName}`,
            })
          ) {
            this.deleteOrganisation(organisation);
          }
        },
      },
    ];
    if (this.systemConfguration()?.singleTenantMode === false) {
      this.menuItems.push({
        label: this.translate.instant('CREATE_INFRASTRUCTURE'),
        icon: 'pi pi-server',
        command: (_event) => {
          this.createInfrastructure(organisation);
        },
      });
    }
  }

  async createInfrastructure(orga: OrganisationAdminUebersichtDto) {
    if (
      await this.confirmationService.confirm({
        message: this.translate.instant('RECREATE_INFRASTRUCTURE_Q'),
      })
    ) {
      await lastValueFrom(this.orgaClient.organisation_CreateInfrastructure(orga.id));
    }
  }

  getIcon(activeStatus: boolean | undefined) {
    return activeStatus ? 'pi pi-lock' : 'pi pi-unlock';
  }

  getLabel(activeStatus: boolean | undefined) {
    return activeStatus ? this.translate.instant('DEACTIVATE') : this.translate.instant('ACTIVATE');
  }

  async loadData() {
    try {
      this.loading = true;

      this.organisations = await this.administrationService.getAllOrganisationDto();
    } finally {
      this.loading = false;
    }
  }

  getTagSeverity(status: boolean) {
    return status ? 'success' : 'danger';
  }

  resetFilter() {
    this.dtOrga?.reset();
    sessionStorage.removeItem(this.stateKey);
  }
}
