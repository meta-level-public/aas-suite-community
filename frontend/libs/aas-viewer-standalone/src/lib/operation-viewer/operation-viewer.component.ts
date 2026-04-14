import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { EncodingService } from '@aas/common-services';
import { Property } from '@aas/model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, inject, Input, model } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { ViewerStoreService } from '../viewer-store.service';

import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from 'primeng/accordion';
import { PrimeTemplate } from 'primeng/api';
import { Button } from 'primeng/button';
import { Divider } from 'primeng/divider';
import { Fieldset } from 'primeng/fieldset';
import { InputText } from 'primeng/inputtext';
import { Ripple } from 'primeng/ripple';
import { SelectButton } from 'primeng/selectbutton';
import { TableModule } from 'primeng/table';
import { OperationVariableComponent } from './operation-variable/operation-variable.component';

@Component({
  selector: 'aas-operation-viewer',
  templateUrl: './operation-viewer.component.html',
  imports: [
    TableModule,
    PrimeTemplate,
    OperationVariableComponent,
    Fieldset,
    Accordion,
    AccordionPanel,
    Ripple,
    AccordionHeader,
    AccordionContent,
    FormsModule,
    InputText,
    Divider,
    SelectButton,
    Button,
    TranslateModule,
  ],
})
export class OperationViewerComponent {
  @Input() operation: aas.types.Operation | null | undefined;
  @Input({ required: true }) idShortPath: string = '';
  @Input({ required: true }) submodelId: string = '';

  executeType = model<'shell' | 'aas-repo' | 'sm-repo'>('aas-repo');
  executeUrl = model('');
  // treeService = inject(V3TreeService);
  http = inject(HttpClient);
  inputVariables = model<any[]>([]);
  outputVariables = model<any[]>([]);
  inoutputVariables = model<any[]>([]);

  viewerStore = inject(ViewerStoreService);

  async getExecuteUrl() {
    let url = (await this.viewerStore.currentSmUrl()) ?? '';
    // const infra = PortalService.getCurrentAasInfrastructureSetting();
    // if (infra != null) {
    //   url = infra.aasRepositoryUrl ?? '';
    // }

    const currentIdShortPath = this.idShortPath;
    const currentSubmodelId = EncodingService.base64urlEncode(this.submodelId);
    const currentAasId = 'TODO';

    switch (this.executeType()) {
      case 'shell':
        url += `/submodels/${currentSubmodelId}/submodel-elements/${currentIdShortPath}/invoke/$value`;
        break;
      case 'aas-repo':
        url += `/shells/${currentAasId}/submodels/${currentSubmodelId}/submodel-elements/${currentIdShortPath}/invoke/$value`;
        break;
      case 'sm-repo':
        url += `/submodels/${currentSubmodelId}/submodel-elements/${currentIdShortPath}/invoke/$value`;
        break;
    }

    return url;
  }
  async calculateUrl() {
    const url = await this.getExecuteUrl();
    this.executeUrl.set(url);
  }

  calculateVariables() {
    this.inputVariables.set(
      this.operation?.inputVariables?.map((v) => ({
        idShort: v.value.idShort,
        value: (v.value as any as Property).value ?? '',
      })) ?? [],
    );

    this.outputVariables.set(
      this.operation?.outputVariables?.map((v) => ({
        idShort: v.value.idShort,
        value: (v.value as any as Property).value ?? '',
      })) ?? [],
    );

    this.inoutputVariables.set(
      this.operation?.inoutputVariables?.map((v) => ({
        idShort: v.value.idShort,
        value: (v.value as any as Property).value ?? '',
      })) ?? [],
    );
  }
  async execute() {
    // REST-Aufruf starten
    const body: any = {
      inputVariables: this.inputVariables(),
      inoutputVariables: this.inoutputVariables(),
    };

    let params = new HttpParams();

    this.inputVariables().forEach((v) => {
      params = params.set(v.idShort, v.value);
    });

    const res = await lastValueFrom(this.http.post(this.executeUrl(), body, { params }));
    // eslint-disable-next-line no-console
    console.log(res);
  }
  async executeAsync() {
    // REST-Aufruf starten
    const body: any = {
      inputVariables: this.inputVariables(),
      inoutputVariables: this.inoutputVariables(),
    };

    this.inputVariables().forEach((v) => {
      body[v.idShort] = v.value;
    });

    const url = this.executeUrl().replace('/invoke/', '/invoke-async/');
    const res = await lastValueFrom(this.http.post(url, body));
    // eslint-disable-next-line no-console
    console.log(res);
  }
}
