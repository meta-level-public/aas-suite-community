import * as aas from '@aas-core-works/aas-core3.1-typescript';

function semanticRef(value: string) {
  return new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
    new aas.types.Key(aas.types.KeyTypes.GlobalReference, value),
  ]);
}

function property(idShort: string, semanticId: string, value: string) {
  const element = new aas.types.Property(aas.types.DataTypeDefXsd.String, null, null, idShort);
  element.semanticId = semanticRef(semanticId);
  element.value = value;
  return element;
}

function mlp(idShort: string, semanticId: string, value: string) {
  const element = new aas.types.MultiLanguageProperty(null, null, idShort);
  element.semanticId = semanticRef(semanticId);
  element.value = [new aas.types.LangStringTextType('en', value)];
  return element;
}

function fileElement(idShort: string, value: string, contentType: string, semanticId?: string) {
  const element = new aas.types.File(undefined, undefined, idShort);
  if (semanticId) {
    element.semanticId = semanticRef(semanticId);
  }
  element.value = value;
  element.contentType = contentType;
  return element;
}

function blobElement(idShort: string, value: string, contentType: string, semanticId?: string) {
  const element = new aas.types.Blob();
  if (semanticId) {
    element.semanticId = semanticRef(semanticId);
  }
  element.idShort = idShort;
  element.value = value;
  element.contentType = contentType;
  return element;
}

