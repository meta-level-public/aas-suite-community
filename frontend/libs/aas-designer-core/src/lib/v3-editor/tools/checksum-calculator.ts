import * as aas from '@aas-core-works/aas-core3.1-typescript';

export class ChecksumCalculator {
  static getSubmodelChecksum(_submodel: aas.types.Submodel): string {
    // const submodelString = JSON.stringify(submodel);
    return '123456789';
  }
  static getSMCChecksum(_smc: aas.types.SubmodelElementCollection): string {
    // const submodelString = JSON.stringify(submodel);
    return '123456789';
  }
}
