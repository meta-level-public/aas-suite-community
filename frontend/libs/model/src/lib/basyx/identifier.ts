export class Identifier {
  idType: 'IRI' | 'IRDI' | 'Custom' | 'IdShort' = 'IRI';
  local: boolean = true;
  type = IdentifierType.Undefined;
  value: string = '';

  constructor(type: IdentifierType) {
    this.type = type;
  }
}

export enum IdentifierType {
  Undefined = 'Undefined',

  GlobalReference = 'GlobalReference',
  FragmentReference = 'FragmentReference',

  AccessPermissionRule = 'AccessPermissionRule',
  AnnotatedRelationshipElement = 'AnnotatedRelationshipElement',
  BasicEvent = 'BasicEvent',
  Blob = 'Blob',
  Capability = 'Capability',
  ConceptDictionary = 'ConceptDictionary',
  DataElement = 'DataElement',
  File = 'File',
  Entity = 'Entity',
  Event = 'Event',
  MultiLanguageProperty = 'MultiLanguageProperty',
  Operation = 'Operation',
  Property = 'Property',
  Range = 'Range',
  ReferenceElement = 'ReferenceElement',
  RelationshipElement = 'RelationshipElement',
  SubmodelElement = 'SubmodelElement',
  SubmodelElementCollection = 'SubmodelElementCollection',
  View = 'View',

  Asset = 'Asset',
  AssetAdministrationShell = 'AssetAdministrationShell',
  ConceptDescription = 'ConceptDescription',
  Submodel = 'Submodel',
  Qualifier = 'Qualifier',
}
