import { ModelTypable } from './model-typable';
import { Referrable } from './referrable';

export class MultiLanguageProperty extends Referrable implements ModelTypable {
  modelType = { name: 'MultiLanguageProperty' };
  kind: 'Instance' | ' Type' = 'Instance';
  category: 'PARAMETER' | 'CONSTANT' | 'VARIABLE' | undefined;

  value: MultiLanguagePropertyValue[] = [];
  valueId: any; //EnvironmentReference
  mlGenUuid: string = '';

  static fromDto(dto: any) {
    const m = new MultiLanguageProperty();
    Object.assign(m, dto);
    return m;
  }
}

export class MultiLanguagePropertyValue {
  language: string = '';
  text: string = '';
}
