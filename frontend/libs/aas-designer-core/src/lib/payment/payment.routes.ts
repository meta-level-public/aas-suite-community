import { Routes } from '@angular/router';
import { CreatePaymentModelComponent } from './create-payment-model/create-payment-model.component';
import { EditPaymentModelComponent } from './edit-payment-model/edit-payment-model.component';
import { PaymentModelListComponent } from './payment-model-list/payment-model-list.component';

export const PAYMENT_ROUTES: Routes = [
  {
    path: '',
    component: PaymentModelListComponent,
  },
  {
    path: 'create',
    component: CreatePaymentModelComponent,
  },
  {
    path: 'edit/:id',
    component: EditPaymentModelComponent,
  },
];
