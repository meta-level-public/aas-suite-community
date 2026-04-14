import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { ISubmodelElement } from '@aas-core-works/aas-core3.1-typescript/types';
import { HelpLabelComponent } from '@aas/common-components';
import { AasConfirmationService } from '@aas/common-services';
import { FilenameHelper, HandoverSemantics, InstanceHelper, SemanticIdHelper } from '@aas/helpers';
import { ShellResult, SupplementalFile } from '@aas/model';
import { NgClass } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
import { DialogService } from 'primeng/dynamicdialog';
import { Fieldset } from 'primeng/fieldset';
import { FileSelectEvent } from 'primeng/fileupload';
import { Message } from 'primeng/message';
import { Select, SelectChangeEvent } from 'primeng/select';
import { v4 as uuid } from 'uuid';
import { AasSharedDataService } from '../../../asset-administration-shell-tree/services/aas-shared-data.service';
import { V3UndoDirective } from '../../../general/directives/v3-undo.directive';
import { Info } from '../../../general/model/info-item';
import {
  createDocumentationDocument,
  getDocumentationDocumentSemanticIdForHost,
  isDocumentationDocumentCollection,
} from '../../../generator/generator-documentation.builder';
import { DocumentItem } from '../../../generator/model/document-item';
import { HandoverdocumentationDocumentAddonComponent } from '../../addons/handoverdocumentation-document-addon/handoverdocumentation-document-addon.component';
import { EditorTypeOption } from '../../model/editor-type-option';
import { V3TreeItem } from '../../model/v3-tree-item';
import { V3TreeService } from '../../v3-tree/v3-tree.service';
import { EndpointUrlComponent } from '../endpoint-url/endpoint-url.component';
import { V3ComponentBase } from '../v3-component-base';
import { V3EmbeddedDataSpecificationComponent } from '../v3-embedded-data-specification/v3-embedded-data-specification.component';
import { V3IdShortComponent } from '../v3-id-short/v3-id-short.component';
import { V3LangStringListComponent } from '../v3-lang-string-list/v3-lang-string-list.component';
import { V3MarkingsEditorComponent } from '../v3-markings-editor/v3-markings-editor.component';
import { V3QualifiersComponent } from '../v3-qualifiers/v3-qualifiers.component';
import { V3SemanticDescriptionComponent } from '../v3-semantic-description/v3-semantic-description.component';

@Component({
  selector: 'aas-v3-submodel-element-list-editor',
  templateUrl: './v3-submodel-element-list-editor.component.html',
  styleUrls: ['./v3-submodel-element-list-editor.component.css'],
  imports: [
    Fieldset,
    HelpLabelComponent,
    V3IdShortComponent,
    Message,
    Button,
    V3LangStringListComponent,
    Checkbox,
    FormsModule,
    Select,
    V3UndoDirective,
    V3MarkingsEditorComponent,
    NgClass,
    V3SemanticDescriptionComponent,
    V3QualifiersComponent,
    V3EmbeddedDataSpecificationComponent,
    EndpointUrlComponent,
    TranslateModule,
  ],
})
export class V3SubmodelElementListEditorComponent extends V3ComponentBase implements OnChanges {
  @Input() submodelElementList: V3TreeItem<aas.types.SubmodelElementList> | undefined | null;
  @Input({ required: true }) shellResult: ShellResult | undefined;
  @Input({ required: true }) repositoryUrl: string = '';
  @Input({ required: true }) idShortPath: string = '';

  valueType: aas.types.AasSubmodelElements | undefined;
  dataType: aas.types.DataTypeDefXsd | undefined | null;

  previousElementType: aas.types.AasSubmodelElements | undefined;
  previousDataType: aas.types.DataTypeDefXsd | undefined | null;

  file: any;

  smlSubmodelElementTypes: { label: string; value: number }[];

  info = Info;
  AasSubmodelElements = aas.types.AasSubmodelElements;
  InstanceHelper = InstanceHelper;

  orderListValues: { id: string; element: ISubmodelElement }[] = [];

  handoverDocuments: HandoverDocumentListItem[] = [];

