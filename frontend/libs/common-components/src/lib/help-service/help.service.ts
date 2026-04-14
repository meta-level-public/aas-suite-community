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
    this.helpTexts.set(await lastValueFrom(this.helpClient.helpInternal_GetHelpTexts()));
  }

  constructor() {
    this.initHelp();
  }
}
