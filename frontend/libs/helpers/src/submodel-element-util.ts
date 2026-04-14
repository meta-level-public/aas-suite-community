import { ISubmodelElement } from '@aas-core-works/aas-core3.1-typescript/types';

export class SubmodelElementUtil {
  static getLabel(element: ISubmodelElement, lang: string) {
    if (element.displayName != null) {
      const labelInLang = element.displayName.find((d) => d.language === lang);
      if (labelInLang != null) {
        return labelInLang.text;
      } else {
        const labelInEn = element.displayName.find((d) => d.language === 'en');
        if (labelInEn != null) {
          return labelInEn.text;
        } else {
          // das erstbeste liefern
          return element.displayName[0].text;
        }
      }
    } else {
      return element.idShort;
    }
  }
}
