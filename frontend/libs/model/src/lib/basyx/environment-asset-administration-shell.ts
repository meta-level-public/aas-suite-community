import { Identification } from './identification';

export class EnvironmentAssetAdministrationShell {
  asset: any;
  submodels: any[] = [];
  idShort: string = '';
  identification: Identification = new Identification();
  mlGenUuid: string = '';
  modelType: { name: string } = { name: 'AssetAdministrationShell' };

  administration: { version: string; revision: string } = { version: '1.0', revision: '0' };

  static fromDto(dto: any) {
    const shell = new EnvironmentAssetAdministrationShell();
    Object.assign(shell, dto);

    return shell;
  }
}
