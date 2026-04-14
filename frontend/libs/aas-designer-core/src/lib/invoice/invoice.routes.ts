import { Routes } from '@angular/router';
import { InvoiceListComponent } from './invoice-list/invoice-list.component';

export const INVOICE_ROUTES: Routes = [
  {
    path: '',
    component: InvoiceListComponent,
  },
];
