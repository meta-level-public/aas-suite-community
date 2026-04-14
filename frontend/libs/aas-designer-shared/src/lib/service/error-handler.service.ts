import { NotificationService } from '@aas/common-services';
import { ApiException } from '@aas/jwt-auth';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, Injectable, isDevMode, NgZone } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService implements ErrorHandler {
  errorMessagesToIgnore: string[] = [
    "Cannot read properties of undefined (reading 'querySelectorAll')",
    'NG0953',
    'saveColumnWidths',
    'Cannot append btn to',
  ];
  constructor(
    private notificationService: NotificationService,
    private translate: TranslateService,
    private zone: NgZone,
  ) {}
  handleError(error: any): void {
    this.zone.run(() => {
      if (this.ignoreError(error)) {
        return;
      }
      if (error.rejection instanceof ApiException) {
        const ex = error.rejection as ApiException;
        if (ex.displayError)
          this.notificationService.showMessage(
            this.messageFormatter(ex.message !== '' && ex.message != null ? ex.message : 'UNKNOWN'),
            this.translate.instant(ex.title !== '' && ex.title != null ? ex.title : 'UNKNOWN'),
            'error',
            true,
            3000,
            ex.additionalInfo,
          );

        // eslint-disable-next-line no-console
        if (isDevMode()) console.error(error);
      } else if (error instanceof ApiException) {
        const ex = error as ApiException;
        if (ex.displayError)
          this.notificationService.showMessage(
            this.messageFormatter(ex.message !== '' && ex.message != null ? ex.message : 'UNKNOWN'),
            this.translate.instant(ex.title !== '' && ex.title != null ? ex.title : 'UNKNOWN'),
            'error',
            true,
            3000,
            ex.additionalInfo,
          );

        // eslint-disable-next-line no-console
        if (isDevMode()) console.error(error);
      } else if (!(error.rejection instanceof HttpErrorResponse)) {
        this.notificationService.showMessage(
          this.messageFormatter(`${error.message ?? error} - ${error.stack ?? ''}`),
          this.translate.instant('UNHANDLED_EXCEPTION'),
          'error',
          true,
        );

        // eslint-disable-next-line no-console
        if (isDevMode()) console.error(error);
      } else if (error.error instanceof ErrorEvent) {
        // client-side error
        const errorMessage = `Error: ${error.error.message}`;
        this.notificationService.showMessage(errorMessage, 'CLIENTSIDE_ERROR_HEADLINE', 'error', true);

        // eslint-disable-next-line no-console
        if (isDevMode()) console.error(error);
      } else if (error instanceof TypeError) {
        // client-side error
        const errorMessage = `Error: ${error.message}`;
        this.notificationService.showMessage(errorMessage, 'CLIENTSIDE_ERROR_HEADLINE', 'error', true);

        // eslint-disable-next-line no-console
        if (isDevMode()) console.error(error);
      } else {
        const errorMessage = `Error: ${error.message}`;
        setTimeout(() =>
          this.notificationService.showMessage(errorMessage, 'CLIENTSIDE_ERROR_HEADLINE', 'error', true),
        );
        // eslint-disable-next-line no-console
        if (isDevMode()) console.error(error);
      }
    });
  }

  ignoreError(error: any): boolean {
    let ignore = false;

    this.errorMessagesToIgnore.forEach((e) => {
      if (error.message.includes(e) || error.stack?.includes(e)) {
        ignore = true;
      }
    });

    return ignore;
  }

  messageFormatter(message: string): string {
    return message.replace(/&quot;/gm, '"');
  }
}
