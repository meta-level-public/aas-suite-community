import { inject, Injectable, signal } from '@angular/core';
import { HelpInternalClient, HelpTextDto } from '@aas/webapi-client';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HelpService {
  helpClient = inject(HelpInternalClient);
  helpTexts = signal<HelpTextDto[]>([]);

  async initHelp() {
    // Initialize help
    try {
      this.helpTexts.set(await lastValueFrom(this.helpClient.helpInternal_GetHelpTexts()));
    } catch {
      // Without help texts the labels are shown without a help popover
      console.error('Loading help texts failed');
      this.helpTexts.set([]);
    }
  }

  constructor() {
    this.initHelp();
  }
}
