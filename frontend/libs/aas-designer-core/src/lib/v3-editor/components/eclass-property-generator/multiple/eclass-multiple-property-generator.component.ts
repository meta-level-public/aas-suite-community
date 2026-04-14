import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { NgClass } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { cloneDeep } from 'lodash-es';
import { MenuItem, PrimeTemplate, TreeNode } from 'primeng/api';
import { Button } from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Popover } from 'primeng/popover';
import { Skeleton } from 'primeng/skeleton';
import { Steps } from 'primeng/steps';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { Tree } from 'primeng/tree';
import { TreeTableModule } from 'primeng/treetable';
import { EClassLogoComponent } from '../../../../general/eclass-logo/eclass-logo.component';
import { EditorTypeOption } from '../../../model/editor-type-option';
import { V3TreeItem } from '../../../model/v3-tree-item';
import { ElementInserter } from '../../../tools/element-inserter';
import { V3TreeService } from '../../../v3-tree/v3-tree.service';
import { EClassPropertyService } from '../eclass-property.service';

@Component({
  selector: 'aas-eclass-multiple-property-generator',
  templateUrl: './eclass-multiple-property-generator.component.html',
  imports: [
    Button,
    Dialog,
    EClassLogoComponent,
    Skeleton,
    Steps,
    TreeTableModule,
    InputText,
    PrimeTemplate,
    Checkbox,
    FormsModule,
    Tag,
    Tree,
    NgClass,
    Popover,
    TableModule,
    TranslateModule,
  ],
})
export class EclassMultiplePropertyGeneratorComponent implements OnInit {
  @Input({ required: true }) submodelElementCollection: aas.types.SubmodelElementCollection | undefined | null;
  showCandidates: boolean = false;
  candidates: any[] = [];
  candidateNodes: TreeNode[] = [];
  createTechnicalProperties: string[] = [];
  loading: boolean = true;
  infoLoading: boolean = false;

  items: MenuItem[] | undefined;

  activeIndex: number = 0;
  tree: TreeNode<V3TreeItem<any>>[] = [];
  targetNode: TreeNode<V3TreeItem<any>> | TreeNode<V3TreeItem<any>>[] | null = null;
  eclassImported: boolean = false;
  invalidData: boolean = false;
  valuelist: string[] = [];
  definition: string = '';

  onActiveIndexChange(event: number) {
    this.activeIndex = event;
  }

  constructor(
    private eclassPropertyService: EClassPropertyService,
    private v3TreeService: V3TreeService,
    private translate: TranslateService,
  ) {}

  async ngOnInit() {
    this.items = [
      {
        label: this.translate.instant('SELECT_PROPERTIES'),
      },
      {
        label: this.translate.instant('SELECT_TARGET'),
      },
    ];
    this.loading = true;
    try {
      this.eclassImported = await this.eclassPropertyService.hasEclassImported();
    } finally {
      this.loading = false;
    }
  }

  async generateTechnicalPropertiesFromEclass() {
    this.tree = cloneDeep(this.v3TreeService.aasTreeData);

    // bestimmen, welche Knoten selektierbar sind
    this.setDisabledStatesForNodesRecursive(this.tree);
    // const classificationSystem = this.submodelElementCollection?.content?.value?.find(
    //   (v) =>
    //     v.semanticId?.keys?.some(
    //       (k) => k.value === 'https://admin-shell.io/ZVEI/TechnicalData/ProductClassificationSystem/1/1',
    //     ),
    // ) as aas.types.Property;
    const classificationSystemVersion = this.submodelElementCollection?.value?.find((v) =>
      v.semanticId?.keys?.some(
        (k) => k.value === 'https://admin-shell.io/ZVEI/TechnicalData/ClassificationSystemVersion/1/1',
      ),
    ) as aas.types.Property;
    const classificationClass = this.submodelElementCollection?.value?.find((v) =>
      v.semanticId?.keys?.some((k) => k.value === 'https://admin-shell.io/ZVEI/TechnicalData/ProductClassId/1/1'),
    ) as aas.types.Property;

    this.invalidData =
      classificationSystemVersion?.value == null ||
      classificationClass?.value == null ||
      classificationSystemVersion.value === '' ||
      classificationClass.value === '';

    this.candidates = [];
    if (!this.invalidData) {
      // mögliche Kandidaten abrufen
      const candidates = await this.eclassPropertyService.getEclassPropertyCandidates(
        classificationSystemVersion.value ?? '',
        classificationClass.value?.replaceAll('-', '') ?? '',
      );

      if (candidates.length > 0) {
        const rootNode = {} as TreeNode;
        rootNode.label = '';
        rootNode.children = candidates
          .filter((c) => c.aspectBlock === '')
          .map((c) => ({
            label: c.irdi,
            data: { ...c, displayName: this.getRowLabel(c) },
            key: c.orderNumber,
          }));

        this.candidateNodes = [rootNode];

        const groups = [...new Set(candidates.map((c) => c.aspectBlock))];
        groups.forEach((group) => {
          if (group !== '') {
            const groupNode = {} as TreeNode;
            groupNode.label = group;
            groupNode.children = candidates
              .filter((c) => c.aspectBlock === group)
              .map((c) => ({
                label: this.getRowLabel(c),
                data: { ...c, displayName: this.getRowLabel(c) },
                key: c.orderNumber,
              }));
            this.candidateNodes.push(groupNode);
          }
        });
      }

      this.candidates = candidates;
    }
    this.activeIndex = 0;
    this.targetNode = null;

    this.showCandidates = true;
  }

