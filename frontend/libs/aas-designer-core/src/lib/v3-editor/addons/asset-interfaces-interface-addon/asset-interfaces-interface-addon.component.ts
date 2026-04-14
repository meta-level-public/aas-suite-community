import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Select } from 'primeng/select';
import { Fieldset } from 'primeng/fieldset';

type AidInterfaceDialogData = {
  count?: number;
  existingInterface?: aas.types.SubmodelElementCollection;
};

type ProtocolType = 'HTTP' | 'MQTT' | 'Modbus' | 'Other';
type InteractionType = 'Property' | 'Action' | 'Event';
type HttpHeaderDraft = { name: string; value: string };
type FormDraft = {
  idShort: string;
  target: string;
  contentType: string;
  protocol: ProtocolType;
  otherProtocol: string;
  httpMethod: string;
  mqttQos: string;
  mqttRetain: string;
  mqttControlPacket: string;
  modbusFunction: string;
  modbusEntity: string;
  modbusZeroBased: string;
  modbusPollingTime: string;
  modbusTimeout: string;
  modbusPayloadDataType: string;
  securityConfiguration: string;
  httpHeaders: HttpHeaderDraft[];
};
type SecuritySchemeDraft = {
  idShort: string;
  scheme: string;
  in: string;
  name: string;
  description: string;
};
type AidPropertyDraft = {
  idShort: string;
  key: string;
  title: string;
  dataType: string;
  unitCode: string;
  isObservable: boolean;
  valueSemantics: string;
  children: AidPropertyDraft[];
};

@Component({
  selector: 'aas-asset-interfaces-interface-addon',
  templateUrl: './asset-interfaces-interface-addon.component.html',
  imports: [CommonModule, FormsModule, TranslateModule, Button, InputText, Message, Select, Fieldset],
  styles: [
    `
      :host ::ng-deep .capability-fieldset .p-fieldset-legend {
        display: flex;
        align-items: center;
        width: 100%;
        padding: 0 !important;
      }

      :host ::ng-deep .capability-fieldset.p-fieldset-toggleable .p-fieldset-legend a {
        padding: 0 !important;
      }

      :host ::ng-deep .capability-fieldset.p-fieldset-toggleable .p-fieldset-toggle-button {
        display: flex;
        align-items: center;
        width: 100%;
      }

      :host ::ng-deep .capability-fieldset .p-fieldset-legend-label,
      :host ::ng-deep .capability-fieldset .p-fieldset-legend-text {
        display: flex;
        align-items: center;
        flex: 1;
        width: 100%;
      }

      .aid-addon-container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      :host ::ng-deep .aid-fieldset {
        border: 1px solid var(--p-content-border-color);
        background: var(--p-content-background);
        border-radius: var(--p-border-radius);
      }

      :host ::ng-deep .aid-fieldset .p-fieldset-content {
        padding: 0.9rem;
      }
    `,
  ],
})
export class AssetInterfacesInterfaceAddonComponent {
  private readonly config = inject(DynamicDialogConfig);
  private readonly ref = inject(DynamicDialogRef);

  idShort = 'Interface00';
  title = '';
  endpointBase = '';
  interactionType: InteractionType = 'Property';

  private existing: aas.types.SubmodelElementCollection | null = null;

  protocolOptions: { label: string; value: ProtocolType }[] = [
    { label: 'HTTP', value: 'HTTP' },
    { label: 'MQTT', value: 'MQTT' },
    { label: 'Modbus', value: 'Modbus' },
    { label: 'Other', value: 'Other' },
  ];
  interactionTypeOptions: { label: string; value: InteractionType }[] = [
    { label: 'Property', value: 'Property' },
    { label: 'Action', value: 'Action' },
    { label: 'Event', value: 'Event' },
  ];
  httpMethodOptions: { label: string; value: string }[] = [
    { label: 'GET', value: 'GET' },
    { label: 'POST', value: 'POST' },
    { label: 'PUT', value: 'PUT' },
    { label: 'PATCH', value: 'PATCH' },
    { label: 'DELETE', value: 'DELETE' },
  ];

