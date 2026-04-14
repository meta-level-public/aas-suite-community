import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';
import { MultilanguagePropertyComponent } from '../../general/structural-elements/multilanguage-property/multilanguage-property.component';
import {
  ensureBatteryEditorReferenceValue,
  formatBatteryEditorRangeDateValue,
  getBatteryEditorBlobContentType,
  getBatteryEditorBlobLength,
  getBatteryEditorBlobValue,
  getBatteryEditorConceptDescription,
  getBatteryEditorRangeEditorValue,
  getBatteryEditorRangeInputType,
  getBatteryEditorRangeValueTypeLabel,
  getBatteryEditorReferenceSummary,
  getBatteryEditorValueListOptions,
  isBatteryEditorTextualBlob,
  normalizeBatteryEditorEnumValue,
  parseBatteryEditorRangeDateValue,
  usesBatteryEditorStructuredRangeInput,
} from '../battery-editor-field-utils';

@Component({
  selector: 'aas-battery-editor-shared-field',
  templateUrl: './battery-editor-shared-field.component.html',
  imports: [
    Button,
    DatePicker,
    TranslateModule,
    InputText,
    FormsModule,
    MultilanguagePropertyComponent,
    Select,
    Textarea,
  ],
})
export class BatteryEditorSharedFieldComponent {
  @Input({ required: true }) field!: any;
  @Input({ required: true }) fieldId!: string;
  @Input({ required: true }) referenceTypeOptions!: Array<{ label: string; value: number }>;
  @Input({ required: true }) keyTypeOptions!: Array<{ label: string; value: number }>;
  @Input() conceptDescriptions: aas.types.ConceptDescription[] = [];

  @Output() fieldChanged = new EventEmitter<void>();

  private propertyDatePickerCache: { rawValue: string; inputType: string; parsedValue: Date | null } | null = null;
  private rangeDatePickerCache: Record<
    'min' | 'max',
    { rawValue: string; inputType: string; parsedValue: Date | null } | null
  > = {
    min: null,
    max: null,
  };

  getRangeValueTypeLabel() {
    return getBatteryEditorRangeValueTypeLabel(this.field?.element?.valueType);
  }

  getPropertyInputType() {
    return getBatteryEditorRangeInputType(this.field?.element?.valueType);
  }

  getPropertyDatePickerValue() {
    const inputType = this.getPropertyInputType();
    const rawValue = `${this.field?.element?.value ?? ''}`.trim();

    if (this.propertyDatePickerCache?.rawValue === rawValue && this.propertyDatePickerCache.inputType === inputType) {
      return this.propertyDatePickerCache.parsedValue;
    }

    const parsedValue =
      inputType === 'time'
        ? this.parseTimePickerValue(this.field?.element?.value)
        : parseBatteryEditorRangeDateValue(this.field?.element?.value, inputType);

    this.propertyDatePickerCache = { rawValue, inputType, parsedValue };
    return parsedValue;
  }

  onPropertyDatePickerChanged(value: Date | null) {
    const inputType = this.getPropertyInputType();

    this.field.element.value =
      inputType === 'time' ? this.formatTimePickerValue(value) : formatBatteryEditorRangeDateValue(value, inputType);
    this.fieldChanged.emit();
  }

  usesDatePickerPropertyInput() {
    const inputType = this.getPropertyInputType();
    return inputType === 'date' || inputType === 'datetime-local' || inputType === 'time';
  }

  isDateTimePropertyInput() {
    return this.getPropertyInputType() === 'datetime-local';
  }

  isTimeOnlyPropertyInput() {
    return this.getPropertyInputType() === 'time';
  }

  getRangeInputType() {
    return getBatteryEditorRangeInputType(this.field?.element?.valueType);
  }

  getRangeEditorValue(boundary: 'min' | 'max') {
    return getBatteryEditorRangeEditorValue(this.field?.element?.[boundary], this.getRangeInputType());
  }

  getRangeDatePickerValue(boundary: 'min' | 'max') {
    const inputType = this.getRangeInputType();
    const rawValue = `${this.field?.element?.[boundary] ?? ''}`.trim();
    const cachedValue = this.rangeDatePickerCache[boundary];

    if (cachedValue?.rawValue === rawValue && cachedValue.inputType === inputType) {
      return cachedValue.parsedValue;
    }

    const parsedValue = parseBatteryEditorRangeDateValue(this.field?.element?.[boundary], inputType);
    this.rangeDatePickerCache[boundary] = { rawValue, inputType, parsedValue };

    return parsedValue;
  }

  onRangeBoundaryChanged(boundary: 'min' | 'max', value: string | null) {
    this.field.element[boundary] = value == null || value === '' ? null : value;
    this.fieldChanged.emit();
  }

  onRangeDatePickerChanged(boundary: 'min' | 'max', value: Date | null) {
    this.field.element[boundary] = formatBatteryEditorRangeDateValue(value, this.getRangeInputType());
    this.fieldChanged.emit();
  }

