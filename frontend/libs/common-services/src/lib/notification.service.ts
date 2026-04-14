import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { Message } from 'primeng/message';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  messages: ErrorMessage[] = [];
  private _headerMessageSet = new Set<Message>();

  constructor(
    private messageService: MessageService,
    private translate: TranslateService,
  ) {}

  showMessageAlways(
    message: string | string[],
    title: string = '',
    severity: 'success' | 'info' | 'warn' | 'error' = 'info',
    permanent: boolean = true,
    life: number = 5000,
    additionalInfo: string | null = null,
  ) {
    this.showMessage(message, title, severity, permanent, life, additionalInfo, true);
  }

  showMessage(
    message: string | string[],
    title: string = '',
    severity: 'success' | 'info' | 'warn' | 'error' = 'info',
    permanent: boolean = true,
    life: number = 5000,
    additionalInfo: string | null = null,
    force: boolean = false,
  ): void {
    let resultMessage = '';
    if (additionalInfo != null && additionalInfo !== '' && additionalInfo !== 'None') {
      resultMessage += '\nInfo: ' + this.translate.instant(additionalInfo) + '\n';
    }
    if (Array.isArray(message)) {
      resultMessage += message.map((m) => this.translate.instant(m)).join('\n');
    } else {
      resultMessage += this.translate.instant(message);
    }
    if (title !== '') title = this.translate.instant(title);
    if (this.addMessage(resultMessage, title, force)) {
      if (permanent) {
        this.messageService.clear('errorDlg');
        this.messageService.add({
          key: 'errorDlg',
          sticky: true,
          severity: severity,
          summary: title,
          detail: resultMessage,
        });
      } else
        this.messageService.add({
          severity: severity,
          summary: title,
          detail: resultMessage,
          life,
        });
    }
  }

  removeMessage(message: string, title: string) {
    this.messages = this.messages.filter((m) => m.message !== message && m.title === title);
  }
  removeMessages() {
    this.messages = [];
  }

  private addMessage(message: string, title: string, force = false) {
    const errorMessage: ErrorMessage = { message, title };
    if (!this.messages.some((m) => m.message === message && m.title === title) || force) {
      this.messages.push(errorMessage);
      return true;
    }
    return false;
  }
}

export interface ErrorMessage {
  message: string;
  title: string;
}