  forms: FormDraft[] = [];
  securitySchemes: SecuritySchemeDraft[] = [];
  propertyDefinitions: AidPropertyDraft[] = [];

  constructor() {
    const data = (this.config.data ?? {}) as AidInterfaceDialogData;
    this.idShort = `Interface${(data.count ?? 0).toString().padStart(2, '0')}`;

    if (data.existingInterface != null) {
      this.existing = data.existingInterface;
      this.applyFromExisting(data.existingInterface);
    } else {
      this.forms = [this.createEmptyForm(0)];
      this.propertyDefinitions = [];
    }
  }

  get validationErrors(): string[] {
    const errors: string[] = [];
    if (this.idShort.trim() === '') errors.push('AID_INTERFACE_VALIDATION_ID_SHORT_REQUIRED');
    if (this.forms.length === 0) errors.push('AID_INTERFACE_VALIDATION_FORM_REQUIRED');

    this.forms.forEach((form) => {
      if (form.target.trim() === '') errors.push('AID_INTERFACE_VALIDATION_TARGET_REQUIRED');
      if (form.protocol === 'Other' && form.otherProtocol.trim() === '') {
        errors.push('AID_INTERFACE_VALIDATION_PROTOCOL_VALUE_REQUIRED');
      }
    });

    return errors;
  }

  get canApply(): boolean {
    return this.validationErrors.length === 0;
  }

  cancel(): void {
    this.ref.close(null);
  }

  addForm(): void {
    this.forms.push(this.createEmptyForm(this.forms.length));
  }

  removeForm(index: number): void {
    this.forms.splice(index, 1);
  }

  addHttpHeader(form: FormDraft): void {
    form.httpHeaders.push({ name: '', value: '' });
  }

  removeHttpHeader(form: FormDraft, index: number): void {
    form.httpHeaders.splice(index, 1);
  }

  addSecurityScheme(): void {
    this.securitySchemes.push({
      idShort: `securityScheme${this.securitySchemes.length.toString().padStart(2, '0')}`,
      scheme: '',
      in: '',
      name: '',
      description: '',
    });
  }

  removeSecurityScheme(index: number): void {
    this.securitySchemes.splice(index, 1);
  }

  addPropertyDefinition(): void {
    this.propertyDefinitions.push(this.createEmptyPropertyDefinition(this.propertyDefinitions.length));
  }

  removePropertyDefinition(index: number): void {
    this.propertyDefinitions.splice(index, 1);
  }

  addNestedPropertyDefinition(parent: AidPropertyDraft): void {
    parent.children.push(this.createEmptyPropertyDefinition(parent.children.length));
  }

  removeNestedPropertyDefinition(parent: AidPropertyDraft, index: number): void {
    parent.children.splice(index, 1);
  }

  onFormProtocolChanged(form: FormDraft, protocol: ProtocolType): void {
    if (protocol === 'HTTP') {
      if (form.contentType.trim() === '') form.contentType = 'application/json';
      if (form.target.trim() === '') form.target = '/';
      if (form.httpMethod.trim() === '') form.httpMethod = 'GET';
    }
    if (protocol === 'MQTT') {
      if (form.contentType.trim() === '') form.contentType = 'application/json';
      if (form.target.trim() === '') form.target = 'mqtt://broker/topic';
    }
    if (protocol === 'Modbus') {
      if (form.contentType.trim() === '') form.contentType = 'application/octet-stream';
      if (form.target.trim() === '') form.target = 'modbus://device/register';
    }
  }

