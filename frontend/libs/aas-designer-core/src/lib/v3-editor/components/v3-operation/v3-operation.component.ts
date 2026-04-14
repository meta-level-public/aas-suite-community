import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { HelpLabelComponent } from '@aas/common-components';
import { EncodingService, PortalService } from '@aas/common-services';
import { InstanceHelper } from '@aas/helpers';
import { ShellResult } from '@aas/model';
import { NgClass } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, Input, model, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from 'primeng/accordion';
import { Button } from 'primeng/button';
import { Divider } from 'primeng/divider';
import { Fieldset } from 'primeng/fieldset';
import { InputText } from 'primeng/inputtext';
import { Ripple } from 'primeng/ripple';
import { SelectButton } from 'primeng/selectbutton';
import { lastValueFrom } from 'rxjs';
import { NullIfEmptyDirective } from '../../../general/directives/null-if-empty.directive';
import { Info } from '../../../general/model/info-item';
import { V3TreeItem } from '../../model/v3-tree-item';
import { V3TreeService } from '../../v3-tree/v3-tree.service';
import { EndpointUrlComponent } from '../endpoint-url/endpoint-url.component';
import { V3CategoryComponent } from '../v3-category/v3-category.component';
import { V3ComponentBase } from '../v3-component-base';
import { V3IdShortComponent } from '../v3-id-short/v3-id-short.component';
import { V3LangStringListComponent } from '../v3-lang-string-list/v3-lang-string-list.component';
import { V3QualifiersComponent } from '../v3-qualifiers/v3-qualifiers.component';
import { V3SemanticDescriptionComponent } from '../v3-semantic-description/v3-semantic-description.component';
import { V3VariablePropertyComponent } from './v3-variable-property/v3-variable-property.component';
type OperationVariable = aas.types.OperationVariable;
type Property = aas.types.Property;
@Component({
  selector: 'aas-v3-operation',
  templateUrl: './v3-operation.component.html',
  imports: [
    Fieldset,
    HelpLabelComponent,
    V3IdShortComponent,
    Button,
    V3LangStringListComponent,
    V3CategoryComponent,
    Accordion,
    AccordionPanel,
    Ripple,
    AccordionHeader,
    AccordionContent,
    V3VariablePropertyComponent,
    Button,
    Divider,
    FormsModule,
    InputText,
    NullIfEmptyDirective,
    SelectButton,
    NgClass,
    V3SemanticDescriptionComponent,
    V3QualifiersComponent,
    EndpointUrlComponent,
    TranslateModule,
  ],
})
export class V3OperationComponent extends V3ComponentBase implements OnInit {
  @Input() operation: V3TreeItem<aas.types.Operation> | undefined;
  @Input({ required: true }) shellResult: ShellResult | undefined;
  @Input({ required: true }) idShortPath: string = '';

  info = Info;

  ngOnInit(): void {
    this.calculateUrl();
    this.calculateVariables();
  }

  addTyp(target: 'in' | 'out' | 'inout', typ: 'mlp' | 'prop' | 'smc') {
    if (this.operation?.content) {
      let prop: any;
      switch (typ) {
        case 'mlp':
          prop = new aas.types.MultiLanguageProperty();
          break;
        case 'prop':
          prop = new aas.types.Property(aas.types.DataTypeDefXsd.String);
          break;
        case 'smc':
          prop = new aas.types.SubmodelElementCollection(null, null, '');
          break;
      }

      const opVar = new aas.types.OperationVariable(prop);

      switch (target) {
        case 'in':
          if (this.operation.content.inputVariables == null) this.operation.content.inputVariables = [];
          this.operation.content.inputVariables.push(opVar);
          break;
        case 'out':
          if (this.operation.content.outputVariables == null) this.operation.content.outputVariables = [];
          this.operation.content.outputVariables.push(opVar);
          break;
        case 'inout':
          if (this.operation.content.inoutputVariables == null) this.operation.content.inoutputVariables = [];
          this.operation.content.inoutputVariables.push(opVar);
          break;
      }
    }
    this.calculateVariables();
  }

