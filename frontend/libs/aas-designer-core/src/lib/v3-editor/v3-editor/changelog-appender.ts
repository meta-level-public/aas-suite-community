import {
  DataTypeDefXsd,
  Key,
  KeyTypes,
  ModellingKind,
  Property,
  Reference,
  ReferenceTypes,
  Submodel,
  SubmodelElementCollection,
} from '@aas-core-works/aas-core3.1-typescript/types';
import { IdGenerationUtil } from '@aas/helpers';
import { ShellResult } from '@aas/model';

export class ChangelogAppender {
  static appendChangelog(comment: string | null, shellResult: ShellResult, currentUser: string, prefix: string) {
    let result = 'nothing';
    const aas = shellResult.v3Shell?.assetAdministrationShells?.[0];
    if (aas == null) return result;

    let changelogSubmodel: Submodel | undefined;

    for (const smRef of aas.submodels ?? []) {
      const sm = shellResult.v3Shell?.submodels?.find((s) => s.id === smRef.keys[0].value);
      if (sm == null) continue;

      if (sm.semanticId?.keys[0].value !== 'AasDesignerChangelog') continue;

      changelogSubmodel = sm;
    }

    if (changelogSubmodel == null) {
      changelogSubmodel = new Submodel(
        IdGenerationUtil.generateIri('submodel', prefix),
        null,
        null,
        'AasDesignerChangelog',
        null,
        null,
        null,
        ModellingKind.Instance,
        new Reference(ReferenceTypes.ExternalReference, [new Key(KeyTypes.GlobalReference, 'AasDesignerChangelog')]),
      );
      shellResult.v3Shell?.submodels?.push(changelogSubmodel);
      aas.submodels?.push(
        new Reference(ReferenceTypes.ModelReference, [new Key(KeyTypes.Submodel, changelogSubmodel.id)]),
      );
      result = 'created';
    } else {
      result = 'updated';
    }

    // ChangelogCollection finden
    let changelogCollection = changelogSubmodel.submodelElements?.find(
      (se) => se.idShort === 'Changes',
    ) as SubmodelElementCollection;
    if (changelogCollection == null) {
      // erzeugen
      if (changelogSubmodel.submodelElements == null) changelogSubmodel.submodelElements = [];
      changelogCollection = new SubmodelElementCollection(null, null, 'Changes');
      changelogSubmodel.submodelElements.push(changelogCollection);
    }
    // changelogCollection um UpdateEntry erweitern
    const count = changelogCollection.value?.length ?? 0;
    const changelogEntry = new SubmodelElementCollection(null, null, 'Update' + count);
    const changelogDate = new Property(
      DataTypeDefXsd.DateTime,
      null,
      null,
      'Date',
      null,
      null,
      null,
      null,
      null,
      null,
      new Date().toISOString(),
    );
    const changelogUser = new Property(
      DataTypeDefXsd.String,
      null,
      null,
      'User',
      null,
      null,
      null,
      null,
      null,
      null,
      currentUser,
    );
    const changelogAction = new Property(
      DataTypeDefXsd.String,
      null,
      null,
      'Action',
      null,
      null,
      null,
      null,
      null,
      null,
      'Update',
    );
    const changelogComment = new Property(
      DataTypeDefXsd.String,
      null,
      null,
      'Comment',
      null,
      null,
      null,
      null,
      null,
      null,
      comment ?? '',
    );

    changelogEntry.value = [changelogDate, changelogUser, changelogAction, changelogComment];
    if (changelogCollection.value == null) changelogCollection.value = [];
    changelogCollection.value.push(changelogEntry);

    return result;
  }
}