  apply(): void {
    if (!this.canApply) return;

    const result =
      this.existing != null ? this.existing : new aas.types.SubmodelElementCollection(null, null, this.idShort);
    result.idShort = this.idShort.trim();
    result.semanticId = this.createExternalRef('https://admin-shell.io/idta/AssetInterfacesDescription/1/0/Interface');

    if (result.value == null) result.value = [];

    this.upsertProperty(result.value, 'title', 'https://www.w3.org/2019/wot/td#title', this.title);

    const endpointMetadata = this.upsertCollection(
      result.value,
      'EndpointMetadata',
      'https://admin-shell.io/idta/AssetInterfacesDescription/1/0/EndpointMetadata',
    );
    this.upsertProperty(
      endpointMetadata.value!,
      'baseURI',
      'https://www.w3.org/2019/wot/td#baseURI',
      this.endpointBase,
    );
    this.writeSecuritySchemes(endpointMetadata);

    const interactionMetadata = this.upsertCollection(
      result.value,
      'InteractionMetadata',
      this.getInteractionSemanticId(this.interactionType),
    );
    this.writePropertyDefinitions(interactionMetadata, this.propertyDefinitions);

    const formsCollection = this.upsertCollection(
      interactionMetadata.value!,
      'forms',
      'https://www.w3.org/2019/wot/td#hasForm',
    );
    formsCollection.value = [];

    this.forms.forEach((draft, index) => {
      const form = new aas.types.SubmodelElementCollection(
        null,
        null,
        draft.idShort.trim() || `Form${index.toString().padStart(2, '0')}`,
      );
      form.semanticId = this.createExternalRef('https://www.w3.org/2019/wot/td#hasForm');
      form.value = [];

      this.upsertProperty(form.value, 'target', 'https://www.w3.org/2019/wot/hypermedia#hasTarget', draft.target);
      this.upsertProperty(
        form.value,
        'contentType',
        'https://www.w3.org/2019/wot/hypermedia#forContentType',
        draft.contentType,
      );
      this.upsertProperty(
        form.value,
        'Protocol',
        'https://www.w3.org/2019/wot/hypermedia#forSubProtocol',
        draft.protocol === 'Other' ? draft.otherProtocol : draft.protocol,
      );
      this.upsertProperty(form.value, 'methodName', 'https://www.w3.org/2011/http#methodName', draft.httpMethod);
      this.upsertProperty(form.value, 'qos', 'https://www.w3.org/2019/wot/mqtt#hasQoSFlag', draft.mqttQos);
      this.upsertProperty(form.value, 'retain', 'https://www.w3.org/2019/wot/mqtt#hasRetainFlag', draft.mqttRetain);
      this.upsertProperty(
        form.value,
        'ControlPacket',
        'https://www.w3.org/2019/wot/mqtt#ControlPacket',
        draft.mqttControlPacket,
      );
      this.upsertProperty(
        form.value,
        'modv_function',
        'https://www.w3.org/2019/wot/modbus#hasFunction',
        draft.modbusFunction,
      );
      this.upsertProperty(
        form.value,
        'modv_entity',
        'https://www.w3.org/2019/wot/modbus#hasEntity',
        draft.modbusEntity,
      );
      this.upsertProperty(
        form.value,
        'modv_zeroBased',
        'https://www.w3.org/2019/wot/modbus#hasZeroBasedAddr',
        draft.modbusZeroBased,
      );
      this.upsertProperty(
        form.value,
        'modv_pollingTime',
        'https://www.w3.org/2019/wot/modbus#hasPollingTime',
        draft.modbusPollingTime,
      );
      this.upsertProperty(
        form.value,
        'modv_timeout',
        'https://www.w3.org/2019/wot/modbus#hasTimeout',
        draft.modbusTimeout,
      );
      this.upsertProperty(
        form.value,
        'modv_payloadDataType',
        'https://www.w3.org/2019/wot/modbus#hasPayloadDataType',
        draft.modbusPayloadDataType,
      );
      this.upsertProperty(
        form.value,
        'security',
        'https://www.w3.org/2019/wot/td#hasSecurityConfiguration',
        draft.securityConfiguration,
      );
      this.writeHttpHeaders(form, draft.httpHeaders);

      formsCollection.value?.push(form);
    });

    this.ref.close(result);
  }

