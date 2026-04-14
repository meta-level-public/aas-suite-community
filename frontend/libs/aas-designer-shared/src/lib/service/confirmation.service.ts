import { Injectable } from '@angular/core';
import { Confirmation, ConfirmationService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class AasConfirmationService {
  constructor(private confirmationService: ConfirmationService) {}

  confirm(options: Confirmation): Promise<boolean> {
    return new Promise((resolve, _reject) => {
      this.confirmationService.confirm({
        ...options,
        accept: () => resolve(true),
        reject: () => resolve(false),
      });
    });
  }
}
