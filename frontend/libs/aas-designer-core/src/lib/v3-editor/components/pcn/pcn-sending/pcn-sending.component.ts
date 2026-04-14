import { HttpClient } from '@angular/common/http';
import { Component, inject, model, OnDestroy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HelpLabelComponent } from '@aas/common-components';
import { NotificationService } from '@aas/common-services';
import { LookupEntry } from '@aas/model';
import mqtt from 'mqtt';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { lastValueFrom, Subscription } from 'rxjs';
import { AutocompleteOffDirective } from '../../../../general/directives/autocomplete-off.directive';
import { PcnStateStoreService } from '../pcn-state-store.service';

@Component({
  imports: [
    FormsModule,
    TranslateModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    AutocompleteOffDirective,
    HelpLabelComponent,
    DividerModule,
    PasswordModule,
  ],
  selector: 'aas-pcn-sending',
  templateUrl: './pcn-sending.component.html',
})
export class PcnSendingComponent implements OnDestroy {
  pcnStateStore = inject(PcnStateStoreService);
  notificationService = inject(NotificationService);

  changeType = model(''); // PcnType
  message = model(''); // PcnReasonComment
  reason = model(''); // PcnReasonComment
  loading = signal(false);
  pcnBrokerUsername = model('');
  pcnBrokerPassword = model('');
  pcnBrokerTopic = model(this.pcnStateStore.pcnBrokerTopic());
  pcnBrokerUrl = model('');

  availableChangeTypes = ['PCN', 'PDN'];
  availableChangeReasons = signal<LookupEntry[]>([]);

  reasonLabel = signal('descriptionEn');

  http = inject(HttpClient);
  translate = inject(TranslateService);
  subscriptions: Subscription[] = [];

  constructor() {
    this.loadReasons();
    this.subscriptions.push(
      this.translate.onLangChange.subscribe((event) => {
        this.reasonLabel.set(event.lang === 'de' ? 'descriptionDe' : 'descriptionEn');
        this.sortAndAssignReasons(this.availableChangeReasons());
      }),
    );
    this.reasonLabel.set(this.translate.currentLang === 'de' ? 'descriptionDe' : 'descriptionEn');
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  async loadReasons() {
    var reasons = await lastValueFrom(this.http.get<LookupEntry[]>('assets/lookups/pcn-change-reasons.json'));
    if (reasons) {
      this.sortAndAssignReasons(reasons);
    } else {
      // eslint-disable-next-line no-console
      console.log('Failed to load reasons');
    }
  }

  sortAndAssignReasons(reasons: LookupEntry[]) {
    reasons = reasons.sort((a: LookupEntry, b: LookupEntry) => {
      const labelA = (a as any)[this.reasonLabel()];
      const labelB = (b as any)[this.reasonLabel()];
      if (labelA < labelB) {
        return -1;
      }
      if (labelA > labelB) {
        return 1;
      }
      return 0;
    });
    this.availableChangeReasons.set(reasons ?? []);
  }

  async sendMessage() {
    try {
      this.loading.set(true);
      const brokerUrl = this.pcnBrokerUrl();
      const topic = this.pcnBrokerTopic();
      const username = this.pcnBrokerUsername();
      const password = this.pcnBrokerPassword();
      const message = this.message();
      if (!brokerUrl || !topic || !message) {
        // eslint-disable-next-line no-console
        console.log('Broker URL, Topic, and Message are required.');
        return;
      }

      // neuen Eintrag in Record erstellen
      const changeRecordPath = await this.pcnStateStore.createNewChangeRecord(
        this.changeType(),
        this.message(),
        this.reason(),
      );

      if (!changeRecordPath) {
        this.notificationService.showMessageAlways('ERROR_CREATING_CHANGE_RECORD', 'ERROR', 'error', true);
        return;
      }

      const submodelId = this.pcnStateStore.pcnSubmodelTreeItem()?.id ?? '';
      const smUrl = this.pcnStateStore.smUrl() ?? '';
      const path = smUrl + '/submodel-elements/Records';

      const messageToSend =
        '{"submodel":{"id":"' + submodelId + '","path":"' + path + '","changeRecord":"' + changeRecordPath + '"}}';

      // MQTT-Verbindung herstellen
      const client = mqtt.connect(brokerUrl, {
        username,
        password,
        rejectUnauthorized: false,
      });

      client.on('connect', () => {
        // eslint-disable-next-line no-console
        console.log('Connected to MQTT broker');
        // Nachricht senden
        client.publish(topic, messageToSend, { qos: 1 }, (err: any) => {
          if (err) {
            this.notificationService.showMessageAlways('ERROR_SENDING_MESSAGE', 'ERROR', 'error', true);
            // eslint-disable-next-line no-console
            console.log('Failed to send message:', err);
          } else {
            this.notificationService.showMessageAlways('MESSAGE_SENT_SUCCESS', 'SUCCESS', 'success', false);
            // eslint-disable-next-line no-console
            console.log('Message sent successfully:', message);
          }
          this.loading.set(false);
          client.end(); // Verbindung schließen
        });
      });

      client.on('error', (err: any) => {
        this.notificationService.showMessageAlways('ERROR_SENDING_MESSAGE', 'ERROR', 'error', true);
        // eslint-disable-next-line no-console
        console.log('MQTT connection error:', err);
        this.loading.set(false);
        client.end(); // Verbindung schließen
      });
    } finally {
      //this.loading.set(false);
    }
  }
}
