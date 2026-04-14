import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { TreeNode } from 'primeng/api';
import { CMTypeOption } from '../../v3-editor/model/cm-type-option';
import { V3TreeItem } from '../../v3-editor/model/v3-tree-item';
import { V3TreeService } from '../../v3-editor/v3-tree/v3-tree.service';

type AssetAdministrationShell = aas.types.AssetAdministrationShell;
type ConceptDescription = aas.types.ConceptDescription;
type ISubmodelElement = aas.types.ISubmodelElement;
type MultiLanguageProperty = aas.types.MultiLanguageProperty;
type Property = aas.types.Property;
type Submodel = aas.types.Submodel;

export class V3Searcher {
  matchingIds: string[] = [];

  constructor(private treeService: V3TreeService) {}

  searchAnywhere(idToFind: string, treeData: TreeNode[]) {
    this.searchIdShort(idToFind, treeData);
    this.searchValue(idToFind, treeData);
    this.searchSemanticId(idToFind, treeData);
    // this.searchConceptDescriptions(idToFind, treeData, aasStructure);

    return this.matchingIds;
  }

  searchIdShort(idToFind: string, treeData: TreeNode<V3TreeItem<any>>[]) {
    for (const treeNode of treeData) {
      this.searchIdShortRecursive(idToFind, treeNode);
    }
    return this.matchingIds;
  }
  searchValue(idToFind: string, treeData: TreeNode[]) {
    for (const treeNode of treeData) {
      this.searchValueRecursive(idToFind, treeNode);
    }
    return this.matchingIds;
  }
  searchSemanticId(idToFind: string, treeData: TreeNode[]) {
    for (const treeNode of treeData) {
      this.searchSemanticIdRecursive(idToFind, treeNode);
    }
    return this.matchingIds;
  }
  searchConceptDescription(idToFind: string, treeData: TreeNode[]) {
    for (const treeNode of treeData) {
      this.searchConceptDescriptions(idToFind, treeNode);
    }
    return this.matchingIds;
  }

  searchIdShortRecursive(idToFind: string, treeNode: TreeNode<V3TreeItem<any>>): any {
    if (treeNode.data == null) return;
    switch (treeNode.data.editorType as any) {
      case CMTypeOption.AssetAdministrationShells:
        break;
      case CMTypeOption.AssetAdministrationShell:
        {
          const aasShell = treeNode.data?.content as AssetAdministrationShell;
          if (aasShell.idShort?.toLowerCase()?.includes(idToFind.toLowerCase())) {
            this.insertIntoMatchingIds(treeNode.data.id);
          }
        }
        break;
      case 'Submodels':
        break;
      case CMTypeOption.Submodel:
        {
          const sm = treeNode.data.content as Submodel;
          if (sm.idShort?.toLowerCase()?.includes(idToFind.toLowerCase())) {
            this.insertIntoMatchingIds(treeNode.data.id);
          }
        }
        break;
      case CMTypeOption.SubmodelElementCollection:
      case CMTypeOption.SubmodelElementList:
      case CMTypeOption.Property:
      case CMTypeOption.MultiLanguageProperty:
      case CMTypeOption.Capability:
      case CMTypeOption.Entity:
      case CMTypeOption.File:
      case CMTypeOption.Operation:
      case CMTypeOption.ReferenceElement:
        {
          const sme = treeNode.data.content as ISubmodelElement;
          if (sme.idShort?.toLowerCase()?.includes(idToFind.toLowerCase())) {
            this.insertIntoMatchingIds(treeNode.data.id);
          }
        }
        break;
      default:
        // eslint-disable-next-line no-console
        console.log('Unknown editorType ' + treeNode.data.editorType);
      //throw new Error('Unknown editorType ' + treeNode.data.editorType);
    }

    if (treeNode.children != null) {
      for (const tn of treeNode.children) {
        this.searchIdShortRecursive(idToFind, tn);
      }
    }
  }

