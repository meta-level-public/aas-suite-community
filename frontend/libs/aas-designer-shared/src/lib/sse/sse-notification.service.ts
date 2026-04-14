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

  shellUpdated = new EventEmitter<ShellUpdateMessage>();
  submodelUpdated = new EventEmitter<SubmodelUpdateMessage>();
  productChangeNotificationReceived = new EventEmitter<PcnUpdateMessage>();
  importProgressUpdated = new EventEmitter<ImportProgressMessage>();

  createSse(url: string) {
    if (this.eventSource == null) {
      this.eventSource = new EventSource(url);

      this.eventSource.onopen = () => {
        // eslint-disable-next-line no-console
        console.log('SSE connection opened');
      };

      this.eventSource.onerror = (error) => {
        // eslint-disable-next-line no-console
        console.log('SSE connection error', error);
        this.eventSource?.close();
        this.eventSource = undefined;
        this.sseConnectErrorCount++;
        if (this.sseConnectErrorCount < 10) {
          this.createSse(url);
        } else {
          setTimeout(() => this.createSse(url), 10000);
        }
      };

      this.eventSource.addEventListener('ProductChangeNotificationReceived', (event) => {
        const item = JSON.parse(event.data);
        this.eventSource?.close();
        this.eventSource = undefined;
        this.createSse(url);

        const pcnUpdateMessage: PcnUpdateMessage = {
          aasIdentifier: item.Identifier,
          infrastructureId: item.InfrastructureId,
          content: item.AdditionalContent,
        };
        this.productChangeNotificationReceived.next(pcnUpdateMessage);
      });

      this.eventSource.addEventListener('ShellUpdated', (event) => {
        const item = JSON.parse(event.data);
        this.eventSource?.close();
        this.eventSource = undefined;
        this.createSse(url);

        const shellUpdateMessage: ShellUpdateMessage = {
          aasIdentifier: item.Identifier,
          infrastructureId: item.InfrastructureId,
        };
        this.shellUpdated.next(shellUpdateMessage);
      });

      this.eventSource.addEventListener('SubmodelUpdated', (event) => {
        const item = JSON.parse(event.data);
        this.eventSource?.close();
        this.eventSource = undefined;
        this.createSse(url);

        const submodelUpdateMessage: SubmodelUpdateMessage = {
          submodelIdentifier: item.Identifier,
          infrastructureId: item.InfrastructureId,
        };
        this.submodelUpdated.next(submodelUpdateMessage);
      });

      this.eventSource.addEventListener('ImportProgressUpdated', (event) => {
        const item = JSON.parse(event.data);
        this.eventSource?.close();
        this.eventSource = undefined;
        this.createSse(url);

        const importProgressMessage: ImportProgressMessage = {
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
        };
        this.importProgressUpdated.next(importProgressMessage);
      });
    }
  }

  async initialize() {
    try {
      this.clientId = await lastValueFrom(this.sseClient.serverSentEvents_RegisterClient());

      const url = (this.sseClient as any)['baseUrl'] + '/aas-api/ServerSentEvents/WaitForUpdates/' + this.clientId;
      this.createSse(url);
      this.sseConnectErrorCount = 0;
    } finally {
      this.sseConnectErrorCount++;
      // vielleicht den Timeout erhöhen bei vielen Fehlversuchen
      /** Nicht zu ändern **/
    }
  }
}
