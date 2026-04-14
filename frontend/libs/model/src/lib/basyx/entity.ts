import { ModelTypable } from './model-typable';

export class Entity implements ModelTypable {
  statements: any[] = [];
  entityType: 'CoManagedEntity' | 'SelfManagedEntity' | null = null;
  asset: { keys: [{ idType: string; value: string }] } = { keys: [{ idType: 'IRI', value: '' }] };

  idShort: string = '';

  modelType = { name: 'Entity' };
  kind: 'Instance' | ' Type' = 'Instance';
  category: 'PARAMETER' | 'CONSTANT' | 'VARIABLE' | undefined;
  mlGenUuid: string = '';

  static fromDto(dto: any) {
    const p = new Entity();
    Object.assign(p, dto);
    return p;
  }
}