  private applyFromExisting(existing: aas.types.SubmodelElementCollection): void {
    this.idShort = existing.idShort?.trim() || this.idShort;
    this.title = this.readProperty(existing.value ?? [], 'https://www.w3.org/2019/wot/td#title', 'title');

    const endpointMetadata = this.findCollection(
      existing.value ?? [],
      'https://admin-shell.io/idta/AssetInterfacesDescription/1/0/EndpointMetadata',
      'EndpointMetadata',
    );
    this.endpointBase = this.readProperty(
      endpointMetadata?.value ?? [],
      'https://www.w3.org/2019/wot/td#baseURI',
      'baseURI',
    );
    this.securitySchemes = this.readSecuritySchemes(endpointMetadata);

    const interactionMetadata = this.findInteractionCollection(existing.value ?? []);
    this.interactionType = this.getInteractionTypeFromCollection(interactionMetadata);
    this.propertyDefinitions = this.readPropertyDefinitions(interactionMetadata);

    const formsCollection = this.findCollection(
      interactionMetadata?.value ?? [],
      'https://www.w3.org/2019/wot/td#hasForm',
      'forms',
    );
    const formCollections = (formsCollection?.value ?? []).filter(
      (el): el is aas.types.SubmodelElementCollection => el instanceof aas.types.SubmodelElementCollection,
    );

    this.forms = formCollections.map((form, index) => {
      const target = this.readProperty(form.value ?? [], 'https://www.w3.org/2019/wot/hypermedia#hasTarget', 'target');
      const protocolValue = this.readProperty(
        form.value ?? [],
        'https://www.w3.org/2019/wot/hypermedia#forSubProtocol',
        'Protocol',
      );
      const normalizedProtocol = this.normalizeProtocol(protocolValue, target);

      return {
        idShort: form.idShort?.trim() || `Form${index.toString().padStart(2, '0')}`,
        target,
        contentType: this.readProperty(
          form.value ?? [],
          'https://www.w3.org/2019/wot/hypermedia#forContentType',
          'contentType',
        ),
        protocol: normalizedProtocol,
        otherProtocol: normalizedProtocol === 'Other' ? protocolValue : '',
        httpMethod:
          this.readProperty(form.value ?? [], 'https://www.w3.org/2011/http#methodName', 'methodName') || 'GET',
        mqttQos: this.readProperty(form.value ?? [], 'https://www.w3.org/2019/wot/mqtt#hasQoSFlag', 'qos'),
        mqttRetain: this.readProperty(form.value ?? [], 'https://www.w3.org/2019/wot/mqtt#hasRetainFlag', 'retain'),
        mqttControlPacket: this.readProperty(
          form.value ?? [],
          'https://www.w3.org/2019/wot/mqtt#ControlPacket',
          'ControlPacket',
        ),
        modbusFunction: this.readProperty(
          form.value ?? [],
          'https://www.w3.org/2019/wot/modbus#hasFunction',
          'modv_function',
        ),
        modbusEntity: this.readProperty(
          form.value ?? [],
          'https://www.w3.org/2019/wot/modbus#hasEntity',
          'modv_entity',
        ),
        modbusZeroBased: this.readProperty(
          form.value ?? [],
          'https://www.w3.org/2019/wot/modbus#hasZeroBasedAddr',
          'modv_zeroBased',
        ),
        modbusPollingTime: this.readProperty(
          form.value ?? [],
          'https://www.w3.org/2019/wot/modbus#hasPollingTime',
          'modv_pollingTime',
        ),
        modbusTimeout: this.readProperty(
          form.value ?? [],
          'https://www.w3.org/2019/wot/modbus#hasTimeout',
          'modv_timeout',
        ),
        modbusPayloadDataType: this.readProperty(
          form.value ?? [],
          'https://www.w3.org/2019/wot/modbus#hasPayloadDataType',
          'modv_payloadDataType',
        ),
        securityConfiguration: this.readProperty(
          form.value ?? [],
          'https://www.w3.org/2019/wot/td#hasSecurityConfiguration',
          'security',
        ),
        httpHeaders: this.readHttpHeaders(form),
      };
    });

    if (this.forms.length === 0) {
      this.forms = [this.createEmptyForm(0)];
    }
  }

