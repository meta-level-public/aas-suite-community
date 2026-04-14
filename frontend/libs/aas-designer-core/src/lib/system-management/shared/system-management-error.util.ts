import { NotificationService } from '@aas/common-services';
import { ApiException } from '@aas/jwt-auth';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';

export async function showSystemManagementError(
  error: unknown,
  notificationService: NotificationService,
  messageService: MessageService,
  translateService: TranslateService,
): Promise<void> {
  const message = await getSystemManagementErrorMessage(error);
  if (message === 'COMMON_ERROR') {
    notificationService.showMessageAlways(message, 'ERROR', 'error', true);
    return;
  }

  messageService.clear('errorDlg');
  messageService.add({
    key: 'errorDlg',
    sticky: true,
    severity: 'error',
    summary: translateService.instant('ERROR'),
    detail: message,
  });
}

async function getSystemManagementErrorMessage(error: unknown): Promise<string> {
  if (error instanceof ApiException) {
    return extractApiExceptionMessage(error);
  }

  const genericMessage = extractMessage(error);
  if (genericMessage != null && genericMessage !== 'COMMON_ERROR') {
    return genericMessage;
  }

  if (!(error instanceof HttpErrorResponse)) {
    return genericMessage ?? 'COMMON_ERROR';
  }

  const directMessage = await extractAnyMessage(error.error);
  if (directMessage != null) {
    return directMessage;
  }

  const responseMessage = await extractAnyMessage(error);
  if (responseMessage != null) {
    return responseMessage;
  }

  return 'COMMON_ERROR';
}

function extractMessage(value: unknown): string | null {
  if (typeof value === 'string') {
    const normalizedValue = value.trim();
    return normalizedValue !== '' ? normalizedValue : null;
  }

  if (value == null || typeof value !== 'object') {
    return null;
  }

  const candidates = value as Record<string, unknown>;
  const message = [
    candidates['message'],
    candidates['detail'],
    candidates['Message'],
    candidates['error'],
    candidates['errorMessage'],
    candidates['title'],
  ].find((candidate) => typeof candidate === 'string' && candidate.trim() !== '') as string | undefined;

  return message?.trim() ?? null;
}

function extractApiExceptionMessage(error: ApiException): string {
  const message = error.message?.trim();
  if (message != null && message !== '') {
    return message;
  }

  const exceptionType = error.exceptionType?.trim() || error.title?.trim();
  return exceptionType !== '' ? exceptionType : 'COMMON_ERROR';
}

async function extractAnyMessage(value: unknown): Promise<string | null> {
  const directMessage = extractMessage(value);
  if (directMessage != null) {
    const parsedMessage = await extractStringMessage(directMessage);
    return parsedMessage ?? directMessage;
  }

  if (value instanceof Blob) {
    return await extractBlobMessage(value);
  }

  if (value instanceof ArrayBuffer) {
    return await extractArrayBufferMessage(value);
  }

  if (value == null || typeof value !== 'object') {
    return null;
  }

  const candidates = value as Record<string, unknown>;
  for (const nestedValue of [
    candidates['error'],
    candidates['errorMessage'],
    candidates['response'],
    candidates['data'],
    candidates['body'],
  ]) {
    const nestedMessage = await extractAnyMessage(nestedValue);
    if (nestedMessage != null) {
      return nestedMessage;
    }
  }

  return null;
}

async function extractStringMessage(value: string): Promise<string | null> {
  const normalizedValue = value.trim();
  if (normalizedValue === '') {
    return null;
  }

  if (normalizedValue.startsWith('{') || normalizedValue.startsWith('[')) {
    try {
      return (await extractAnyMessage(JSON.parse(normalizedValue))) ?? normalizedValue;
    } catch {
      return normalizedValue;
    }
  }

  return normalizedValue;
}

async function extractBlobMessage(blob: Blob): Promise<string | null> {
  try {
    return await extractStringMessage(await blob.text());
  } catch {
    return null;
  }
}

async function extractArrayBufferMessage(buffer: ArrayBuffer): Promise<string | null> {
  try {
    return await extractStringMessage(new TextDecoder().decode(buffer));
  } catch {
    return null;
  }
}
