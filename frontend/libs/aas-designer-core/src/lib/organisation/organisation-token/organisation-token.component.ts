import { DateProxyPipe } from '@aas/common-pipes';
import { AasConfirmationService, NotificationService } from '@aas/common-services';
import { AasInfrastructureClient, AvailableInfastructure, OrgaTokenDto } from '@aas/webapi-client';
import { Clipboard } from '@angular/cdk/clipboard';
import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MenuItem, PrimeTemplate } from 'primeng/api';
import { Button } from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
import { DatePicker } from 'primeng/datepicker';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Menu } from 'primeng/menu';
import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { Textarea } from 'primeng/textarea';
import { lastValueFrom } from 'rxjs';
import { v4 as uuid } from 'uuid';
import { Organisation } from '@aas-designer-model';
import { OrganisationService } from '../organisation.service';

@Component({
  selector: 'aas-organisation-token',
  templateUrl: './organisation-token.component.html',
  imports: [
    Button,
    TableModule,
    PrimeTemplate,
    Button,
    Menu,
    Dialog,
    FormsModule,
    Textarea,
    Select,
    DatePicker,
    InputText,
    Checkbox,
    TranslateModule,
    DateProxyPipe,
  ],
})
export class OrganisationTokenComponent implements OnInit {
  @ViewChild('adminOrgaEditForm') form!: NgForm;
  menuItems: MenuItem[] = [];
  loading = false;
  organisation: Organisation | undefined;
  orgaTokens: OrgaTokenDto[] = [];
  newOrgaToken: OrgaTokenDto | null = null;
  addTokenDialogVisible: boolean = false;
  benutzerName: string = '';
  availableScopes: string[] = [];

  infrastructureClient = inject(AasInfrastructureClient);
  availableInfrastructures = signal<AvailableInfastructure[]>([]);

  constructor(
    private orgaService: OrganisationService,
    private notificationService: NotificationService,
    private translate: TranslateService,
    private clipboard: Clipboard,
    private confirmationService: AasConfirmationService,
  ) {}

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    this.orgaTokens = await this.orgaService.getOrgaTokens();
    this.availableScopes = await this.orgaService.getAvailableScopes();
    this.availableInfrastructures.set(
      await lastValueFrom(this.infrastructureClient.aasInfrastructure_GetAvailableInfrastructures()),
    );
  }

  showAddTokenDialog() {
    this.addTokenDialogVisible = true;
    this.newOrgaToken = new OrgaTokenDto();
    this.newOrgaToken.key = uuid();
  }

  copyTokenToClipboard() {
    if (this.newOrgaToken != null) {
      this.clipboard.copy(this.newOrgaToken.key ?? '');
      this.notificationService.showMessageAlways('TOKEN_COPIED', 'SUCCESS', 'success', false);
    }
  }

  async saveToken() {
    if (this.newOrgaToken != null) {
      try {
        this.loading = true;
        const newOrgaToken = await this.orgaService.addOrgaToken(this.newOrgaToken);
        this.orgaTokens.push(newOrgaToken);
        this.addTokenDialogVisible = false;
      } finally {
        this.loading = false;
      }
    }
  }

  onShowActions(token: OrgaTokenDto) {
    this.menuItems = [
      {
        label: this.translate.instant('DEACTIVATE'),
        icon: 'pi pi-lock',
        command: (_event) => this.deactivateToken(token),
        visible: token.active === true,
      },
      {
        label: this.translate.instant('ACTIVATE'),
        icon: 'pi pi-unlock',
        visible: token.active !== true,
        command: (_event) => this.activateToken(token),
      },
      {
        label: this.translate.instant('DELETE'),
        icon: 'pi pi-trash',
        command: () => this.deleteToken(token),
      },
      {
        label: this.translate.instant('COPY_TOKEN'),
        icon: 'pi pi-copy',
        command: () => {
          this.clipboard.copy(token.key ?? '');
          this.notificationService.showMessageAlways('TOKEN_COPIED', 'SUCCESS', 'success', false);
        },
      },
    ];
  }

  async deactivateToken(token: OrgaTokenDto) {
    try {
      this.loading = true;
      if (token.id != null) {
        await this.orgaService.deactivateToken(token.id);
        token.active = false;
      }
    } finally {
      this.loading = false;
    }
  }

  async activateToken(token: OrgaTokenDto) {
    try {
      this.loading = true;
      if (token.id != null) {
        await this.orgaService.activateToken(token.id);
        token.active = true;
      }
    } finally {
      this.loading = false;
    }
  }

  async deleteToken(token: OrgaTokenDto) {
    if (
      (await this.confirmationService.confirm({
        message: this.translate.instant('DELETE_TOKEN_Q'),
      })) === true
    ) {
      if (token.id != null) {
        await this.orgaService.deleteToken(token.id);
        const indx = this.orgaTokens.indexOf(token);
        this.orgaTokens.splice(indx, 1);
        this.orgaTokens = this.orgaTokens.slice();
      }
    }
  }
}