  private createEmptyForm(index: number): FormDraft {
    return {
      idShort: `Form${index.toString().padStart(2, '0')}`,
      target: '',
      contentType: 'application/json',
      protocol: 'HTTP',
      otherProtocol: '',
      httpMethod: 'GET',
      mqttQos: '',
      mqttRetain: '',
      mqttControlPacket: '',
      modbusFunction: '',
      modbusEntity: '',
      modbusZeroBased: '',
      modbusPollingTime: '',
      modbusTimeout: '',
      modbusPayloadDataType: '',
      securityConfiguration: '',
      httpHeaders: [],
    };
  }

  private createEmptyPropertyDefinition(index: number): AidPropertyDraft {
    return {
      idShort: `property${index.toString().padStart(2, '0')}`,
      key: '',
      title: '',
      dataType: '',
      unitCode: '',
      isObservable: false,
      valueSemantics: '',
      children: [],
    };
  }

  private getInteractionSemanticId(interactionType: InteractionType): string {
    switch (interactionType) {
      case 'Action':
        return 'https://www.w3.org/2019/wot/td#ActionAffordance';
      case 'Event':
        return 'https://www.w3.org/2019/wot/td#EventAffordance';
      default:
        return 'https://www.w3.org/2019/wot/td#PropertyAffordance';
    }
  }

  private getInteractionTypeFromCollection(
    collection: aas.types.SubmodelElementCollection | undefined,
  ): InteractionType {
    const sem = this.readFirstRefValue(collection?.semanticId).toLowerCase();
    if (sem.includes('actionaffordance')) return 'Action';
    if (sem.includes('eventaffordance')) return 'Event';
    return 'Property';
  }

  private findInteractionCollection(
    elements: aas.types.ISubmodelElement[],
  ): aas.types.SubmodelElementCollection | undefined {
    return (
      this.findCollection(elements, 'https://www.w3.org/2019/wot/td#InteractionAffordance', 'InteractionMetadata') ??
      this.findCollection(elements, 'https://www.w3.org/2019/wot/td#PropertyAffordance', 'InteractionMetadata') ??
      this.findCollection(elements, 'https://www.w3.org/2019/wot/td#ActionAffordance', 'InteractionMetadata') ??
      this.findCollection(elements, 'https://www.w3.org/2019/wot/td#EventAffordance', 'InteractionMetadata')
    );
  }

  private normalizeProtocol(protocol: string, target: string): ProtocolType {
    const value = protocol.trim().toLowerCase();
    const tgt = target.trim().toLowerCase();
    if (value === 'http' || tgt.startsWith('http://') || tgt.startsWith('https://')) return 'HTTP';
    if (value === 'mqtt' || tgt.startsWith('mqtt://')) return 'MQTT';
    if (value === 'modbus' || tgt.startsWith('modbus://')) return 'Modbus';
    return protocol.trim() === '' ? 'HTTP' : 'Other';
  }

  private writeHttpHeaders(form: aas.types.SubmodelElementCollection, headers: HttpHeaderDraft[]): void {
    const parent = form.value ?? [];
    const headersCollection = this.findCollection(parent, 'https://www.w3.org/2011/http#headers', 'headers');
    const relevant = headers
      .map((h) => ({ name: h.name.trim(), value: h.value.trim() }))
      .filter((h) => h.name !== '' || h.value !== '');

    if (relevant.length === 0) {
      if (headersCollection != null) headersCollection.value = [];
      return;
    }

    const targetCollection =
      headersCollection ?? this.upsertCollection(parent, 'headers', 'https://www.w3.org/2011/http#headers');
    targetCollection.value = [];
    targetCollection.semanticId = this.createExternalRef('https://www.w3.org/2011/http#headers');
    targetCollection.idShort = 'headers';

    relevant.forEach((header, index) => {
      const entry = new aas.types.SubmodelElementCollection(null, null, `Header${index.toString().padStart(2, '0')}`);
      entry.semanticId = this.createExternalRef('https://www.w3.org/2011/http#headers');
      entry.value = [];
      this.upsertProperty(entry.value, 'fieldName', 'https://www.w3.org/2011/http#fieldName', header.name);
      this.upsertProperty(entry.value, 'fieldValue', 'https://www.w3.org/2011/http#fieldValue', header.value);
      targetCollection.value?.push(entry);
    });
  }

