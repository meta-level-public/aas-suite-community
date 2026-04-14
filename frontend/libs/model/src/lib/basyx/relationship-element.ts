import { ModelTypable } from './model-typable';
import { Reference } from './reference';

export class RelationshipElement implements ModelTypable {
  first: Reference = new Reference();
  second: Reference = new Reference();

  idShort: string = '';

  modelType = { name: 'RelationshipElement' };
  kind: 'Instance' | ' Type' = 'Instance';
  category: 'PARAMETER' | 'CONSTANT' | 'VARIABLE' | undefined;

  mlGenUuid: string = '';

  static fromDto(dto: any) {
    const p = new Reference();
    Object.assign(p, dto);
    return p;
  }
}
