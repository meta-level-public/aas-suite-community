import { BasyxFile } from './file';
import { Identifiable } from './identifiable';
import { Identification } from './identification';
import { Identifier, IdentifierType } from './identifier';
import { ModelTypable } from './model-typable';
import { MultiLanguageProperty } from './multi-language-property';
import { Property } from './property';
import { Referrable } from './referrable';
import { SubmodelElementCollection } from './submodel-element-collection';

export class Submodel extends Referrable implements Identifiable, ModelTypable {
  kind: 'Instance' | 'Template' = 'Instance';
  identification: Identification = new Identification();
  qualifier: any;
  submodelElements: any[] = [];
  semanticId: { keys: Identifier[] } = { keys: [] };
  modelType = { name: 'Submodel' };
  category: 'PARAMETER' | 'CONSTANT' | 'VARIABLE' | undefined;
  mlGenUuid: string = '';

  setSemanticId(identification: Identification, type: IdentifierType): void {
    if (this.semanticId == null) this.semanticId = { keys: [] };
    let semId = this.semanticId.keys.find((s) => s.type === type);
    if (semId == null) {
      semId = new Identifier(type);
      this.semanticId.keys.push(semId);
    }

    semId.idType = identification.idType;
    semId.local = true;
    semId.value = identification.id;
  }

  static fromDto(dto: any) {
    const s = new Submodel();
    Object.assign(s, dto);
    s.submodelElements = s.submodelElements.map((sme: any) => {
      switch (sme.modelType.name) {
        case 'SubmodelElementCollection':
          return SubmodelElementCollection.fromDto(sme);
        case 'Property':
          return Property.fromDto(sme);
        case 'File':
          return BasyxFile.fromDto(sme);
        case 'MultiLanguageProperty':
          return MultiLanguageProperty.fromDto(sme);
        default:
          return sme;
      }
    });

    return s;
  }
}