  searchSemanticIdRecursive(idToFind: string, treeNode: TreeNode<V3TreeItem<any>>) {
    if (treeNode.data == null) return;
    switch (treeNode.data.editorType as any) {
      case CMTypeOption.AssetAdministrationShells:
      case CMTypeOption.AssetAdministrationShell:
        break;
      case 'Submodels':
        break;
      case CMTypeOption.Submodel:
        {
          const sm = treeNode.data.content as Submodel;
          if (sm.semanticId?.keys.find((k: any) => k.value.toLowerCase()?.includes(idToFind.toLowerCase()))) {
            this.insertIntoMatchingIds(treeNode.data.id);
          }
        }
        break;
      case CMTypeOption.SubmodelElementCollection:
      case CMTypeOption.SubmodelElementList:
      case CMTypeOption.Property:
      case CMTypeOption.MultiLanguageProperty:
      case CMTypeOption.Capability:
      case CMTypeOption.Entity:
      case CMTypeOption.File:
      case CMTypeOption.Operation:
      case CMTypeOption.ReferenceElement:
        {
          const sme = treeNode.data.content as ISubmodelElement;
          if (sme.semanticId?.keys.find((k: any) => k.value.toLowerCase()?.includes(idToFind.toLowerCase()))) {
            this.insertIntoMatchingIds(treeNode.data.id);
          }
        }
        break;
      default:
        // eslint-disable-next-line no-console
        console.log('Unknown editorType ' + treeNode.data.editorType);
      //throw new Error('Unknown editorType ' + treeNode.data.editorType);
    }

    if (treeNode.children != null) {
      for (const tn of treeNode.children) {
        this.searchSemanticIdRecursive(idToFind, tn);
      }
    }
  }

  searchValueRecursive(idToFind: string, treeNode: TreeNode<V3TreeItem<any>>) {
    if (treeNode.data == null) return;
    switch (treeNode.data.editorType as any) {
      case CMTypeOption.AssetAdministrationShells:
      case CMTypeOption.AssetAdministrationShell:
      case 'Submodels':
        break;
      case CMTypeOption.Property:
        {
          const sme = treeNode.data.content as Property;
          if (sme.value?.toLowerCase()?.includes(idToFind.toLowerCase())) {
            this.insertIntoMatchingIds(treeNode.data.id);
          }
        }
        break;

      case CMTypeOption.MultiLanguageProperty:
        {
          const sme = treeNode.data.content as MultiLanguageProperty;
          if (sme.value?.find((k: any) => k.text.toLowerCase()?.includes(idToFind.toLowerCase()))) {
            this.insertIntoMatchingIds(treeNode.data.id);
          }
        }
        break;
      case CMTypeOption.Capability:
      case CMTypeOption.Entity:
      case CMTypeOption.File:
      case CMTypeOption.Operation:
      case CMTypeOption.ReferenceElement:
        break;
      default:
        // eslint-disable-next-line no-console
        console.log('Unknown editorType ' + treeNode.data.editorType);
      //throw new Error('Unknown editorType ' + treeNode.data.editorType);
    }

    if (treeNode.children != null) {
      for (const tn of treeNode.children) {
        this.searchValueRecursive(idToFind, tn);
      }
    }
  }

  searchConceptDescriptions(idToFind: string, treeNode: TreeNode<V3TreeItem<any>>) {
    if (treeNode.data == null) return;
    switch (treeNode.data.editorType as any) {
      case CMTypeOption.AssetAdministrationShells:
      case CMTypeOption.AssetAdministrationShell:
      case CMTypeOption.Submodel:
      case CMTypeOption.SubmodelElementCollection:
      case CMTypeOption.SubmodelElementList:
      case CMTypeOption.Property:
      case CMTypeOption.MultiLanguageProperty:
      case CMTypeOption.Capability:
      case CMTypeOption.Entity:
      case CMTypeOption.File:
      case CMTypeOption.Operation:
      case CMTypeOption.ReferenceElement:
        break;
      case CMTypeOption.ConceptDescription:
        {
          const cd = treeNode.data.content as ConceptDescription;
          if (cd.idShort?.toLowerCase()?.includes(idToFind.toLowerCase())) {
            this.insertIntoMatchingIds(treeNode.data.id);
          }
        }
        break;
      default:
        // eslint-disable-next-line no-console
        console.log('Unknown editorType ' + treeNode.data.editorType);
      //throw new Error('Unknown editorType ' + treeNode.data.editorType);
    }

    if (treeNode.children != null) {
      for (const tn of treeNode.children) {
        this.searchConceptDescriptions(idToFind, tn);
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

  insertIntoMatchingIds(id: any) {
    if (this.matchingIds.indexOf(id) === -1) {
      this.matchingIds.push(id);
    }
  }
}
