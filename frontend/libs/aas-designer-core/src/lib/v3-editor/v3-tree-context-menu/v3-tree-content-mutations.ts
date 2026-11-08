import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { PackageMetadata, ShellResult } from '@aas/model';
import { cloneDeep } from 'lodash-es';
import { v4 as uuid } from 'uuid';

type ISubmodelElement = aas.types.ISubmodelElement;

export type InsertMode = 'copy' | 'reference' | null;

function createSubmodelReference(submodelId: string) {
  return new aas.types.Reference(aas.types.ReferenceTypes.ModelReference, [
    new aas.types.Key(aas.types.KeyTypes.Submodel, submodelId),
  ]);
}

/**
 * Adds `element` to the model content of the target node (environment, shell, submodel or container element).
 * When pasting a shell or submodel as copy, the referenced submodels get new ids and are added to the environment.
 */
export function addElementToContent(
  container: unknown,
  element: aas.types.Class,
  mode: InsertMode,
  shellResult: ShellResult | undefined,
) {
  if (container instanceof PackageMetadata) {
    const shell = element as aas.types.AssetAdministrationShell;
    if (mode === 'copy') {
      const submodelRefs: aas.types.Reference[] = [];
      shell.submodels?.forEach((smRef) => {
        const submodel = shellResult?.v3Shell?.submodels?.find((s) => s.id === smRef.keys[0].value);
        const submodelCopy = cloneDeep(submodel);
        if (submodelCopy != null) {
          submodelCopy.id = uuid();
          shellResult?.v3Shell?.submodels?.push(submodelCopy);
          submodelRefs.push(createSubmodelReference(submodelCopy.id));
        }
      });
      shell.submodels = submodelRefs;
    }
    container.fullData?.assetAdministrationShells?.push(shell);
  }

  if (container instanceof aas.types.AssetAdministrationShell) {
    const submodel = element as aas.types.Submodel;
    if (container.submodels == null) {
      container.submodels = [];
    }
    if (mode === 'copy') {
      const id = uuid();
      container.submodels.push(createSubmodelReference(id));
      submodel.id = id;
      shellResult?.v3Shell?.submodels?.push(submodel);
    } else {
      container.submodels.push(createSubmodelReference(submodel.id));
    }
  }

  const children = getChildArray(container, true);
  children?.push(element as ISubmodelElement);
}

/** Removes `element` from the child array of the parent container (submodel, collection, list or entity). */
export function removeElementFromContent(parentContent: unknown, element: unknown) {
  const children = getChildArray(parentContent, false);
  const index = children?.indexOf(element as ISubmodelElement);
  if (children != null && index != null && index > -1) {
    children.splice(index, 1);
  }
}

function getChildArray(container: unknown, create: boolean): ISubmodelElement[] | null | undefined {
  if (container instanceof aas.types.Submodel) {
    if (create && container.submodelElements == null) container.submodelElements = [];
    return container.submodelElements;
  }
  if (container instanceof aas.types.SubmodelElementCollection || container instanceof aas.types.SubmodelElementList) {
    if (create && container.value == null) container.value = [];
    return container.value;
  }
  if (container instanceof aas.types.Entity) {
    if (create && container.statements == null) container.statements = [];
    return container.statements;
  }
  return undefined;
}