  constructor(
    public aasSharedDataService: AasSharedDataService,
    private treeService: V3TreeService,
    private sanitizer: DomSanitizer,
    private confirmService: AasConfirmationService,
    private translate: TranslateService,
    private dialogService: DialogService,
  ) {
    super();

    this.smlSubmodelElementTypes = [
      {
        label: aas.types.AasSubmodelElements[aas.types.AasSubmodelElements.Property],
        value: aas.types.AasSubmodelElements.Property,
      },
      {
        label: aas.types.AasSubmodelElements[aas.types.AasSubmodelElements.Range],
        value: aas.types.AasSubmodelElements.Range,
      },
      {
        label: aas.types.AasSubmodelElements[aas.types.AasSubmodelElements.File],
        value: aas.types.AasSubmodelElements.File,
      },
      {
        label: aas.types.AasSubmodelElements[aas.types.AasSubmodelElements.ReferenceElement],
        value: aas.types.AasSubmodelElements.ReferenceElement,
      },
      {
        label: aas.types.AasSubmodelElements[aas.types.AasSubmodelElements.SubmodelElementCollection],
        value: aas.types.AasSubmodelElements.SubmodelElementCollection,
      },
      {
        label: aas.types.AasSubmodelElements[aas.types.AasSubmodelElements.SubmodelElementList],
        value: aas.types.AasSubmodelElements.SubmodelElementList,
      },
      {
        label: aas.types.AasSubmodelElements[aas.types.AasSubmodelElements.RelationshipElement],
        value: aas.types.AasSubmodelElements.RelationshipElement,
      },
      {
        label: aas.types.AasSubmodelElements[aas.types.AasSubmodelElements.Operation],
        value: aas.types.AasSubmodelElements.Operation,
      },
      {
        label: aas.types.AasSubmodelElements[aas.types.AasSubmodelElements.Entity],
        value: aas.types.AasSubmodelElements.Entity,
      },
      {
        label: aas.types.AasSubmodelElements[aas.types.AasSubmodelElements.Blob],
        value: aas.types.AasSubmodelElements.Blob,
      },
      {
        label: aas.types.AasSubmodelElements[aas.types.AasSubmodelElements.Capability],
        value: aas.types.AasSubmodelElements.Capability,
      },
      {
        label: aas.types.AasSubmodelElements[aas.types.AasSubmodelElements.MultiLanguageProperty],
        value: aas.types.AasSubmodelElements.MultiLanguageProperty,
      },
    ];

    this.smlSubmodelElementTypes = this.smlSubmodelElementTypes.sort((a, b) => a.label.localeCompare(b.label));
  }

  ngOnChanges(_changes: SimpleChanges): void {
    this.dataType = this.submodelElementList?.content?.valueTypeListElement;
    this.valueType = this.submodelElementList?.content?.typeValueListElement;
    this.previousElementType = this.submodelElementList?.content?.typeValueListElement;
    this.previousDataType = this.submodelElementList?.content?.valueTypeListElement;
    this.createOrderlist();
    this.refreshHandoverDocuments();
  }

  createOrderlist() {
    if (this.submodelElementList?.content?.value != null) {
      this.orderListValues = [];
      this.submodelElementList.content.value.forEach((element) => {
        this.orderListValues.push({ id: uuid(), element: element });
      });
    }
  }

  refreshHandoverDocuments() {
    this.handoverDocuments = this.getHandoverDocumentCollections().map((element, index) => {
      const documentItem = DocumentItem.fromHandoverSubmodelElement(element, this.translate.currentLang || 'en');
      const primaryVersion = documentItem.documentVersion?.[0];
      const label =
        primaryVersion?.title?.trim() || element.idShort || `${this.translate.instant('DOCUMENTS')} ${index + 1}`;
      const secondaryLabel = documentItem.vdi2770FileFileName || primaryVersion?.documentVersionId || '';

      return {
        id: `${element.idShort ?? 'document'}-${index}`,
        label,
        secondaryLabel,
        idShort: element.idShort ?? '',
      };
    });
  }

