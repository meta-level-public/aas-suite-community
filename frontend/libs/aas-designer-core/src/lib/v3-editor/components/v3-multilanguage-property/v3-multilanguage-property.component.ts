import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { LangStringTextType } from '@aas-core-works/aas-core3.1-typescript/types';
import { LanguageService } from '@aas/aas-designer-shared';
import { HelpLabelComponent } from '@aas/common-components';
import { SemanticIdHelper } from '@aas/helpers';
import { ShellResult } from '@aas/model';
import {
  ProductDesignationClient,
  ProductDesignationDto,
  ProductFamilyClient,
  ProductFamilyDto,
  ProductRootClient,
  ProductRootDto,
} from '@aas/webapi-client';
import { NgClass } from '@angular/common';
import { Component, inject, Input, OnChanges, signal, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { Divider } from 'primeng/divider';
import { Fieldset } from 'primeng/fieldset';
import { Select } from 'primeng/select';
import { lastValueFrom } from 'rxjs';
import { UndoDirective } from '../../../general/directives/undo.directive';
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

@Component({
  selector: 'aas-v3-multilanguage-property',
  templateUrl: './v3-multilanguage-property.component.html',
  styleUrls: ['../../../../host.scss'],
  imports: [
    Fieldset,
    HelpLabelComponent,
    V3IdShortComponent,
    Button,
    V3LangStringListComponent,
    V3CategoryComponent,
    NgClass,
    Select,
    UndoDirective,
    FormsModule,
    Divider,
    V3ValueIdComponent,
    V3SemanticDescriptionComponent,
    V3QualifiersComponent,
    V3EmbeddedDataSpecificationComponent,
    EndpointUrlComponent,
    TranslateModule,
  ],
})
export class V3MultilanguagePropertyComponent extends V3ComponentBase implements OnChanges {
  @Input() property: V3TreeItem<aas.types.MultiLanguageProperty> | undefined;
  @Input({ required: true }) shellResult: ShellResult | undefined;
  @Input({ required: true }) idShortPath: string = '';
  info = Info;

  embeddedDataSpecCollapsed: boolean = true;

  families = signal<ProductFamilyDto[]>([]);
  roots = signal<ProductRootDto[]>([]);
  designations = signal<ProductDesignationDto[]>([]);
  selectedFamily: ProductFamilyDto | undefined;
  selectedRoot: ProductRootDto | undefined;
  selectedDesignation: ProductDesignationDto | undefined;

  productRootClient = inject(ProductRootClient);
  productFamilyClient = inject(ProductFamilyClient);
  productDesignationClient = inject(ProductDesignationClient);
  treeService = inject(V3TreeService);

  constructor(private langService: LanguageService) {
    super();
  }

  ngOnChanges(_changes: SimpleChanges): void {
    this.embeddedDataSpecCollapsed = !this.hasDataSpecErrors;
    this.initFamilies();
    this.initRoots();
    this.initDesignations();
  }

  async initFamilies() {
    this.families.set(await lastValueFrom(this.productFamilyClient.productFamily_GetAllProductFamilys()));
  }
  async initRoots() {
    this.roots.set(await lastValueFrom(this.productRootClient.productRoot_GetAllProductRoots()));
  }
  async initDesignations() {
    this.designations.set(
      await lastValueFrom(this.productDesignationClient.productDesignation_GetAllProductDesignations()),
    );
  }

  get isProductFamily() {
    return (
      this.property?.content?.idShort === 'ManufacturerProductFamily' ||
      SemanticIdHelper.hasSemanticId(this.property?.content, '0173-1#02-AAU731#001')
    );
  }

  get isProductRoot() {
    return (
      this.property?.content?.idShort === 'ManufacturerProductRoot' ||
      SemanticIdHelper.hasSemanticId(this.property?.content, '0173-1#02-AAU732#001')
    );
  }

  get isProductDesignation() {
    return (
      this.property?.content?.idShort === 'ManufacturerProductDesignation' ||
      SemanticIdHelper.hasSemanticId(this.property?.content, '0173-1#02-AAW338#001')
    );
  }

  applyFamily() {
    if (this.property?.content != null) {
      if (this.selectedFamily?.mlpKeyValues == null || this.selectedFamily.mlpKeyValues.length === 0) {
        this.property.content.value = [new LangStringTextType('en', this.selectedFamily?.name ?? '')];
      } else {
        this.property.content.value =
          this.selectedFamily?.mlpKeyValues?.map((x) => {
            return new LangStringTextType(x.language ?? '', x.text ?? '');
          }) ?? [];
      }
    }
    this.treeService.registerFieldUndoStep();
  }

  applyRoot() {
    if (this.property?.content != null) {
      if (this.selectedRoot?.mlpKeyValues == null || this.selectedRoot.mlpKeyValues.length === 0) {
        this.property.content.value = [new LangStringTextType('en', this.selectedRoot?.name ?? '')];
      } else {
        this.property.content.value =
          this.selectedRoot?.mlpKeyValues?.map((x) => {
            return new LangStringTextType(x.language ?? '', x.text ?? '');
          }) ?? [];
      }
    }
    this.treeService.registerFieldUndoStep();
  }

  applyDesignation() {
    if (this.property?.content != null) {
      if (this.selectedDesignation?.mlpKeyValues == null || this.selectedDesignation.mlpKeyValues.length === 0) {
        this.property.content.value = [new LangStringTextType('en', this.selectedDesignation?.name ?? '')];
      } else {
        this.property.content.value =
          this.selectedDesignation?.mlpKeyValues?.map((x) => {
            return new LangStringTextType(x.language ?? '', x.text ?? '');
          }) ?? [];
      }
    }
    this.treeService.registerFieldUndoStep();
  }

  get hasDataSpecErrors() {
    const errors = [];
    this.property?.content?.embeddedDataSpecifications?.forEach((spec) => {
      for (const error of aas.verification.verify(spec)) {
        errors.push(error);
      }
    });
    if (this.property?.content != null) {
      for (const error of aas.verification.verify(this.property.content)) {
        if (error.message === 'Embedded data specifications must be either not set or have at least one item.')
          errors.push(error);
      }
    }

    return errors.length > 0;
  }

  get hasContentErrors() {
    const errors = [];
    if (this.property?.content) {
      for (const error of aas.verification.verify(this.property.content)) {
        errors.push(error);
      }
    }
    return (
      errors.filter((e) => (e.path.segments[0] as any)?.name === 'value').length > 0 ||
      errors.filter((e) => (e.path.segments[0] as any)?.name === 'valueId').length > 0 ||
      errors.filter((e) => e.message === 'Value must be either not set or have at least one item.').length > 0
    );
  }

  get contentError() {
    const errors = [];
    if (this.property?.content) {
      for (const error of aas.verification.verify(this.property.content)) {
        errors.push(error);
      }
    }
    return errors.filter((e) => e.message === 'Value must be either not set or have at least one item.');
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
