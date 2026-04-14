import { MultiLanguageProperty } from './multi-language-property';
import { Property } from './property';
import { SubmodelElementCollection } from './submodel-element-collection';

export class OperationVariable {
  modelType: { name: string } = { name: 'OperationVariable' };
  value: Property | SubmodelElementCollection | MultiLanguageProperty | null = null;
}
