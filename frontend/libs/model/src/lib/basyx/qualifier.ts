import { IdentifierType } from './identifier';
import { SemanticId } from './semantic-id';

export class Qualifier {
  type: QualifierType = QualifierType.Multiplicity;
  value: string = '';
  valueType: string = '';
  modelType = { name: 'Qualifier' };
  semanticId: SemanticId = new SemanticId(IdentifierType.Qualifier);
}

export enum QualifierType {
  Multiplicity = 'Multiplicity',
  FormInfo = 'FormInfo',
  FormTitle = 'FormTitle',
}

export enum MultiplicityTypes {
  One = 'One',
  OneToMany = 'OneToMany',
  ZeroToMany = 'ZeroToMany',
}
