import { ModelTypable } from './model-typable';
import { Referrable } from './referrable';

export class BasyxFile extends Referrable implements ModelTypable {
  modelType = { name: 'File' };
  kind: 'Instance' | ' Type' = 'Instance';
  category: 'PARAMETER' | 'CONSTANT' | 'VARIABLE' | undefined;
  mimeType: string = '';
  value: string = '';

  fileObj: File | undefined;
  mlGenUuid: string = '';

  static fromDto(dto: any) {
    const f = new BasyxFile();
    Object.assign(f, dto);
    return f;
  }
}
