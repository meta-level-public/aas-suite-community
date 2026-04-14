import * as aas from '@aas-core-works/aas-core3.1-typescript';
import {
  BasicEventElement,
  MultiLanguageProperty,
  Property,
  SubmodelElementCollection,
  SubmodelElementList,
} from '@aas-core-works/aas-core3.1-typescript/types';
import { SemanticIdHelper } from '@aas/helpers';
import { PcnClient } from '@aas/webapi-client';
import { HttpClient } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { cloneDeep } from 'lodash-es';
import { lastValueFrom } from 'rxjs';
import { V3TreeItem } from '../../model/v3-tree-item';
import { V3EditorDataStoreService } from '../../v3-editor-data-store.service';
import { V3EditorService } from '../../v3-editor.service';
import { V3TreeService } from '../../v3-tree/v3-tree.service';

@Injectable({
  providedIn: 'root',
})
export class PcnStateStoreService {
  pcnSubmodelTreeItem = signal<V3TreeItem<aas.types.Submodel> | null>(null);

  pcnClient = inject(PcnClient);
  v3TreeService = inject(V3TreeService);

  reloadPcnInfoTrigger = signal(0);

  pcnSubmodel = computed(() => {
    return this.pcnSubmodelTreeItem()?.content;
  });

  pcnEvent = computed(() => {
    const pcnSubmodel = this.pcnSubmodel();
    for (const element of pcnSubmodel?.submodelElements ?? []) {
      if (
        (element.idShort === 'PcnEventsOutgoing' ||
          element.idShort === 'PcnEventsIncoming' ||
          SemanticIdHelper.hasSemanticId(
            element,
            'http://admin-shell.io/VDMA/Fluidics/ProductChangeNotification/EventsOutgoing/1/0',
          ) ||
          SemanticIdHelper.hasSemanticId(
            element,
            'http://admin-shell.io/VDMA/Fluidics/ProductChangeNotification/EventsIncoming/1/0',
          )) &&
        element instanceof BasicEventElement
      ) {
        return element;
      }
    }

    return null;
  });

  isIncoming = computed(() => {
    const pcnEvent = this.pcnEvent();
    if (pcnEvent == null) {
      return false;
    }
    return (
      pcnEvent?.idShort === 'PcnEventsIncoming' ||
      SemanticIdHelper.hasSemanticId(
        pcnEvent,
        'http://admin-shell.io/VDMA/Fluidics/ProductChangeNotification/EventsIncoming/1/0',
      )
    );
  });

  isOutgoing = computed(() => {
    const pcnEvent = this.pcnEvent();
    if (pcnEvent == null) {
      return false;
    }
    return (
      pcnEvent?.idShort === 'PcnEventsOutgoing' ||
      SemanticIdHelper.hasSemanticId(
        pcnEvent,
        'http://admin-shell.io/VDMA/Fluidics/ProductChangeNotification/EventsOutgoing/1/0',
      )
    );
  });

  pcnInfos = signal<any>(null);

  constructor() {
    effect(() => {
      this.loadPcnInfos();
    });
  }

  async loadPcnInfos() {
    const aasIdentifier = this.aasIdentifier();
    this.reloadPcnInfoTrigger(); // trigger

    if (aasIdentifier == null || aasIdentifier === '') {
      this.pcnInfos.set(null);
      return;
    }
    const data = await lastValueFrom(this.pcnClient.pcn_GetPcnRegistrationInformation(aasIdentifier));
    this.pcnInfos.set(data);
  }

  pcnBrokerTopic = computed(() => {
    const event = this.pcnSubmodel()?.submodelElements?.find(
      (el) =>
        SemanticIdHelper.hasSemanticId(
          el,
          'http://admin-shell.io/VDMA/Fluidics/ProductChangeNotification/EventsOutgoing/1/0',
        ) ||
        SemanticIdHelper.hasSemanticId(
          el,
          'http://admin-shell.io/VDMA/Fluidics/ProductChangeNotification/EventsIncoming/1/0',
        ) ||
        el.idShort === 'PcnEventsIncoming' ||
        el.idShort === 'PcnEventsOutgoing',
    );

    const mqttBrokerTopic = (event as BasicEventElement)?.messageTopic;

    return mqttBrokerTopic;
  });

  brokerUrls = computed(() => {
    const pcnEvent = this.pcnEvent();

    if (pcnEvent == null) {
      return [];
    }

    const broker = pcnEvent?.messageBroker;
    if (broker?.keys == null) {
      return [];
    }
    const brokerItemId = broker.keys[broker.keys.length - 1]?.value;

    const mqttEndpointCollection = this.pcnSubmodel()?.submodelElements?.find((el) => el.idShort === brokerItemId);
    const mqttEndpoint = (
      (mqttEndpointCollection as SubmodelElementCollection)?.value?.find(
        (el) => el.idShort === 'EndpointMqtt',
      ) as Property
    )?.value;
    const wsEndpoint = (
      (mqttEndpointCollection as SubmodelElementCollection)?.value?.find(
        (el) => el.idShort === 'EndpointWs',
      ) as Property
    )?.value;

    const res: string[] = [];
    if (mqttEndpoint != null) {
      res.push(mqttEndpoint);
    }
    if (wsEndpoint != null) {
      res.push(wsEndpoint);
    }

    return res;
  });

