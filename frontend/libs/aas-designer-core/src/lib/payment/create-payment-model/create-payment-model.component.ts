import { DirtyCheckable, PaymentModel, PaymentPeriod } from '@aas-designer-model';
import { NotificationService } from '@aas/common-services';
import { AutocompleteOffDirective } from '@aas/helpers';
import { SystemManagementClient } from '@aas/webapi-client';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
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
  selector: 'aas-create-payment-model',
  templateUrl: './create-payment-model.component.html',
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
export class CreatePaymentModelComponent extends DirtyCheckable implements OnInit {
  private readonly router = inject(Router);
  private readonly systemManagementClient = inject(SystemManagementClient);
  @ViewChild('createForm') form!: NgForm;
  loading: boolean = false;
  paymentModel: PaymentModel = new PaymentModel();
  paymentPeriodOptions = [
    PaymentPeriod.MONTHLY,
    PaymentPeriod.QUARTERLY,
    PaymentPeriod.HALF_YEARLY,
    PaymentPeriod.YEARLY,
  ];

  constructor(
    private notificationService: NotificationService,
    private paymenService: PaymentService,
  ) {
    super();
  }

  async ngOnInit() {
    const systemConfiguration = await lastValueFrom(this.systemManagementClient.systemManagement_GetConfiguration());
    if (systemConfiguration.singleTenantMode === true) {
      await this.router.navigate(['/system-management/template-management']);
    }
  }

  close() {
    history.back();
  }

  async save() {
    try {
      this.loading = true;
      await this.paymenService.create(this.paymentModel);

      this.notificationService.showMessageAlways('SUCCESS_CREATE_PAYMENT_MODEL', 'SUCCESS', 'success', false);
      this.close();
    } finally {
      this.loading = false;
    }
  }

  override isDirty() {
    return this.form?.dirty === true && this.form?.submitted === false;
  }
}
