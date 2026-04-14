import { ModelTypable } from './model-typable';

export class Property implements ModelTypable {
  valueType: string = '';
  value: string = '';
  valueId: any; //EnvironmentReference

  _idShort: string = '';

  modelType = { name: 'Property' };
  kind: 'Instance' | ' Type' = 'Instance';
  category: 'PARAMETER' | 'CONSTANT' | 'VARIABLE' | undefined;
  mlGenUuid: string = '';

  static fromDto(dto: any) {
    const p = new Property();
    Object.assign(p, dto);
    return p;
  }

  set idShort(value: string | number) {
    this._idShort = value.toString();
  }

  get idShort(): string {
    return this._idShort.toString();
  }
}
