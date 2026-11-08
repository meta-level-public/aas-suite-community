import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { TestBed } from '@angular/core/testing';
import { DynamicDialogConfig, DynamicDialogRef } from '@openng/optimus-ui/dynamicdialog';
import { vi } from 'vitest';
import { AssetInterfacesInterfaceAddonComponent } from './asset-interfaces-interface-addon.component';

function child<T extends aas.types.ISubmodelElement>(
  collection: aas.types.SubmodelElementCollection | undefined,
  idShort: string,
): T | undefined {
  return collection?.value?.find((el) => el.idShort === idShort) as T | undefined;
}

function propertyValue(collection: aas.types.SubmodelElementCollection | undefined, idShort: string) {
  return child<aas.types.Property>(collection, idShort)?.value;
}

function prop(idShort: string, value: string) {
  return new aas.types.Property(
    aas.types.DataTypeDefXsd.String,
    null,
    null,
    idShort,
    null,
    null,
    null,
    null,
    null,
    null,
    value,
  );
}

function smc(idShort: string, value: aas.types.ISubmodelElement[], semanticId?: string) {
  const collection = new aas.types.SubmodelElementCollection(null, null, idShort);
  collection.value = value;
  if (semanticId) {
    collection.semanticId = new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
      new aas.types.Key(aas.types.KeyTypes.GlobalReference, semanticId),
    ]);
  }
  return collection;
}

