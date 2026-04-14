import { ConceptDescription, DataSpecificationIec61360 } from '@aas-core-works/aas-core3.1-typescript/types';

export class ConceptDescriptionHelper {
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
}
