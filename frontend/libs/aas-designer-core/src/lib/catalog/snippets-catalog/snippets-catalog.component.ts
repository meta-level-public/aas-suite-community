import { Snippet } from '@aas-designer-model';
import { DateProxyPipe } from '@aas/common-pipes';
import { PortalService } from '@aas/common-services';
import { AasMetamodelVersion } from '@aas/model';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { cloneDeep, uniq } from 'lodash-es';
import { ConfirmationService, MenuItem, TreeNode } from 'primeng/api';
import { SnippetCatalogService } from '../service/snippet-catalog.service';

import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { ConfirmDialogComponent } from '@aas/aas-designer-shared';
import { NotificationService } from '@aas/common-services';
import { InstanceHelper } from '@aas/helpers';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { MenuModule } from 'primeng/menu';
import { MultiSelectModule } from 'primeng/multiselect';
import { PopoverModule } from 'primeng/popover';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { TreeTableModule } from 'primeng/treetable';

@Component({
  selector: 'aas-snippets-catalog',
  templateUrl: './snippets-catalog.component.html',
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    ButtonModule,
    TableModule,
    DialogModule,
    TagModule,
    TreeTableModule,
    PopoverModule,
    MenuModule,
    MultiSelectModule,
    SelectModule,
    ToolbarModule,
    ConfirmDialogComponent,
    DateProxyPipe,
  ],
  providers: [ConfirmationService],
  styleUrls: ['../../../host.scss'],
})
export class SnippetsCatalogComponent implements OnInit {
  @Input() insertEnabled: boolean = false;
  uuid: string = '';
  parentElement: any;
  elementType: string = '';
  @Input() emptyText: string = 'NO_SNIPPET_HAS_BEEN_ADDED_YET';

  loading = false;

  snippetData: Snippet[] = [];

  modelTypes: string[] = [];

  menuItems: MenuItem[] = [];

  displaySnippetModal = false;

  snippedDialogEntry: TreeNode[] = [];
  InstanceHelper = InstanceHelper;

  @Output() insertSnippet = new EventEmitter<{
    snippetId: number;
    uuid: string;
    elementType: string;
    parentElement: any;
    data?: string;
  }>();
  selectedSnippet: Snippet | null = null;
  version: AasMetamodelVersion = AasMetamodelVersion.ALL;

  constructor(
    private snippetCatalogService: SnippetCatalogService,
    private translate: TranslateService,
    private confirmationService: ConfirmationService,
    private notificationService: NotificationService,
    private portalService: PortalService,
  ) {}

  async ngOnInit() {
    await this.getAllSnippets(this.version);
  }

  viewSnippet(snippet: Snippet) {
    this.snippedDialogEntry = [];
    switch (snippet.version) {
      case AasMetamodelVersion.V2:
        if (snippet.template.smList != null && snippet.template.smList.length > 0) {
          snippet.template.smList.forEach((sm: any) => {
            this.snippedDialogEntry.push(this.getTreeNode(sm));
          });
        } else {
          this.snippedDialogEntry.push(this.getTreeNode(this.getSnippetElement(snippet)));
        }
        break;
      case AasMetamodelVersion.V3:
        this.createV3Tree(snippet.template, snippet.typ);
        break;
      default:
        throw new Error('Unknown AAS metamodel version');
    }

    this.displaySnippetModal = true;
    this.selectedSnippet = snippet;
  }

  getSnippetElement(snippet: Snippet): any {
    if (snippet.template?.element) {
      return cloneDeep(snippet.template?.element);
    } else {
      return cloneDeep(snippet.template);
    }
  }

  getTreeNode(submodel: any) {
    const documentNode = {} as TreeNode;
    documentNode.children = [];

    documentNode.data = { label: submodel.idShort || '', value: submodel };

    if (submodel.submodels != null && submodel.submodels.length > 0) {
      submodel.submodels.forEach((s: any) => {
        documentNode.children?.push(this.getTreeNode(s));
      });
    }

    if (submodel.submodelElements != null && submodel.submodelElements.length > 0) {
      submodel.submodelElements.forEach((s: any) => {
        documentNode.children?.push(this.getTreeNode(s));
      });
    }

    if (submodel?.modelType?.name === 'SubmodelElementCollection') {
      submodel.value?.forEach((s: any) => {
        documentNode.children?.push(this.getTreeNode(s));
      });
    }

    if (submodel?.modelType?.name === 'MultiLanguageProperty') {
      submodel.value?.forEach((s: any) => {
        documentNode.children?.push(this.getTreeNode(s));
      });
    }

    return documentNode;
  }

