import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { AssetAdministrationShellEnvironment } from './basyx/shell-environment';
import { PackageMetadata } from './package-metadata';
import { SupplementalFile } from './supplemental-file';

export class ShellResult {
  shell: AssetAdministrationShellEnvironment | null = null; // populated and sent only by v2

  plainJson: string = '';
  supplementalFiles: SupplementalFile[] = []; // populated and sent from v3 onwards
  addedFiles: SupplementalFile[] = []; // populated by the client for transmission to the server
  deletedFiles: SupplementalFile[] = []; // populated by the client for transmission to the server

  deletedSubmodels: string[] = []; // populated by the client for transmission to the server

  packageMetadata: PackageMetadata = new PackageMetadata();

  /** Diese Daten werden erst vom client bestimmt und gefüllt */
  v3Shell: aas.types.Environment | null = null;
  id: number = 0;

  static fromDto(dto: any) {
    const shellResult = new ShellResult();
    Object.assign(shellResult, dto);

    shellResult.shell = AssetAdministrationShellEnvironment.fromDto(dto.shell);

    if (dto.plainJson != null && dto.plainJson !== '') {
      const instanceOrErrorPlain = aas.jsonization.environmentFromJsonable(JSON.parse(dto.plainJson));
      shellResult.v3Shell = instanceOrErrorPlain.value;

      if (instanceOrErrorPlain.error != null) {
        // eslint-disable-next-line no-console
        console.log(
          'De-serialization failed: ' +
            `${instanceOrErrorPlain.error.path}: ` +
            `${instanceOrErrorPlain.error.message}`,
        );
      }
    }

    shellResult.packageMetadata.filename = dto.fileName;
    shellResult.packageMetadata.freigabeLevel = dto.freigabeLevel;
    shellResult.packageMetadata.marktGuid = dto.marktGuid;
    shellResult.packageMetadata.beschreibung = dto.beschreibung;

    return shellResult;
  }

  getPlain() {
    if (this.v3Shell != null) return JSON.stringify(aas.jsonization.toJsonable(this.v3Shell));
    else return '';
  }
}
