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
      const apiException =
        error instanceof ApiException ? error : error?.rejection instanceof ApiException ? error.rejection : null;

      if (apiException != null) {
        if (apiException.displayError) {
          this.notificationService.showMessage(
            this.messageFormatter(
              apiException.message !== '' && apiException.message != null ? apiException.message : 'UNKNOWN',
            ),
            this.translate.instant(
              apiException.title !== '' && apiException.title != null ? apiException.title : 'UNKNOWN',
            ),
            'error',
            true,
            3000,
            apiException.additionalInfo,
          );
        }
      } else if (error?.rejection instanceof HttpErrorResponse) {
        // An HTTP error that the calling code did not handle (e.g. from an external repository).
        this.notificationService.showMessage(
          this.describeHttpError(error.rejection),
          this.translate.instant('REQUEST_FAILED'),
          'error',
          true,
        );
      } else {
        // The stack trace is only useful for developers and must not be shown to users.
        const details = isDevMode() && error?.stack ? ` - ${error.stack}` : '';
        this.notificationService.showMessage(
          this.messageFormatter(`${error?.message ?? error}${details}`),
          this.translate.instant('UNHANDLED_EXCEPTION'),
          'error',
          true,
        );
      }

      if (isDevMode()) console.error(error);
    });
  }

  ignoreError(error: any): boolean {
    let ignore = false;

    this.errorMessagesToIgnore.forEach((e) => {
      if (error?.message?.includes?.(e) || error?.stack?.includes?.(e)) {
        ignore = true;
      }
    });

    return ignore;
  }

  private describeHttpError(response: HttpErrorResponse): string {
    if (response.error instanceof ErrorEvent) {
      // Network or client-side problem, e.g. the connection was interrupted.
      return response.error.message;
    }
    const serverMessage =
      typeof response.error === 'string' ? response.error : (response.error?.message ?? response.error?.Message);
    const status = `${response.status} ${response.statusText ?? ''}`.trim();
    return serverMessage ? `${status}: ${this.messageFormatter(String(serverMessage))}` : status;
  }

  messageFormatter(message: string): string {
    return message.replace(/&quot;/gm, '"');
  }
}
