import { BasyxFile } from './file';
import { Identifiable } from './identifiable';
import { Identification } from './identification';
import { Identifier, IdentifierType } from './identifier';
import { MultiLanguageProperty } from './multi-language-property';
import { Property } from './property';

export class SubmodelElementCollection implements Identifiable {
  value: any[] = []; // any submodel element
  ordered: boolean = false;
  allowDuplicates: boolean = false;

  _idShort: string = '';

  modelType: { name: string } = { name: 'SubmodelElementCollection' };
  kind: 'Instance' | ' Type' = 'Instance';

  semanticId: { keys: Identifier[] } = { keys: [] };
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
    const smc = new SubmodelElementCollection();
    Object.assign(smc, dto);
    smc.value = smc.value.map((sme: any) => {
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
    return smc;
  }

  set idShort(value: string | number) {
    this._idShort = value.toString();
  }

  get idShort(): string {
    return this._idShort.toString();
  }
}
