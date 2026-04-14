import { PaymentModel } from '@aas-designer-model';
import { Component, inject, OnInit } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MenuItem, PrimeTemplate } from 'primeng/api';
import { PaymentService } from '../payment.service';

import { DateProxyPipe } from '@aas/common-pipes';
import { AasConfirmationService } from '@aas/common-services';
import { SystemManagementClient } from '@aas/webapi-client';
import { CurrencyPipe, registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import localeDeExtra from '@angular/common/locales/extra/de';
import { Router, RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { Menu } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'aas-payment-model-list',
  templateUrl: './payment-model-list.component.html',
  styleUrls: ['../../../host.scss'],
  imports: [Button, Button, RouterLink, TableModule, PrimeTemplate, Menu, CurrencyPipe, TranslateModule, DateProxyPipe],
})
export class PaymentModelListComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly systemManagementClient = inject(SystemManagementClient);
  loading: boolean = false;
  models: any[] = [];
  menuItems: MenuItem[] = [];

  constructor(
    private paymentService: PaymentService,
    private translate: TranslateService,
    private confirmationService: AasConfirmationService,
  ) {
    registerLocaleData(localeDe, 'de-DE', localeDeExtra);
  }

  async ngOnInit() {
    const systemConfiguration = await lastValueFrom(this.systemManagementClient.systemManagement_GetConfiguration());
    if (systemConfiguration.singleTenantMode === true) {
      await this.router.navigate(['/system-management/template-management']);
      return;
    }

    this.loadData();
  }

  async loadData() {
    try {
      this.loading = true;
      this.models = await this.paymentService.getAll();
    } finally {
      this.loading = false;
    }
  }

  onShowActions(paymentModel: PaymentModel) {
    this.menuItems = [
      {
        label: this.translate.instant('EDIT'),
        icon: 'pi pi-pencil',
        routerLink: `edit/${paymentModel.id}`,
        visible: !paymentModel.isSystemModel,
      },
      {
        label: this.translate.instant('DELETE'),
        icon: 'pi pi-trash',
        command: () => {
          if (paymentModel.id != null) {
            this.deletePaymentModel(paymentModel.id);
          }
        },
        visible: !paymentModel.isSystemModel,
      },
      {
        label: this.translate.instant('NICHT_BEARBEITBAR'),
        visible: paymentModel.isSystemModel,
      },
    ];
  }

  async deletePaymentModel(id: number) {
    if (
      await this.confirmationService.confirm({
        message: this.translate.instant('DELETE_PAYMENT_MODEL_Q'),
      })
    ) {
      await this.paymentService.delete(id);
      this.loadData();
    }
  }
}
