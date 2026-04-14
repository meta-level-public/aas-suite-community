import { Identifier, IdentifierType } from './identifier';

export class SemanticId {
  keys: Identifier[] = [];

  constructor(type: IdentifierType) {
    this.keys.push(new Identifier(type));
  }
}