  private readHttpHeaders(form: aas.types.SubmodelElementCollection): HttpHeaderDraft[] {
    const headersCollection = this.findCollection(form.value ?? [], 'https://www.w3.org/2011/http#headers', 'headers');
    if (headersCollection == null) return [];

    return (headersCollection.value ?? [])
      .filter((el): el is aas.types.SubmodelElementCollection => el instanceof aas.types.SubmodelElementCollection)
      .map((entry) => ({
        name: this.readProperty(entry.value ?? [], 'https://www.w3.org/2011/http#fieldName', 'fieldName'),
        value: this.readProperty(entry.value ?? [], 'https://www.w3.org/2011/http#fieldValue', 'fieldValue'),
      }))
      .filter((header) => header.name !== '' || header.value !== '');
  }

  private writeSecuritySchemes(endpointMetadata: aas.types.SubmodelElementCollection): void {
    const parent = endpointMetadata.value ?? [];
    const definitionsCollection = this.upsertCollection(
      parent,
      'securityDefinitions',
      'https://www.w3.org/2019/wot/td#definesSecurityScheme',
    );

    definitionsCollection.value = [];
    this.securitySchemes
      .map((s) => ({
        idShort: s.idShort.trim(),
        scheme: s.scheme.trim(),
        in: s.in.trim(),
        name: s.name.trim(),
        description: s.description.trim(),
      }))
      .filter((s) => s.idShort !== '' || s.scheme !== '' || s.in !== '' || s.name !== '' || s.description !== '')
      .forEach((scheme, index) => {
        const entry = new aas.types.SubmodelElementCollection(
          null,
          null,
          scheme.idShort || `securityScheme${index.toString().padStart(2, '0')}`,
        );
        entry.semanticId = this.createExternalRef('https://www.w3.org/2019/wot/td#definesSecurityScheme');
        entry.value = [];
        this.upsertProperty(entry.value, 'scheme', 'https://www.w3.org/2019/wot/td#scheme', scheme.scheme);
        this.upsertProperty(entry.value, 'in', 'https://www.w3.org/2019/wot/td#in', scheme.in);
        this.upsertProperty(entry.value, 'name', 'https://www.w3.org/2019/wot/td#name', scheme.name);
        this.upsertProperty(
          entry.value,
          'description',
          'https://www.w3.org/2019/wot/td#description',
          scheme.description,
        );
        definitionsCollection.value?.push(entry);
      });
  }

  private writePropertyDefinitions(
    interactionMetadata: aas.types.SubmodelElementCollection,
    properties: AidPropertyDraft[],
  ): void {
    const parent = interactionMetadata.value ?? [];
    const propertiesCollection = this.upsertCollection(
      parent,
      'properties',
      'https://www.w3.org/2019/wot/json-schema#properties',
    );
    propertiesCollection.value = [];

    properties
      .filter((p) => this.hasPropertyContent(p))
      .forEach((property, index) => {
        propertiesCollection.value?.push(this.createPropertyElement(property, index));
      });
  }

