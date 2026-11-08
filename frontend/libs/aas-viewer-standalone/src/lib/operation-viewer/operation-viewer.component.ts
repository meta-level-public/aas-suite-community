import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { EncodingService } from '@aas/common-services';
import { UrlHelper } from '@aas/helpers';
import { Property } from '@aas/model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, inject, Input, model, ChangeDetectionStrategy } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { ViewerStoreService } from '../viewer-store.service';

import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from '@openng/optimus-ui/accordion';
import { PrimeTemplate } from '@openng/optimus-ui/api';
import { Button } from '@openng/optimus-ui/button';
import { Divider } from '@openng/optimus-ui/divider';
import { Fieldset } from '@openng/optimus-ui/fieldset';
import { InputText } from '@openng/optimus-ui/inputtext';
import { Message } from '@openng/optimus-ui/message';
import { Ripple } from '@openng/optimus-ui/ripple';
import { SelectButton } from '@openng/optimus-ui/selectbutton';
import { TableModule } from '@openng/optimus-ui/table';
import { OperationVariableComponent } from './operation-variable/operation-variable.component';
import { ExpandedStateDirective } from '../expanded-state/expanded-state.directive';

@Component({
  selector: 'aas-operation-viewer',
  templateUrl: './operation-viewer.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    ExpandedStateDirective,
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
    Message,
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

  /**
   * Invoke URL for the operation. The submodel endpoint already ends with `/submodels/{id}`, the AAS endpoint
   * with `/shells/{id}`. Returns an empty string when the required endpoint is not known.
   */
  getExecuteUrl(): string {
    const operationPath = `submodel-elements/${this.idShortPath}/invoke/$value`;

    if (this.executeType() === 'sm-repo') {
      // Use the submodel this operation belongs to, not the one currently selected in the navigation.
      const smUrl = this.viewerStore.submodels().find((sm) => sm.id === this.submodelId)?.url ?? '';
      return smUrl === '' ? '' : UrlHelper.appendSlash(smUrl) + operationPath;
    }

    const aasUrl = this.viewerStore.aasUrl();
    if (aasUrl === '' || this.submodelId === '') {
      return '';
    }
    return `${UrlHelper.appendSlash(aasUrl)}submodels/${EncodingService.base64urlEncode(this.submodelId)}/${operationPath}`;
  }

  canExecute(): boolean {
    return this.getExecuteUrl() !== '';
  }

  calculateUrl() {
    this.executeUrl.set(this.getExecuteUrl());
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
    const url = this.getExecuteUrl();
    if (url === '') return;
    // REST-Aufruf starten
    const body: any = {
      inputVariables: this.inputVariables(),
      inoutputVariables: this.inoutputVariables(),
    };

    let params = new HttpParams();

    this.inputVariables().forEach((v) => {
      params = params.set(v.idShort, v.value);
    });

    await lastValueFrom(this.http.post(url, body, { params }));
  }
  async executeAsync() {
    const executeUrl = this.getExecuteUrl();
    if (executeUrl === '') return;
    // REST-Aufruf starten
    const body: any = {
      inputVariables: this.inputVariables(),
      inoutputVariables: this.inoutputVariables(),
    };

    this.inputVariables().forEach((v) => {
      body[v.idShort] = v.value;
    });

    const url = executeUrl.replace('/invoke/', '/invoke-async/');
    await lastValueFrom(this.http.post(url, body));
  }
}
