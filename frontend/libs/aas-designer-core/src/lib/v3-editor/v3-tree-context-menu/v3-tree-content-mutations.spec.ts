import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { PackageMetadata, ShellResult } from '@aas/model';
import {
  addElementToContent,
  findSubmodelToPasteAsReference,
  removeElementFromContent,
} from './v3-tree-content-mutations';

function createShell(id: string) {
  return new aas.types.AssetAdministrationShell(id, new aas.types.AssetInformation(aas.types.AssetKind.Instance));
}

function submodelRef(id: string) {
  return new aas.types.Reference(aas.types.ReferenceTypes.ModelReference, [
    new aas.types.Key(aas.types.KeyTypes.Submodel, id),
  ]);
}

describe('v3 tree content mutations', () => {
  it('appends submodel elements to submodels, collections, lists and entities (creating the arrays)', () => {
    const property = new aas.types.Property(aas.types.DataTypeDefXsd.String);
    const containers = [
      new aas.types.Submodel('urn:sm'),
      new aas.types.SubmodelElementCollection(),
      new aas.types.SubmodelElementList(aas.types.AasSubmodelElements.Property),
      new aas.types.Entity(),
    ];

    containers.forEach((container) => addElementToContent(container, property, null, undefined));

    expect((containers[0] as aas.types.Submodel).submodelElements).toEqual([property]);
    expect((containers[1] as aas.types.SubmodelElementCollection).value).toEqual([property]);
    expect((containers[2] as aas.types.SubmodelElementList).value).toEqual([property]);
    expect((containers[3] as aas.types.Entity).statements).toEqual([property]);
  });

  it('references a submodel in a shell and gives a pasted copy a new id', () => {
    const shellResult = new ShellResult();
    shellResult.v3Shell = new aas.types.Environment(null, []);
    const shell = createShell('urn:aas');

    const referenced = new aas.types.Submodel('urn:existing');
    addElementToContent(shell, referenced, 'reference', shellResult);
    expect(shell.submodels?.[0].keys[0].value).toBe('urn:existing');
    expect(shellResult.v3Shell.submodels).toEqual([]);

    const copy = new aas.types.Submodel('urn:existing');
    addElementToContent(shell, copy, 'copy', shellResult);
    expect(copy.id).not.toBe('urn:existing');
    expect(shell.submodels?.[1].keys[0].value).toBe(copy.id);
    expect(shellResult.v3Shell.submodels).toEqual([copy]);
  });

  it('offers pasting a copied submodel as reference only into shells that do not reference it yet', () => {
    const submodel = new aas.types.Submodel('urn:sm');
    const shellResult = new ShellResult();
    shellResult.v3Shell = new aas.types.Environment(null, [submodel]);
    const otherShell = createShell('urn:aas:other');
    const owningShell = createShell('urn:aas');
    owningShell.submodels = [submodelRef('urn:sm')];
    const copied = new aas.types.Submodel('urn:sm');

    expect(findSubmodelToPasteAsReference(otherShell, copied, shellResult)).toBe(submodel);
    expect(findSubmodelToPasteAsReference(owningShell, copied, shellResult)).toBeUndefined();
    expect(findSubmodelToPasteAsReference(otherShell, new aas.types.Submodel('urn:gone'), shellResult)).toBeUndefined();
    expect(findSubmodelToPasteAsReference(new aas.types.Submodel('urn:x'), copied, shellResult)).toBeUndefined();
    expect(findSubmodelToPasteAsReference(otherShell, copied, undefined)).toBeUndefined();
  });

  it('pastes a submodel as reference without changing its id or duplicating it in the environment', () => {
    const submodel = new aas.types.Submodel('urn:sm');
    const shellResult = new ShellResult();
    shellResult.v3Shell = new aas.types.Environment(null, [submodel]);
    const shell = createShell('urn:aas:other');

    addElementToContent(shell, findSubmodelToPasteAsReference(shell, submodel, shellResult)!, 'reference', shellResult);

    expect(submodel.id).toBe('urn:sm');
    expect(shell.submodels?.[0].type).toBe(aas.types.ReferenceTypes.ModelReference);
    expect(shell.submodels?.[0].keys[0].value).toBe('urn:sm');
    expect(shellResult.v3Shell.submodels).toEqual([submodel]);
  });

  it('copies the submodels of a shell pasted as copy into the environment', () => {
    const submodel = new aas.types.Submodel('urn:sm');
    const shellResult = new ShellResult();
    shellResult.v3Shell = new aas.types.Environment(null, [submodel]);
    const metadata = new PackageMetadata();
    metadata.fullData = new aas.types.Environment([]);
    const shell = createShell('urn:aas');
    shell.submodels = [submodelRef('urn:sm')];

    addElementToContent(metadata, shell, 'copy', shellResult);

    const copiedSubmodel = shellResult.v3Shell.submodels?.[1];
    expect(metadata.fullData.assetAdministrationShells).toEqual([shell]);
    expect(copiedSubmodel).not.toBe(submodel);
    expect(copiedSubmodel?.id).not.toBe('urn:sm');
    expect(shell.submodels[0].keys[0].value).toBe(copiedSubmodel?.id);
  });

  it('removes an element from its parent and ignores elements that are not contained', () => {
    const first = new aas.types.Property(aas.types.DataTypeDefXsd.String);
    const second = new aas.types.Property(aas.types.DataTypeDefXsd.String);
    const collection = new aas.types.SubmodelElementCollection();
    collection.value = [first, second];

    removeElementFromContent(collection, first);
    removeElementFromContent(collection, new aas.types.Blob());
    removeElementFromContent(undefined, second);

    expect(collection.value).toEqual([second]);
  });
});
