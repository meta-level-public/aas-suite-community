import { ModelTypable } from './model-typable';
import { MultiLanguagePropertyValue } from './multi-language-property';

export class Asset implements ModelTypable {
  idShort: string = '';
  description: MultiLanguagePropertyValue[] = [];

  modelType = { name: 'Asset' };
  kind: 'Instance' | ' Type' = 'Instance';
  category: 'PARAMETER' | 'CONSTANT' | 'VARIABLE' | undefined;
  mlGenUuid: string = '';

  static fromDto(dto: any) {
    const p = new Asset();
    Object.assign(p, dto);
    return p;
  }
}