  get isHandoverDocumentList() {
    const submodel = this.getSubmodelContent();

    return (
      this.submodelElementList?.parent?.editorType === EditorTypeOption.Submodel &&
      SemanticIdHelper.hasSemanticId(this.submodelElementList?.content, HandoverSemantics.CONTAINER_V2) &&
      submodel != null &&
      SemanticIdHelper.hasSemanticId(submodel, '0173-1#01-AHF578#003')
    );
  }

  get hasHandoverDocuments() {
    return this.handoverDocuments.length > 0;
  }

  get canAddHandoverDocument() {
    return (
      this.submodelElementList?.content?.typeValueListElement == null ||
      this.submodelElementList.content.typeValueListElement === aas.types.AasSubmodelElements.SubmodelElementCollection
    );
  }

  addHandoverDocument() {
    if (this.submodelElementList?.content == null) {
      return;
    }

    const currentDocuments = this.getHandoverDocumentCollections();
    const ref = this.dialogService.open(HandoverdocumentationDocumentAddonComponent, {
      width: '75%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: true,
      header: this.translate.instant('ADD_DOCUMENT'),
      closable: true,
      modal: true,
      data: { count: currentDocuments.length },
    });

    if (ref == null) {
      return;
    }

    ref.onClose.subscribe((documentItem: DocumentItem | null) => {
      if (documentItem == null || this.submodelElementList?.content == null) {
        return;
      }

      this.submodelElementList.content.typeValueListElement = aas.types.AasSubmodelElements.SubmodelElementCollection;
      if (this.submodelElementList.content.value == null) {
        this.submodelElementList.content.value = [];
      }

      const requiredSemanticIds: string[] = [];
      const documentElement = createDocumentationDocument(
        currentDocuments.length,
        requiredSemanticIds,
        documentItem,
        this.translate.currentLang || 'en',
        getDocumentationDocumentSemanticIdForHost(this.submodelElementList.content),
      );

      this.submodelElementList.content.value.push(documentElement);
      this.addSupplementalFile(documentItem);
      this.createOrderlist();
      this.refreshHandoverDocuments();
      this.treeService.refreshSml();
    });
  }

  private addSupplementalFile(documentItem: DocumentItem) {
    if (documentItem.file == null) {
      return;
    }

    const sanitizedFilename = FilenameHelper.sanitizeFilename(documentItem.file.name ?? 'newFile');
    const newSupplFile: SupplementalFile = {
      path: sanitizedFilename,
      filename: sanitizedFilename,
      fileApiUrl: '',
      fileUrl: null,
      fileResourceUrl: URL.createObjectURL(documentItem.file),
      contentType: FilenameHelper.getContentType(documentItem.file),
      file: documentItem.file,
      isLoaded: true,
      isLoading: false,
      isLocal: true,
      fileData: documentItem.file,
      id: null,
      isThumbnail: false,
    };

    this.shellResult?.supplementalFiles.push(newSupplFile);
    this.shellResult?.addedFiles.push(newSupplFile);
    this.treeService.addFileNode(newSupplFile);
  }

  private getHandoverDocumentCollections() {
    return (this.submodelElementList?.content?.value ?? []).filter(
      (element): element is aas.types.SubmodelElementCollection => isDocumentationDocumentCollection(element),
    );
  }

  async onElementtypeChange(_event: SelectChangeEvent) {
    if (this.submodelElementList?.content != null && this.valueType != null) {
      if (this.submodelElementList.content.value != null && this.submodelElementList.content.value.length > 0) {
        if (await this.confirmService.confirm({ message: this.translate.instant('CHANGE_ELEMENT_TYPE_REMOVE_Q') })) {
          this.submodelElementList.content.typeValueListElement = this.valueType;
          this.submodelElementList.content.value = null;
          this.treeService.refreshSml();
        } else {
          if (this.previousElementType != null) this.valueType = this.previousElementType;
        }
      } else {
        this.submodelElementList.content.typeValueListElement = this.valueType;
      }
    }
    this.createOrderlist();
  }