  async getAllSnippets(version: AasMetamodelVersion, elementTypes?: string[]) {
    this.version = version;
    try {
      this.loading = true;
      this.snippetData = await this.snippetCatalogService.getAllSnippets(version);
      // filtern, falls elementtypen übergeben wurden:
      if (elementTypes != null && elementTypes.length > 0) {
        this.snippetData = this.snippetData.filter((s) => elementTypes.includes(s.typ));
      }
      this.modelTypes = uniq(this.snippetData.map((value) => value.typ));
    } finally {
      this.loading = false;
    }
  }

  async deleteSnippet(snippet: Snippet) {
    try {
      if (snippet.id !== undefined) {
        let result = '';
        try {
          this.loading = true;
          result = await this.snippetCatalogService.deleteSnippet(snippet.id.toString());
        } finally {
          if (result !== '') {
            this.notificationService.showMessageAlways(
              'SNIPPET_HAS_BEEN_DELETED_SUCCESSFULLY',
              'SUCCESS',
              'success',
              false,
            );
          } else {
            this.notificationService.showMessageAlways('SNIPPET_COULD_NOT_BE_DELETED', 'ERROR', 'error', false);
          }
          this.loading = false;
        }
      }
    } finally {
      this.reload();
    }
  }

  onShowActions(snippet: Snippet) {
    this.menuItems = [
      {
        label: this.translate.instant('INSERT'),
        icon: 'pi pi-sign-in',
        command: () => {
          this.insertSnippet.emit({
            snippetId: snippet.id,
            uuid: this.uuid,
            elementType: snippet.typ,
            parentElement: this.parentElement,
            data: snippet.template,
          });
        },
        visible: this.insertEnabled,
      },
      {
        label: this.translate.instant('VIEW'),
        icon: 'pi pi-search',
        command: () => {
          this.viewSnippet(snippet);
        },
      },
      {
        label: this.translate.instant('SHARE'),
        icon: 'pi pi-share-alt',
        command: (_event) => {
          this.confirmationService.confirm({
            message: `${this.translate.instant('SHARE_SNIPPET_Q')} <b>${snippet.name}</b>`,
            accept: () => {
              this.share(snippet);
            },
          });
        },
        visible: snippet.freigabeLevel !== 'ORGANISATION' && snippet.besitzerId === this.portalService.user?.id,
      },
      {
        label: this.translate.instant('UNSHARE'),
        icon: 'fa-solid fa-lock',
        command: (_event) => {
          this.confirmationService.confirm({
            message: `${this.translate.instant('UNSHARE_SNIPPET_Q')} <b>${snippet.name}</b>`,
            accept: () => {
              this.unshare(snippet);
            },
          });
        },
        visible: snippet.freigabeLevel !== 'PRIVATE' && snippet.besitzerId === this.portalService.user?.id,
      },
      {
        label: this.translate.instant('DELETE'),
        icon: 'pi pi-trash',
        command: () => {
          this.confirmationService.confirm({
            message: `${this.translate.instant('THE_FOLLOWING_CONTENT_WILL_BE_DELETED', { content: snippet.name })}`,
            accept: () => {
              this.deleteSnippet(snippet);
            },
          });
        },
        visible: snippet.besitzerId === this.portalService.user?.id,
      },
    ];
  }

  private reload() {
    this.snippetData = [];
    this.snippedDialogEntry = [];
    this.displaySnippetModal = false;
    this.getAllSnippets(this.version);
  }

  async unshare(snippet: Snippet) {
    try {
      this.loading = true;
      const res = await this.snippetCatalogService.unshare(snippet.id);
      if (res) {
        this.reload();
      }
    } finally {
      this.loading = false;
    }
  }
  async share(snippet: Snippet) {
    try {
      this.loading = true;
      const res = await this.snippetCatalogService.share(snippet.id);
      if (res) {
        this.reload();
      }
    } finally {
      this.loading = false;
    }
  }

