import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { HelpLabelComponent } from '@aas/common-components';
import { ShellResult } from '@aas/model';
import { NgClass } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Checkbox } from 'primeng/checkbox';
import { DatePicker } from 'primeng/datepicker';
import { Fieldset } from 'primeng/fieldset';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { NullIfEmptyDirective } from '../../../general/directives/null-if-empty.directive';
import { UndoDirective } from '../../../general/directives/undo.directive';
import { V3UndoDirective } from '../../../general/directives/v3-undo.directive';
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

@Component({
  selector: 'aas-v3-range-element',
  templateUrl: './v3-range-element.component.html',
  imports: [
    Fieldset,
    HelpLabelComponent,
    V3IdShortComponent,
    V3LangStringListComponent,
    V3CategoryComponent,
    Select,
    UndoDirective,
    FormsModule,
    Checkbox,
    V3UndoDirective,
    DatePicker,
    InputText,
    NullIfEmptyDirective,
    NgClass,
    V3SemanticDescriptionComponent,
    V3QualifiersComponent,
    V3EmbeddedDataSpecificationComponent,
    EndpointUrlComponent,
    TranslateModule,
  ],
})
export class V3RangeElementComponent extends V3ComponentBase implements OnChanges {
  @Input() range: V3TreeItem<aas.types.Range> | undefined;
  @Input({ required: true }) shellResult: ShellResult | undefined;
  @Input({ required: true }) idShortPath: string = '';

  info = Info;
  dataType = aas.types.DataTypeDefXsd;
  dateValueMin: Date | undefined;
  dateValueMax: Date | undefined;

  constructor(private treeService: V3TreeService) {
    super();
  }

  get hasSemanticErrors() {
    const errors = [];
    if (this.range?.content?.semanticId != null) {
      for (const error of aas.verification.verify(this.range.content.semanticId, false)) {
        errors.push(error);
      }
    }
    return errors.length > 0;
  }

  ngOnChanges(): void {
    if (this.range?.content?.min != null && this.range?.content?.min !== '') {
      this.dateValueMin = new Date(this.range.content.min);
    }
    if (this.range?.content?.max != null && this.range?.content?.max !== '') {
      this.dateValueMax = new Date(this.range.content.max);
    }
  }

  onDateMinSelect(event: Date | null) {
    if (this.range?.content != null) {
      if (event != null) {
        this.range.content.min = event.toISOString().split('T')[0] ?? '';
        this.treeService.registerFieldUndoStep();
      } else {
        this.range.content.min = null;
        this.treeService.registerFieldUndoStep();
      }
    }
  }

  onDateTimeMinSelect(event: Date | null) {
    if (this.range?.content != null) {
      if (event != null) {
        this.range.content.min = event.toISOString() ?? '';
        this.treeService.registerFieldUndoStep();
      } else {
        this.range.content.min = null;
        this.treeService.registerFieldUndoStep();
      }
    }
  }

  onTimeMinSelect(event: Date | null) {
    if (this.range?.content != null) {
      if (event != null) {
        this.range.content.min = event.toISOString().split('T')[1] ?? '';
        this.treeService.registerFieldUndoStep();
      } else {
        this.range.content.min = null;
        this.treeService.registerFieldUndoStep();
      }
    }
  }

  onDateMaxSelect(event: Date | null) {
    if (this.range?.content != null) {
      if (event != null) {
        this.range.content.max = event.toISOString().split('T')[0] ?? '';
        this.treeService.registerFieldUndoStep();
      } else {
        this.range.content.max = null;
        this.treeService.registerFieldUndoStep();
      }
    }
  }

  onDateTimeMaxSelect(event: Date | null) {
    if (this.range?.content != null) {
      if (event != null) {
        this.range.content.max = event.toISOString() ?? '';
        this.treeService.registerFieldUndoStep();
      } else {
        this.range.content.max = null;
        this.treeService.registerFieldUndoStep();
      }
    }
  }
  onTimeMaxSelect(event: Date | null) {
    if (this.range?.content != null) {
      if (event != null) {
        this.range.content.max = event.toISOString().split('T')[1] ?? '';
        this.treeService.registerFieldUndoStep();
      } else {
        this.range.content.max = null;
        this.treeService.registerFieldUndoStep();
      }
    }
  }

  get hasMaxValueErrors() {
    const errors = [];
    if (this.range?.content) {
      for (const error of aas.verification.verify(this.range.content)) {
        errors.push(error);
      }
    }
    return errors.filter((e) => e.message === 'Max must be consistent with the value type.').length > 0;
  }

  get maxValueError() {
    const errors = [];
    if (this.range?.content) {
      for (const error of aas.verification.verify(this.range.content)) {
        errors.push(error);
      }
    }
    return errors.filter((e) => e.message === 'Max must be consistent with the value type.');
  }

  get hasMinValueErrors() {
    const errors = [];
    if (this.range?.content) {
      for (const error of aas.verification.verify(this.range.content)) {
        errors.push(error);
      }
    }
    return errors.filter((e) => e.message === 'Min must be consistent with the value type.').length > 0;
  }

  get minValueError() {
    const errors = [];
    if (this.range?.content) {
      for (const error of aas.verification.verify(this.range.content)) {
        errors.push(error);
      }
    }
    return errors.filter((e) => e.message === 'Min must be consistent with the value type.');
  }
}