  private createPropertyElement(property: AidPropertyDraft, index: number): aas.types.SubmodelElementCollection {
    const entry = new aas.types.SubmodelElementCollection(
      null,
      null,
      property.idShort.trim() || `property${index.toString().padStart(2, '0')}`,
    );
    entry.semanticId = this.createExternalRef('https://www.w3.org/2019/wot/json-schema#propertyName');
    entry.value = [];

    this.upsertProperty(
      entry.value,
      'key',
      'https://admin-shell.io/idta/AssetInterfacesDescription/1/0/key',
      property.key,
    );
    this.upsertProperty(entry.value, 'title', 'https://www.w3.org/2019/wot/td#title', property.title);
    this.upsertProperty(entry.value, 'type', 'https://www.w3.org/1999/02/22-rdf-syntax-ns#type', property.dataType);
    this.upsertProperty(entry.value, 'unitCode', 'https://schema.org/unitCode', property.unitCode);
    this.upsertProperty(
      entry.value,
      'isObservable',
      'https://www.w3.org/2019/wot/td#isObservable',
      property.isObservable ? 'true' : 'false',
    );
    this.upsertProperty(
      entry.value,
      'valueSemantics',
      'https://adminshell.io/idta/AssetInterfacesDescription/1/0/valueSemantics',
      property.valueSemantics,
    );

    if (property.children.some((child) => this.hasPropertyContent(child))) {
      const childCollection = this.upsertCollection(
        entry.value,
        'properties',
        'https://www.w3.org/2019/wot/json-schema#properties',
      );
      childCollection.value = [];
      property.children
        .filter((child) => this.hasPropertyContent(child))
        .forEach((child, childIndex) => childCollection.value?.push(this.createPropertyElement(child, childIndex)));
    }

    return entry;
  }

  private readPropertyDefinitions(
    interactionMetadata: aas.types.SubmodelElementCollection | undefined,
  ): AidPropertyDraft[] {
    const propertiesCollection = this.findCollection(
      interactionMetadata?.value ?? [],
      'https://www.w3.org/2019/wot/json-schema#properties',
      'properties',
    );

    return (propertiesCollection?.value ?? [])
      .filter((el): el is aas.types.SubmodelElementCollection => el instanceof aas.types.SubmodelElementCollection)
      .map((entry, index) => this.readPropertyDefinition(entry, index));
  }