  getValue(nodeData: any) {
    if (nodeData?.value?.modelType?.name === 'Property') {
      return nodeData.value.value !== '' ? nodeData.value.value : this.translate.instant('VALUE_UNSET');
    }
    if (nodeData?.value?.modelType?.name === 'MultiLanguageProperty') {
      if (
        Object.prototype.hasOwnProperty.call(nodeData?.value, 'language') &&
        Object.prototype.hasOwnProperty.call(nodeData?.value, 'text')
      ) {
        return `(${nodeData.value.language})  ${nodeData.value.text}`;
      } else return this.translate.instant('VALUE_UNSET');
    }
    if (InstanceHelper.getInstanceName(nodeData) === 'Property') {
      return nodeData.value ?? '';
    }
    if (InstanceHelper.getInstanceName(nodeData) === 'Range') {
      return (nodeData.min ?? '') + ' - ' + (nodeData.max ?? '');
    }
    if (InstanceHelper.getInstanceName(nodeData) === 'MultiLanguageProperty') {
      let res = '';
      nodeData.value?.forEach((element: any) => {
        res += `${element.text} @ ${element.language}\n`;
      });
      return res;
    }
    return '';
  }

  getLabel(nodeData: any) {
    return nodeData.value?.idShort ?? '';
  }

  getTagSeverity(type: 'PRIVATE' | 'ORGANISATION') {
    if (type === 'PRIVATE') {
      return 'success';
    } else {
      return 'info';
    }
  }