  setDisabledStatesForNodesRecursive(nodes: TreeNode[]) {
    nodes.forEach((node) => {
      if (
        node.data?.editorType === EditorTypeOption.SubmodelElementCollection ||
        node.data?.editorType === EditorTypeOption.Submodel
      ) {
        node.selectable = true;
      } else {
        node.selectable = false;
      }
      if (node.children != null) {
        this.setDisabledStatesForNodesRecursive(node.children);
      }
    });
  }

  async showInfo(irdi: string, op: Popover, event: any) {
    try {
      this.infoLoading = true;
      this.valuelist = [];
      op.toggle(event);
      this.valuelist = await this.eclassPropertyService.getValuelistInfo(irdi);
    } finally {
      this.infoLoading = false;
    }
  }

  async showDefinition(rowData: any, op: Popover, event: any) {
    this.definition = this.getRowDefinition(rowData);
    op.toggle(event);
  }

  getSourceSeverity(source: string) {
    switch (source) {
      case 'Advanced':
        return 'success';
      case 'Basic':
        return 'warn';
      case 'Asset':
        return 'info';
      default:
        return 'danger';
    }
  }

  async addTechnicalPropertiesToCollection() {
    if (this.targetNode == null) return;

    const createdProperties = await this.eclassPropertyService.addTechnicalPropertiesToCollection(
      this.createTechnicalProperties,
    );

    let targetId = '';
    if (this.targetNode instanceof Array) {
      targetId = this.targetNode[0].data?.id ?? '';
    } else {
      targetId = this.targetNode.data?.id ?? '';
    }
    createdProperties.forEach((prop: any) => {
      const instanceOrErrorPlain = aas.jsonization.submodelElementFromJsonable(JSON.parse(prop));
      if (instanceOrErrorPlain.value != null)
        ElementInserter.insertSubmodelElementByTargetId(targetId, this.v3TreeService, instanceOrErrorPlain.value);
    });

    this.showCandidates = false;
  }

  getNodeLabel(treeNode: TreeNode<V3TreeItem<any>>): string {
    let label = treeNode.data?.treeLabel ?? treeNode.label ?? '';
    if (treeNode.data?.content?.kind === aas.types.ModellingKind.Template) {
      label = '<T> ' + label;
    }
    return label;
  }

  getRowLabel(rowData: any) {
    const currentLanguage = this.translate.currentLang;
    const keys = Object.keys(rowData.preferredName);
    let searchKey = keys.find((k) => k.startsWith(currentLanguage));
    let foundLabel = '';
    if (searchKey != null) {
      foundLabel = rowData?.preferredName[searchKey];
    } else {
      searchKey = keys.find((k) => k.startsWith('en'));
      foundLabel = searchKey ? rowData?.preferredName[searchKey] : '';
    }
    if (foundLabel === '') {
      const firstKey = Object.keys(rowData?.preferredName)[0];
      foundLabel = rowData?.preferredName[firstKey] ?? '';
    }
    return foundLabel;
  }

  getRowDefinition(rowData: any) {
    const currentLanguage = this.translate.currentLang;
    const keys = Object.keys(rowData.definition);
    let searchKey = keys.find((k) => k.startsWith(currentLanguage));
    let foundLabel = '';
    if (searchKey != null) {
      foundLabel = rowData?.definition[searchKey];
    } else {
      searchKey = keys.find((k) => k.startsWith('en'));
      foundLabel = searchKey ? rowData?.definition[searchKey] : '';
    }
    if (foundLabel === '') {
      const firstKey = Object.keys(rowData?.definition)[0];
      foundLabel = rowData?.definition[firstKey] ?? '';
    }
    return foundLabel;
  }
}
