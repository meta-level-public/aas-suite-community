import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { IdGenerationUtil } from '@aas/helpers';
import { ConceptDescriptionRoot, ShellResult } from '@aas/model';
import { TreeNode } from 'primeng/api';
import { v4 as uuid } from 'uuid';
import { SubmodelResult } from '../../generator/model/submodel-result';
import { EditorTypeOption } from '../model/editor-type-option';
import { V3TreeItem } from '../model/v3-tree-item';
import { V3TreeService } from '../v3-tree/v3-tree.service';
type ConceptDescription = aas.types.ConceptDescription;
type ISubmodelElement = aas.types.ISubmodelElement;

export class ElementInserter {
  static insertSubmodelTemplate(
    node: TreeNode,
    template: SubmodelResult,
    treeService: V3TreeService,
    conceptDescriptionsRootNode: TreeNode<V3TreeItem<ConceptDescription | ConceptDescriptionRoot>>,
    shellResult: ShellResult | undefined,
    prefix: string,
  ) {
    if (node.data?.content != null) {
      if (node.data.content.submodelElements == null) {
        node.data.content.submodelElements = [];
      }
      if (node.data.content.submodels == null) {
        node.data.content.submodels = [];
      }

      if (shellResult?.v3Shell != null && shellResult.v3Shell.submodels == null) {
        shellResult.v3Shell.submodels = [];
      }

      for (const submodel of template.v3Submodels) {
        submodel.id = IdGenerationUtil.generateIri('submodel', prefix);
        const submodelRef = new aas.types.Reference(aas.types.ReferenceTypes.ModelReference, [
          new aas.types.Key(aas.types.KeyTypes.Submodel, submodel.id),
        ]);

        node.data.content.submodels.push(submodelRef);

        shellResult?.v3Shell?.submodels?.push(submodel);

        const id = uuid();
        // treenode erzeugen für Submodel(ref)
        const propNodeData = new V3TreeItem<aas.types.Submodel>();
        propNodeData.content = submodel;
        propNodeData.id = id;
        propNodeData.editorType = EditorTypeOption.Submodel;
        propNodeData.parent = node.data;
        const shellNode: TreeNode<V3TreeItem<aas.types.Submodel>> = {
          label: submodel?.idShort ?? submodel.id,
          data: propNodeData,
          children: [],
          parent: node,
          key: id,
          expanded: false,
        };
        if (node.children == null) {
          node.children = [];
        }
        node.children.push(shellNode);
        treeService.buildChildTree(submodel.submodelElements, shellNode);
        node.expanded = true;
        treeService.aasTreeData = [...treeService.aasTreeData];
        setTimeout(() => {
          treeService.editorComponent?.requestEditModeForNextSelection();
          treeService.selectById(id);
        });
      }
      // konzeptbeschreibungen anhängen

      for (const conceptDescription of template.v3ConceptDescriptions) {
        if (shellResult?.v3Shell != null && shellResult.v3Shell.conceptDescriptions == null)
          shellResult.v3Shell.conceptDescriptions = [];

        // nur einfügen, falls noch nicht vorhanden
        const existingCd = shellResult?.v3Shell?.conceptDescriptions?.find(
          (cd: any) => cd.id === conceptDescription.id,
        );

        if (!existingCd) {
          shellResult?.v3Shell?.conceptDescriptions?.push(conceptDescription);
        }

        const id = uuid();
        // treenode erzeugen für Submodel(ref)
        const propNodeData = new V3TreeItem<aas.types.ConceptDescription>();
        propNodeData.content = conceptDescription;
        propNodeData.id = id;
        propNodeData.editorType = EditorTypeOption.Submodel;
        propNodeData.parent = node.data;
        const shellNode: TreeNode<V3TreeItem<aas.types.ConceptDescription> | V3TreeItem<ConceptDescriptionRoot>> = {
          label: conceptDescription?.idShort ?? conceptDescription.id,
          data: propNodeData,
          children: [],
          parent: node,
          key: id,
          expanded: false,
        };
        if (node.children == null) {
          node.children = [];
        }
        if (conceptDescriptionsRootNode != null && conceptDescriptionsRootNode.children == null)
          conceptDescriptionsRootNode.children = [];
        conceptDescriptionsRootNode?.children?.push(shellNode);
      }
    }
  }

