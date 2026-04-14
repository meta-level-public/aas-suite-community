import { OrgaPaymentModel, PaymentModel } from '@aas-designer-model';
import { SystemConfigurationDto, SystemManagementClient } from '@aas/webapi-client';
import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MenuItem, PrimeTemplate } from 'primeng/api';
import { PaymentService } from '../payment.service';

import { OrgaUserSeatStats } from '@aas-designer-model';
import { DateProxyPipe } from '@aas/common-pipes';
import { AasConfirmationService } from '@aas/common-services';
import { CurrencyPipe, registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import localeDeExtra from '@angular/common/locales/extra/de';
import { signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { Dialog } from 'primeng/dialog';
import { Menu } from 'primeng/menu';
import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { Toolbar } from 'primeng/toolbar';
import { Tooltip } from 'primeng/tooltip';
import { lastValueFrom } from 'rxjs';
import { OrganisationStateService } from '../../organisation/organisation-state.service';

@Component({
  selector: 'aas-orga-payment-model-list',
  templateUrl: './orga-payment-model-list.component.html',
  imports: [
    Toolbar,
    TableModule,
    PrimeTemplate,
    Button,
    Menu,
    Tooltip,
    Dialog,
    Select,
    FormsModule,
    DatePicker,
    CurrencyPipe,
    TranslateModule,
    DateProxyPipe,
  ],
})
export class OrgaPaymentModelListComponent implements OnInit, OnChanges {
  orgaStateService = inject(OrganisationStateService);
  systemManagementClient = inject(SystemManagementClient);
  @Input() orgaId: number = 0;
  @Input() loading: boolean = false;
  @Input() showMenu: boolean = true;
  @Output() paymentModelSaved = new EventEmitter();

  bezahlmodelle: OrgaPaymentModel[] = [];
  displayAddBezahlmodell: boolean = false;
  paymentModelOptions: PaymentModel[] = [];
  selectedPaymentModel: PaymentModel | null = null;
  endDate: Date | null = null;
  previousEndDate: Date | null = null;
  currentPaymentModel: PaymentModel | null = null;
  displayChangeBezahlmodell: boolean = false;
  menuItems: MenuItem[] = [];
  updateEndDateDialogVisible: boolean = false;
  paymentModelToUpdate: OrgaPaymentModel | null = null;

  userSeatStats: OrgaUserSeatStats | undefined;
  systemConfiguration = signal<SystemConfigurationDto | null>(null);

  constructor(
    private confirmationService: AasConfirmationService,
    private translate: TranslateService,
    private paymentService: PaymentService,
  ) {
    registerLocaleData(localeDe, 'de-DE', localeDeExtra);
  }

  async ngOnInit() {
    this.systemConfiguration.set(await lastValueFrom(this.systemManagementClient.systemManagement_GetConfiguration()));
    if (this.systemConfiguration()?.singleTenantMode === true) {
      return;
    }

    // If orgaId is not provided via Input, use the one from state service
    if (this.orgaId === 0) {
      this.orgaId = this.orgaStateService.myOrgaId;
    }
    await this.loadPaymentModels();
    await this.loadUserSeatStats();
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (this.systemConfiguration()?.singleTenantMode === true) {
      return;
    }

    if (
      changes['orgaId'] != null &&
      (changes['orgaId'].currentValue !== changes['orgaId'].previousValue || changes['orgaId'].firstChange)
    ) {
      await this.loadPaymentModels();
      await this.loadUserSeatStats();
    }
  }

  async loadPaymentModels() {
    if (this.orgaId !== 0) {
      try {
        this.loading = true;
        this.bezahlmodelle = await this.paymentService.getByOrga(this.orgaId);
      } finally {
        this.loading = false;
      }
    }
  }

  async loadUserSeatStats() {
    if (this.orgaId !== 0) {
      try {
        this.loading = true;
        this.userSeatStats = await this.paymentService.getUserSeatStats(this.orgaId);
      } finally {
        this.loading = false;
      }
    }
  }

  get hasUnlimitedUsers() {
    return this.userSeatStats?.maxUserSeatsCount === -1;
  }

  onShowActions(bezahlmodell: OrgaPaymentModel) {
    this.menuItems = [
      {
        label: this.translate.instant('CANCEL_OPTION'),
        icon: 'pi pi-delete',
        command: (_event) => {
          this.cancelOption(bezahlmodell);
        },
        visible: bezahlmodell.paymentModel.mehrfachBuchbar === true,
      },
      {
        label: this.translate.instant('UPDATE_END_DATE'),
        command: () => {
          this.endDate = bezahlmodell.endDate;
          this.updateEndDateDialogVisible = true;
          this.paymentModelToUpdate = bezahlmodell;
        },
      },
    ];
  }

  async openAddPaymentModel() {
    this.displayAddBezahlmodell = true;
    this.selectedPaymentModel = null;

    if (this.bezahlmodelle == null || this.bezahlmodelle.length === 0) {
      this.paymentModelOptions = (await this.paymentService.getAll()).filter((pm) => pm.mehrfachBuchbar === false);
    } else {
      this.paymentModelOptions = (await this.paymentService.getAll()).filter((pm) => pm.mehrfachBuchbar === true);
    }
  }

  async setPaymentModel() {
    if (await this.confirmationService.confirm({ message: this.translate.instant('ADD_PAYMENT_MODEL_Q') })) {
      if (this.selectedPaymentModel?.id != null) {
        try {
          this.loading = true;
          await this.paymentService.addPaymentModel(this.selectedPaymentModel.id, this.orgaId);
          this.displayAddBezahlmodell = false;
          this.paymentModelSaved.emit();
        } finally {
          this.loading = false;
        }
      }
    }
  }

  async cancelOption(orgaPaymentModel: OrgaPaymentModel) {
    if (this.userSeatStats == null) return;
    let opt = 'CANCEL_OPTION_Q';
    if (this.sumNutzer - orgaPaymentModel.paymentModel.anzahlNutzer < this.userSeatStats.maxUserSeatsCount) {
      opt = 'CANCEL_OPTION_UNLICENCED_Q';
    }
    if (await this.confirmationService.confirm({ message: this.translate.instant(opt) })) {
      if (orgaPaymentModel.id != null) {
        try {
          this.loading = true;
          await this.paymentService.removePaymentModel(orgaPaymentModel.id);
          this.displayAddBezahlmodell = false;
          this.paymentModelSaved.emit();
        } finally {
          this.loading = false;
        }
      }
    }
  }

  async updatePaymentModel() {
    if (await this.confirmationService.confirm({ message: this.translate.instant('UPDATE_PAYMENT_MODEL_Q') })) {
      if (this.selectedPaymentModel?.id != null) {
        try {
          this.loading = true;
          await this.paymentService.updatePaymentModel(
            this.bezahlmodelle[0].paymentModel.id ?? 0,
            this.selectedPaymentModel.id,
            this.orgaId,
            this.endDate,
          );
          this.displayChangeBezahlmodell = false;
          this.loadPaymentModels();
          this.loadUserSeatStats();
          this.paymentModelSaved.emit();
        } finally {
          this.loading = false;
        }
      }
    }
  }

  async updatePaymentModelEndDate() {
    if (this.paymentModelToUpdate != null) {
      try {
        this.loading = true;
        await this.paymentService.updatePaymentModelEndDate(
          this.paymentModelToUpdate.id ?? 0,
          this.orgaId,
          this.endDate,
        );
        this.paymentModelToUpdate.endDate = this.endDate;
        this.updateEndDateDialogVisible = false;
        this.paymentModelSaved.emit();
      } finally {
        this.loading = false;
      }
    }
  }

  get isExclusivePaymentModel() {
    return this.bezahlmodelle.some((p) => p.paymentModel.exklusivBuchbar);
  }

  async openChangePaymentModel() {
    this.displayChangeBezahlmodell = true;
    this.selectedPaymentModel = null;
    if (this.bezahlmodelle) {
      this.currentPaymentModel = this.bezahlmodelle[0].paymentModel;
      this.endDate = this.bezahlmodelle[0].endDate;
      this.previousEndDate = this.bezahlmodelle[0].endDate;
    }
    this.paymentModelOptions = (await this.paymentService.getAll()).filter((pm) => pm.mehrfachBuchbar === false);
  }

  get sumNutzer() {
    return this.bezahlmodelle.reduce((acc, obj) => {
      return acc + obj.paymentModel.anzahlNutzer;
    }, 0);
  }

  get sumPreis() {
    return this.bezahlmodelle.reduce((acc, obj) => {
      return acc + obj.paymentModel.preis;
    }, 0);
  }

  get nothingChanged() {
    let hasChange = false;
    if (this.previousEndDate !== this.endDate) hasChange = true;

    if (this.selectedPaymentModel != null && this.currentPaymentModel?.id !== this.selectedPaymentModel.id) {
      hasChange = true;
    }

    return !hasChange;
  }

  isInvalid(bezahlmodell: OrgaPaymentModel) {
    return (bezahlmodell.endDate?.getTime() ?? 0) <= Date.now();
  }
}
