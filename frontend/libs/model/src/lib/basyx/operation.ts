import { OperationVariable } from './operation-variable';

export class Operation {
  idShort: string = '';
  modelType: { name: string } = { name: 'Operation' };

  descriptions?: string;
  outputVariables?: OperationVariable[];
  inputVariables?: OperationVariable[];
  inoutputVariables?: OperationVariable[];

  mlGenUuid: string = '';
}