  private readPropertyDefinition(entry: aas.types.SubmodelElementCollection, index: number): AidPropertyDraft {
    const nestedCollection = this.findCollection(
      entry.value ?? [],
      'https://www.w3.org/2019/wot/json-schema#properties',
      'properties',
    );

    return {
      idShort: entry.idShort?.trim() || `property${index.toString().padStart(2, '0')}`,
      key: this.readProperty(
        entry.value ?? [],
        'https://admin-shell.io/idta/AssetInterfacesDescription/1/0/key',
        'key',
      ),
      title: this.readProperty(entry.value ?? [], 'https://www.w3.org/2019/wot/td#title', 'title'),
      dataType: this.readProperty(entry.value ?? [], 'https://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'type'),
      unitCode: this.readProperty(entry.value ?? [], 'https://schema.org/unitCode', 'unitCode'),
      isObservable:
        this.readProperty(
          entry.value ?? [],
          'https://www.w3.org/2019/wot/td#isObservable',
          'isObservable',
        ).toLowerCase() === 'true',
      valueSemantics: this.readProperty(
        entry.value ?? [],
        'https://adminshell.io/idta/AssetInterfacesDescription/1/0/valueSemantics',
        'valueSemantics',
      ),
      children: (nestedCollection?.value ?? [])
        .filter((el): el is aas.types.SubmodelElementCollection => el instanceof aas.types.SubmodelElementCollection)
        .map((child, childIndex) => this.readPropertyDefinition(child, childIndex)),
    };
  }

  private hasPropertyContent(property: AidPropertyDraft): boolean {
    return (
      property.idShort.trim() !== '' ||
      property.key.trim() !== '' ||
      property.title.trim() !== '' ||
      property.dataType.trim() !== '' ||
      property.unitCode.trim() !== '' ||
      property.valueSemantics.trim() !== '' ||
      property.children.some((child) => this.hasPropertyContent(child))
    );
  }

  private readSecuritySchemes(
    endpointMetadata: aas.types.SubmodelElementCollection | undefined,
  ): SecuritySchemeDraft[] {
    const definitions = this.findCollection(
      endpointMetadata?.value ?? [],
      'https://www.w3.org/2019/wot/td#definesSecurityScheme',
      'securityDefinitions',
    );

    return (definitions?.value ?? [])
      .filter((el): el is aas.types.SubmodelElementCollection => el instanceof aas.types.SubmodelElementCollection)
      .map((entry, index) => ({
        idShort: entry.idShort?.trim() || `securityScheme${index.toString().padStart(2, '0')}`,
        scheme: this.readProperty(entry.value ?? [], 'https://www.w3.org/2019/wot/td#scheme', 'scheme'),
        in: this.readProperty(entry.value ?? [], 'https://www.w3.org/2019/wot/td#in', 'in'),
        name: this.readProperty(entry.value ?? [], 'https://www.w3.org/2019/wot/td#name', 'name'),
        description: this.readProperty(entry.value ?? [], 'https://www.w3.org/2019/wot/td#description', 'description'),
      }))
      .filter((s) => s.idShort !== '' || s.scheme !== '' || s.in !== '' || s.name !== '' || s.description !== '');
  }

  private upsertCollection(
    parent: aas.types.ISubmodelElement[],
    idShort: string,
    semanticId: string,
  ): aas.types.SubmodelElementCollection {
    let collection = this.findCollection(parent, semanticId, idShort);
    if (collection == null) {
      collection = new aas.types.SubmodelElementCollection(null, null, idShort);
      parent.push(collection);
    }
    collection.idShort = idShort;
    collection.semanticId = this.createExternalRef(semanticId);
    if (collection.value == null) collection.value = [];
    return collection;
  }

  private upsertProperty(
    parent: aas.types.ISubmodelElement[],
    idShort: string,
    semanticId: string,
    value: string,
  ): void {
    const normalizedValue = value.trim();
    let prop = parent.find(
      (el): el is aas.types.Property =>
        el instanceof aas.types.Property &&
        (this.hasSemanticId(el, semanticId) || (el.idShort ?? '').toLowerCase() === idShort.toLowerCase()),
    );

    if (normalizedValue === '' && prop == null) return;

    if (prop == null) {
      prop = new aas.types.Property(aas.types.DataTypeDefXsd.String, null, null, idShort);
      parent.push(prop);
    }

    prop.idShort = idShort;
    prop.semanticId = this.createExternalRef(semanticId);
    prop.valueType = aas.types.DataTypeDefXsd.String;
    prop.value = normalizedValue !== '' ? normalizedValue : null;
  }

  private findCollection(
    elements: aas.types.ISubmodelElement[],
    semanticId: string,
    idShort: string,
  ): aas.types.SubmodelElementCollection | undefined {
    return elements.find(
      (el): el is aas.types.SubmodelElementCollection =>
        el instanceof aas.types.SubmodelElementCollection &&
        (this.hasSemanticId(el, semanticId) || (el.idShort ?? '').toLowerCase() === idShort.toLowerCase()),
    );
  }

  private readProperty(elements: aas.types.ISubmodelElement[], semanticId: string, idShort: string): string {
    const prop = elements.find(
      (el): el is aas.types.Property =>
        el instanceof aas.types.Property &&
        (this.hasSemanticId(el, semanticId) || (el.idShort ?? '').toLowerCase() === idShort.toLowerCase()),
    );
    return `${prop?.value ?? ''}`.trim();
  }

  private hasSemanticId(element: aas.types.IHasSemantics, semanticId: string): boolean {
    return (
      element.semanticId?.keys?.some((k) => (k.value ?? '').trim().toLowerCase() === semanticId.trim().toLowerCase()) ??
      false
    );
  }

  private readFirstRefValue(reference: aas.types.Reference | undefined | null): string {
    return `${reference?.keys?.[0]?.value ?? ''}`.trim();
  }

  private createExternalRef(semanticId: string): aas.types.Reference {
    return new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
      new aas.types.Key(aas.types.KeyTypes.GlobalReference, semanticId),
    ]);
  }
}