  async onDatatypeChange(_event: SelectChangeEvent) {
    if (this.submodelElementList?.content != null && this.dataType != null) {
      if (this.submodelElementList.content.value != null && this.submodelElementList.content.value.length > 0) {
        if (await this.confirmService.confirm({ message: this.translate.instant('CHANGE_DATA_TYPE_Q') })) {
          this.submodelElementList.content.valueTypeListElement = this.dataType;

          this.submodelElementList.content.value.forEach((element) => {
            (element as any).valueType = this.dataType;
          });
          this.treeService.refreshSml();
        } else {
          this.dataType = this.previousDataType;
        }
      } else {
        this.submodelElementList.content.valueTypeListElement = this.dataType;
      }
    }
    this.createOrderlist();
  }

  onReorder() {
    this.treeService.refreshSml();
  }

  addElement() {
    if (this.submodelElementList?.content != null) {
      if (this.submodelElementList.content.value == null) this.submodelElementList.content.value = [];

      const valueType = this.submodelElementList.content.valueTypeListElement ?? aas.types.DataTypeDefXsd.String;

      switch (this.submodelElementList?.content?.typeValueListElement) {
        case aas.types.AasSubmodelElements.Property:
          this.submodelElementList.content.value.push(new aas.types.Property(valueType));
          break;

        case aas.types.AasSubmodelElements.Range:
          this.submodelElementList.content.value.push(new aas.types.Range(valueType));
          break;

        case aas.types.AasSubmodelElements.File:
          {
            const prop = new aas.types.File();
            prop.contentType = 'application/octet-stream';
            this.submodelElementList.content.value.push(prop);
          }
          break;

        case aas.types.AasSubmodelElements.ReferenceElement:
          this.submodelElementList.content.value.push(new aas.types.ReferenceElement());
          break;

        case aas.types.AasSubmodelElements.SubmodelElementCollection:
          this.submodelElementList.content.value.push(new aas.types.SubmodelElementCollection());
          break;

        case aas.types.AasSubmodelElements.SubmodelElementList:
          this.submodelElementList.content.value.push(
            new aas.types.SubmodelElementList(aas.types.AasSubmodelElements.Property),
          );
          break;

        case aas.types.AasSubmodelElements.RelationshipElement:
          {
            const prop = new aas.types.RelationshipElement();
            prop.first = new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, []);
            prop.second = new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, []);
            this.submodelElementList.content.value.push(prop);
          }
          break;
        case aas.types.AasSubmodelElements.Operation:
          this.submodelElementList.content.value.push(new aas.types.Operation());
          break;
        case aas.types.AasSubmodelElements.Entity:
          {
            const prop = new aas.types.Entity();
            prop.entityType = aas.types.EntityType.SelfManagedEntity;
            this.submodelElementList.content.value.push(prop);
          }
          break;
        case aas.types.AasSubmodelElements.Blob:
          {
            const prop = new aas.types.Blob();
            prop.contentType = 'application/octet-stream';
            this.submodelElementList.content.value.push(prop);
          }
          break;
        case aas.types.AasSubmodelElements.Capability:
          this.submodelElementList.content.value.push(new aas.types.Capability());
          break;
        case aas.types.AasSubmodelElements.MultiLanguageProperty:
          this.submodelElementList.content.value.push(new aas.types.MultiLanguageProperty());
          break;
      }
    }

    this.createOrderlist();
    this.treeService.refreshSml();
  }

  hasValueError(row: aas.types.Property) {
    const errors = [];
    for (const error of aas.verification.verify(row)) {
      errors.push(error);
    }
    return errors.length > 0;
  }

  getValueError(row: aas.types.Property) {
    const errors = [];
    for (const error of aas.verification.verify(row)) {
      errors.push(error);
    }
    return errors;
  }

  removeElement(element: ISubmodelElement) {
    if (this.submodelElementList?.content?.value != null) {
      this.submodelElementList.content.value = this.submodelElementList.content.value?.filter((e) => e !== element);
      if (this.submodelElementList.content.value.length === 0) this.submodelElementList.content.value = null;
    }
    this.createOrderlist();
    this.refreshHandoverDocuments();
    this.treeService.refreshSml();
  }

  onSelect(event: FileSelectEvent) {
    // prüfen ob es eine bestehende ist!
    const oldFilename = this.file?.content?.value ?? 'no_file_set';
    if (this.shellResult?.v3Shell != null) {
      const supplementalFile = this.shellResult?.supplementalFiles.find(
        (f) => f.path === FilenameHelper.replaceFileUri(this.file?.value),
      );

      let newFileName = event.files[0].name;
      let newFilePath = `file:/aasx/files/${FilenameHelper.sanitizeFilename(newFileName)}`;
      const existing = this.shellResult?.supplementalFiles.filter(
        (f) => f.path === FilenameHelper.replaceFileUri(newFilePath),
      );
      if (existing != null && existing.length !== 0) {
        newFileName = `${FilenameHelper.getNameWithoutExt(newFileName)}${existing.length}${FilenameHelper.getExtension(
          newFileName,
        )}`;
        newFilePath = `file:/aasx/files/${FilenameHelper.sanitizeFilename(newFileName)}`;
      }

      this.file.value = newFilePath;
      this.file.contentType = event.files[0].type;

      const isReferenced =
        this.file.value == null ? false : FilenameHelper.isReferenced(oldFilename, this.shellResult.v3Shell);

      if (supplementalFile) {
        if (!supplementalFile.isLocal && !isReferenced) {
          this.shellResult?.deletedFiles.push(supplementalFile);
        } else {
          this.shellResult?.addedFiles.splice(this.shellResult.addedFiles.indexOf(supplementalFile), 1);
        }
        if (!isReferenced) {
          this.treeService.deleteFileNode(supplementalFile);
        }
      }

      const supplFile: SupplementalFile = {
        path: FilenameHelper.replaceFileUri(newFilePath) ?? '',
        filename: FilenameHelper.sanitizeFilename(newFileName),
        fileApiUrl: '',
        contentType: this.file.contentType,
        file: event.files[0],
        isLoaded: true,
        isLoading: false,
        isLocal: true,
        fileUrl: this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(event.files[0])),
        fileData: null,
        id: null,
        isThumbnail: false,
      };
      this.shellResult?.supplementalFiles.push(supplFile);

      this.shellResult?.addedFiles.push(supplFile);
      this.treeService.addFileNode(supplFile);
    }
  }

  get hasSemanticErrors() {
    const errors = [];
    if (this.submodelElementList?.content?.semanticId != null) {
      for (const error of aas.verification.verify(this.submodelElementList.content.semanticId, false)) {
        errors.push(error);
      }
    }
    return errors.length > 0;
  }

  get isMarkings() {
    return (
      this.submodelElementList?.content?.idShort === 'Markings' ||
      SemanticIdHelper.hasSemanticId(this.submodelElementList?.content, '0173-1#01-AGZ673#001') ||
      SemanticIdHelper.hasSemanticId(this.submodelElementList?.content, '0112/2///61360_7#AAS006#001')
    );
  }

  getSubmodelId() {
    if (this.submodelElementList != null) {
      return this.getSubmodelIdRecursive(this.submodelElementList);
    } else {
      return '';
    }
  }

  getSubmodelIdRecursive(element: V3TreeItem<any>): string {
    if (element.editorType === EditorTypeOption.Submodel) {
      return element.content.id;
    } else if (element.parent != null) {
      return this.getSubmodelIdRecursive(element.parent);
    } else {
      return '';
    }
  }

  private getSubmodelContent(): aas.types.Submodel | null {
    if (this.submodelElementList == null) {
      return null;
    }

    return this.getSubmodelContentRecursive(this.submodelElementList);
  }

  private getSubmodelContentRecursive(element: V3TreeItem<any>): aas.types.Submodel | null {
    if (element.editorType === EditorTypeOption.Submodel) {
      return element.content as aas.types.Submodel;
    }

    return element.parent != null ? this.getSubmodelContentRecursive(element.parent) : null;
  }
}

interface HandoverDocumentListItem {
  id: string;
  label: string;
  secondaryLabel: string;
  idShort: string;
}
