import { Identification } from './identification';
import { Identifier, IdentifierType } from './identifier';

export interface Identifiable {
  semanticId: { keys: Identifier[] };
  setSemanticId(identification: Identification, type: IdentifierType): void;
}
