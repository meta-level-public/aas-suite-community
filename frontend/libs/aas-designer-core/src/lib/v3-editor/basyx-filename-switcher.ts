import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { Submodel, SubmodelElementCollection, SubmodelElementList } from '@aas-core-works/aas-core3.1-typescript/types';
import { ShellResult } from '@aas/model';

export class BasyxFilenameSwitcher {
  static switchFilenames(oldNewFileNames: { [key: string]: string }, shellResult: ShellResult) {
    shellResult.v3Shell?.assetAdministrationShells?.forEach((shell) => {
      const defaultThumbnailPath = shell.assetInformation?.defaultThumbnail?.path;
      if (defaultThumbnailPath != null && shell.assetInformation?.defaultThumbnail != null) {
        shell.assetInformation.defaultThumbnail.path = BasyxFilenameSwitcher.switchFilenameInPathLikeValue(
          oldNewFileNames,
          defaultThumbnailPath,
        );
      }
    });

    shellResult.v3Shell?.submodels?.forEach((submodel) => {
      BasyxFilenameSwitcher.switchFilenameRecursively(oldNewFileNames, submodel);
    });

    shellResult.supplementalFiles?.forEach((supplementalFile) => {
      if (supplementalFile.filename != null && oldNewFileNames[supplementalFile.filename] != null) {
        supplementalFile.filename = oldNewFileNames[supplementalFile.filename];
      }

      supplementalFile.path = BasyxFilenameSwitcher.switchFilenameInPathLikeValue(
        oldNewFileNames,
        supplementalFile.path,
      );
    });
  }

  static switchFilenameRecursively(oldNewFileNames: { [key: string]: string }, element: any) {
    if (element instanceof Submodel && element.submodelElements != null) {
      element.submodelElements.forEach((sme) => {
        BasyxFilenameSwitcher.switchFilenameRecursively(oldNewFileNames, sme);
      });
    }
    if (element instanceof SubmodelElementCollection && element.value != null) {
      element.value.forEach((sme) => {
        BasyxFilenameSwitcher.switchFilenameRecursively(oldNewFileNames, sme);
      });
    }
    if (element instanceof SubmodelElementList && element.value != null) {
      element.value.forEach((sme) => {
        BasyxFilenameSwitcher.switchFilenameRecursively(oldNewFileNames, sme);
      });
    }

    if (element instanceof aas.types.File) {
      if (element.value != null) {
        element.value = BasyxFilenameSwitcher.switchFilenameInPathLikeValue(oldNewFileNames, element.value);
      }
    }
  }

  private static switchFilenameInPathLikeValue(
    oldNewFileNames: { [key: string]: string },
    value: string | null | undefined,
  ) {
    if (value == null || value === '') {
      return value ?? '';
    }

    if (oldNewFileNames[value] != null) {
      return oldNewFileNames[value];
    }

    const fileName = value.split('/').pop();
    if (fileName == null || oldNewFileNames[fileName] == null) {
      return value;
    }

    return value.slice(0, value.length - fileName.length) + oldNewFileNames[fileName];
  }
}