  createV3Tree(template: string, templateType: string) {
    switch (templateType) {
      case 'Submodel':
        {
          const instanceOrErrorPlain = aas.jsonization.submodelFromJsonable(JSON.parse(template));
          if (instanceOrErrorPlain.value != null) {
            const rootNode = {} as TreeNode<any>;
            rootNode.label = instanceOrErrorPlain.value.idShort ?? instanceOrErrorPlain.value.id;
            rootNode.data = {
              content: instanceOrErrorPlain.value,
              label: instanceOrErrorPlain.value.idShort ?? instanceOrErrorPlain.value.id,
            };
            rootNode.children = this.buildSubmodelChildren(instanceOrErrorPlain.value.submodelElements, rootNode);
            this.snippedDialogEntry = [rootNode];
          }
        }
        break;
      case 'AssetAdministrationShell':
        {
          const instanceOrErrorPlain = aas.jsonization.assetAdministrationShellFromJsonable(JSON.parse(template));
          if (instanceOrErrorPlain.value != null) {
            const rootNode = {} as TreeNode<any>;
            rootNode.label = instanceOrErrorPlain.value.idShort ?? instanceOrErrorPlain.value.id;
            rootNode.data = {
              content: instanceOrErrorPlain.value,
              label: instanceOrErrorPlain.value.idShort ?? instanceOrErrorPlain.value.id,
            };
            rootNode.children = this.buildSubmodelChildren(instanceOrErrorPlain.value.submodels, rootNode);
            this.snippedDialogEntry = [rootNode];
          }
        }
        break;

      case 'Property':
        {
          const instanceOrErrorPlain = aas.jsonization.propertyFromJsonable(JSON.parse(template));
          if (instanceOrErrorPlain.value != null) {
            const rootNode = {} as TreeNode<any>;
            rootNode.label = instanceOrErrorPlain.value.idShort ?? '';
            rootNode.data = {
              content: instanceOrErrorPlain.value,
              label: instanceOrErrorPlain.value.idShort ?? '',
            };
            this.snippedDialogEntry = [rootNode];
          }
        }
        break;
      case 'Range':
        {
          const instanceOrErrorPlain = aas.jsonization.rangeFromJsonable(JSON.parse(template));
          if (instanceOrErrorPlain.value != null) {
            const rootNode = {} as TreeNode<any>;
            rootNode.label = instanceOrErrorPlain.value.idShort ?? '';
            rootNode.data = {
              content: instanceOrErrorPlain.value,
              label: instanceOrErrorPlain.value.idShort ?? '',
            };
            this.snippedDialogEntry = [rootNode];
          }
        }
        break;
      case 'File':
        {
          const instanceOrErrorPlain = aas.jsonization.fileFromJsonable(JSON.parse(template));
          if (instanceOrErrorPlain.value != null) {
            const rootNode = {} as TreeNode<any>;
            rootNode.label = instanceOrErrorPlain.value.idShort ?? '';
            rootNode.data = {
              content: instanceOrErrorPlain.value,
              label: instanceOrErrorPlain.value.idShort ?? '',
            };
            this.snippedDialogEntry = [rootNode];
          }
        }
        break;
      case 'MultiLanguageProperty':
        {
          const instanceOrErrorPlain = aas.jsonization.multiLanguagePropertyFromJsonable(JSON.parse(template));
          if (instanceOrErrorPlain.value != null) {
            const rootNode = {} as TreeNode<any>;
            rootNode.label = instanceOrErrorPlain.value.idShort ?? '';
            rootNode.data = {
              content: instanceOrErrorPlain.value,
              label: instanceOrErrorPlain.value.idShort ?? '',
            };
            this.snippedDialogEntry = [rootNode];
          }
        }
        break;
      case 'Operation':
        {
          const instanceOrErrorPlain = aas.jsonization.operationFromJsonable(JSON.parse(template));
          if (instanceOrErrorPlain.value != null) {
            const rootNode = {} as TreeNode<any>;
            rootNode.label = instanceOrErrorPlain.value.idShort ?? '';
            rootNode.data = {
              content: instanceOrErrorPlain.value,
              label: instanceOrErrorPlain.value.idShort ?? '',
            };
            this.snippedDialogEntry = [rootNode];
          }
        }
        break;
      case 'Reference':
        {
          const instanceOrErrorPlain = aas.jsonization.referenceElementFromJsonable(JSON.parse(template));
          if (instanceOrErrorPlain.value != null) {
            const rootNode = {} as TreeNode<any>;
            rootNode.label = instanceOrErrorPlain.value.idShort ?? '';
            rootNode.data = {
              content: instanceOrErrorPlain.value,
              label: instanceOrErrorPlain.value.idShort ?? '',
            };
            this.snippedDialogEntry = [rootNode];
          }
        }
        break;
      case 'SubmodelElementCollection':
        {
          const instanceOrErrorPlain = aas.jsonization.submodelElementCollectionFromJsonable(JSON.parse(template));
          if (instanceOrErrorPlain.value != null) {
            const rootNode = {} as TreeNode<any>;
            rootNode.label = instanceOrErrorPlain.value.idShort ?? '';
            rootNode.data = {
              content: instanceOrErrorPlain.value,
              label: instanceOrErrorPlain.value.idShort ?? '',
            };
            rootNode.children = this.buildSubmodelChildren(instanceOrErrorPlain.value.value, rootNode);

            this.snippedDialogEntry = [rootNode];
          }
        }
        break;
      case 'SubmodelElementList':
        {
          const instanceOrErrorPlain = aas.jsonization.submodelElementListFromJsonable(JSON.parse(template));
          if (instanceOrErrorPlain.value != null) {
            const rootNode = {} as TreeNode<any>;
            rootNode.label = instanceOrErrorPlain.value.idShort ?? '';
            rootNode.data = {
              content: instanceOrErrorPlain.value,
              label: instanceOrErrorPlain.value.idShort ?? '',
            };
            rootNode.children = this.buildSubmodelChildren(instanceOrErrorPlain.value.value, rootNode);

            this.snippedDialogEntry = [rootNode];
          }
        }
        break;
      case 'ConceptDescription':
        {
          const instanceOrErrorPlain = aas.jsonization.conceptDescriptionFromJsonable(JSON.parse(template));
          if (instanceOrErrorPlain.value != null) {
            const rootNode = {} as TreeNode<any>;
            rootNode.label = instanceOrErrorPlain.value.idShort ?? '';
            rootNode.data = {
              content: instanceOrErrorPlain.value,
              label: instanceOrErrorPlain.value.idShort ?? '',
            };

            this.snippedDialogEntry = [rootNode];
          }
        }
        break;
      default:
        throw new Error('Unknown template type ' + templateType);
    }
  }

  buildSubmodelChildren(parentData: any, parentNode: TreeNode<any>) {
    const children: TreeNode<any>[] = [];

    parentData.forEach((element: any) => {
      let collectChildren: TreeNode<any>[] = [];
      //Aufbau der Grundstruktur
      const el: TreeNode<any> = {
        label: element.id ?? element.idShort,
        expanded: false,
        children: [],
        parent: parentNode,
        data: { content: element, label: element.id ?? element.idShort },
      };

      // Auf einzelne Typen prüfen und entsprechend die Kindelemente "sammeln".
      if (element instanceof aas.types.Submodel) {
        collectChildren = this.buildSubmodelChildren(element?.submodelElements, el);
      }

      if (element instanceof aas.types.SubmodelElementCollection) {
        if (element.value != null) collectChildren = this.buildSubmodelChildren(element.value, el);
      }

      if (element instanceof aas.types.SubmodelElementList) {
        if (element.value != null) collectChildren = this.buildSubmodelChildren(element.value, el);
      }

      if (element instanceof aas.types.Entity) {
        collectChildren = this.buildSubmodelChildren(element.statements, el);
      }

      // Kind-Elemente zuweisen
      el.children = collectChildren;
      children.push(el);
    });

    return children;
  }
}