describe('AssetInterfacesInterfaceAddonComponent', () => {
  let close: ReturnType<typeof vi.fn>;

  function createComponent(data?: Record<string, unknown>) {
    close = vi.fn();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [AssetInterfacesInterfaceAddonComponent],
      providers: [
        { provide: DynamicDialogRef, useValue: { close } },
        { provide: DynamicDialogConfig, useValue: { data } },
      ],
    });
    TestBed.overrideComponent(AssetInterfacesInterfaceAddonComponent, {
      set: { template: '', imports: [], styles: [] },
    });
    return TestBed.createComponent(AssetInterfacesInterfaceAddonComponent).componentInstance;
  }

  function applyAndGetResult(component: AssetInterfacesInterfaceAddonComponent) {
    component.apply();
    expect(close).toHaveBeenCalledTimes(1);
    return close.mock.calls[0][0] as aas.types.SubmodelElementCollection;
  }

  describe('initial state and validation', () => {
    it('starts with one empty HTTP form and an idShort derived from count', () => {
      const component = createComponent({ count: 3 });

      expect(component.idShort).toBe('Interface03');
      expect(component.forms).toHaveLength(1);
      expect(component.forms[0]).toMatchObject({
        idShort: 'Form00',
        protocol: 'HTTP',
        httpMethod: 'GET',
        contentType: 'application/json',
      });
    });

    it('falls back to Interface00 without dialog data', () => {
      expect(createComponent().idShort).toBe('Interface00');
    });

    it('requires a target for every form', () => {
      const component = createComponent();
      expect(component.validationErrors).toEqual(['AID_INTERFACE_VALIDATION_TARGET_REQUIRED']);
      expect(component.canApply).toBe(false);

      component.forms[0].target = '/data';
      expect(component.canApply).toBe(true);
    });

    it('requires an idShort and at least one form', () => {
      const component = createComponent();
      component.idShort = ' ';
      component.removeForm(0);

      expect(component.validationErrors).toEqual([
        'AID_INTERFACE_VALIDATION_ID_SHORT_REQUIRED',
        'AID_INTERFACE_VALIDATION_FORM_REQUIRED',
      ]);
    });

    it('requires a protocol value when protocol "Other" is selected', () => {
      const component = createComponent();
      component.forms[0].target = 'coap://device';
      component.forms[0].protocol = 'Other';
      expect(component.validationErrors).toEqual(['AID_INTERFACE_VALIDATION_PROTOCOL_VALUE_REQUIRED']);

      component.forms[0].otherProtocol = 'CoAP';
      expect(component.validationErrors).toEqual([]);
    });

    it('does not close the dialog while invalid and closes with null on cancel', () => {
      const component = createComponent();
      component.apply();
      expect(close).not.toHaveBeenCalled();

      component.cancel();
      expect(close).toHaveBeenCalledWith(null);
    });
  });

  describe('protocol defaults', () => {
    it('fills empty fields with protocol specific defaults', () => {
      const component = createComponent();
      const form = component.forms[0];

      form.contentType = '';
      form.httpMethod = '';
      component.onFormProtocolChanged(form, 'HTTP');
      expect(form).toMatchObject({ target: '/', contentType: 'application/json', httpMethod: 'GET' });

      form.target = '';
      form.contentType = '';
      component.onFormProtocolChanged(form, 'MQTT');
      expect(form).toMatchObject({ target: 'mqtt://broker/topic', contentType: 'application/json' });

      form.target = '';
      form.contentType = '';
      component.onFormProtocolChanged(form, 'Modbus');
      expect(form).toMatchObject({ target: 'modbus://device/register', contentType: 'application/octet-stream' });
    });

    it('never overwrites values the user already entered', () => {
      const component = createComponent();
      const form = component.forms[0];
      form.target = 'mqtt://my/topic';
      form.contentType = 'text/plain';

      component.onFormProtocolChanged(form, 'Modbus');

      expect(form.target).toBe('mqtt://my/topic');
      expect(form.contentType).toBe('text/plain');
    });
  });

  describe('apply on a new interface', () => {
    it('builds the interface structure with endpoint, interaction metadata and forms', () => {
      const component = createComponent();
      component.idShort = ' HTTP_Interface ';
      component.title = ' Pump ';
      component.endpointBase = 'https://pump.local';
      component.interactionType = 'Action';
      component.forms[0].target = ' /start ';
      component.forms[0].httpMethod = 'POST';

      const result = applyAndGetResult(component);

      expect(result.idShort).toBe('HTTP_Interface');
      expect(result.semanticId?.keys[0].value).toBe(
        'https://admin-shell.io/idta/AssetInterfacesDescription/1/0/Interface',
      );
      expect(propertyValue(result, 'title')).toBe('Pump');

      const endpoint = child<aas.types.SubmodelElementCollection>(result, 'EndpointMetadata');
      expect(propertyValue(endpoint, 'baseURI')).toBe('https://pump.local');
      expect(child<aas.types.SubmodelElementCollection>(endpoint, 'securityDefinitions')?.value).toEqual([]);

      const interaction = child<aas.types.SubmodelElementCollection>(result, 'InteractionMetadata');
      expect(interaction?.semanticId?.keys[0].value).toBe('https://www.w3.org/2019/wot/td#ActionAffordance');

      const form = child<aas.types.SubmodelElementCollection>(interaction, 'forms')
        ?.value?.[0] as aas.types.SubmodelElementCollection;
      expect(form.idShort).toBe('Form00');
      expect(propertyValue(form, 'target')).toBe('/start');
      expect(propertyValue(form, 'contentType')).toBe('application/json');
      expect(propertyValue(form, 'Protocol')).toBe('HTTP');
      expect(propertyValue(form, 'methodName')).toBe('POST');
      // empty optional fields are not written at all
      expect(child(form, 'qos')).toBeUndefined();
      expect(child(form, 'modv_function')).toBeUndefined();
      expect(child(form, 'headers')).toBeUndefined();
    });

    it('writes the custom protocol value for protocol "Other"', () => {
      const component = createComponent();
      component.forms[0].target = 'coap://device';
      component.forms[0].protocol = 'Other';
      component.forms[0].otherProtocol = 'CoAP';

      const result = applyAndGetResult(component);
      const forms = child<aas.types.SubmodelElementCollection>(
        child<aas.types.SubmodelElementCollection>(result, 'InteractionMetadata'),
        'forms',
      );

      expect(propertyValue(forms?.value?.[0] as aas.types.SubmodelElementCollection, 'Protocol')).toBe('CoAP');
    });

    function firstForm(result: aas.types.SubmodelElementCollection) {
      return child<aas.types.SubmodelElementCollection>(
        child<aas.types.SubmodelElementCollection>(result, 'InteractionMetadata'),
        'forms',
      )?.value?.[0] as aas.types.SubmodelElementCollection;
    }

    it('writes only the binding terms of the selected protocol', () => {
      const fill = (protocol: 'HTTP' | 'MQTT' | 'Modbus', target: string) => {
        const component = createComponent();
        Object.assign(component.forms[0], {
          protocol,
          target,
          httpMethod: 'PUT',
          mqttQos: '1',
          mqttRetain: 'true',
          modbusFunction: 'readHoldingRegisters',
          modbusEntity: 'HoldingRegister',
        });
        component.addHttpHeader(component.forms[0]);
        component.forms[0].httpHeaders[0] = { name: 'Accept', value: 'text/plain' };
        return firstForm(applyAndGetResult(component));
      };

      const http = fill('HTTP', '/data');
      expect(propertyValue(http, 'methodName')).toBe('PUT');
      expect(child(http, 'headers')).toBeDefined();
      expect(child(http, 'qos')).toBeUndefined();
      expect(child(http, 'modv_function')).toBeUndefined();

      const mqtt = fill('MQTT', 'mqtt://broker/topic');
      expect(child(mqtt, 'methodName')).toBeUndefined();
      expect(child(mqtt, 'headers')).toBeUndefined();
      expect(propertyValue(mqtt, 'qos')).toBe('1');
      expect(propertyValue(mqtt, 'retain')).toBe('true');
      expect(child(mqtt, 'modv_function')).toBeUndefined();

      const modbus = fill('Modbus', 'modbus://device/1');
      expect(child(modbus, 'methodName')).toBeUndefined();
      expect(child(modbus, 'headers')).toBeUndefined();
      expect(child(modbus, 'qos')).toBeUndefined();
      expect(propertyValue(modbus, 'modv_function')).toBe('readHoldingRegisters');
      expect(propertyValue(modbus, 'modv_entity')).toBe('HoldingRegister');
    });

    it('keeps an explicitly chosen protocol for http(s) targets after reload', () => {
      const component = createComponent();
      component.forms[0].target = 'https://device/coap-gateway';
      component.forms[0].protocol = 'Other';
      component.forms[0].otherProtocol = 'CoAP';

      const form = firstForm(applyAndGetResult(component));
      expect(child(form, 'methodName')).toBeUndefined();

      const reread = createComponent({
        existingInterface: smc('I', [smc('InteractionMetadata', [smc('forms', [form])])]),
      });
      expect(reread.forms[0]).toMatchObject({ protocol: 'Other', otherProtocol: 'CoAP' });
    });

    it('writes only HTTP headers that have a name or a value', () => {
      const component = createComponent();
      const form = component.forms[0];
      form.target = '/';
      component.addHttpHeader(form);
      component.addHttpHeader(form);
      component.addHttpHeader(form);
      form.httpHeaders[0] = { name: ' Accept ', value: ' application/json ' };
      form.httpHeaders[2] = { name: '', value: 'orphan' };

      const result = applyAndGetResult(component);
      const createdForm = child<aas.types.SubmodelElementCollection>(
        child<aas.types.SubmodelElementCollection>(result, 'InteractionMetadata'),
        'forms',
      )?.value?.[0] as aas.types.SubmodelElementCollection;
      const headers = child<aas.types.SubmodelElementCollection>(createdForm, 'headers');

      expect(headers?.value?.map((h) => h.idShort)).toEqual(['Header00', 'Header01']);
      const first = headers?.value?.[0] as aas.types.SubmodelElementCollection;
      expect(propertyValue(first, 'fieldName')).toBe('Accept');
      expect(propertyValue(first, 'fieldValue')).toBe('application/json');
      const second = headers?.value?.[1] as aas.types.SubmodelElementCollection;
      expect(child(second, 'fieldName')).toBeUndefined();
      expect(propertyValue(second, 'fieldValue')).toBe('orphan');
    });

    it('writes security schemes and nested property definitions, skipping empty ones', () => {
      const component = createComponent();
      component.forms[0].target = '/';
      component.addSecurityScheme();
      component.securitySchemes[0].scheme = 'basic';
      component.securitySchemes[0].in = 'header';
      component.addSecurityScheme();
      component.securitySchemes[1].idShort = '';

      component.addPropertyDefinition();
      const def = component.propertyDefinitions[0];
      def.key = 'temperature';
      def.dataType = 'number';
      def.isObservable = true;
      component.addNestedPropertyDefinition(def);
      def.children[0].title = 'Unit';
      component.addNestedPropertyDefinition(def);
      def.children[1].idShort = '';
      component.addPropertyDefinition();
      component.propertyDefinitions[1].idShort = '';

      const result = applyAndGetResult(component);

      const definitions = child<aas.types.SubmodelElementCollection>(
        child<aas.types.SubmodelElementCollection>(result, 'EndpointMetadata'),
        'securityDefinitions',
      );
      expect(definitions?.value?.map((d) => d.idShort)).toEqual(['securityScheme00']);
      const scheme = definitions?.value?.[0] as aas.types.SubmodelElementCollection;
      expect(propertyValue(scheme, 'scheme')).toBe('basic');
      expect(propertyValue(scheme, 'in')).toBe('header');

      const properties = child<aas.types.SubmodelElementCollection>(
        child<aas.types.SubmodelElementCollection>(result, 'InteractionMetadata'),
        'properties',
      );
      expect(properties?.value?.map((p) => p.idShort)).toEqual(['property00']);
      const created = properties?.value?.[0] as aas.types.SubmodelElementCollection;
      expect(propertyValue(created, 'key')).toBe('temperature');
      expect(propertyValue(created, 'type')).toBe('number');
      expect(propertyValue(created, 'isObservable')).toBe('true');
      const nested = child<aas.types.SubmodelElementCollection>(created, 'properties');
      expect(nested?.value?.map((p) => p.idShort)).toEqual(['property00']);
      expect(propertyValue(nested?.value?.[0] as aas.types.SubmodelElementCollection, 'title')).toBe('Unit');
    });
  });

  describe('editing an existing interface', () => {
    function buildExisting() {
      const form = smc('readTemp', [
        prop('target', 'mqtt://broker/temp'),
        prop('contentType', 'application/json'),
        prop('qos', '1'),
        smc('headers', [smc('Header00', [prop('fieldName', 'X-Key'), prop('fieldValue', 'abc')])]),
      ]);
      const property = smc('temperature', [
        prop('key', 'temp'),
        prop('isObservable', 'TRUE'),
        smc('properties', [smc('unit', [prop('title', 'Celsius')])]),
      ]);
      const interaction = smc(
        'InteractionMetadata',
        [smc('properties', [property]), smc('forms', [form])],
        'https://www.w3.org/2019/wot/td#EventAffordance',
      );
      const endpoint = smc('EndpointMetadata', [
        prop('baseURI', 'mqtt://broker'),
        smc('securityDefinitions', [smc('nosec_sc', [prop('scheme', 'nosec')])]),
      ]);
      const custom = prop('CustomElement', 'keep me');
      return smc('MQTT_Interface', [prop('title', 'Sensor'), endpoint, interaction, custom]);
    }

    it('reads the draft from an existing interface collection', () => {
      const component = createComponent({ count: 9, existingInterface: buildExisting() });

      expect(component.idShort).toBe('MQTT_Interface');
      expect(component.title).toBe('Sensor');
      expect(component.endpointBase).toBe('mqtt://broker');
      expect(component.interactionType).toBe('Event');
      expect(component.securitySchemes).toEqual([
        { idShort: 'nosec_sc', scheme: 'nosec', in: '', name: '', description: '' },
      ]);
      expect(component.propertyDefinitions).toHaveLength(1);
      expect(component.propertyDefinitions[0]).toMatchObject({
        idShort: 'temperature',
        key: 'temp',
        isObservable: true,
      });
      expect(component.propertyDefinitions[0].children[0]).toMatchObject({ idShort: 'unit', title: 'Celsius' });
      expect(component.forms).toHaveLength(1);
      expect(component.forms[0]).toMatchObject({
        idShort: 'readTemp',
        target: 'mqtt://broker/temp',
        protocol: 'MQTT',
        otherProtocol: '',
        httpMethod: 'GET',
        mqttQos: '1',
        httpHeaders: [{ name: 'X-Key', value: 'abc' }],
      });
    });

    it('normalizes the protocol from explicit value or target scheme', () => {
      const formsFor = (protocol: string, target: string) => {
        const formValue = [prop('target', target)];
        if (protocol !== '') formValue.push(prop('Protocol', protocol));
        const existing = smc('I', [smc('InteractionMetadata', [smc('forms', [smc('f', formValue)])])]);
        return createComponent({ existingInterface: existing }).forms[0];
      };

      expect(formsFor('', 'https://x')).toMatchObject({ protocol: 'HTTP' });
      expect(formsFor('modbus', 'tcp://x')).toMatchObject({ protocol: 'Modbus' });
      expect(formsFor('', 'modbus://x')).toMatchObject({ protocol: 'Modbus' });
      expect(formsFor('', 'opc.tcp://x')).toMatchObject({ protocol: 'HTTP' });
      expect(formsFor('CoAP', 'coap://x')).toMatchObject({ protocol: 'Other', otherProtocol: 'CoAP' });
      // an explicit protocol wins over the URL scheme of the target
      expect(formsFor('CoAP', 'http://x')).toMatchObject({ protocol: 'Other', otherProtocol: 'CoAP' });
      expect(formsFor('MQTT', 'https://x')).toMatchObject({ protocol: 'MQTT' });
    });

    it('creates an empty form when the existing interface has none', () => {
      const component = createComponent({ existingInterface: smc('Empty', []) });

      expect(component.idShort).toBe('Empty');
      expect(component.interactionType).toBe('Property');
      expect(component.forms).toHaveLength(1);
      expect(component.forms[0].target).toBe('');
    });

    it('updates the existing collection in place and keeps unrelated elements', () => {
      const existing = buildExisting();
      const component = createComponent({ existingInterface: existing });
      component.title = '';
      component.endpointBase = 'mqtt://other';
      component.interactionType = 'Property';

      const result = applyAndGetResult(component);

      expect(result).toBe(existing);
      expect(propertyValue(result, 'CustomElement')).toBe('keep me');
      // cleared fields stay as element but lose their value
      expect(child<aas.types.Property>(result, 'title')?.value).toBeNull();
      const endpoint = child<aas.types.SubmodelElementCollection>(result, 'EndpointMetadata');
      expect(propertyValue(endpoint, 'baseURI')).toBe('mqtt://other');
      const interactions = result.value?.filter((el) => el.idShort === 'InteractionMetadata');
      expect(interactions).toHaveLength(1);
      expect((interactions?.[0] as aas.types.SubmodelElementCollection).semanticId?.keys[0].value).toBe(
        'https://www.w3.org/2019/wot/td#PropertyAffordance',
      );
    });

    it('round-trips security schemes and properties and drops HTTP headers of MQTT forms', () => {
      const existing = buildExisting();
      const component = createComponent({ existingInterface: existing });
      const result = applyAndGetResult(component);

      const reread = createComponent({ existingInterface: result });

      // HTTP headers are an HTTP binding and are not written for the MQTT form
      expect(reread.forms).toEqual(component.forms.map((form) => ({ ...form, httpHeaders: [] })));
      expect(reread.securitySchemes).toEqual(component.securitySchemes);
      expect(reread.propertyDefinitions).toEqual(component.propertyDefinitions);
      expect(reread.interactionType).toBe(component.interactionType);
    });
  });
});