  recordsElement = computed(() => {
    const pcnSubmodel = this.pcnSubmodel();
    if (pcnSubmodel == null) {
      return null;
    }
    const el = pcnSubmodel.submodelElements?.find(
      (submodelElement) =>
        submodelElement.idShort === 'Records' ||
        SemanticIdHelper.hasSemanticId(
          submodelElement,
          'http://admin-shell.io/VDMA/Fluidics/ProductChangeNotification/Record/List/1/0',
        ),
    );
    if (el != null && el instanceof SubmodelElementList) {
      return el as SubmodelElementList;
    }
    return null;
  });

  http = inject(HttpClient);
  v3EditorService = inject(V3EditorService);
  editorStateStore = inject(V3EditorDataStoreService);

  smUrl = computed(() => {
    const descriptor = this.editorStateStore.editorDescriptor();
    if (descriptor == null) {
      return null;
    }
    const pcnSubmodel = this.pcnSubmodel();
    if (pcnSubmodel == null) {
      return null;
    }
    const smUrl = descriptor.submodelDescriptorEntries?.find((e) => e.oldId === pcnSubmodel.id);
    return smUrl?.endpoint ?? null;
  });

  aasIdentifier = computed(() => {
    const descriptor = this.editorStateStore.editorDescriptor();
    if (descriptor == null) {
      return null;
    }

    return descriptor.aasDescriptorEntry?.oldId ?? null;
  });

  async createNewChangeRecord(pcnType: string, pcnComment: string, pcnReason: string) {
    const templateObj = await lastValueFrom(this.http.get<any>('assets/lookups/pcn-update-entry.json'));

    const templateSmcObj = aas.jsonization.submodelElementCollectionFromJsonable(templateObj).value;

    if (templateSmcObj == null) {
      return null;
    }

    const recordsElement = this.recordsElement();
    if (recordsElement == null) {
      return null;
    }

    if (recordsElement.value == null) {
      recordsElement.value = [];
    }

    const pcnTypeObj = templateSmcObj.value?.find(
      (el) =>
        el.idShort === 'PcnType' ||
        SemanticIdHelper.hasSemanticId(el, 'http://admin-shell.io/VDMA/Fluidics/ProductChangeNotification/PcnType/1/0'),
    );
    if (pcnTypeObj != null && pcnTypeObj instanceof Property) {
      pcnTypeObj.value = pcnType;
    }

    const pcnCommentObj = templateSmcObj.value?.find(
      (el) => el.idShort === 'PcnReasonComment' || SemanticIdHelper.hasSemanticId(el, '0173-1#02-ABF814#002'),
    );
    if (pcnCommentObj != null && pcnCommentObj instanceof MultiLanguageProperty) {
      pcnCommentObj.value = [new aas.types.LangStringTextType('de', pcnComment)];
    }

    const pcnDateObj = templateSmcObj.value?.find(
      (el) => el.idShort === 'DateOfRecord' || SemanticIdHelper.hasSemanticId(el, '0173-1#02-ABF816#002'),
    );
    if (pcnDateObj != null && pcnDateObj instanceof Property) {
      pcnDateObj.value = new Date().toISOString();
    }

    const pcnReasonObj = templateSmcObj.value?.find(
      (el) =>
        el.idShort === 'ReasonsOfChange' ||
        SemanticIdHelper.hasSemanticId(
          el,
          'http://admin-shell.io/VDMA/Fluidics/ProductChangeNotification/ReasonOfChange/List/1/0',
        ),
    );
    if (pcnReasonObj != null && pcnReasonObj instanceof SubmodelElementList) {
      const el = pcnReasonObj.value?.[0];
      if (el != null && el instanceof SubmodelElementCollection) {
        const reasonIdObj = el.value?.find(
          (reasonElement) =>
            reasonElement.idShort === 'ReasonId' ||
            SemanticIdHelper.hasSemanticId(reasonElement, '0173-10029#02-ABC727#001'),
        );
        if (reasonIdObj != null && reasonIdObj instanceof Property) {
          reasonIdObj.value = pcnReason;
        }
      }
    }

    recordsElement.value.push(templateSmcObj);
    const refreshEvent = new CustomEvent('refreshEntityTreeNodes');
    window.dispatchEvent(refreshEvent);

    if (this.v3TreeService.editorComponent?.shellResult != null) {
      await this.v3EditorService.saveNew(this.v3TreeService.editorComponent?.shellResult);
      this.v3TreeService.editorComponent.v3ShellBackup = cloneDeep(this.v3TreeService.editorComponent?.shellResult);
    }

    const smUrl = this.smUrl();
    if (smUrl == null) {
      return null;
    }

    const changeRecord = smUrl + '/submodel-elements/Records[' + (recordsElement.value.length - 1) + ']/$value';

    return changeRecord;
  }
}
