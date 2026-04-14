import { Identification } from './identification';
import { Identifier, IdentifierType } from './identifier';

export class Reference {
  keys: Identifier[] = [];
  mlGenUuid: string = '';
  modelType = { name: 'ReferenceElement' };
  kind: 'Instance' | ' Type' = 'Instance';
  category: 'PARAMETER' | 'CONSTANT' | 'VARIABLE' | undefined;

  semanticId: { keys: Identifier[] } = { keys: [new Identifier(IdentifierType.ReferenceElement)] };

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
}
