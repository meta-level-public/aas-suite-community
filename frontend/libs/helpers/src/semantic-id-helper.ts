import {
  ConceptDescription,
  DataSpecificationIec61360,
  IHasSemantics,
  ISubmodelElement,
} from '@aas-core-works/aas-core3.1-typescript/types';

export class SemanticIdHelper {
  static getSemanticDescription(element: any, type?: string): any {
    if (element?.semanticId?.keys == null) {
      return null;
    }
    return element?.semanticId?.keys.find((key: any) => {
      return (
        key.type === 'GlobalReference' ||
        key.type === 'ConceptDescription' ||
        key.type === (element.modelType.name ?? type)
      );
    });
  }

  static getBenennung(conceptDescription: ConceptDescription | undefined, userLang: string) {
    if (conceptDescription?.embeddedDataSpecifications != null) {
      const dataSpec = conceptDescription.embeddedDataSpecifications[0]
        .dataSpecificationContent as DataSpecificationIec61360;
      let found = dataSpec.preferredName?.find((spec: any) => (spec.language as string).toLowerCase() === userLang);
      if (found != null) {
        return found.text;
      }

      found = dataSpec.preferredName?.find((spec: any) => (spec.language as string).toLowerCase() === 'en');
      if (found != null) {
        return found.text;
      }

      if (dataSpec.preferredName != null && dataSpec.preferredName.length > 0) {
        found = dataSpec.preferredName[0];
        if (found != null) {
          return found.text;
        }
      }
    }
    return '';
  }

  static getDefinition(conceptDescription: ConceptDescription | undefined, userLang: string) {
    if (conceptDescription?.embeddedDataSpecifications != null) {
      const dataSpec = conceptDescription.embeddedDataSpecifications[0]
        .dataSpecificationContent as DataSpecificationIec61360;
      let found = dataSpec.definition?.find((spec: any) => (spec.language as string).toLowerCase() === userLang);
      if (found != null) {
        return found.text;
      }

      found = dataSpec.definition?.find((spec: any) => (spec.language as string).toLowerCase() === 'en');
      if (found != null) {
        return found.text;
      }

      if (dataSpec.definition != null && dataSpec.definition.length > 0) {
        found = dataSpec.definition[0];
        if (found != null) {
          return found.text;
        }
      }
    }
    return '';
  }

  static getUnit(conceptDescription: ConceptDescription | undefined) {
    if (conceptDescription?.embeddedDataSpecifications != null) {
      const dataSpec = conceptDescription.embeddedDataSpecifications[0]
        .dataSpecificationContent as DataSpecificationIec61360;

      return dataSpec.unit;
    }
    return '';
  }

  static getDatatype(conceptDescription: ConceptDescription | undefined) {
    if (conceptDescription?.embeddedDataSpecifications != null) {
      const dataSpec = conceptDescription.embeddedDataSpecifications[0]
        .dataSpecificationContent as DataSpecificationIec61360;

      return dataSpec.dataType;
    }
    return '';
  }
  static getSymbol(conceptDescription: ConceptDescription | undefined) {
    if (conceptDescription?.embeddedDataSpecifications != null) {
      const dataSpec = conceptDescription.embeddedDataSpecifications[0]
        .dataSpecificationContent as DataSpecificationIec61360;

      return dataSpec.symbol;
    }
    return '';
  }

  static hasSemanticId(sme: ISubmodelElement | IHasSemantics | undefined, semanticId: string) {
    // TODO: Ggf müssen wir hier die Versionsnummern ignorieren
    return sme?.semanticId?.keys.find((k) => k.value.toLowerCase().startsWith(semanticId.toLowerCase())) != null;
  }
}
