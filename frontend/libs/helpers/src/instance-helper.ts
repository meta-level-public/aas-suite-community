import * as aas from '@aas-core-works/aas-core3.1-typescript';

export class InstanceHelper {
  static getInstanceName(el: any) {
    if (el instanceof aas.types.AssetAdministrationShell) {
      return 'AssetAdministrationShell';
    }
    if (el instanceof aas.types.Submodel) {
      return 'Submodel';
    }
    if (el instanceof aas.types.SubmodelElementCollection) {
      return 'SubmodelElementCollection';
    }
    if (el instanceof aas.types.SubmodelElementList) {
      return 'SubmodelElementList';
    }
    if (el instanceof aas.types.Property) {
      return 'Property';
    }
    if (el instanceof aas.types.MultiLanguageProperty) {
      return 'MultiLanguageProperty';
    }
    if (el instanceof aas.types.Operation) {
      return 'Operation';
    }
    if (el instanceof aas.types.OperationVariable) {
      return 'OperationVariable';
    }
    if (el instanceof aas.types.Entity) {
      return 'Entity';
    }
    if (el instanceof aas.types.ReferenceElement) {
      return 'ReferenceElement';
    }
    if (el instanceof aas.types.Reference) {
      return 'Reference';
    }
    if (el instanceof aas.types.BasicEventElement) {
      return 'BasicEventElement';
    }
    if (el instanceof aas.types.Blob) {
      return 'Blob';
    }
    if (el instanceof aas.types.Capability) {
      return 'Capability';
    }
    if (el instanceof aas.types.ConceptDescription) {
      return 'ConceptDescription';
    }
    if (el instanceof aas.types.File) {
      return 'File';
    }
    if (el instanceof aas.types.Range) {
      return 'Range';
    }
    if (el instanceof aas.types.RelationshipElement) {
      return 'RelationshipElement';
    }
    if (el instanceof aas.types.LangStringTextType) {
      return 'LangStringTextType';
    }
    // console.log('Unknown instance type: ' + el);
    return el?.constructor?.name; // only works if not minified ....
  }
}