  static insertSubmodel(
    submodel: aas.types.Submodel,
    treeService: V3TreeService,
    shellResult: ShellResult | undefined,
  ) {
    const node = treeService?.treeComponent?.shellNode as TreeNode<V3TreeItem<any>>;
    if (node?.data?.content instanceof aas.types.AssetAdministrationShell && node.data?.content != null) {
      if (node.data.content.submodels == null) {
        node.data.content.submodels = [];
      }
      if (shellResult?.v3Shell != null && shellResult.v3Shell.submodels == null) {
        shellResult.v3Shell.submodels = [];
      }

      const submodelRef = new aas.types.Reference(aas.types.ReferenceTypes.ModelReference, [
        new aas.types.Key(aas.types.KeyTypes.Submodel, submodel.id),
      ]);

      node.data.content.submodels.push(submodelRef);

      shellResult?.v3Shell?.submodels?.push(submodel);

      const id = uuid();
      // treenode erzeugen für Submodel(ref)
      const propNodeData = new V3TreeItem<aas.types.Submodel>();
      propNodeData.content = submodel;
      propNodeData.id = id;
      propNodeData.editorType = EditorTypeOption.Submodel;
      propNodeData.parent = node.data;
      const shellNode: TreeNode<V3TreeItem<aas.types.AssetAdministrationShell> | V3TreeItem<aas.types.Submodel>> = {
        label: submodel?.idShort ?? submodel.id,
        data: propNodeData,
        children: [],
        parent: node,
        key: id,
        expanded: false,
      };
      if (node.children == null) {
        node.children = [];
      }
      node.children.push(shellNode);
      treeService.buildChildTree(submodel.submodelElements, shellNode);
      node.expanded = true;
      treeService.aasTreeData = [...treeService.aasTreeData];
      setTimeout(() => {
        treeService.editorComponent?.requestEditModeForNextSelection();
        treeService.selectById(id);
      });
    }
  }

  static insertSubmodelElementToSubmodel(sme: aas.types.ISubmodelElement, treeService: V3TreeService) {
    const node = treeService.selectedTreeNode as TreeNode<V3TreeItem<aas.types.Submodel>>;
    if (node.data?.content != null) {
      if (node.data.content.submodelElements == null) {
        node.data.content.submodelElements = [];
      }

      node.data.content.submodelElements.push(sme);

      treeService.buildChildTree([sme], node);

      // konzeptbeschreibungen?
    }
  }

  static insertSubmodelElementToCollection(sme: aas.types.ISubmodelElement, treeService: V3TreeService) {
    const node = treeService.selectedTreeNode as TreeNode<V3TreeItem<aas.types.SubmodelElementCollection>>;
    if (node.data?.content != null) {
      if (node.data.content.value == null) {
        node.data.content.value = [];
      }

      node.data.content.value.push(sme);

      treeService.buildChildTree([sme], node);

      // konzeptbeschreibungen?
    }
  }

  static insertConceptDescription(cd: aas.types.ConceptDescription, treeService: V3TreeService) {
    const node = treeService.selectedTreeNode as TreeNode<V3TreeItem<any>>;
    if (node.data?.content != null) {
      if (node.data.content.conceptDescriptions == null) {
        node.data.content.conceptDescriptions = [];
      }

      node.data.content.conceptDescriptions.push(cd);

      const id = uuid();
      const propNodeData = new V3TreeItem<aas.types.ConceptDescription>();
      propNodeData.content = cd;
      propNodeData.id = id;
      propNodeData.editorType = EditorTypeOption.ConceptDescription;
      propNodeData.parent = node.data;
      const cdNode: TreeNode<V3TreeItem<aas.types.ConceptDescription>> = {
        label: cd?.idShort ?? cd.id,
        data: propNodeData,
        children: [],
        parent: node,
        key: id,
        expanded: false,
      };
      if (node.children == null) {
        node.children = [];
      }
      node.children.push(cdNode);
    }
  }

  static insertSubmodelElementByTargetId(targetId: string, treeService: V3TreeService, sme: ISubmodelElement) {
    const node = treeService.findById(targetId);
    if (node?.data?.content != null) {
      if (node.data.content.value == null) {
        node.data.content.value = [];
      }

      node.data.content.value.push(sme);

      treeService.buildChildTree([sme], node);
    }
  }
}
