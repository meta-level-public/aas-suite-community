import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { HelpLabelComponent } from '@aas/common-components';
import { ShellResult } from '@aas/model';
import { NgClass } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Input, OnChanges } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Fieldset } from 'primeng/fieldset';
import { Info } from '../../../general/model/info-item';
import { V3TreeItem } from '../../model/v3-tree-item';
import { V3TreeService } from '../../v3-tree/v3-tree.service';
import { EndpointUrlComponent } from '../endpoint-url/endpoint-url.component';
import { V3CategoryComponent } from '../v3-category/v3-category.component';
import { V3ComponentBase } from '../v3-component-base';
import { V3EmbeddedDataSpecificationComponent } from '../v3-embedded-data-specification/v3-embedded-data-specification.component';
import { V3IdShortComponent } from '../v3-id-short/v3-id-short.component';
import { V3LangStringListComponent } from '../v3-lang-string-list/v3-lang-string-list.component';
import { V3QualifiersComponent } from '../v3-qualifiers/v3-qualifiers.component';
import { V3SemanticDescriptionComponent } from '../v3-semantic-description/v3-semantic-description.component';
import { V3ValueIdComponent } from '../v3-value-id/v3-value-id.component';
import { V3ValueTypeComponent } from '../v3-value-type/v3-value-type.component';
import { PropertyValueEditorComponent } from './property-value-editor/property-value-editor.component';
type ValueList = aas.types.ValueList;

@Component({
  selector: 'aas-v3-property-editor',
  templateUrl: './v3-property-editor.component.html',
  imports: [
    Fieldset,
    HelpLabelComponent,
    V3IdShortComponent,
    V3LangStringListComponent,
    V3ValueTypeComponent,
    V3CategoryComponent,
    NgClass,
    PropertyValueEditorComponent,
    V3ValueIdComponent,
    V3SemanticDescriptionComponent,
    V3QualifiersComponent,
    V3EmbeddedDataSpecificationComponent,
    EndpointUrlComponent,
    TranslateModule,
  ],
})
export class V3PropertyEditorComponent extends V3ComponentBase implements OnChanges {
  @Input() property: V3TreeItem<aas.types.Property> | undefined;
  @Input({ required: true }) shellResult: ShellResult | undefined;
  @Input({ required: true }) idShortPath: string = '';

  DataTypeDefXsd = aas.types.DataTypeDefXsd;

  info = Info;

  dateValue: Date | undefined;
  archetypeOptions = ['Full', 'OneDown', 'OneUp'];
  valuelistOptions: any[] = [];

  constructor(
    private treeService: V3TreeService,
    private http: HttpClient,
  ) {
    super();
  }

  ngOnChanges(): void {
    if (this.property?.content?.value != null && this.property?.content?.value !== '') {
      this.dateValue = new Date(this.property.content.value);
    }
    this.valuelistOptions = [];
    if (this.hasValuelist) {
      const semanticId = this.property?.content?.semanticId?.keys[0]?.value;
      if (semanticId != null) {
        const cd = this.shellResult?.v3Shell?.conceptDescriptions?.find((c) => c.id === semanticId);
        if (cd != null) {
          const valueList = (cd.embeddedDataSpecifications?.[0]?.dataSpecificationContent as any)
            ?.valueList as ValueList;
          this.valuelistOptions = valueList?.valueReferencePairs.map((v) => ({ label: v.value, value: v.value }));
        }
      }
      if (this.valuelistOptions?.length === 0) {
        this.valuelistOptions = (
          this.property?.content?.embeddedDataSpecifications?.[0]?.dataSpecificationContent as any
        )?.valueList?.valueReferencePairs.map((v: any) => ({ label: v.value, value: v.value }));
      }
    }
  }

  get hasValueErrors() {
    const errors = [];
    if (this.property?.content) {
      for (const error of aas.verification.verify(this.property.content)) {
        errors.push(error);
      }
    }
    return (
      errors.filter((e) => (e.path.segments[0] as any)?.name === 'value').length > 0 ||
      errors.filter((e) => e.message === 'Value must be consistent with the value type.').length > 0
    );
  }

  get hasValueIdErrors() {
    const errors = [];
    if (this.property?.content?.valueId) {
      for (const error of aas.verification.verify(this.property.content.valueId)) {
        errors.push(error);
      }
    }
    return errors.length > 0;
  }

  get hasValuelist() {
    let _hasValuelist = false;
    const semanticId = this.property?.content?.semanticId?.keys[0]?.value;
    if (semanticId != null) {
      const cd = this.shellResult?.v3Shell?.conceptDescriptions?.find((c) => c.id === semanticId);
      if (cd != null) {
        _hasValuelist = (cd.embeddedDataSpecifications?.[0]?.dataSpecificationContent as any)?.valueList != null;
      }
    }
    if (this.property?.content?.embeddedDataSpecifications != null) {
      const valueList = (this.property.content.embeddedDataSpecifications[0]?.dataSpecificationContent as any)
        ?.valueList;
      _hasValuelist = valueList != null && valueList.valueReferencePairs?.length > 0;
    }
    return _hasValuelist;
  }

  get isArchetype() {
    return (
      (this.property?.content != null &&
        this.property.content.semanticId?.keys.find((k) =>
          k.value.startsWith('https://admin-shell.io/idta/HierarchicalStructures/ArcheType/1/0'),
        )) != null
    );
  }

  get hasSemanticErrors() {
    const errors = [];
    if (this.property?.content?.semanticId != null) {
      for (const error of aas.verification.verify(this.property.content.semanticId, false)) {
        errors.push(error);
      }
    }
    return errors.length > 0;
  }
}