  deleteVariable(opVar: any, target: 'in' | 'out' | 'inout') {
    if (this.operation?.content) {
      let indx = -1;
      switch (target) {
        case 'in':
          indx = this.operation.content.inputVariables?.indexOf(opVar) ?? -1;
          if (indx !== -1) this.operation.content.inputVariables?.splice(indx, 1);
          break;
        case 'out':
          indx = this.operation.content.outputVariables?.indexOf(opVar) ?? -1;
          if (indx !== -1) this.operation.content.outputVariables?.splice(indx, 1);
          break;
        case 'inout':
          indx = this.operation.content.inoutputVariables?.indexOf(opVar) ?? -1;
          if (indx !== -1) this.operation.content.inoutputVariables?.splice(indx, 1);
          break;
      }
    }
    this.calculateVariables();
  }

  getType(input: OperationVariable) {
    return InstanceHelper.getInstanceName(input.value);
  }

  get hasErrors() {
    const errors = [];
    if (this.operation?.content) {
      for (const error of aas.verification.verify(this.operation.content)) {
        errors.push(error);
      }
    }
    return errors.filter((e) => (e.path.segments[0] as any)?.name === 'idShort').length > 0;
  }

  get hasSemanticErrors() {
    const errors = [];
    if (this.operation?.content?.semanticId != null) {
      for (const error of aas.verification.verify(this.operation.content.semanticId, false)) {
        errors.push(error);
      }
    }
    return errors.length > 0;
  }

  executeType = model<'shell' | 'aas-repo' | 'sm-repo'>('aas-repo');
  executeUrl = model('');
  treeService = inject(V3TreeService);
  http = inject(HttpClient);
  inputVariables = model<any[]>([]);
  outputVariables = model<any[]>([]);
  inoutputVariables = model<any[]>([]);

  getExecuteUrl() {
    let url = '';
    const infra = PortalService.getCurrentAasInfrastructureSetting();
    if (infra != null) {
      url = infra.aasRepositoryUrl ?? '';
    }

    const currentIdShortPath = this.treeService.getCurrentIdShortPath();
    const currentSubmodelId = EncodingService.base64urlEncode(this.treeService.getCurrentSubmodel().id);
    const currentAasId = EncodingService.base64urlEncode(this.treeService.getCurrentAasId());

    switch (this.executeType()) {
      case 'shell':
        url += `/aas/submodels/${currentSubmodelId}/submodel-elements/${currentIdShortPath}/invoke/$value`;
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
  calculateUrl() {
    this.executeUrl.set(this.getExecuteUrl());
  }

  calculateVariables() {
    this.inputVariables.set(
      this.operation?.content?.inputVariables?.map((v) => ({
        idShort: v.value.idShort,
        value: (v.value as Property).value ?? '',
      })) ?? [],
    );

    this.outputVariables.set(
      this.operation?.content?.outputVariables?.map((v) => ({
        idShort: v.value.idShort,
        value: (v.value as Property).value ?? '',
      })) ?? [],
    );

    this.inoutputVariables.set(
      this.operation?.content?.inoutputVariables?.map((v) => ({
        idShort: v.value.idShort,
        value: (v.value as Property).value ?? '',
      })) ?? [],
    );
  }
  async execute() {
    // REST-Aufruf starten
    const body = {
      inputVariables: this.inputVariables(),
      inoutputVariables: this.inoutputVariables(),
    };

    const res = await lastValueFrom(this.http.post(this.executeUrl(), body));
    // eslint-disable-next-line no-console
    console.log(res);
  }
  async executeAsync() {
    // REST-Aufruf starten
    const body = {
      inputVariables: this.inputVariables(),
      inoutputVariables: this.inoutputVariables(),
    };

    const url = this.executeUrl().replace('/invoke/', '/invoke-async/');
    const res = await lastValueFrom(this.http.post(url, body));
    // eslint-disable-next-line no-console
    console.log(res);
  }
}
