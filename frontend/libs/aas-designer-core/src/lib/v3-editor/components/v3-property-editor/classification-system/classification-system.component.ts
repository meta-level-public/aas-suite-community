import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { NullIfEmptyDirective } from '../../../../general/directives/null-if-empty.directive';
import { V3UndoDirective } from '../../../../general/directives/v3-undo.directive';

@Component({
  selector: 'aas-classification-system',
  templateUrl: './classification-system.component.html',
  imports: [Select, FormsModule, InputText, V3UndoDirective, NullIfEmptyDirective, TranslateModule],
})
export class ClassificationSystemComponent implements OnInit, OnChanges {
  @Input({ required: true }) classificationSystem: aas.types.Property | undefined;
  classificationSystemOptions: { label: string; value: string }[] = [];

  selectedClassificationSystem: string | null = null;

  constructor(private translate: TranslateService) {}

  ngOnInit(): void {
    this.classificationSystemOptions = [
      { label: 'VDI2770 Blatt 1:2020', value: 'VDI2770 Blatt 1:2020' },
      { label: 'IEC61355-1:2008', value: 'IEC61355-1:2008' },
      { label: this.translate.instant('OTHER'), value: 'OTHER' },
    ];
    const val = this.classificationSystem?.value ?? 'OTHER';
    if (this.classificationSystemOptions.find((o) => o.value === val) != null) {
      this.selectedClassificationSystem = val;
    } else {
      this.selectedClassificationSystem = 'OTHER';
    }
  }

  ngOnChanges() {
    const val = this.classificationSystem?.value ?? 'OTHER';
    if (this.classificationSystemOptions.find((o) => o.value === val) != null) {
      this.selectedClassificationSystem = val;
    } else {
      this.selectedClassificationSystem = 'OTHER';
    }
  }

  onClassificationSystemChange() {
    if (this.selectedClassificationSystem !== 'OTHER' && this.classificationSystem != null) {
      this.classificationSystem.value = this.selectedClassificationSystem;
    }
  }
}
