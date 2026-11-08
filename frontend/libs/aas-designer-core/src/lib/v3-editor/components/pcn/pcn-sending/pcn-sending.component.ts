import { HelpLabelComponent } from '@aas/common-components';
import { NotificationService } from '@aas/common-services';
import { LookupEntry } from '@aas/model';
import { HttpClient } from '@angular/common/http';
import { Component, inject, model, OnDestroy, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import mqtt from 'mqtt';
import { ButtonModule } from '@openng/optimus-ui/button';
import { DividerModule } from '@openng/optimus-ui/divider';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { PasswordModule } from '@openng/optimus-ui/password';
import { SelectModule } from '@openng/optimus-ui/select';
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
  changeDetection: ChangeDetectionStrategy.Eager,
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
      console.warn('Failed to load reasons');
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
    const brokerUrl = this.pcnBrokerUrl();
    const topic = this.pcnBrokerTopic();
    const message = this.message();
    if (!brokerUrl || !topic || !message) {
      this.notificationService.showMessageAlways('REQUIRED_FIELD', 'ERROR', 'error', false);
      return;
    }

    this.loading.set(true);
    let messageToSend: string;
    try {
      // neuen Eintrag in Record erstellen
      const changeRecordPath = await this.pcnStateStore.createNewChangeRecord(
        this.changeType(),
        message,
        this.reason(),
      );

      if (!changeRecordPath) {
        this.notificationService.showMessageAlways('ERROR_CREATING_CHANGE_RECORD', 'ERROR', 'error', true);
        this.loading.set(false);
        return;
      }

      const smUrl = this.pcnStateStore.smUrl() ?? '';
      messageToSend = JSON.stringify({
        submodel: {
          id: this.pcnStateStore.pcnSubmodelTreeItem()?.id ?? '',
          path: smUrl + '/submodel-elements/Records',
          changeRecord: changeRecordPath,
        },
      });
    } catch {
      this.notificationService.showMessageAlways('ERROR_CREATING_CHANGE_RECORD', 'ERROR', 'error', true);
      this.loading.set(false);
      return;
    }

    // MQTT-Verbindung herstellen; ohne Reconnect, damit ein nicht erreichbarer Broker den Vorgang beendet
    const client = mqtt.connect(brokerUrl, {
      username: this.pcnBrokerUsername(),
      password: this.pcnBrokerPassword(),
      connectTimeout: 10_000,
      reconnectPeriod: 0,
    });

    let finished = false;
    const finish = (success: boolean) => {
      if (finished) {
        return;
      }
      finished = true;
      if (success) {
        this.notificationService.showMessageAlways('MESSAGE_SENT_SUCCESS', 'SUCCESS', 'success', false);
      } else {
        this.notificationService.showMessageAlways('ERROR_SENDING_MESSAGE', 'ERROR', 'error', true);
      }
      this.loading.set(false);
      client.end();
    };

    client.on('connect', () => {
      client.publish(topic, messageToSend, { qos: 1 }, (err?: Error) => finish(err == null));
    });
    client.on('error', () => finish(false));
    // connection closed (e.g. connect timeout) before the message was published
    client.on('close', () => finish(false));
  }
}
