import { HttpErrorResponse } from '@angular/common/http';
import { NotificationService } from '@aas/common-services';
import { ApiException } from '@aas/jwt-auth';
import { NgZone } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ErrorHandlerService } from './error-handler.service';

const devMode = vi.hoisted(() => ({ enabled: true }));

vi.mock('@angular/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@angular/core')>();
  return { ...actual, isDevMode: () => devMode.enabled };
});

function apiException(message: string, title = '', displayError = true, additionalInfo = '') {
  const exception = new ApiException(message, title);
  exception.displayError = displayError;
  exception.additionalInfo = additionalInfo;
  return exception;
}

describe('ErrorHandlerService', () => {
  let service: ErrorHandlerService;
  let showMessage: ReturnType<typeof vi.fn>;
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    devMode.enabled = true;
    showMessage = vi.fn();
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const translate = { instant: (key: string) => `translated:${key}` };
    const zone = { run: (fn: () => unknown) => fn() };

    service = new ErrorHandlerService(
      { showMessage } as unknown as NotificationService,
      translate as unknown as TranslateService,
      zone as unknown as NgZone,
    );
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  describe('ApiException', () => {
    it('shows message, translated title and additional info of a displayable exception', () => {
      service.handleError(apiException('Shell not found', 'NOT_FOUND', true, 'id: urn:example:aas:1'));

      expect(showMessage).toHaveBeenCalledWith(
        'Shell not found',
        'translated:NOT_FOUND',
        'error',
        true,
        3000,
        'id: urn:example:aas:1',
      );
    });

    it('handles exceptions wrapped in a promise rejection the same way', () => {
      service.handleError({ rejection: apiException('Upload failed', 'UPLOAD_ERROR') });

      expect(showMessage).toHaveBeenCalledWith('Upload failed', 'translated:UPLOAD_ERROR', 'error', true, 3000, '');
    });

    it('falls back to UNKNOWN for empty message and title', () => {
      service.handleError(apiException('', ''));

      expect(showMessage).toHaveBeenCalledWith('UNKNOWN', 'translated:UNKNOWN', 'error', true, 3000, '');
    });

    it('decodes html quotes in the message', () => {
      service.handleError(apiException('Value &quot;abc&quot; is invalid', 'VALIDATION'));

      expect(showMessage.mock.calls[0][0]).toBe('Value "abc" is invalid');
    });

    it('does not notify the user when displayError is false', () => {
      service.handleError(apiException('Silent', 'SILENT', false));
      service.handleError({ rejection: apiException('Silent too', 'SILENT', false) });

      expect(showMessage).not.toHaveBeenCalled();
    });

    it('logs the exception to the console only in dev mode', () => {
      service.handleError(apiException('Logged', 'X', false));
      expect(consoleError).toHaveBeenCalledTimes(1);

      devMode.enabled = false;
      service.handleError(apiException('Not logged', 'X', false));
      expect(consoleError).toHaveBeenCalledTimes(1);
    });
  });

  describe('unhandled errors', () => {
    it('shows the message together with the stack trace in dev mode', () => {
      const error = new Error('Cannot read properties of null');
      error.stack = 'Error: Cannot read properties of null\n    at ShellComponent.load (shell.component.ts:42)';

      service.handleError(error);

      expect(showMessage).toHaveBeenCalledTimes(1);
      const [message, title, severity, permanent] = showMessage.mock.calls[0];
      expect(message).toContain('Cannot read properties of null');
      expect(message).toContain('shell.component.ts:42');
      expect(title).toBe('translated:UNHANDLED_EXCEPTION');
      expect(severity).toBe('error');
      expect(permanent).toBe(true);
    });

    it('hides the stack trace from the user outside of dev mode', () => {
      devMode.enabled = false;
      const error = new Error('Cannot read properties of null');
      error.stack = 'Error: Cannot read properties of null\n    at ShellComponent.load (shell.component.ts:42)';

      service.handleError(error);

      expect(showMessage.mock.calls[0][0]).toBe('Cannot read properties of null');
      expect(consoleError).not.toHaveBeenCalled();
    });

    it('shows non-error values as message', () => {
      service.handleError('Something went wrong');

      expect(showMessage.mock.calls[0][0]).toBe('Something went wrong');
    });
  });

  describe('unhandled http errors', () => {
    it('shows status and server message of a rejected http request', () => {
      const response = new HttpErrorResponse({
        status: 502,
        statusText: 'Bad Gateway',
        error: { message: 'Repository not reachable' },
      });

      service.handleError({ rejection: response, message: 'Uncaught (in promise): HttpErrorResponse' });

      expect(showMessage).toHaveBeenCalledWith(
        '502 Bad Gateway: Repository not reachable',
        'translated:REQUEST_FAILED',
        'error',
        true,
      );
    });

    it('shows the client-side message of a network error', () => {
      const response = new HttpErrorResponse({
        status: 0,
        error: new ErrorEvent('error', { message: 'Network lost' }),
      });

      service.handleError({ rejection: response });

      expect(showMessage).toHaveBeenCalledWith('Network lost', 'translated:REQUEST_FAILED', 'error', true);
    });
  });

  describe('ignored errors', () => {
    it('suppresses known harmless errors by message', () => {
      service.handleError(new Error('NG0953: Unexpected emit for destroyed OutputRef'));
      service.handleError(new Error("Cannot read properties of undefined (reading 'querySelectorAll')"));

      expect(showMessage).not.toHaveBeenCalled();
    });

    it('suppresses known harmless errors by stack trace', () => {
      const error = new Error('Cannot read properties of null');
      error.stack = 'TypeError: x\n    at Table.saveColumnWidths (table.ts:1)';

      service.handleError(error);

      expect(showMessage).not.toHaveBeenCalled();
      expect(service.ignoreError(error)).toBe(true);
    });

    it('does not ignore other errors or empty values', () => {
      expect(service.ignoreError(new Error('Network unavailable'))).toBe(false);
      expect(service.ignoreError(null)).toBe(false);
      expect(service.ignoreError({ message: 42 })).toBe(false);
    });
  });
});
