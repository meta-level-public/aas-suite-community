import * as aas from '@aas-core-works/aas-core3.1-typescript';
import {
  MultiLanguageProperty,
  Property,
  SubmodelElementCollection,
  SubmodelElementList,
} from '@aas-core-works/aas-core3.1-typescript/types';
import { DateProxyPipe } from '@aas/common-pipes';
import { SemanticIdHelper } from '@aas/helpers';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, model } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { lastValueFrom } from 'rxjs';
import { PcnChangeInfo } from './pcn-change-info';

@Component({
  selector: 'aas-pcn-changes',
  imports: [CommonModule, TranslateModule, TableModule, DateProxyPipe, ButtonModule],
  templateUrl: './pcn-changes.component.html',
})
export class PcnChangesComponent {
  pcnChangeData = model<PcnChangeInfo | undefined>(undefined);

  config = inject(DynamicDialogConfig);
  httpClient = inject(HttpClient);

  constructor() {
    if (this.config.data?.changeData) {
      this.pcnChangeData.set(this.config.data.changeData);
    }
  }

  changeRecordByContent = computed(async () => {
    let changeRecordPath = this.pcnChangeData()?.changeRecord;
    if (!changeRecordPath) {
      return null;
    }
    changeRecordPath = changeRecordPath.replace('[', '%5B').replace(']', '%5D');
    const res = await lastValueFrom(this.httpClient.get<any>(changeRecordPath));
    const smc = aas.jsonization.submodelElementCollectionFromJsonable(res).value;
    // eslint-disable-next-line no-console
    console.log('changeRecord', smc);
    return smc;
  });

  changeRecordByPath = computed(async () => {
    let allRecordsPath = this.pcnChangeData()?.path;
    if (!allRecordsPath) {
      return null;
    }
    const res = await lastValueFrom(this.httpClient.get<any>(allRecordsPath));
    const smlRecords = aas.jsonization.submodelElementListFromJsonable(res).value;
    // eslint-disable-next-line no-console
    console.log('changeRecord', smlRecords);

    let changeRecordPath = this.pcnChangeData()?.changeRecord;
    const indexRegex = /\[(\d+)\]/;
    const matches = changeRecordPath?.match(indexRegex);
    const index = +(matches?.[1] ?? -1);
    if (index >= 0) {
      const record = smlRecords?.value?.[index];
      return record as aas.types.SubmodelElementCollection;
    }
    return null;
  });

  dateOfRecord = computed(async () => {
    const changeRecord = await this.changeRecordByPath();
    if (!changeRecord) {
      return null;
    }
    const dateOfRecord = changeRecord.value?.find(
      (el) => el.idShort === 'DateOfRecord' || SemanticIdHelper.hasSemanticId(el, '0173-1#02-ABF816#002'),
    );
    if (dateOfRecord != null && dateOfRecord instanceof aas.types.Property) {
      if (dateOfRecord.value == null) {
        return null;
      }
      return new Date(dateOfRecord.value);
    }
    return null;
  });

  changeReason = computed(async () => {
    const changeRecord = await this.changeRecordByPath();
    if (!changeRecord) {
      return null;
    }

    const pcnReasonObj = changeRecord.value?.find(
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
          (_el) => el.idShort === 'ReasonId' || SemanticIdHelper.hasSemanticId(el, '0173-10029#02-ABC727#001'),
        );
        if (reasonIdObj != null && reasonIdObj instanceof Property) {
          return reasonIdObj.value;
        }
      }
    }
    return null;
  });

  comment = computed(async () => {
    const changeRecord = await this.changeRecordByPath();
    if (!changeRecord) {
      return '';
    }

    const pcnCommentObj = changeRecord.value?.find(
      (el) => el.idShort === 'PcnReasonComment' || SemanticIdHelper.hasSemanticId(el, '0173-1#02-ABF814#002'),
    );
    if (pcnCommentObj != null && pcnCommentObj instanceof MultiLanguageProperty) {
      return pcnCommentObj.value?.[0]?.text;
    }
    return '';
  });

  changeType = computed(async () => {
    const changeRecord = await this.changeRecordByPath();
    if (!changeRecord) {
      return '';
    }

    const pcnTypeObj = changeRecord.value?.find(
      (el) =>
        el.idShort === 'PcnType' ||
        SemanticIdHelper.hasSemanticId(el, 'http://admin-shell.io/VDMA/Fluidics/ProductChangeNotification/PcnType/1/0'),
    );
    if (pcnTypeObj != null && pcnTypeObj instanceof Property) {
      return pcnTypeObj.value;
    }
    return '';
  });
}
