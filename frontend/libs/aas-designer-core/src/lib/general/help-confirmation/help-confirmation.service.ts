import { BenutzerEinstellungen, HilfeTyp } from '@aas-designer-model';
import { AppConfigService } from '@aas/common-services';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DialogService } from 'primeng/dynamicdialog';
import { lastValueFrom } from 'rxjs';
import { PortalService } from '@aas/common-services';
import { HelpConfirmationComponent } from './help-confirmation.component';

export interface HelpOptions {
  question: string;
  header?: string;
  type: HilfeTyp;
}

export interface HelpResult {
  dontShowAgain: boolean;
  type: HilfeTyp;
  result: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class HelpConfirmationService {
  constructor(
    private dialogService: DialogService,
    private translate: TranslateService,
    private http: HttpClient,
    private portalService: PortalService,
    private appConfigService: AppConfigService,
  ) {}

  confirm(options: HelpOptions): Promise<boolean> | boolean {
    const hilfeAktiv = this.portalService.user?.isHilfeAktiv(options.type);
    if (hilfeAktiv === false) {
      return true;
    }

    const ref = this.dialogService.open(HelpConfirmationComponent, {
      header: this.translate.instant(options.header ?? 'CONFIRMATION'),
      data: { options },
      closable: false,
    });

    return new Promise((resolve, _reject) => {
      ref?.onClose.subscribe((res: HelpResult) => {
        if (res.result === true) {
          // Nachfrageergebenis speichern!
          const user = this.portalService.user;
          if (res.dontShowAgain === true) {
            if (user != null) {
              if (user.einstellungen == null) {
                user.einstellungen = new BenutzerEinstellungen();
              }
              user.einstellungen.hilfeInaktiv[res.type] = res.dontShowAgain.toString();
              lastValueFrom(
                this.http.patch(`${this.appConfigService.config.apiPath}/Benutzer/UpdateSettings`, user.einstellungen),
              );
              this.portalService.saveUser(user);
            }
          }
          resolve(true);
        } else {
          if (res.dontShowAgain === true) {
            if (this.portalService.user != null) {
              if (this.portalService.user.einstellungen == null) {
                this.portalService.user.einstellungen = new BenutzerEinstellungen();
              }
              this.portalService.user.einstellungen.hilfeInaktiv[res.type] = res.dontShowAgain.toString();

              lastValueFrom(
                this.http.patch(
                  `${this.appConfigService.config.apiPath}/Benutzer/UpdateSettings`,
                  this.portalService.user.einstellungen,
                ),
              );
            }
            resolve(false);
          }
        }
      });
    });
  }
}
