import { AssetAdministrationShellEnvironment, Identifier, MultiLanguageProperty } from '@aas/model';
import { TreeNode } from 'primeng/api';

export class V2Searcher {
  matchingIds: string[] = [];

  searchAnywhere(idToFind: string, treeData: TreeNode[], aasStructure: AssetAdministrationShellEnvironment) {
    this.searchIdShortRecursive(aasStructure, idToFind, treeData, aasStructure);
    this.searchValueRecursive(aasStructure, idToFind, treeData, aasStructure);
    this.searchSemanticIdRecursive(aasStructure, idToFind, treeData, aasStructure);
    this.searchConceptDescriptions(idToFind, treeData, aasStructure);

    return this.matchingIds;
  }

  searchIdShort(aasStructure: AssetAdministrationShellEnvironment, idToFind: string, treeData: TreeNode[]) {
    this.searchIdShortRecursive(aasStructure, idToFind, treeData, aasStructure);
    return this.matchingIds;
  }
  searchValue(aasStructure: AssetAdministrationShellEnvironment, idToFind: string, treeData: TreeNode[]) {
    this.searchValueRecursive(aasStructure, idToFind, treeData, aasStructure);
    return this.matchingIds;
  }
  searchSemanticId(aasStructure: AssetAdministrationShellEnvironment, idToFind: string, treeData: TreeNode[]) {
    this.searchSemanticIdRecursive(aasStructure, idToFind, treeData, aasStructure);
    return this.matchingIds;
  }
  searchConceptDescription(aasStructure: AssetAdministrationShellEnvironment, idToFind: string, treeData: TreeNode[]) {
    this.searchConceptDescriptions(idToFind, treeData, aasStructure);
    return this.matchingIds;
  }

  searchIdShortRecursive(
    element: any,
    idToFind: string,
    treeData: TreeNode[],
    aasStructure: AssetAdministrationShellEnvironment,
  ): any {
    if (((element.idShort as string) ?? '').toLowerCase().includes(idToFind.toLowerCase())) {
      this.insertIntoMatching(element.mlGenUuid, treeData, aasStructure);
    }
    if (element.modelType?.name === 'SubmodelElementCollection' && element.value != null) {
      for (const smce of element.value) {
        this.searchIdShortRecursive(smce, idToFind, treeData, aasStructure);
      }
    } else if (element.modelType?.name === 'Submodel' && element.submodelElements != null) {
      for (const sme of element.submodelElements) {
        this.searchIdShortRecursive(sme, idToFind, treeData, aasStructure);
      }
    } else if (element.modelType?.name === 'Entity' && element.statements != null) {
      for (const sme of element.statements) {
        this.searchIdShortRecursive(sme, idToFind, treeData, aasStructure);
      }
    } else if (element instanceof AssetAdministrationShellEnvironment) {
      for (const sm of element.submodels ?? []) {
        this.searchIdShortRecursive(sm, idToFind, treeData, aasStructure);
      }
      for (const asset of element.assets ?? []) {
        this.searchIdShortRecursive(asset, idToFind, treeData, aasStructure);
      }
      for (const cd of element.conceptDescriptions ?? []) {
        this.searchIdShortRecursive(cd, idToFind, treeData, aasStructure);
      }
      for (const shell of element.assetAdministrationShells ?? []) {
        this.searchIdShortRecursive(shell, idToFind, treeData, aasStructure);
      }
    }

    return null;
  }

  searchSemanticIdRecursive(
    element: any,
    idToFind: string,
    treeData: TreeNode[],
    aasStructure: AssetAdministrationShellEnvironment,
  ): any {
    if (element.semanticId != null) {
      // suchen - mal sehen wie
      //    this.matchingIds.push(element.mlGenUuid);
      element.semanticId.keys.forEach((k: Identifier) => {
        if (k.value.toLowerCase().includes(idToFind.toLowerCase())) {
          this.insertIntoMatching(element.mlGenUuid, treeData, aasStructure);
        }
      });
    }
    if (element.modelType?.name === 'SubmodelElementCollection' && element.value != null) {
      for (const smce of element.value) {
        this.searchSemanticIdRecursive(smce, idToFind, treeData, aasStructure);
      }
    } else if (element.modelType?.name === 'Submodel' && element.submodelElements != null) {
      for (const sme of element.submodelElements) {
        this.searchSemanticIdRecursive(sme, idToFind, treeData, aasStructure);
      }
    } else if (element.modelType?.name === 'Entity' && element.statements != null) {
      for (const sme of element.statements) {
        this.searchSemanticIdRecursive(sme, idToFind, treeData, aasStructure);
      }
    } else if (element instanceof AssetAdministrationShellEnvironment) {
      for (const sm of element.submodels ?? []) {
        this.searchSemanticIdRecursive(sm, idToFind, treeData, aasStructure);
      }
      for (const asset of element.assets ?? []) {
        this.searchSemanticIdRecursive(asset, idToFind, treeData, aasStructure);
      }
      for (const cd of element.conceptDescriptions ?? []) {
        this.searchSemanticIdRecursive(cd, idToFind, treeData, aasStructure);
      }
      for (const shell of element.assetAdministrationShells ?? []) {
        this.searchSemanticIdRecursive(shell, idToFind, treeData, aasStructure);
      }
    }

    return null;
  }

