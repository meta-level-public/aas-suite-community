import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { PackageMetadata } from '@aas/model';
import { EditorTypeOption } from './editor-type-option';
type File = aas.types.File;
export class V3TreeItem<T> {
  content: T | undefined;
  id: string = '';
  editorType: EditorTypeOption = EditorTypeOption.Undefined;
  parent: V3TreeItem<any> | null | undefined;

  isParentSml: boolean = false;

  get treeLabel(): string {
    if (this.content instanceof PackageMetadata || this.editorType === EditorTypeOption.AssetAdministrationShells) {
      return 'SHELLS';
    }

    if (this.editorType === EditorTypeOption.ConceptDescriptions) {
      return 'CONCEPT_DESCRIPTIONS';
    }

    if (this.editorType === EditorTypeOption.SupplementalFiles) {
      return 'SUPPLEMENTAL_FILES';
    }

    if (this.editorType === EditorTypeOption.AllSubmodels) {
      return 'SUBMODELS';
    }

    if (this.editorType === EditorTypeOption.MissingSubmodel) {
      return 'MissingSubmodel';
    }

    if (this.editorType === EditorTypeOption.SupplementalFile) {
      return (this.content as any)?.filename;
    }

    if (this.editorType === EditorTypeOption.File) {
      return (this.content as File)?.idShort ?? (this.content as File)?.value ?? '';
    }

    return (this.content as any)?.idShort ?? (this.content as any)?.id ?? 'undefined';
  }
}
