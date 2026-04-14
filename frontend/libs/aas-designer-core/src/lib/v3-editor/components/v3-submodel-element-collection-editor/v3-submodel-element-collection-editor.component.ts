import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { HelpLabelComponent } from '@aas/common-components';
import { InstanceHelper, SemanticIdHelper } from '@aas/helpers';
import { ShellResult } from '@aas/model';
import { NgClass } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { PrimeTemplate } from 'primeng/api';
import { Fieldset } from 'primeng/fieldset';
import { TableModule } from 'primeng/table';
import { Info } from '../../../general/model/info-item';
import { AddressSelectionComponent } from '../../../general/structural-elements/address-selection/address-selection.component';
import { EditorTypeOption } from '../../model/editor-type-option';
import { V3TreeItem } from '../../model/v3-tree-item';
import { EndpointUrlComponent } from '../endpoint-url/endpoint-url.component';
import { V3CategoryComponent } from '../v3-category/v3-category.component';
import { V3ComponentBase } from '../v3-component-base';
import { V3EmbeddedDataSpecificationComponent } from '../v3-embedded-data-specification/v3-embedded-data-specification.component';
import { V3IdShortComponent } from '../v3-id-short/v3-id-short.component';
import { V3LangStringListComponent } from '../v3-lang-string-list/v3-lang-string-list.component';
import { V3MarkingsEditorComponent } from '../v3-markings-editor/v3-markings-editor.component';
import { V3MlpCurrentEditorComponent } from '../v3-mlp-current-editor/v3-mlp-current-editor.component';
import { V3NestedSubmodelElementCollectionComponent } from '../v3-nested-submodel-element-collection/v3-nested-submodel-element-collection.component';
import { ClassIdComponent } from '../v3-property-editor/class-id/class-id.component';
import { ClassificationSystemComponent } from '../v3-property-editor/classification-system/classification-system.component';
import { V3QualifiersComponent } from '../v3-qualifiers/v3-qualifiers.component';
import { V3SemanticDescriptionComponent } from '../v3-semantic-description/v3-semantic-description.component';

@Component({
  selector: 'aas-v3-submodel-element-collection-editor',
  templateUrl: './v3-submodel-element-collection-editor.component.html',
  styleUrls: ['./v3-submodel-element-collection-editor.component.css'],
  imports: [
    Fieldset,
    HelpLabelComponent,
    V3IdShortComponent,
    V3LangStringListComponent,
    V3CategoryComponent,
    V3MarkingsEditorComponent,
    AddressSelectionComponent,
    V3NestedSubmodelElementCollectionComponent,
    TableModule,
    PrimeTemplate,
    ClassificationSystemComponent,
    ClassIdComponent,
    V3MlpCurrentEditorComponent,
    NgClass,
    V3SemanticDescriptionComponent,
    V3QualifiersComponent,
    V3EmbeddedDataSpecificationComponent,
    EndpointUrlComponent,
    TranslateModule,
  ],
})
export class V3SubmodelElementCollectionEditorComponent extends V3ComponentBase implements OnChanges {
  @Input({ required: true }) submodelElementCollection:
    | V3TreeItem<aas.types.SubmodelElementCollection>
    | undefined
    | null;
  @Input({ required: true }) shellResult: ShellResult | undefined;
  @Input({ required: true }) repositoryUrl: string = '';
  @Input({ required: true }) idShortPath: string = '';

  info = Info;
  InstanceHelper = InstanceHelper;
  embeddedDataSpecCollapsed: boolean = true;
  @ViewChild('nestedSmc') nestedSmc: any;

  ngOnChanges(_changes: SimpleChanges): void {
    this.embeddedDataSpecCollapsed = !this.hasDataSpecErrors;
  }

  get hasDataSpecErrors() {
    const errors = [];
    this.submodelElementCollection?.content?.embeddedDataSpecifications?.forEach((spec) => {
      for (const error of aas.verification.verify(spec)) {
        errors.push(error);
      }
    });
    if (this.submodelElementCollection?.content) {
      for (const error of aas.verification.verify(this.submodelElementCollection.content, false)) {
        if (error.message === 'Embedded data specifications must be either not set or have at least one item.')
          errors.push(error);
      }
    }

    return errors.length > 0;
  }

  get isMarkings() {
    return (
      this.submodelElementCollection?.content?.idShort === 'Markings' ||
      SemanticIdHelper.hasSemanticId(this.submodelElementCollection?.content, '0173-1#01-AGZ673#001') ||
      SemanticIdHelper.hasSemanticId(this.submodelElementCollection?.content, '0112/2///61360_7#AAS006#001')
    );
  }

  get isAddress() {
    return this.submodelElementCollection?.content?.idShort?.startsWith('ContactInformation');
  }

  get isDocumentClassification() {
    const isDocClass = this.submodelElementCollection?.content?.semanticId?.keys?.some(
      (k) =>
        k.value.startsWith('0173-1#02-ABI502#003/0173-1#01-AHF581') ||
        k.value.startsWith('0173-1#02-ABI502#001/0173-1#01-AHF581'),
    );
    return isDocClass;
  }

  get classIdElement() {
    const classIdElement = this.submodelElementCollection?.content?.value?.find((v) =>
      v.semanticId?.keys?.some((k) => k.value.startsWith('0173-1#02-ABH996')),
    );
    return classIdElement != null ? (classIdElement as aas.types.Property) : null;
  }

  get classNameElement() {
    const classNameElement = this.submodelElementCollection?.content?.value?.find((v) =>
      v.semanticId?.keys?.some((k) => k.value.startsWith('0173-1#02-AAO102') || k.value.startsWith('0173-1#02-ABJ219')),
    );
    return classNameElement != null ? (classNameElement as aas.types.MultiLanguageProperty) : null;
  }

  get classificationSystemElement() {
    const classificationSystemElement = this.submodelElementCollection?.content?.value?.find((v) =>
      v.semanticId?.keys?.some((k) => k.value.startsWith('0173-1#02-ABH997')),
    );
    return classificationSystemElement != null ? (classificationSystemElement as aas.types.Property) : null;
  }

  get isVdiClassId() {
    return (
      this.classIdElement?.semanticId?.keys?.find((k) => k.value.startsWith('0173-1#02-ABH996')) != null &&
      this.classificationType === 'VDI2770 Blatt 1:2020'
    );
  }
  get isIecClassId() {
    return (
      this.classIdElement?.semanticId?.keys?.find((k) => k.value.startsWith('0173-1#02-ABH996')) != null &&
      this.classificationType === 'IEC61355-1:2008'
    );
  }

  get classificationType() {
    const prop = this.submodelElementCollection?.content?.value?.find((p: any) =>
      p.semanticId?.keys.find((k: any) => k.value.startsWith('0173-1#02-ABH997')),
    );
    if (prop != null) {
      return (prop as aas.types.Property).value;
    }
    return '';
  }

  addressApplied() {
    this.nestedSmc?.refresh();
  }

  get hasSemanticErrors() {
    const errors = [];
    if (this.submodelElementCollection?.content?.semanticId != null) {
      for (const error of aas.verification.verify(this.submodelElementCollection.content.semanticId, false)) {
        errors.push(error);
      }
    }
    return errors.length > 0;
  }

  getSubmodelId() {
    if (this.submodelElementCollection != null) {
      return this.getSubmodelIdRecursive(this.submodelElementCollection);
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
}
