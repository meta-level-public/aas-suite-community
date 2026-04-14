import { IdGenerationUtil } from '@aas/helpers';
import { BasyxFile, Identification, Property } from '@aas/model';

export class Helper {
  static setMlpValue(smeArray: any[], field: string, val: any, lang: string) {
    const el = smeArray.find((sme: any) => sme.idShort === field);
    if (el != null) {
      el.value = [
        {
          language: lang,
          text: val,
        },
      ];
    }
  }
  static setValue(smeArray: any[], field: string, val: any, prefix: string, elementType?: string) {
    const el = smeArray.find((sme: any) => sme.idShort === field);
    if (el != null) {
      el.value = val;
    } else {
      if (elementType === 'File') {
        const prop = new BasyxFile();
        const idf = new Identification();
        idf.id = IdGenerationUtil.generateIri('file', prefix);
        prop.idShort = field;
        prop.value = val;
        smeArray.push(prop);
      }
      if (elementType === 'Property') {
        const prop = new Property();
        const idf = new Identification();
        idf.id = IdGenerationUtil.generateIri('propperty', prefix);
        prop.idShort = field;
        prop.value = val;
        smeArray.push(prop);
      }
    }
  }

  static setMimeType(smeArray: any[], field: string, val: any) {
    const el = smeArray.find((sme: any) => sme.idShort === field);
    if (el != null) {
      el.mimeType = val;
    }
  }
}
