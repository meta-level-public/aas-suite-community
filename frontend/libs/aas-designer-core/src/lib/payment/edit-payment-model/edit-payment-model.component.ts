import { DirtyCheckable, PaymentModel, PaymentPeriod } from '@aas-designer-model';
import { NotificationService } from '@aas/common-services';
import { AutocompleteOffDirective } from '@aas/helpers';
import { SystemManagementClient } from '@aas/webapi-client';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { PrimeTemplate } from 'primeng/api';
import { Button } from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Select } from 'primeng/select';
import { Toolbar } from 'primeng/toolbar';
import { lastValueFrom } from 'rxjs';
import { PaymentService } from '../payment.service';

@Component({
  selector: 'aas-edit-payment-model',
  templateUrl: './edit-payment-model.component.html',
  imports: [
    FormsModule,
    AutocompleteOffDirective,
    Toolbar,
    Button,
    Button,
    InputText,
    Message,
    Select,
    PrimeTemplate,
    Checkbox,
    TranslateModule,
  ],
})
export class EditPaymentModelComponent extends DirtyCheckable implements OnInit {
  private readonly router = inject(Router);
  private readonly systemManagementClient = inject(SystemManagementClient);
  @ViewChild('editForm') form!: NgForm;
  loading: boolean = false;
  paymentModel: PaymentModel | null = null;
  paymentPeriodOptions = [
    PaymentPeriod.MONTHLY,
    PaymentPeriod.QUARTERLY,
    PaymentPeriod.HALF_YEARLY,
    PaymentPeriod.YEARLY,
  ];

  constructor(
    private notificationService: NotificationService,
    private paymenService: PaymentService,
    private route: ActivatedRoute,
  ) {
    super();
  }

  get id() {
    return parseInt(this.route.snapshot.params['id']);
  }

  ngOnInit(): void {
    void this.initialize();
  }

  private async initialize() {
    const systemConfiguration = await lastValueFrom(this.systemManagementClient.systemManagement_GetConfiguration());
    if (systemConfiguration.singleTenantMode === true) {
      await this.router.navigate(['/system-management/template-management']);
      return;
    }

    await this.loadData();
  }

  async loadData() {
    try {
      this.loading = true;
      this.paymentModel = await this.paymenService.getById(this.id);
    } finally {
      this.loading = false;
    }
  }

  close() {
    history.back();
  }

  async save() {
    if (this.paymentModel != null) {
      try {
        this.loading = true;
        await this.paymenService.update(this.paymentModel);

        this.notificationService.showMessageAlways('SUCCESS_EDIT_PAYMENT_MODEL', 'SUCCESS', 'success', false);
        this.close();
      } finally {
        this.loading = false;
      }
    }
  }

  override isDirty() {
    return this.form?.dirty === true && this.form?.submitted === false;
  }
}
