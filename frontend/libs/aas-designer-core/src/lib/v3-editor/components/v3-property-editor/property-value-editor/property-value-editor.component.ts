import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { ValueList } from '@aas-core-works/aas-core3.1-typescript/types';
import { HelpLabelComponent } from '@aas/common-components';
import { SemanticIdHelper } from '@aas/helpers';
import { ShellResult } from '@aas/model';
import { Component, Input, OnChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { SelectButton } from 'primeng/selectbutton';
import { NullIfEmptyDirective } from '../../../../general/directives/null-if-empty.directive';
import { V3UndoDirective } from '../../../../general/directives/v3-undo.directive';
import { V3TreeService } from '../../../v3-tree/v3-tree.service';
import { V3ComponentBase } from '../../v3-component-base';
import { ClassIdComponent } from '../class-id/class-id.component';
import { ClassificationSystemComponent } from '../classification-system/classification-system.component';

@Component({
  selector: 'aas-property-value-editor',
  templateUrl: './property-value-editor.component.html',
  styleUrls: ['./property-value-editor.component.css'],
  imports: [
    DatePicker,
    FormsModule,
    HelpLabelComponent,
    SelectButton,
    InputGroup,
    InputText,
    V3UndoDirective,
    NullIfEmptyDirective,
    InputGroupAddon,
    Button,
    Select,
    ClassificationSystemComponent,
    ClassIdComponent,
    TranslateModule,
  ],
})
export class PropertyValueEditorComponent extends V3ComponentBase implements OnChanges {
  @Input({ required: true }) property: aas.types.Property | undefined;
  @Input({ required: true }) parentCollection: aas.types.SubmodelElementCollection | undefined;
  @Input({ required: true }) shellResult: ShellResult | undefined;

  DataTypeDefXsd = aas.types.DataTypeDefXsd;

  dateValue: Date | undefined;
  archetypeOptions = ['Full', 'OneDown', 'OneUp'];
  valuelistOptions: any[] = [];

  constructor(private treeService: V3TreeService) {
    super();
  }

  ngOnChanges(): void {
    if (this.property?.value != null && this.property?.value !== '') {
      this.dateValue = new Date(this.property.value);
    }
    this.valuelistOptions = [];
    if (this.hasValuelist) {
      const semanticId = this.property?.semanticId?.keys[0]?.value;
      if (semanticId != null) {
        const cd = this.shellResult?.v3Shell?.conceptDescriptions?.find((c) => c.id === semanticId);
        if (cd != null) {
          const valueList = (cd.embeddedDataSpecifications?.[0]?.dataSpecificationContent as any)
            ?.valueList as ValueList;
          this.valuelistOptions = valueList?.valueReferencePairs.map((v) => ({ label: v.value, value: v.value }));
        }
      }
      if (this.valuelistOptions == null || this.valuelistOptions.length === 0) {
        this.valuelistOptions = (
          this.property?.embeddedDataSpecifications?.[0]?.dataSpecificationContent as any
        )?.valueList.valueReferencePairs.map((v: any) => ({ label: v.value, value: v.value }));
      }
    }
  }

  get isArchetype() {
    return (
      (this.property != null &&
        this.property.semanticId?.keys.find((k) =>
          k.value.startsWith('https://admin-shell.io/idta/HierarchicalStructures/ArcheType/1/0'),
        )) != null
    );
  }

  get isDocumentClassification() {
    return (
      (this.property != null &&
        this.property.semanticId?.keys.find((k) => k.value.startsWith('0173-1#02-ABH997#001'))) != null
    );
  }

  get hasValuelist() {
    let _hasValuelist = false;
    const semanticId = this.property?.semanticId?.keys[0]?.value;
    if (semanticId != null) {
      const cd = this.shellResult?.v3Shell?.conceptDescriptions?.find((c) => c.id === semanticId);
      if (cd != null) {
        _hasValuelist = (cd.embeddedDataSpecifications?.[0]?.dataSpecificationContent as any)?.valueList != null;
      }
    }
    if (this.property?.embeddedDataSpecifications != null) {
      const valueList = (this.property.embeddedDataSpecifications[0]?.dataSpecificationContent as any)?.valueList;
      _hasValuelist = valueList != null && valueList.valueReferencePairs.length > 0;
    }
    return _hasValuelist;
  }

  get isVdiClassId() {
    return (
      (this.property != null &&
        this.property.semanticId?.keys.find((k) => k.value.startsWith('0173-1#02-ABH996#001'))) != null &&
      this.classificationType === 'VDI2770 Blatt 1:2020'
    );
  }

  get isIecClassId() {
    return (
      (this.property != null &&
        this.property.semanticId?.keys.find((k) => k.value.startsWith('0173-1#02-ABH996#001'))) != null &&
      this.classificationType === 'IEC61355-1:2008'
    );
  }

  get isEclassProductClassId() {
    const parentClassificationSystemElement = this.parentCollection?.value?.find(
      (p: any) =>
        SemanticIdHelper.hasSemanticId(
          p,
          'https://admin-shell.io/ZVEI/TechnicalData/ProductClassificationSystem/1/1',
        ) ||
        SemanticIdHelper.hasSemanticId(
          p,
          'https://admin-shell.io/sandbox/SG2/TechnicalData/ProductClassificationSystem/1/1',
        ),
    );
    if (parentClassificationSystemElement == null || !(parentClassificationSystemElement instanceof aas.types.Property))
      return false;

    const parentIsEclassClassificationSystem =
      parentClassificationSystemElement.value?.trim().toLowerCase() === 'eclass';

    return (
      this.property != null &&
      (SemanticIdHelper.hasSemanticId(
        this.property,
        'https://admin-shell.io/sandbox/SG2/TechnicalData/ProductClassId/1/1',
      ) ||
        SemanticIdHelper.hasSemanticId(
          this.property,
          'https://admin-shell.io/ZVEI/TechnicalData/ProductClassId/1/1',
        )) &&
      parentIsEclassClassificationSystem
    );
  }

  openEclassLink(productclass: string) {
    this.UrlHelper.openEclassProductclass(productclass);
  }

  get classificationType() {
    if (this.parentCollection != null) {
      const prop = this.parentCollection.value?.find((p: any) =>
        p.semanticId?.keys.find((k: any) => k.value.startsWith('0173-1#02-ABH997#001')),
      ) as aas.types.Property;
      if (prop != null) {
        return prop.value;
      }
    }
    return '';
  }

  get classNameElement() {
    if (this.parentCollection != null) {
      const prop = this.parentCollection.value?.find((p: any) =>
        p.semanticId?.keys.find((k: any) => k.value.startsWith('0173-1#02-AAO102#003')),
      ) as aas.types.MultiLanguageProperty;
      return prop;
    }
    return null;
  }

  get classIdElement() {
    if (this.parentCollection != null) {
      const prop = this.parentCollection.value?.find((p: any) =>
        p.semanticId?.keys.find((k: any) => k.value.startsWith('0173-1#02-ABH996#001')),
      ) as aas.types.Property;
      return prop;
    }
    return null;
  }

  get classificationSystemElement() {
    if (this.parentCollection != null) {
      const prop = this.parentCollection.value?.find((p: any) =>
        p.semanticId?.keys.find((k: any) => k.value.startsWith('0173-1#02-ABH997#001')),
      ) as aas.types.Property;
      return prop;
    }
    return null;
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onDateSelect(event: Date | null) {
    if (this.property != null) {
      if (event != null) {
        this.property.value = this.formatDate(event);
        this.treeService.registerFieldUndoStep();
      } else {
        this.property.value = null;
        this.treeService.registerFieldUndoStep();
      }
    }
  }

  sanitizeValue() {
    if (this.property?.value === '') this.property.value = null;
  }

  onDateTimeSelect(event: Date | null) {
    if (this.property != null) {
      if (event != null) {
        this.property.value = event.toISOString() ?? '';
        this.treeService.registerFieldUndoStep();
      } else {
        this.property.value = null;
        this.treeService.registerFieldUndoStep();
      }
    }
  }

  get hasValueErrors() {
    const errors = [];
    if (this.property) {
      for (const error of aas.verification.verify(this.property)) {
        errors.push(error);
      }
    }
    return (
      errors.filter((e) => (e.path.segments[0] as any)?.name === 'value').length > 0 ||
      errors.filter((e) => e.message === 'Value must be consistent with the value type.').length > 0
    );
  }

  get valueError() {
    const errors = [];
    if (this.property) {
      for (const error of aas.verification.verify(this.property)) {
        errors.push(error);
      }
    }
    return [
      ...errors.filter((e) => (e.path.segments[0] as any)?.name === 'value'),
      ...errors.filter((e) => e.message === 'Value must be consistent with the value type.'),
    ];
  }

  get hasValueIdErrors() {
    const errors = [];
    if (this.property?.valueId) {
      for (const error of aas.verification.verify(this.property.valueId)) {
        errors.push(error);
      }
    }
    return errors.length > 0;
  }
}