  searchValueRecursive(
    element: any,
    idToFind: string,
    treeData: TreeNode[],
    aasStructure: AssetAdministrationShellEnvironment,
  ): any {
    if (
      element.modelType?.name === 'Property' &&
      ((element.value as string) ?? '').toLowerCase().includes(idToFind.toLowerCase())
    ) {
      this.insertIntoMatching(element.mlGenUuid, treeData, aasStructure);
    }
    if (element.modelType?.name === 'MultiLanguageProperty') {
      for (const val of (element as MultiLanguageProperty).value) {
        if (val.text?.toLowerCase().includes(idToFind.toLowerCase())) {
          this.insertIntoMatching(element.mlGenUuid, treeData, aasStructure);
        }
      }
    }

    if (element.modelType?.name === 'SubmodelElementCollection' && element.value != null) {
      for (const smce of element.value) {
        this.searchValueRecursive(smce, idToFind, treeData, aasStructure);
      }
    } else if (element.modelType?.name === 'Submodel' && element.submodelElements != null) {
      for (const sme of element.submodelElements) {
        this.searchValueRecursive(sme, idToFind, treeData, aasStructure);
      }
    } else if (element.modelType?.name === 'Entity' && element.statements != null) {
      for (const sme of element.statements) {
        this.searchValueRecursive(sme, idToFind, treeData, aasStructure);
      }
    } else if (element instanceof AssetAdministrationShellEnvironment) {
      for (const sm of element.submodels ?? []) {
        this.searchValueRecursive(sm, idToFind, treeData, aasStructure);
      }
      for (const asset of element.assets ?? []) {
        this.searchValueRecursive(asset, idToFind, treeData, aasStructure);
      }
      for (const cd of element.conceptDescriptions ?? []) {
        this.searchValueRecursive(cd, idToFind, treeData, aasStructure);
      }
      for (const shell of element.assetAdministrationShells ?? []) {
        this.searchValueRecursive(shell, idToFind, treeData, aasStructure);
      }
    }

    return null;
  }

  searchConceptDescriptions(
    idToFind: string,
    treeData: TreeNode[],
    aasStructure: AssetAdministrationShellEnvironment,
  ): void {
    aasStructure?.conceptDescriptions.forEach((cd) => {
      if ((cd.idShort ?? '').toLowerCase().includes(idToFind.toLowerCase())) {
        this.insertIntoMatching(cd.mlGenUuid, treeData, aasStructure);
      }
      if ((cd.identification?.id ?? '').toLowerCase().includes(idToFind.toLowerCase())) {
        this.insertIntoMatching(cd.mlGenUuid, treeData, aasStructure);
      }

      cd.embeddedDataSpecifications.forEach((eds) => {
        for (const val of eds.dataSpecificationContent.preferredName ?? []) {
          if (val.text?.toLowerCase().includes(idToFind.toLowerCase())) {
            this.insertIntoMatching(cd.mlGenUuid, treeData, aasStructure);
          }
        }
        for (const val of eds.dataSpecificationContent.shortName ?? []) {
          if (val.text?.toLowerCase().includes(idToFind.toLowerCase())) {
            this.insertIntoMatching(cd.mlGenUuid, treeData, aasStructure);
          }
        }
        for (const val of eds.dataSpecificationContent.definition ?? []) {
          if (val.text?.toLowerCase().includes(idToFind.toLowerCase())) {
            this.insertIntoMatching(cd.mlGenUuid, treeData, aasStructure);
          }
        }
      });
    });
  }

  insertIntoMatching(id: string, treeData: TreeNode[], aasStructure: AssetAdministrationShellEnvironment): void {
    if (!this.matchingIds.includes(id)) {
      let found = false;
      for (const tn of treeData ?? []) {
        if (this.findRecursive(tn, id) != null) {
          found = true;
        }
      }
      if (found) {
        this.matchingIds.push(id);
      } else {
        // elternelement finden, dass sichtbar ist, für die "ausgegrauten teilmodelle"?
        for (const sm of aasStructure?.submodels ?? []) {
          if (JSON.stringify(sm).includes(`"mlGenUuid":"${id}"`)) {
            if (!this.matchingIds.includes(id)) this.matchingIds.push(sm.mlGenUuid);
          }
        }
      }
    }
  }

  findRecursive(node: TreeNode, idToFind: string): any {
    if (node?.data?.uuid === idToFind) {
      return true;
    } else {
      for (const childNode of node.children ?? []) {
        const res = this.findRecursive(childNode, idToFind);
        if (res) return res;
      }
    }
    return null;
  }
}
