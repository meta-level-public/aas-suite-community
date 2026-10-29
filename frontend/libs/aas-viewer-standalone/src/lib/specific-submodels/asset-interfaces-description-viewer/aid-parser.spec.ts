import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { describe, expect, it } from 'vitest';
import { countDataPoints, countForms, parseAssetInterfaces } from './aid-parser';

const AID = 'https://admin-shell.io/idta/AssetInterfacesDescription/1/0/';
const WOT = 'https://www.w3.org/2019/wot/';

function ref(value: string) {
  return { type: 'ExternalReference', keys: [{ type: 'GlobalReference', value }] };
}

function prop(idShort: string, semanticId: string, value: string) {
  return { modelType: 'Property', idShort, semanticId: ref(semanticId), valueType: 'xs:string', value };
}

function smc(idShort: string, semanticId: string, value: unknown[]) {
  return { modelType: 'SubmodelElementCollection', idShort, semanticId: ref(semanticId), value };
}

const type = (value: string) => prop('type', 'https://www.w3.org/1999/02/22-rdf-syntax-ns#type', value);
const unit = (value: string) => prop('unit', 'https://schema.org/unitCode', value);
const nested = (...children: unknown[]) => smc('properties', `${WOT}json-schema#properties`, children);
const point = (idShort: string, ...value: unknown[]) => smc(idShort, `${WOT}json-schema#propertyName`, value);

// Shaped like the AID 1.2 of the HTW demo: one HTTP interface with nested status properties
const submodelJson = {
  modelType: 'Submodel',
  id: 'urn:test:aid',
  idShort: 'AssetInterfacesDescription',
  semanticId: ref('https://admin-shell.io/idta/AssetInterfacesDescription/1/2/Submodel'),
  submodelElements: [
    smc('HttpStatus', `${AID}Interface`, [
      prop('title', `${WOT}td#title`, 'SmartRast status'),
      smc('EndpointMetadata', `${AID}EndpointMetadata`, [
        prop('base', `${WOT}td#baseURI`, 'http://192.168.42.195/'),
        prop('contentType', `${WOT}hypermedia#forContentType`, 'application/json'),
        smc('securityDefinitions', `${WOT}td#definesSecurityScheme`, [
          smc('nosec_sc', `${WOT}security#NoSecurityScheme`, [
            prop('scheme', `${WOT}security#SecurityScheme`, 'nosec'),
          ]),
        ]),
      ]),
      smc('InteractionMetadata', `${AID}InteractionMetadata`, [
        smc('properties', `${WOT}td#PropertyAffordance`, [
          smc('Status', `${AID}PropertyDefinition`, [
            type('object'),
            prop('observable', `${WOT}td#isObservable`, 'true'),
            nested(
              point('weather', type('object'), nested(point('temperature_c', type('number'), unit('Cel')))),
              point('parking', type('array'), smc('items', `${WOT}json-schema#items`, [type('boolean')]), {
                modelType: 'Range',
                idShort: 'itemsRange',
                semanticId: ref(`${AID}itemsRange`),
                valueType: 'xs:integer',
                min: '4',
                max: '4',
              }),
            ),
            smc('forms', `${WOT}td#hasForm`, [
              prop('href', `${WOT}hypermedia#hasTarget`, '/api/status'),
              prop('contentType', `${WOT}hypermedia#forContentType`, 'application/json'),
              prop('htv_methodName', 'https://www.w3.org/2011/http#methodName', 'GET'),
            ]),
          ]),
        ]),
        smc('actions', `${WOT}td#ActionAffordance`, [
          smc('Reset', `${AID}ActionDefinition`, [
            prop('title', `${WOT}td#title`, 'Restart device'),
            smc('forms', `${WOT}td#hasForm`, [
              prop('href', `${WOT}hypermedia#hasTarget`, 'mqtt://broker/reset'),
              prop('mqv_qos', 'https://www.w3.org/2019/wot/mqtt#hasQoSFlag', '1'),
            ]),
          ]),
        ]),
      ]),
    ]),
  ],
};

function parse() {
  const submodel = aas.jsonization.submodelFromJsonable(submodelJson as aas.jsonization.JsonValue).mustValue();
  return parseAssetInterfaces(submodel);
}

describe('parseAssetInterfaces', () => {
  it('reads the interface header with protocol and security', () => {
    const [httpInterface] = parse();

    expect(httpInterface).toMatchObject({
      idShort: 'HttpStatus',
      title: 'SmartRast status',
      baseUrl: 'http://192.168.42.195/',
      contentType: 'application/json',
      protocol: 'HTTP',
    });
    expect(httpInterface.securitySchemes).toEqual([
      { idShort: 'nosec_sc', scheme: 'nosec', in: '', name: '', description: '' },
    ]);
  });

  it('reads the form of a property affordance and resolves it against the base URL', () => {
    const status = parse()[0].dataPoints[0];

    expect(status).toMatchObject({ idShort: 'Status', kind: 'property', dataType: 'object', observable: true });
    expect(status.form).toMatchObject({
      href: '/api/status',
      url: 'http://192.168.42.195/api/status',
      method: 'GET',
      contentType: 'application/json',
    });
  });

  it('reads nested data points with readable units and array item types', () => {
    const [weather, parking] = parse()[0].dataPoints[0].children;

    expect(weather.children[0]).toMatchObject({
      id: 'properties.Status.weather.temperature_c',
      dataType: 'number',
      unit: '°C',
      unitCode: 'Cel',
      form: null,
    });
    expect(parking).toMatchObject({ dataType: 'array<boolean>', range: '4' });
  });

  it('reads actions with their title and protocol specific form details', () => {
    const reset = parse()[0].dataPoints[1];

    expect(reset).toMatchObject({ idShort: 'Reset', name: 'Restart device', kind: 'action' });
    expect(reset.form?.details).toEqual([{ label: 'mqv_qos', value: '1' }]);
  });

  it('counts all data points and the ones with own endpoints', () => {
    const dataPoints = parse()[0].dataPoints;

    expect(countDataPoints(dataPoints)).toBe(5);
    expect(countForms(dataPoints)).toBe(2);
  });

  it('returns no interfaces for an empty submodel', () => {
    expect(parseAssetInterfaces(new aas.types.Submodel('urn:test:empty'))).toEqual([]);
  });
});
