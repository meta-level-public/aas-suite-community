import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { SemanticIdHelper } from './semantic-id-helper';

export class ElementFinder {
  static findElement(parent: aas.types.ISubmodelElement[], type: string, semanticId: string) {
    const el = parent.find(
      (sme: any) =>
        (sme.idShort as string).toLowerCase() === type.toLowerCase() || SemanticIdHelper.hasSemanticId(sme, semanticId),
    ) as any;

    return el;
  }

  static findElementText(parent: aas.types.ISubmodelElement[], type: string, semanticId: string, language: string) {
    const el = this.findElement(parent, type, semanticId);

    const userLang = language;

    if (el != null && el instanceof aas.types.Property) {
      return el.value ?? '';
    }

    if (el != null && el instanceof aas.types.MultiLanguageProperty) {
      let found = el.value?.find((e: any) => e.language.toLowerCase() === userLang.toLowerCase());
      if (found != null) {
        return found.text;
      }
      found = el.value?.find((e: any) => e.language.toLowerCase() === 'en');
      if (found != null) {
        return found.text;
      }
      found = el.value?.[0];
      if (found != null) {
        return found.text;
      }
    }
    return '';
  }
}