export function createCircularityExampleSubmodel() {
  const submodel = new aas.types.Submodel('urn:test:circularity', null, null, 'Circularity');
  submodel.semanticId = semanticRef('urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#Circularity');

  const dismantling = new aas.types.SubmodelElementList(
    aas.types.AasSubmodelElements.Property,
    null,
    null,
    'DismantlingAndRemovalInformation',
  );
  dismantling.semanticId = semanticRef(
    'urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#dismantlingAndRemovalInformation',
  );
  dismantling.value = [
    property(
      'DocumentIdentifier',
      'urn:samm:io.admin-shell.idta.handover_documentation:2.0.0#DocumentIdentifier',
      'DOC-DISM-001',
    ),
    fileElement('DismantlingManual', '/documents/dismantling-manual.pdf', 'application/pdf'),
    blobElement(
      'RemovalChecklist',
      'U2F2ZSBhbmQgaXNvbGF0ZSBiYXR0ZXJ5IHBhY2sgYmVmb3JlIGRpc21hbnRsaW5nLg==',
      'text/plain',
    ),
  ];

  const wastePrevention = new aas.types.SubmodelElementList(
    aas.types.AasSubmodelElements.Property,
    null,
    null,
    'WastePrevention',
  );
  wastePrevention.semanticId = semanticRef(
    'urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#wastePrevention',
  );
  wastePrevention.value = [
    property(
      'DocumentIdentifier',
      'urn:samm:io.admin-shell.idta.handover_documentation:2.0.0#DocumentIdentifier',
      'EOL-WASTE-001',
    ),
    fileElement('RepairStrategy', '/documents/repair-strategy.pdf', 'application/pdf'),
  ];

  const separateCollection = new aas.types.SubmodelElementList(
    aas.types.AasSubmodelElements.Property,
    null,
    null,
    'SeparateCollection',
  );
  separateCollection.semanticId = semanticRef(
    'urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#separateCollection',
  );
  separateCollection.value = [
    property(
      'DocumentIdentifier',
      'urn:samm:io.admin-shell.idta.handover_documentation:2.0.0#DocumentIdentifier',
      'EOL-COLLECT-002',
    ),
  ];

  const informationOnCollection = new aas.types.SubmodelElementList(
    aas.types.AasSubmodelElements.Property,
    null,
    null,
    'InformationOnCollection',
  );
  informationOnCollection.semanticId = semanticRef(
    'urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#informationOnCollection',
  );
  informationOnCollection.value = [
    blobElement(
      'CollectionInstructionSheet',
      'Q29sbGVjdCBmYWlsZWQgbW9kdWxlcyBpbiBVTi1hcHByb3ZlZCBjb250YWluZXJzLg==',
      'text/plain',
    ),
  ];

  const endOfLifeInformation = new aas.types.SubmodelElementCollection(null, null, 'EndOfLifeInformation');
  endOfLifeInformation.semanticId = semanticRef(
    'urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#endOfLifeInformation',
  );
  endOfLifeInformation.value = [wastePrevention, separateCollection, informationOnCollection];

  const recycledNickel = new aas.types.SubmodelElementCollection(null, null, 'RecycledContentNickel');
  recycledNickel.semanticId = semanticRef('urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#RecycledContent');
  recycledNickel.value = [
    property(
      'RecycledMaterial',
      'urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#recycledMaterial',
      'Nickel',
    ),
    property('PreConsumerShare', 'urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#preConsumerShare', '14.5'),
    property(
      'PostConsumerShare',
      'urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#postConsumerShare',
      '31.2',
    ),
  ];

  const recycledAluminium = new aas.types.SubmodelElementCollection(null, null, 'RecycledContentAluminium');
  recycledAluminium.semanticId = semanticRef(
    'urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#RecycledContent',
  );
  recycledAluminium.value = [
    property(
      'RecycledMaterial',
      'urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#recycledMaterial',
      'Aluminium',
    ),
    property('PreConsumerShare', 'urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#preConsumerShare', '9.0'),
    property(
      'PostConsumerShare',
      'urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#postConsumerShare',
      '47.5',
    ),
  ];

  const recycledContent = new aas.types.SubmodelElementList(
    aas.types.AasSubmodelElements.SubmodelElementCollection,
    null,
    null,
    'RecycledContentInformation',
  );
  recycledContent.semanticId = semanticRef(
    'urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#recycledContent',
  );
  recycledContent.value = [recycledNickel, recycledAluminium];

  const renewableContent = property(
    'RenewableContent',
    'urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#renewableContent',
    '42.0',
  );

  const safetyInstructions = new aas.types.SubmodelElementList(
    aas.types.AasSubmodelElements.Property,
    null,
    null,
    'SafetyInstructions',
  );
  safetyInstructions.semanticId = semanticRef(
    'urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#safetyInstructions',
  );
  safetyInstructions.value = [
    property(
      'DocumentIdentifier',
      'urn:samm:io.admin-shell.idta.handover_documentation:2.0.0#DocumentIdentifier',
      'SAFE-001',
    ),
    fileElement('ThermalRunawayProtocol', '/documents/thermal-runaway-protocol.pdf', 'application/pdf'),
  ];

  const extinguishingAgents = new aas.types.SubmodelElementList(
    aas.types.AasSubmodelElements.Property,
    null,
    null,
    'ExtinguishingAgents',
  );
  extinguishingAgents.semanticId = semanticRef(
    'urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#extinguishingAgents',
  );
  extinguishingAgents.value = [
    property(
      'ExtinguishingAgent',
      'urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#ExtinguishingAgent',
      'Class D powder',
    ),
    property(
      'ExtinguishingAgentBackup',
      'urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#ExtinguishingAgent',
      'Vermiculite',
    ),
  ];

  const safetyMeasures = new aas.types.SubmodelElementCollection(null, null, 'SafetyMeasures');
  safetyMeasures.semanticId = semanticRef('urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#safetyMeasures');
  safetyMeasures.value = [safetyInstructions, extinguishingAgents];

  const addressOfSupplier = new aas.types.SubmodelElementCollection(null, null, 'AddressOfSupplier');
  addressOfSupplier.semanticId = semanticRef(
    'urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#addressOfSupplier',
  );
  addressOfSupplier.value = [
    mlp('Street', 'urn:samm:io.admin-shell.idta.contact_information:1.0.0#street', 'Example Street 7'),
    mlp('PostalCode', 'urn:samm:io.admin-shell.idta.contact_information:1.0.0#postalCode', '70173'),
    mlp('NationalCode', 'urn:samm:io.admin-shell.idta.contact_information:1.0.0#nationalCode', 'DE'),
  ];

  const emailAddress = new aas.types.SubmodelElementCollection(null, null, 'EmailAddressOfSupplier');
  emailAddress.semanticId = semanticRef('urn:samm:io.admin-shell.idta.contact_information:1.0.0#email');
  emailAddress.value = [
    property(
      'EmailAddress',
      'urn:samm:io.admin-shell.idta.contact_information:1.0.0#emailAddress',
      'parts@example.com',
    ),
  ];

  const moduleHousing = new aas.types.SubmodelElementCollection(null, null, 'ComponentModuleHousing');
  moduleHousing.semanticId = semanticRef('urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#Component');
  moduleHousing.value = [
    property(
      'PartName',
      'urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#partName',
      'Battery module housing',
    ),
    property('PartNumber', 'urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#partNumber', 'PN-4711'),
  ];

  const ventAssembly = new aas.types.SubmodelElementCollection(null, null, 'ComponentVentAssembly');
  ventAssembly.semanticId = semanticRef('urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#Component');
  ventAssembly.value = [
    property(
      'PartName',
      'urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#partName',
      'Pressure relief vent assembly',
    ),
    property('PartNumber', 'urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#partNumber', 'PN-8150'),
  ];

  const components = new aas.types.SubmodelElementList(
    aas.types.AasSubmodelElements.SubmodelElementCollection,
    null,
    null,
    'Components',
  );
  components.semanticId = semanticRef('urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#components');
  components.value = [moduleHousing, ventAssembly];

  const supplier = new aas.types.SubmodelElementCollection(null, null, 'SparePartSupplier');
  supplier.semanticId = semanticRef('urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#SparePartSupplier');
  supplier.value = [
    mlp('NameOfSupplier', 'urn:samm:io.admin-shell.idta.contact_information:1.0.0#company', 'Acme Spares'),
    addressOfSupplier,
    emailAddress,
    property(
      'SupplierWebAddress',
      'urn:samm:io.admin-shell.idta.contact_information:1.0.0#addressOfAdditionalLink',
      'https://example.com/spares',
    ),
    components,
  ];

  const sparePartSources = new aas.types.SubmodelElementList(
    aas.types.AasSubmodelElements.SubmodelElementCollection,
    null,
    null,
    'SparePartSources',
  );
  sparePartSources.semanticId = semanticRef(
    'urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#sparePartSources',
  );
  sparePartSources.value = [supplier];

  submodel.submodelElements = [
    dismantling,
    endOfLifeInformation,
    recycledContent,
    renewableContent,
    safetyMeasures,
    sparePartSources,
  ];

  return submodel;
}