  usesStructuredRangeInput() {
    return usesBatteryEditorStructuredRangeInput(this.field?.element?.valueType);
  }

  usesDatePickerRangeInput() {
    const inputType = this.getRangeInputType();
    return inputType === 'date' || inputType === 'datetime-local';
  }

  isDateTimeRangeInput() {
    return this.getRangeInputType() === 'datetime-local';
  }

  getReferenceSummary() {
    this.ensureReferenceValue();
    return getBatteryEditorReferenceSummary(this.field?.element?.value);
  }

  getKeyTypeOptions() {
    this.ensureReferenceValue();
    return this.field.element.value.type === aas.types.ReferenceTypes.ExternalReference
      ? this.keyTypeOptions.filter((option) => option.value === aas.types.KeyTypes.GlobalReference)
      : this.keyTypeOptions;
  }

  addReferenceKey() {
    this.ensureReferenceValue();
    this.field.element.value.keys.push({
      type:
        this.field.element.value.type === aas.types.ReferenceTypes.ExternalReference
          ? aas.types.KeyTypes.GlobalReference
          : aas.types.KeyTypes.Submodel,
      value: '',
    });
    this.fieldChanged.emit();
  }

  removeReferenceKey(index: number) {
    this.ensureReferenceValue();
    if (this.field.element.value.keys.length <= 1) {
      return;
    }

    this.field.element.value.keys.splice(index, 1);
    this.fieldChanged.emit();
  }

  onReferenceTypeChanged() {
    this.ensureReferenceValue();
    const defaultKeyType =
      this.field.element.value.type === aas.types.ReferenceTypes.ExternalReference
        ? aas.types.KeyTypes.GlobalReference
        : aas.types.KeyTypes.Submodel;

    this.field.element.value.keys.forEach((key: any) => {
      key.type = normalizeBatteryEditorEnumValue(
        aas.types.KeyTypes as unknown as Record<string, string | number>,
        key?.type,
        defaultKeyType,
      );
    });

    if (this.field.element.value.type === aas.types.ReferenceTypes.ExternalReference) {
      this.field.element.value.keys.forEach((key: any) => {
        key.type = aas.types.KeyTypes.GlobalReference;
      });
    }

    this.fieldChanged.emit();
  }

  getBlobContentType() {
    return getBatteryEditorBlobContentType(this.field?.element?.contentType);
  }

  getBlobValue() {
    return getBatteryEditorBlobValue(this.field?.element?.value);
  }

  getBlobLength() {
    return getBatteryEditorBlobLength(this.field?.element?.value);
  }

  isTextualBlob() {
    return isBatteryEditorTextualBlob(this.field?.element?.contentType, this.field?.element?.value);
  }

  onBlobContentTypeChanged(value: string | null) {
    this.field.element.contentType = value == null || value.trim() === '' ? null : value.trim();
    this.fieldChanged.emit();
  }

  onBlobValueChanged(value: string | null) {
    this.field.element.value = value == null ? null : value;
    this.fieldChanged.emit();
  }

  onValueChanged() {
    this.fieldChanged.emit();
  }

  getPropertyValueListOptions() {
    return getBatteryEditorValueListOptions(this.field?.element, this.conceptDescriptions);
  }

  getPropertyConceptDescription() {
    return getBatteryEditorConceptDescription(this.field?.element, this.conceptDescriptions);
  }

  hasPropertyValueList() {
    return this.getPropertyValueListOptions().length > 0;
  }

  onPropertyValueChanged(value: string | null) {
    this.field.element.value = value == null || value === '' ? null : value;
    this.fieldChanged.emit();
  }

  private parseTimePickerValue(value: unknown) {
    const rawValue = `${value ?? ''}`.trim();
    if (rawValue === '') {
      return null;
    }

    const timeValue = rawValue.includes('T') ? (rawValue.split('T')[1] ?? rawValue) : rawValue;
    const normalizedTime = timeValue.replace(/(Z|[+-]\d{2}:?\d{2})$/, '');
    const match = /^(\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?$/.exec(normalizedTime);
    if (match == null) {
      return null;
    }

    const hour = Number(match[1]);
    const minute = Number(match[2]);
    const second = Number(match[3] ?? '0');
    const parsedDate = new Date(1970, 0, 1, hour, minute, second);

    if (
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.getHours() !== hour ||
      parsedDate.getMinutes() !== minute ||
      parsedDate.getSeconds() !== second
    ) {
      return null;
    }

    return parsedDate;
  }

  private formatTimePickerValue(value: Date | null | undefined) {
    if (value == null || Number.isNaN(value.getTime())) {
      return null;
    }

    return `${`${value.getHours()}`.padStart(2, '0')}:${`${value.getMinutes()}`.padStart(2, '0')}`;
  }

  private ensureReferenceValue() {
    this.field.element.value = ensureBatteryEditorReferenceValue(this.field.element.value);
  }
}
