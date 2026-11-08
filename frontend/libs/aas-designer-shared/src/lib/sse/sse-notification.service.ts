import { ServerSentEventsClient } from '@aas/webapi-client';
import { EventEmitter, inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { ImportProgressMessage } from './import-progress-message';
import { PcnUpdateMessage } from './pcn-update-message';
import { ShellUpdateMessage } from './shell-update-message';
import { SubmodelUpdateMessage } from './submodel-update-message';

@Injectable({
  providedIn: 'root',
})
export class SseNotificationService {
  sseClient = inject(ServerSentEventsClient);
  eventSource: EventSource | undefined;
  clientId = '';

  sseConnectErrorCount = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | undefined;

  /** First reconnect delay after an error; doubles with every further error up to the maximum. */
  static readonly reconnectBaseDelayMs = 1000;
  static readonly reconnectMaxDelayMs = 30000;

  shellUpdated = new EventEmitter<ShellUpdateMessage>();
  submodelUpdated = new EventEmitter<SubmodelUpdateMessage>();
  productChangeNotificationReceived = new EventEmitter<PcnUpdateMessage>();
  importProgressUpdated = new EventEmitter<ImportProgressMessage>();

  createSse(url: string) {
    if (this.eventSource != null) {
      return;
    }
    this.eventSource = new EventSource(url);

    this.eventSource.onopen = () => {
      this.sseConnectErrorCount = 0;
    };

    this.eventSource.onerror = (error) => {
      console.warn('SSE connection error', error);
      this.closeEventSource();
      this.sseConnectErrorCount++;
      this.scheduleReconnect(url, this.getReconnectDelay());
    };

    // The server ends the request after each update, so the connection is reopened after every event.
    this.listen(url, 'ProductChangeNotificationReceived', (item) =>
      this.productChangeNotificationReceived.next({
        aasIdentifier: item.Identifier,
        infrastructureId: item.InfrastructureId,
        content: item.AdditionalContent,
      }),
    );

    this.listen(url, 'ShellUpdated', (item) =>
      this.shellUpdated.next({
        aasIdentifier: item.Identifier,
        infrastructureId: item.InfrastructureId,
      }),
    );

    this.listen(url, 'SubmodelUpdated', (item) =>
      this.submodelUpdated.next({
        submodelIdentifier: item.Identifier,
        infrastructureId: item.InfrastructureId,
      }),
    );

    this.listen(url, 'ImportProgressUpdated', (item) =>
      this.importProgressUpdated.next({
        operationId: item.operationId,
        progressPercent: item.progressPercent,
        stage: item.stage,
        message: item.message,
        processedFiles: item.processedFiles,
        totalFiles: item.totalFiles,
        currentFileName: item.currentFileName,
        completed: item.completed,
        failed: item.failed,
        infrastructureId: item.infrastructureId,
      }),
    );
  }

  /** Closes the connection and stops pending reconnects. */
  disconnect() {
    clearTimeout(this.reconnectTimer);
    this.reconnectTimer = undefined;
    this.closeEventSource();
  }

  /** Exponential backoff: 1 s, 2 s, 4 s, ... up to 30 s. */
  getReconnectDelay(): number {
    const delay = SseNotificationService.reconnectBaseDelayMs * 2 ** Math.max(0, this.sseConnectErrorCount - 1);
    return Math.min(delay, SseNotificationService.reconnectMaxDelayMs);
  }

  private listen(url: string, eventName: string, publish: (item: any) => void) {
    this.eventSource?.addEventListener(eventName, (event) => {
      this.closeEventSource();
      this.createSse(url);

      let item: any;
      try {
        item = JSON.parse((event as MessageEvent).data);
      } catch {
        console.warn(`SSE event ${eventName} contains no valid JSON`);
        return;
      }
      publish(item);
    });
  }

  private scheduleReconnect(url: string, delayMs: number) {
    clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = undefined;
      this.createSse(url);
    }, delayMs);
  }

  private closeEventSource() {
    this.eventSource?.close();
    this.eventSource = undefined;
  }

  async initialize() {
    try {
      this.clientId = await lastValueFrom(this.sseClient.serverSentEvents_RegisterClient());

      const url = (this.sseClient as any)['baseUrl'] + '/aas-api/ServerSentEvents/WaitForUpdates/' + this.clientId;
      this.createSse(url);
      this.sseConnectErrorCount = 0;
    } finally {
      this.sseConnectErrorCount++;
      // maybe increase the timeout on many failed attempts
      /** Nicht zu ändern **/
    }
  }
}
